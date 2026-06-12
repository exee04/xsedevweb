"use client";
import React, { useEffect, useRef, useState } from "react";
import { useTerminal, blank, line, type Line } from "@/hooks/useTerminal";
import { commands } from "@/lib/commands";
import { terminalBus, closePanel } from "@/lib/events";
import { ResumePanel } from "@/components/panels/ResumePanel";

const ASCII_ART = `
⠀⠀⠀⢠⣾⣷⣦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⣰⣿⣿⣿⣿⣷⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⢰⣿⣿⣿⣿⣿⣿⣷⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⢀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣤⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⣤⣄⣀⣀⣤⣤⣶⣾⣿⣿⣿⡷
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠁
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠁⠀
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠏⠀⠀⠀
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠏⠀⠀⠀⠀
⣿⣿⣿⡇⠀⡾⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠁⠀⠀⠀⠀⠀
⣿⣿⣿⣧⡀⠁⣀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡟⠉⢹⠉⠙⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣀⠀⣀⣼⣿⣿⣿⣿⡟⠀⠀⠀⠀⠀⠀⠀
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠋⠀⠀⠀⠀⠀⠀⠀⠀
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠛⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠛⠀⠤⢀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⣿⣿⣿⣿⠿⣿⣿⣿⣿⣿⣿⣿⠿⠋⢃⠈⠢⡁⠒⠄⡀⠈⠁⠀⠀⠀⠀⠀⠀⠀
⣿⣿⠟⠁⠀⠀⠈⠉⠉⠁⠀⠀⠀⠀⠈⠆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
`.trim();

const RIGHT_COLUMN = [
  "  xsedev",
  "  full-stack developer",
  "",
  "  > about      who I am",
  "  > skills     tech stack",
  "  > projects   things I've built",
  "  > resume     view my resume",
  "  > contact    get in touch",
  "",
  "  ───────────────────────",
  "",
  "  type a command to get started",
];

const MOBILE_RIGHT_COLUMN = [
  "  xsedev",
  "  full-stack developer",
  "",
  "  tap ? for commands",
];

function buildWelcomeLines(isMobileView: boolean = false): Line[] {
  const artRows = ASCII_ART.split("\n");
  const columnToUse = isMobileView ? MOBILE_RIGHT_COLUMN : RIGHT_COLUMN;
  const totalRows = Math.max(artRows.length, columnToUse.length);
  const offset = Math.floor((totalRows - columnToUse.length) / 2);

  return [
    ...Array.from({ length: totalRows }, (_, i) => ({
      id: i,
      type: "columns" as const,
      text: "",
      left: artRows[i] ?? "",
      right: columnToUse[i - offset] ?? "",
    })),
    blank(),
  ];
}

// ─── Command Drawer ───────────────────────────────────────────────────────────

