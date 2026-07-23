import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pitch Coach — the pre-seed deck editor",
  description:
    "Upload your pre-seed pitch deck and get a skeptical investor's cold read — scored, with the questions that get you to the next meeting. It critiques; it never rewrites.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
