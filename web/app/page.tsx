"use client";

import { useCallback, useRef, useState } from "react";
import type { Band, Critique, FactorId, FactorResult } from "@/lib/schema";

type Benchmark = Record<FactorId, number>;

const BAND_COLOR: Record<Band, string> = {
  missing_or_fatal: "var(--fatal)",
  present_but_broken: "var(--broken)",
  adequate: "var(--adequate)",
  strong: "var(--strong)",
  exceptional: "var(--exceptional)",
  not_applicable: "var(--muted)",
};

function pct(n: number): string {
  return `${Math.round(n * 100)}`;
}

function bandLabel(band: Band): string {
  return band.replace(/_/g, " ");
}

export default function Home() {
  const [mode, setMode] = useState<"upload" | "paste">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [critique, setCritique] = useState<Critique | null>(null);
  const [benchmark, setBenchmark] = useState<Benchmark | null>(null);
  const [openFactor, setOpenFactor] = useState<FactorResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const canSubmit = mode === "upload" ? !!file : text.trim().length > 20;

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  }, []);

  async function submit() {
    setError(null);
    setLoading(true);
    setCritique(null);
    try {
      const form = new FormData();
      if (mode === "upload" && file) form.append("deck", file);
      else form.append("text", text);

      const res = await fetch("/api/critique", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setCritique(data.critique);
      setBenchmark(data.benchmark);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="wrap">
      <header className="hero">
        <h1>Pitch Coach</h1>
        <p>
          A skeptical seed investor reads your pre-seed deck cold and tells you what
          would kill the raise — scored, with the one question that gets you to the
          next meeting.
        </p>
        <span className="rule">It critiques. It never rewrites.</span>
      </header>

      <section className="card">
        <div className="tabs">
          <button
            className={`tab ${mode === "upload" ? "active" : ""}`}
            onClick={() => setMode("upload")}
          >
            Upload .pptx
          </button>
          <button
            className={`tab ${mode === "paste" ? "active" : ""}`}
            onClick={() => setMode("paste")}
          >
            Paste text
          </button>
        </div>

        {mode === "upload" ? (
          <div
            className={`dropzone ${dragging ? "drag" : ""}`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pptx"
              hidden
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            {file ? (
              <span className="filename">📎 {file.name}</span>
            ) : (
              <span>
                <strong>Drop your .pptx here</strong> or click to choose. Your deck is
                critiqued in-session and not stored.
              </span>
            )}
          </div>
        ) : (
          <textarea
            placeholder="Paste your deck text, slide by slide…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        )}

        <div className="row">
          <button className="primary" disabled={!canSubmit || loading} onClick={submit}>
            {loading && <span className="spinner" />}
            {loading ? "Reading your deck…" : "Get the cold read"}
          </button>
          <span className="hint">One investor-grade pass. ~15–30 seconds.</span>
        </div>

        {error && <div className="error">{error}</div>}
      </section>

      {critique && (
        <Results
          critique={critique}
          benchmark={benchmark}
          onOpen={setOpenFactor}
        />
      )}

      {openFactor && (
        <FactorDrawer
          factor={openFactor}
          onClose={() => setOpenFactor(null)}
        />
      )}

      <footer className="footnote">
        The score summarizes the critique; it never replaces it and never licenses a
        rewrite. Powered by the <code>editor/</code> bundle as its single source of
        truth.
      </footer>
    </div>
  );
}

function Results({
  critique,
  benchmark,
  onOpen,
}: {
  critique: Critique;
  benchmark: Benchmark | null;
  onOpen: (f: FactorResult) => void;
}) {
  const { overall, factors } = critique;
  return (
    <>
      <section className="verdict">
        <div className="composite">
          <b>{pct(overall.composite_score)}</b>
          <span className="hint">/ 100 fundability</span>
        </div>
        <p>{overall.cold_read_verdict}</p>
      </section>

      {overall.top_3_dealkillers.length > 0 && (
        <section className="killers">
          <h2>Top deal-killers</h2>
          {overall.top_3_dealkillers.map((k, i) => (
            <div className="killer" key={i}>
              <span className="num">{i + 1}</span>
              <div>
                <div>{k.one_line}</div>
                <span className="tag">{k.factor_id.replace(/_/g, " ")}</span>
              </div>
            </div>
          ))}
        </section>
      )}

      <section className="dials">
        <h2>Every factor — click a dial to open the full note</h2>
        <div className="grid">
          {factors.map((f) => {
            const color = BAND_COLOR[f.band];
            const bench = benchmark?.[f.id];
            const na = f.na || f.score === null;
            return (
              <button className="dial" key={f.id} onClick={() => onOpen(f)}>
                <div className="label">{f.label}</div>
                <div className="score" style={{ color }}>
                  {na ? "N/A" : pct(f.score as number)}
                </div>
                <div className="meter">
                  {!na && (
                    <span
                      style={{ width: `${pct(f.score as number)}%`, background: color }}
                    />
                  )}
                </div>
                <div className="band">
                  {na ? "not applicable at this stage" : bandLabel(f.band)}
                </div>
                {bench !== undefined && (
                  <div className="bench">
                    benchmark {pct(bench)} · updating as more decks are scored
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>
    </>
  );
}

function FactorDrawer({
  factor,
  onClose,
}: {
  factor: FactorResult;
  onClose: () => void;
}) {
  return (
    <div className="overlay" onClick={onClose}>
      <aside className="drawer" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose}>
          Close
        </button>
        <h3>{factor.label}</h3>
        <div className="band" style={{ color: BAND_COLOR[factor.band] }}>
          {factor.na || factor.score === null
            ? "N/A · not applicable at this stage"
            : `${pct(factor.score)} / 100 · ${bandLabel(factor.band)}`}
        </div>

        {factor.investor_read && (
          <div className="section">
            <h4>What an investor concludes</h4>
            <p>{factor.investor_read}</p>
          </div>
        )}

        {factor.why_it_matters && (
          <div className="section">
            <h4>Why fixing it earns the meeting</h4>
            <p>{factor.why_it_matters}</p>
          </div>
        )}

        {factor.cost_if_ignored && (
          <div className="section">
            <h4>Cost if ignored</h4>
            <p>{factor.cost_if_ignored}</p>
          </div>
        )}

        {(factor.do_pattern || factor.dont_pattern) && (
          <div className="section">
            <h4>Patterns (generic exemplars — not your copy)</h4>
            <div className="dodont">
              {factor.do_pattern && (
                <div className="box do">
                  <strong>Do</strong>
                  <p>{factor.do_pattern}</p>
                </div>
              )}
              {factor.dont_pattern && (
                <div className="box dont">
                  <strong>Don&apos;t</strong>
                  <p>{factor.dont_pattern}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {factor.mitigation_question && (
          <div className="section">
            <h4>The question that hands it back to you</h4>
            <div className="q">{factor.mitigation_question}</div>
          </div>
        )}

        {factor.criteria.length > 0 && (
          <div className="section">
            <h4>Criteria</h4>
            {factor.criteria.map((c, i) => (
              <div className="crit" key={i}>
                <span className={`pill ${c.verdict}`}>{c.verdict}</span>
                <div>
                  <div>{c.name}</div>
                  {c.evidence && <div className="ev">{c.evidence}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </aside>
    </div>
  );
}
