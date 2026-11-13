import type { Command } from "../types";
import { error, text } from "../types";
import { launchTargetOf, resolveTarget } from "../launch";
import { opensInNewTab } from "../navigate";

export const openCommand: Command = {
  name: "open",
  usage: "open <file|project>",
  summary: "Open a file's link, or a project's live site / repo",
  run(ctx, args) {
    if (!args[0]) return error("open: missing operand. Try `open resume.pdf` or `open projects/<name>`.");
    const node = resolveTarget(ctx, args[0]);
    if (!node) return error(`open: ${args[0]}: no such file or directory`);
    const target = launchTargetOf(node);
    if (!target) return error(`open: ${args[0]}: nothing to open`);
    ctx.navigate(target.href);
    return text([
      { text: "opening ", tone: "muted" },
      { text: target.href, tone: "signal", href: target.href },
      ...(opensInNewTab(target.href) ? [{ text: " (new tab)", tone: "muted" as const }] : []),
    ]);
  },
};
