import type { Flags } from "./types";

export interface ParsedCommand {
  cmd: string;
  args: string[];
  flags: Flags;
}

/** Tokenizes respecting single/double quotes and backslash escapes. */
function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let current = "";
  let quote: '"' | "'" | null = null;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (quote) {
      if (ch === quote) {
        quote = null;
      } else if (ch === "\\" && input[i + 1] === quote) {
        current += quote;
        i++;
      } else {
        current += ch;
      }
    } else if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (ch === " ") {
      if (current) {
        tokens.push(current);
        current = "";
      }
    } else {
      current += ch;
    }
  }
  if (current) tokens.push(current);
  return tokens;
}

export function parseCommand(input: string): ParsedCommand | null {
  const tokens = tokenize(input.trim());
  if (tokens.length === 0) return null;

  const [cmd, ...rest] = tokens;
  const args: string[] = [];
  const flags: Flags = {};

  for (const token of rest) {
    if (token.startsWith("--")) {
      const [key, value] = token.slice(2).split("=");
      flags[key] = value ?? true;
    } else if (token.startsWith("-") && token.length > 1) {
      // bundle short flags: -la -> l: true, a: true
      for (const ch of token.slice(1)) flags[ch] = true;
    } else {
      args.push(token);
    }
  }

  return { cmd, args, flags };
}
