import { useState, useCallback, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type LineType =
  | "echo" // the command the user typed
  | "output" // plain output text
  | "error" // red error text
  | "blank" // empty spacer line
  | "columns"; // two-column layout (ascii + guide)

export interface Line {
  id: number;
  type: LineType;
  text: string;
  // only used when type === "columns"
  left?: string;
  right?: string;
}

export type CommandHandler = (args: string[]) => Line[];

export interface CommandDefinition {
  description: string; // shown in help
  handler: CommandHandler;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

let _id = 0;
const id = () => ++_id;

export const line = (text: string, type: LineType = "output"): Line => ({
  id: id(),
  type,
  text,
});

export const blank = (): Line => line("", "blank");
export const error = (text: string): Line => line(text, "error");
export const echo = (text: string): Line => line(text, "echo");

// Splits a multi-line string into individual Line objects.
// Trims leading/trailing newlines from the template literal.
export const multiline = (text: string, type: LineType = "output"): Line[] =>
  text
    .trim()
    .split("\n")
    .map((row) => line(row, type));

// ─── Built-in commands ────────────────────────────────────────────────────────

function makeBuiltins(
  registry: Record<string, CommandDefinition>,
  resetToWelcome: () => void,
): Record<string, CommandDefinition> {
  return {
    help: {
      description: "list all available commands",
      handler: () => {
        const all = { ...makeBuiltins(registry, resetToWelcome), ...registry };
        return [
          line("available commands"),
          line("─".repeat(32)),
          ...Object.entries(all).map(([name, def]) =>
            line(`  ${name.padEnd(14)} ${def.description}`),
          ),
          blank(),
        ];
      },
    },
    clear: {
      description: "reset to welcome screen",
      handler: () => {
        // handled specially in runCommand
        return [];
      },
    },
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTerminal(
  registry: Record<string, CommandDefinition>,
  welcomeLines: Line[],
) {
  const [lines, setLines] = useState<Line[]>(welcomeLines);
  const [input, setInput] = useState("");
  const [historyIdx, setHistoryIdx] = useState(-1);
  const historyRef = useRef<string[]>([]);
  const welcomeRef = useRef<Line[]>(welcomeLines);

  // keep welcomeRef in sync if caller changes welcomeLines reference
  welcomeRef.current = welcomeLines;

  const resetToWelcome = useCallback(() => {
    setLines(welcomeRef.current.map((l) => ({ ...l, id: id() })));
  }, []);

  const push = useCallback(
    (newLines: Line[]) => setLines((prev) => [...prev, ...newLines]),
    [],
  );

  const runCommand = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) return;

      // add to history (skip duplicates at top)
      if (historyRef.current[0] !== trimmed) {
        historyRef.current = [trimmed, ...historyRef.current];
      }
      setHistoryIdx(-1);

      const [name, ...args] = trimmed.split(/\s+/);
      const builtins = makeBuiltins(registry, resetToWelcome);
      const all = { ...builtins, ...registry };
      const def = all[name.toLowerCase()];

      // special case: clear resets to welcome
      if (name.toLowerCase() === "clear") {
        resetToWelcome();
        return;
      }

      const echoLine = echo(`$ ${trimmed}`);

      if (!def) {
        push([
          echoLine,
          error(`command not found: ${name}`),
          line(`  type "help" for available commands`),
          blank(),
        ]);
        return;
      }

      const output = def.handler(args);
      push([echoLine, ...output]);
    },
    [registry, push, resetToWelcome],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const history = historyRef.current;

      // Ctrl+C or Cmd+C: clear input (like normal terminal)
      if ((e.ctrlKey || e.metaKey) && e.key === "c") {
        e.preventDefault();
        setInput("");
        setHistoryIdx(-1);
        return;
      }

      if (e.key === "Enter") {
        runCommand(input);
        setInput("");
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        const next = Math.min(historyIdx + 1, history.length - 1);
        setHistoryIdx(next);
        setInput(history[next] ?? "");
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = historyIdx - 1;
        if (next < 0) {
          setHistoryIdx(-1);
          setInput("");
        } else {
          setHistoryIdx(next);
          setInput(history[next] ?? "");
        }
        return;
      }

      if (e.key === "Tab") {
        e.preventDefault();
        const builtins = makeBuiltins(registry, resetToWelcome);
        const all = { ...builtins, ...registry };
        const partial = input.trim().toLowerCase();
        if (!partial) return;
        const match = Object.keys(all).find((k) => k.startsWith(partial));
        if (match) setInput(match);
        return;
      }
    },
    [input, historyIdx, registry, runCommand],
  );

  return {
    lines,
    input,
    setInput,
    handleKeyDown,
    push,
  };
}
