import type { Command, Segment, VNode } from "../types";
import { error, text } from "../types";
import { lookup, resolvePath, listDir } from "../fs";

function size(node: VNode): string {
  if (node.type === "dir") return String(Object.keys(node.children).length);
  return String(node.binary ? 0 : node.content.length);
}

function entry(node: VNode, name: string, long: boolean): Segment[] {
  const label = node.type === "dir" ? `${name}/` : node.executable ? `${name}*` : name;
  const tone = node.type === "dir" || node.executable ? ("signal" as const) : undefined;
  if (!long) return [{ text: label, tone }];
  const mode = node.type === "dir" ? "drwxr-xr-x" : node.executable ? "-rwxr-xr-x" : "-rw-r--r--";
  return [{ text: `${mode}  ${size(node).padStart(6)}  `, tone: "muted" }, { text: label, tone }];
}

export const lsCommand: Command = {
  name: "ls",
  usage: "ls [-l] [-a] [path]",
  summary: "List directory contents",
  run(ctx, args, flags) {
    const long = Boolean(flags.l);
    const all = Boolean(flags.a || flags.all);
    const target = resolvePath(ctx.cwd, args[0] ?? "");
    const node = lookup(ctx.fs, target);
    if (!node) return error(`ls: ${args[0] ?? target}: no such file or directory`);
    if (node.type !== "dir") return text(entry(node, node.name, long));

    const rows = listDir(node).map((e) => entry(node.children[e.name], e.name, long));
    if (all) {
      const parent = lookup(ctx.fs, resolvePath(target, "..")) ?? node;
      rows.unshift(entry(node, ".", long), entry(parent, "..", long));
    }
    if (rows.length === 0) return text("(empty)");
    return text(...rows);
  },
};
