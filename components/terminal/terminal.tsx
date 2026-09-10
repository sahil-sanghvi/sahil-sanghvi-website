"use client";

import { useReducer, useRef, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { VDir, CommandOutput, ShellCtx } from "@/lib/terminal/types";
import { commands } from "@/lib/terminal/commands";
import { parseCommand } from "@/lib/terminal/parser";
import { HOME, listDir, nearestMatch } from "@/lib/terminal/fs";
import { HistoryLine, type Entry } from "./history-line";
import { MobileCommandBar } from "./mobile-command-bar";

const MAX_ENTRIES = 200;
const HISTORY_KEY = "terminal.history";

interface State {
  cwd: string;
  prevCwd: string;
  entries: Entry[];
}

type Action =
  | { type: "setCwd"; path: string }
  | { type: "clear" }
  | { type: "push"; entry: Entry }
  | { type: "update"; id: string; output: CommandOutput };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "setCwd":
      return { ...state, prevCwd: state.cwd, cwd: action.path };
    case "clear":
      return { ...state, entries: [] };
    case "push": {
      const entries = [...state.entries, action.entry];
      return { ...state, entries: entries.length > MAX_ENTRIES ? entries.slice(-MAX_ENTRIES) : entries };
    }
    case "update":
      return {
        ...state,
        entries: state.entries.map((e) => (e.id === action.id ? { ...e, output: action.output } : e)),
      };
  }
}

function loadHistory(): string[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return []; // Safari private mode throws on localStorage access
  }
}

function saveHistory(history: string[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(-100)));
  } catch {
    // ignore
  }
}

export function Terminal({ fs }: { fs: VDir }) {
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, { cwd: HOME, prevCwd: HOME, entries: [] });
  const [inputValue, setInputValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [histIndex, setHistIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const leaveLinkRef = useRef<HTMLAnchorElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ block: "end" });
  }, [state.entries]);

  // Soft-keyboard handling on mobile: keep the prompt visible above the
  // keyboard rather than letting it get covered.
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const onResize = () => inputRef.current?.scrollIntoView({ block: "nearest" });
    vv.addEventListener("resize", onResize);
    return () => vv.removeEventListener("resize", onResize);
  }, []);

  const navigate = useCallback((href: string) => router.push(href), [router]);

  const runCommand = useCallback(
    async (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) return;

      const nextHistory = [...history, trimmed];
      setHistory(nextHistory);
      saveHistory(nextHistory);
      setHistIndex(null);

      const id = crypto.randomUUID();
      dispatch({ type: "push", entry: { id, cwd: state.cwd, input: trimmed, output: "pending" } });

      const parsed = parseCommand(trimmed);
      if (!parsed) {
        dispatch({ type: "update", id, output: { kind: "none" } });
        return;
      }

      const command = commands[parsed.cmd];
      if (!command) {
        dispatch({
          type: "update",
          id,
          output: { kind: "error", message: `${parsed.cmd}: command not found. Try \`help\`.` },
        });
        return;
      }

      const controller = new AbortController();
      abortRef.current = controller;
      const ctx: ShellCtx = {
        fs,
        cwd: state.cwd,
        history: nextHistory,
        signal: controller.signal,
        setCwd: (path) => dispatch({ type: "setCwd", path }),
        clear: () => dispatch({ type: "clear" }),
        navigate,
      };

      try {
        const output = await command.run(ctx, parsed.args, parsed.flags);
        dispatch({ type: "update", id, output });
      } catch (err) {
        dispatch({
          type: "update",
          id,
          output: { kind: "error", message: err instanceof Error ? err.message : "Command failed." },
        });
      }
    },
    [fs, history, navigate, state.cwd]
  );

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = inputValue;
      setInputValue("");
      void runCommand(value);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      const next = histIndex === null ? history.length - 1 : Math.max(0, histIndex - 1);
      setHistIndex(next);
      setInputValue(history[next]);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIndex === null) return;
      const next = histIndex + 1;
      if (next >= history.length) {
        setHistIndex(null);
        setInputValue("");
      } else {
        setHistIndex(next);
        setInputValue(history[next]);
      }
      return;
    }
    if (e.key === "Tab") {
      // Completes only when the input is non-empty; on an empty input, Tab
      // moves focus normally — stealing it unconditionally would be a focus
      // trap in disguise.
      if (!inputValue.trim()) return;
      e.preventDefault();
      const [cmdPart, ...rest] = inputValue.split(" ");
      if (rest.length === 0) {
        const match = nearestMatch(cmdPart, Object.keys(commands));
        if (match) setInputValue(match);
      } else {
        const dirNode = fs; // completion is best-effort against the root listing
        const candidates = listDir(dirNode).map((e) => e.name);
        const match = nearestMatch(rest[rest.length - 1], candidates);
        if (match) setInputValue([cmdPart, ...rest.slice(0, -1), match].join(" "));
      }
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      leaveLinkRef.current?.focus();
      return;
    }
    if (e.key === "l" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      dispatch({ type: "clear" });
      return;
    }
    if (e.key === "c" && e.ctrlKey) {
      abortRef.current?.abort();
    }
  }

  return (
    <main className="flex h-[100dvh] flex-col">
      <div className="border-border flex flex-col gap-1 border-b px-4 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <span className="text-furniture text-muted-foreground shrink-0 tracking-wide">
          sahil@web: ~
        </span>
        <a
          ref={leaveLinkRef}
          href="/"
          className="text-furniture text-signal-500 hover:text-signal-600 shrink-0 tracking-wide"
        >
          ← Prefer a normal page? View the site
        </a>
      </div>

      <div
        role="log"
        aria-live="polite"
        aria-atomic="false"
        aria-relevant="additions"
        className="flex-1 overflow-y-auto px-4 py-3"
      >
        <p className="text-muted-foreground mb-2 max-w-[68ch]">
          Type <span className="text-signal-500">help</span> for commands. Tab completes,
          Ctrl+L clears, Esc leaves the input.
        </p>
        {state.entries.map((entry) => (
          <HistoryLine key={entry.id} entry={entry} />
        ))}
        <div ref={scrollRef} />
      </div>

      <MobileCommandBar onRun={(cmd) => void runCommand(cmd)} />

      <div className="border-border border-t px-4 py-3">
        <label htmlFor="terminal-input" className="sr-only">
          Terminal command input
        </label>
        <div className="flex items-center gap-2">
          <span className="text-signal-500 shrink-0">visitor@web:{state.cwd}$</span>
          <input
            id="terminal-input"
            ref={inputRef}
            type="text"
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            aria-describedby="terminal-hint"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="text-body text-foreground min-w-0 flex-1 bg-transparent focus:outline-none"
            style={{ fontSize: "16px" }}
            autoFocus
          />
        </div>
        <p id="terminal-hint" className="sr-only">
          Press Escape at any time to move focus to the link that leaves the terminal.
        </p>
      </div>
    </main>
  );
}
