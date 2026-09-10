import type { Command } from "../types";
import { error, text } from "../types";
import { lookup, resolvePath } from "../fs";

export const openCommand: Command = {
  name: "open",
  usage: "open <file>",
  summary: "Open a file's linked URL (e.g. a project's live URL)",
  run(ctx, args) {
    if (!args[0]) return error("open: missing file operand");
    const target = resolvePath(ctx.cwd, args[0]);
    const node = lookup(ctx.fs, target);
    if (!node) return error(`open: ${args[0]}: no such file or directory`);
    if (node.type !== "file" || !node.href) {
      return error(`open: ${args[0]}: nothing to open`);
    }
    ctx.navigate(node.href);
    return text(`opening ${node.href} …`);
  },
};
