// Plain, serializable JSON — crosses the RSC boundary from build-fs.ts
// (server) into the client-side Terminal component without issue.

export interface VBase {
  name: string;
}

export interface VDir extends VBase {
  type: "dir";
  children: Record<string, VNode>;
  git?: { owner: string; repo: string; branch: string };
}

export interface VFile extends VBase {
  type: "file";
  content: string;
  binary?: boolean; // resume.pdf -> `cat` refuses
  href?: string; // `open` target
}

export type VNode = VDir | VFile;

export type Segment = { text: string; tone?: "muted" | "signal" | "error"; href?: string };

export type CommandOutput =
  | { kind: "text"; lines: Segment[][] }
  | { kind: "table"; rows: Segment[][] }
  | { kind: "error"; message: string }
  | { kind: "long"; title: string; lineCount: number; body: string }
  | { kind: "none" };

export interface ShellCtx {
  fs: VDir;
  cwd: string;
  history: string[];
  signal: AbortSignal;
  setCwd(path: string): void;
  clear(): void;
  navigate(href: string): void;
}

export interface Flags {
  [key: string]: boolean | string;
}

export interface Command {
  name: string;
  usage: string;
  summary: string;
  aliases?: string[];
  run(ctx: ShellCtx, args: string[], flags: Flags): CommandOutput | Promise<CommandOutput>;
}

export function text(...lines: (string | Segment[])[]): CommandOutput {
  return {
    kind: "text",
    lines: lines.map((l) => (typeof l === "string" ? [{ text: l }] : l)),
  };
}

export function error(message: string): CommandOutput {
  return { kind: "error", message };
}
