import type { ShellCtx, VDir, VNode } from "./types";
import { HOME, lookup, resolvePath } from "./fs";

export type LaunchTarget = { href: string; label: string };

/** What running/opening this node should open, if anything. */
export function launchTargetOf(node: VNode): LaunchTarget | null {
  if (node.type === "dir") {
    if (!node.launch) return null;
    return {
      href: node.launch.href,
      label: node.launch.kind === "live" ? "deployed site" : "GitHub repo",
    };
  }
  return node.href ? { href: node.href, label: node.name } : null;
}

/** Nearest project directory at or above `path` that knows where to launch. */
export function enclosingLaunchable(fs: VDir, path: string): VDir | null {
  const parts = path.split("/").filter(Boolean);
  for (let i = parts.length; i >= 0; i--) {
    const node = lookup(fs, "/" + parts.slice(0, i).join("/"));
    if (node?.type === "dir" && node.launch) return node;
  }
  return null;
}

/**
 * Resolves a user-typed target: a path relative to cwd first, then a bare
 * project name from anywhere (`run precheck-ai` from ~ works).
 */
export function resolveTarget(ctx: ShellCtx, arg: string): VNode | null {
  const direct = lookup(ctx.fs, resolvePath(ctx.cwd, arg));
  if (direct) return direct;
  const name = arg.replace(/\/+$/, "");
  return lookup(ctx.fs, `${HOME}/projects/${name}`);
}
