import JSZip from "jszip";

// A .pptx is a zip of XML. Slide text lives in ppt/slides/slideN.xml inside
// <a:t> runs. We extract text per slide so the critique can tie notes to a slide
// number (Rule 4/5). No external service, no persistence.

interface ExtractedSlide {
  index: number;
  text: string;
}

function slideNumber(pathName: string): number {
  const match = pathName.match(/slide(\d+)\.xml$/);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
}

function textFromSlideXml(xml: string): string {
  // Grab every <a:t>…</a:t> run. Paragraphs (</a:p>) become line breaks.
  const withBreaks = xml.replace(/<\/a:p>/g, "\n");
  const runs = [...withBreaks.matchAll(/<a:t>([\s\S]*?)<\/a:t>/g)].map((m) =>
    decodeXml(m[1]),
  );
  return runs.join(" ").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function decodeXml(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

/**
 * Extract deck text from a .pptx buffer, formatted as "Slide N:" blocks so the
 * model can reference specific slides. Throws if the file isn't a valid .pptx.
 */
export async function extractPptxText(buffer: ArrayBuffer): Promise<string> {
  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(buffer);
  } catch {
    throw new Error("Could not read the file — is it a valid .pptx?");
  }

  const slidePaths = Object.keys(zip.files).filter((p) =>
    /^ppt\/slides\/slide\d+\.xml$/.test(p),
  );

  if (slidePaths.length === 0) {
    throw new Error("No slides found — is this an empty or non-PowerPoint file?");
  }

  slidePaths.sort((a, b) => slideNumber(a) - slideNumber(b));

  const slides: ExtractedSlide[] = [];
  for (let i = 0; i < slidePaths.length; i++) {
    const xml = await zip.files[slidePaths[i]].async("string");
    slides.push({ index: i + 1, text: textFromSlideXml(xml) });
  }

  return slides
    .map((s) => `Slide ${s.index}:\n${s.text || "(no text on this slide)"}`)
    .join("\n\n");
}