function CommandDrawer({
  isOpen,
  onClose,
  commands,
}: {
  isOpen: boolean;
  onClose: () => void;
  commands: Record<string, { description: string }>;
}) {
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      )}

      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-primary transition-transform duration-300 ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ maxHeight: "70vh" }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-primary">
          <span className="text-primary font-mono text-sm">
            available commands
          </span>
          <button
            onClick={onClose}
            className="text-primary text-lg hover:text-foreground transition-colors"
          >
            ✕
          </button>
        </div>

        <div
          className="overflow-y-auto px-4 py-3"
          style={{ maxHeight: "calc(70vh - 56px)" }}
        >
          <div className="space-y-2 font-mono text-xs text-primary">
            {Object.entries(commands).map(([name, cmd]) => (
              <div key={name} className="pb-2 border-b border-primary/20">
                <div className="text-foreground/80 mb-1">
                  <span className="text-primary">&gt; {name}</span>
                </div>
                <div className="text-foreground/60 ml-2">{cmd.description}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-4 py-2 border-t border-primary/20 text-xs text-foreground/50 font-mono">
          press ? to close
        </div>
      </div>
    </>
  );
}

// ─── Terminal ─────────────────────────────────────────────────────────────────

export default function Terminal() {
  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [shouldClear, setShouldClear] = useState(false);
  const [activePanel, setActivePanel] = useState<string | null>(null);

  // ── Responsive / orientation ──────────────────────────────────────────────
  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 900px)");
    const newMobileView = mediaQuery.matches;

    if (newMobileView !== isMobileView) {
      setIsMobileView(newMobileView);
      setShouldClear(true);
    }

    const handleChange = (e: MediaQueryListEvent) => {
      setIsMobileView(e.matches);
      setShouldClear(true);
    };

    const handleOrientationChange = () => {
      setTimeout(() => {
        const mq = window.matchMedia("(max-width: 900px)");
        setIsMobileView(mq.matches);
        setShouldClear(true);
      }, 100);
    };

    mediaQuery.addEventListener("change", handleChange);
    window.addEventListener("orientationchange", handleOrientationChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, [isMobileView]);

  // ── Panel event bus ───────────────────────────────────────────────────────
  useEffect(() => {
    const onOpen = (e: Event) => {
      setActivePanel((e as CustomEvent).detail.id);
    };
    const onClose = () => setActivePanel(null);

    terminalBus.addEventListener("open-panel", onOpen);
    terminalBus.addEventListener("close-panel", onClose);

    return () => {
      terminalBus.removeEventListener("open-panel", onOpen);
      terminalBus.removeEventListener("close-panel", onClose);
    };
  }, []);

  const WELCOME_LINES = buildWelcomeLines(isMobileView);

  const { lines, input, setInput, handleKeyDown, submitInput } = useTerminal(
    commands,
    WELCOME_LINES,
  );

  // ── Clear on resize ───────────────────────────────────────────────────────
  useEffect(() => {
    if (shouldClear) {
      setInput("clear");
      setShouldClear(false);

      const triggerClear = () => {
        if (inputRef.current) {
          inputRef.current.dispatchEvent(
            new KeyboardEvent("keydown", {
              key: "Enter",
              code: "Enter",
              keyCode: 13,
              which: 13,
              bubbles: true,
              cancelable: true,
            }),
          );
        }
      };

      requestAnimationFrame(() => {
        setTimeout(triggerClear, 50);
      });
    }
  }, [shouldClear]);

  // ── Global keyboard shortcuts ─────────────────────────────────────────────
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const isInputFocused = document.activeElement === inputRef.current;

      // ESC: close panel first, then drawer
      if (e.key === "Escape") {
        if (activePanel) {
          setActivePanel(null);
          return;
        }
        if (showDrawer) {
          setShowDrawer(false);
          return;
        }
      }

      if ((e.key === "?" || (e.shiftKey && e.key === "/")) && !isInputFocused) {
        e.preventDefault();
        setShowDrawer((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [showDrawer, activePanel]);

  // ── Auto-scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (outputRef.current) {
      requestAnimationFrame(() => {
        outputRef.current?.scrollTo({
          top: outputRef.current.scrollHeight,
          behavior: "smooth",
        });
      });
    }
  }, [lines]);

  // ── Mobile keyboard scroll into view ──────────────────────────────────────
  useEffect(() => {
    const handleFocus = () => {
      setTimeout(() => {
        inputRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }, 300);
    };

    const input = inputRef.current;
    if (input) input.addEventListener("focus", handleFocus);

    return () => {
      if (input) input.removeEventListener("focus", handleFocus);
    };
  }, []);

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="w-screen min-h-screen bg-background text-foreground scrollbar-custom">
      <style>{`
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb {
          background: var(--primary);
          border-radius: 4px;
          border: 2px solid var(--background);
        }
        ::-webkit-scrollbar-thumb:hover { background: var(--foreground); }
        * { scrollbar-color: var(--primary) transparent; scrollbar-width: thin; }
      `}</style>

      {/* ── Terminal container ── */}
      <div
        className="flex items-center justify-center px-4 py-8 md:py-12 w-screen"
        style={isMobileView ? { position: "fixed", inset: 0, padding: 0 } : {}}
      >
        <div
          className="w-full md:max-w-[70%] shadow-[2px_2px_0px_var(--foreground)] overflow-hidden flex flex-col"
          style={{
            height: isMobileView ? "100dvh" : "min(80vh, 600px)",
          }}
          onClick={() => inputRef.current?.focus()}
        >
          {/* title bar */}
          <div className="bg-primary py-2 md:py-3 px-4 pl-4 md:pl-[5%] shadow-[2px_0px_0px_var(--primary)] flex items-center shrink-0 text-sm md:text-base">
            <span>XSE TERMINAL</span>
          </div>

          {/* output - scrollable */}
          <div
            ref={outputRef}
            className="bg-background flex-1 overflow-y-auto px-3 md:px-[2%] py-3 md:py-4 flex flex-col gap-0.5 w-full"
          >
            {(() => {
              const result: React.ReactNode[] = [];
              let i = 0;
              while (i < lines.length) {
                const l = lines[i];

                if (l.type === "columns") {
                  const block: typeof lines = [];
                  while (i < lines.length && lines[i].type === "columns") {
                    block.push(lines[i]);
                    i++;
                  }
                  result.push(
                    <div
                      key={`col-${block[0].id}`}
                      className="w-full flex flex-col md:flex-row md:gap-8 font-mono text-xs md:text-sm text-primary flex-shrink-0"
                    >
                      <pre className="shrink-0 leading-relaxed mb-4 md:mb-0 whitespace-pre">
                        {block.map((r) => r.left).join("\n")}
                      </pre>
                      <div className="flex flex-col md:justify-center min-w-0 leading-relaxed flex-shrink-0">
                        {isMobileView
                          ? block
                              .map((r) => r.right ?? "")
                              .filter((v, idx, arr) => arr.indexOf(v) === idx)
                              .map((r, idx) =>
                                r.trim() ? (
                                  <span key={idx}>{r}</span>
                                ) : (
                                  <span key={idx} className="h-2 block" />
                                ),
                              )
                          : block.map((r, idx) =>
                              r.right?.trim() ? (
                                <span key={idx}>{r.right}</span>
                              ) : (
                                <span key={idx} className="h-[1lh] block" />
                              ),
                            )}
                      </div>
                    </div>,
                  );
                  continue;
                }

                if (l.type === "blank") {
                  result.push(
                    <div key={`blank-${l.id}`} className="h-2 flex-shrink-0" />,
                  );
                  i++;
                  continue;
                }

                result.push(
                  <div
                    key={`line-${l.id}`}
                    className={
                      l.type === "echo"
                        ? "text-foreground/40 font-mono text-xs md:text-sm flex-shrink-0"
                        : l.type === "error"
                          ? "text-red-500 font-mono text-xs md:text-sm flex-shrink-0"
                          : "text-primary font-mono text-xs md:text-sm flex-shrink-0"
                    }
                  >
                    {l.text}
                  </div>,
                );
                i++;
              }
              return result;
            })()}
          </div>

          {/* divider */}
          <div className="bg-primary h-[1px] border-b border-foreground shrink-0" />

          {/* input bar */}
          <div
            className="bg-background text-primary py-2 md:py-3 px-3 md:px-4 md:pl-[2%] flex items-center cursor-text shrink-0"
            onClick={() => inputRef.current?.focus()}
          >
            <div className="flex items-center w-full ml-2 gap-2">
              <span className="shrink-0 text-xs md:text-sm">
                user@xsedev.xyz~/
              </span>
              <input
                ref={inputRef}
                autoFocus
                type="text"
                inputMode="text"
                enterKeyHint="go"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                className="flex-1 bg-transparent text-primary font-mono text-xs md:text-sm outline-none border-none caret-primary min-w-0"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Help button ── */}
      <button
        type="button"
        onClick={() => setShowDrawer((prev) => !prev)}
        className="fixed bottom-6 right-4 w-10 h-10 bg-primary text-background border border-foreground rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors font-mono text-lg font-bold z-50 md:z-50"
      >
        ?
      </button>

      {/* ── Command Drawer ── */}
      <CommandDrawer
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
        commands={commands}
      />

      {/* ── Panels ── */}
      {activePanel === "resume" && <ResumePanel />}
    </div>
  );
}
