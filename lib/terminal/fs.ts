import type { VDir, VNode } from "./types";

export const HOME = "/home/sahil";

export function resolvePath(cwd: string, input: string): string {
  if (!input) return cwd;
  let path = input;

  if (path === "~") path = HOME;
  else if (path.startsWith("~/")) path = HOME + path.slice(1);

  const base = path.startsWith("/") ? "" : cwd;
  const combined = `${base}/${path}`;

  const parts = combined.split("/").filter(Boolean);
  const stack: string[] = [];
  for (const part of parts) {
    if (part === ".") continue;
    if (part === "..") stack.pop();
    else stack.push(part);
  }
  return "/" + stack.join("/");
}

export function lookup(root: VDir, path: string): VNode | null {
  if (path === "/") return root;
  const parts = path.split("/").filter(Boolean);
  let node: VNode = root;
  for (const part of parts) {
    if (node.type !== "dir") return null;
    const next: VNode | undefined = node.children[part];
    if (!next) return null;
    node = next;
  }
  return node;
}

export function listDir(node: VNode): { name: string; type: "dir" | "file" }[] {
  if (node.type !== "dir") return [];
  return Object.values(node.children)
    .map((c) => ({ name: c.name, type: c.type }))
    .sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === "dir" ? -1 : 1));
}

export function nearestMatch(target: string, candidates: string[]): string | null {
  const lower = target.toLowerCase();
  return candidates.find((c) => c.toLowerCase().startsWith(lower)) ?? null;
}
