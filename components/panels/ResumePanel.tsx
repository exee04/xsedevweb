"use client";
import dynamic from "next/dynamic";
import { PanelShell } from "./PanelShell";

const MobilePdfViewer = dynamic(
  () => import("./MobilePdfViewer").then((m) => m.MobilePdfViewer),
  {
    ssr: false,
    loading: () => <p className="text-xs text-foreground/40">loading pdf...</p>,
  },
);

export function ResumePanel() {
  return (
    <PanelShell
      title="resume"
      className="max-w-2xl w-full max-h-[95vh] md:max-h-[95vh]"
    >
      {/* Desktop: plain iframe */}
      <div className="hidden md:flex flex-col gap-3">
        <div
          className="w-full border border-primary/20"
          style={{ height: "78vh" }}
        >
          <iframe
            src="/resume.pdf"
            className="w-full h-full"
            title="Resume PDF"
          />
        </div>
        <a
          href="/resume.pdf"
          download
          className="text-xs text-foreground/40 hover:text-primary transition-colors underline underline-offset-4"
        >
          ↓ download resume.pdf
        </a>
      </div>

      {/* Mobile: tap-to-fullscreen PDF viewer */}
      <div className="md:hidden">
        <MobilePdfViewer url="/resume.pdf" />
      </div>
    </PanelShell>
  );
}
