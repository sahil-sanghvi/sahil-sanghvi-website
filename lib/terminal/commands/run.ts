import type { Command } from "../types";
import { error, text } from "../types";
import { enclosingLaunchable, launchTargetOf, resolveTarget } from "../launch";
import { opensInNewTab } from "../navigate";

/**
 * `run` — launches a project: its deployed site when it has one, otherwise
 * its GitHub repo. Works from inside a project directory (`cd
 * projects/precheck-ai && run`), with a path (`run projects/precheck-ai`),
 * or with a bare project name from anywhere (`run precheck-ai`). `./launch`
 * inside a project directory does the same thing.
 */
export const runCommand: Command = {
  name: "run",
  aliases: ["launch", "start"],
  usage: "run [project]",
  summary: "Launch a project: its live site if deployed, else its GitHub repo",
  run(ctx, args) {
    const node = args[0] ? resolveTarget(ctx, args[0]) : enclosingLaunchable(ctx.fs, ctx.cwd);
    if (!node) {
      return args[0]
        ? error(`run: ${args[0]}: no such project. Try \`ls ~/projects\`.`)
        : error("run: not inside a project. `cd ~/projects/<name>` first, or `run <name>`.");
    }
    const target = launchTargetOf(node);
    if (!target) {
      return error(`run: ${args[0] ?? node.name}: nothing to launch here`);
    }
    ctx.navigate(target.href);
    return text([
      { text: `launching ${node.name} → ${target.label} ` , tone: "muted" },
      { text: target.href, tone: "signal", href: target.href },
      ...(opensInNewTab(target.href) ? [{ text: " (new tab)", tone: "muted" as const }] : []),
    ]);
  },
};
