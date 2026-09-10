import type { Command, VNode } from "../types";
import { error, text } from "../types";
import { lookup, resolvePath } from "../fs";

function render(node: VNode, prefix: string, lines: string[]) {
  if (node.type !== "dir") return;
  const entries = Object.values(node.children).sort((a, b) => a.name.localeCompare(b.name));
  entries.forEach((child, i) => {
    const isLast = i === entries.length - 1;
    lines.push(`${prefix}${isLast ? "└── " : "├── "}${child.name}`);
    if (child.type === "dir") {
      render(child, prefix + (isLast ? "    " : "│   "), lines);
    }
  });
}

export const treeCommand: Command = {
  name: "tree",
  usage: "tree [path]",
  summary: "Show directory structure recursively",
  run(ctx, args) {
    const target = resolvePath(ctx.cwd, args[0] ?? "");
    const node = lookup(ctx.fs, target);
    if (!node) return error(`tree: ${args[0] ?? target}: no such file or directory`);

    const lines: string[] = [node.name];
    render(node, "", lines);
    if (lines.length > 20) {
      return { kind: "long", title: "tree", lineCount: lines.length, body: lines.join("\n") };
    }
    return text(...lines);
  },
};
