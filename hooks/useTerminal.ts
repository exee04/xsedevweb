import { useState, useCallback, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type LineType = "echo" | "output" | "error" | "blank" | "columns";

export interface Line {
  id: number;
  type: LineType;
  text: string;
  left?: string;
  right?: string;
}

export type CommandHandler = (args: string[]) => Line[];

export interface CommandDefinition {
  description: string;
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

/**
 * Convert a multiline string into an array of Lines.
 *
 * Automatically strips:
 *   - leading/trailing blank lines
 *   - common leading indentation (dedent)
 *
 * Usage — plain string:
 *   ...multiline(`
 *     hello world
 *     second line
 *   `)
 *
 * Usage — with a prefix per line:
 *   ...multiline(`
 *     frontend  →  React
 *     backend   →  Node
 *   `, "output", "  ")   // adds "  " before every line
 */
export const multiline = (
  text: string,
  type: LineType = "output",
  prefix = "  ",
): Line[] => {
  const rawLines = text.split("\n");

  // strip leading/trailing blank lines
  while (rawLines.length && rawLines[0].trim() === "") rawLines.shift();
  while (rawLines.length && rawLines[rawLines.length - 1].trim() === "")
    rawLines.pop();

  // find common indent to strip (dedent)
  const minIndent = rawLines
    .filter((l) => l.trim().length > 0)
    .reduce((min, l) => {
      const indent = l.match(/^(\s*)/)?.[1].length ?? 0;
      return Math.min(min, indent);
    }, Infinity);

  return rawLines.map((l) =>
    line(prefix + l.slice(minIndent === Infinity ? 0 : minIndent), type),
  );
};

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
      handler: () => [],
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

      if (historyRef.current[0] !== trimmed) {
        historyRef.current = [trimmed, ...historyRef.current];
      }
      setHistoryIdx(-1);

      const [name, ...args] = trimmed.split(/\s+/);
      const builtins = makeBuiltins(registry, resetToWelcome);
      const all = { ...builtins, ...registry };
      const def = all[name.toLowerCase()];

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

  const submitInput = useCallback(() => {
    runCommand(input);
    setInput("");
  }, [input, runCommand]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const history = historyRef.current;

      if ((e.ctrlKey || e.metaKey) && e.key === "c") {
        e.preventDefault();
        setInput("");
        setHistoryIdx(-1);
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        submitInput();
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
    [input, historyIdx, registry, submitInput, resetToWelcome],
  );

  return {
    lines,
    input,
    setInput,
    handleKeyDown,
    submitInput,
    push,
  };
}
