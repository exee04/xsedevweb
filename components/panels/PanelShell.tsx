"use client";
import { closePanel } from "@/lib/events";

export function PanelShell({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string; // caller controls width, height, maxHeight etc.
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div
        className={`bg-background border border-primary flex flex-col shadow-[4px_4px_0px_var(--foreground)] w-full ${className ?? "max-w-2xl max-h-[95vh]"}`}
      >
        {/* title bar */}
        <div className="bg-primary text-background px-4 py-2 md:py-3 flex items-center justify-between shrink-0 font-mono text-sm md:text-base">
          <span>{title.toUpperCase()}</span>
          <button
            onClick={closePanel}
            className="hover:opacity-70 transition-opacity text-lg leading-none"
            aria-label="close panel"
          >
            ✕
          </button>
        </div>

        {/* scrollable content */}
        <div className="overflow-y-auto flex-1 px-4 md:px-8 py-5 font-mono text-xs md:text-sm text-primary">
          {children}
        </div>

        {/* footer */}
        <div className="border-t border-primary/30 px-4 py-2 text-xs text-foreground/40 shrink-0 font-mono">
          press ESC to close
        </div>
      </div>
    </div>
  );
}
