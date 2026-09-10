import type { Command } from "../types";
import { error, text } from "../types";
import { lookup, resolvePath, listDir } from "../fs";

export const lsCommand: Command = {
  name: "ls",
  usage: "ls [-l] [-a] [path]",
  summary: "List directory contents",
  run(ctx, args) {
    const target = resolvePath(ctx.cwd, args[0] ?? "");
    const node = lookup(ctx.fs, target);
    if (!node) return error(`ls: ${args[0] ?? target}: no such file or directory`);
    if (node.type !== "dir") return text(node.name);

    const entries = listDir(node);
    if (entries.length === 0) return text("(empty)");

    return text(
      ...entries.map((e) => [
        { text: e.name, tone: e.type === "dir" ? ("signal" as const) : undefined },
      ])
    );
  },
};
