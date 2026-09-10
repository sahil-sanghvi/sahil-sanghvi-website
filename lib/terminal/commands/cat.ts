import type { Command, CommandOutput } from "../types";
import { error, text } from "../types";
import { lookup, resolvePath } from "../fs";

const LONG_THRESHOLD = 15;

export const catCommand: Command = {
  name: "cat",
  usage: "cat <file>",
  summary: "Print a file's contents",
  run(ctx, args): CommandOutput {
    if (!args[0]) return error("cat: missing file operand");
    const target = resolvePath(ctx.cwd, args[0]);
    const node = lookup(ctx.fs, target);
    if (!node) return error(`cat: ${args[0]}: no such file or directory`);
    if (node.type !== "file") return error(`cat: ${args[0]}: is a directory`);
    if (node.binary) return error(`cat: ${args[0]}: binary file — try \`open ${args[0]}\` instead`);

    const lineCount = node.content.split("\n").length;
    if (lineCount > LONG_THRESHOLD) {
      return { kind: "long", title: node.name, lineCount, body: node.content };
    }
    return text(node.content);
  },
};
