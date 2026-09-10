import type { Command } from "../types";
import { error, text } from "../types";
import { lookup, resolvePath, HOME } from "../fs";

export const cdCommand: Command = {
  name: "cd",
  usage: "cd [dir]",
  summary: "Change directory",
  run(ctx, args) {
    const target = resolvePath(ctx.cwd, args[0] ?? HOME);
    const node = lookup(ctx.fs, target);
    if (!node) return error(`cd: ${args[0]}: no such file or directory`);
    if (node.type !== "dir") return error(`cd: ${args[0]}: not a directory`);
    ctx.setCwd(target);
    return text();
  },
};
