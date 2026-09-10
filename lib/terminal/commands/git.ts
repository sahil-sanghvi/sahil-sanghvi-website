import type { Command, VDir } from "../types";
import { error, text } from "../types";
import { lookup } from "../fs";

const NOT_A_REPO = error(
  "fatal: not a git repository (or any of the parent directories): .git"
);

function findGitRoot(fs: VDir, cwd: string): VDir["git"] | null {
  const parts = cwd.split("/").filter(Boolean);
  let node: VDir = fs;
  let found: VDir["git"] | undefined = fs.git;
  for (const part of parts) {
    const next = node.children[part];
    if (!next || next.type !== "dir") break;
    node = next;
    if (node.git) found = node.git;
  }
  return found ?? null;
}

export const gitCommand: Command = {
  name: "git",
  usage: "git <log|show|status> [args]",
  summary: "git log / git show / git status, scoped to a project directory",
  async run(ctx, args) {
    const [sub, ...rest] = args;
    const repoInfo = findGitRoot(ctx.fs, ctx.cwd);

    if (sub === "status") {
      if (!repoInfo) return NOT_A_REPO;
      return text(`On branch ${repoInfo.branch}`, "nothing to commit, working tree clean");
    }

    if (sub === "log") {
      if (!repoInfo) return NOT_A_REPO;
      const res = await fetch("/api/terminal/git", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo: `${repoInfo.owner}/${repoInfo.repo}`, op: "log" }),
      });
      if (!res.ok) return error(`git log: ${(await res.json()).error ?? "request failed"}`);
      const { commits } = await res.json();
      if (!commits || commits.length === 0) return text("(no commits)");
      const lines = commits.flatMap((c: { short_sha: string; message: string; author_name: string; authored_at: string }) => [
        [{ text: `commit ${c.short_sha}`, tone: "signal" as const }],
        [{ text: `Author: ${c.author_name ?? "unknown"}` }],
        [{ text: `Date:   ${c.authored_at}` }],
        [{ text: "" }],
        [{ text: `    ${c.message}` }],
        [{ text: "" }],
      ]);
      if (lines.length > 20) {
        return {
          kind: "long",
          title: "git log",
          lineCount: lines.length,
          body: lines.map((l: { text: string }[]) => l.map((s) => s.text).join("")).join("\n"),
        };
      }
      return { kind: "text", lines };
    }

    if (sub === "show") {
      if (!repoInfo) return NOT_A_REPO;
      const sha = rest[0];
      if (!sha) return error("usage: git show <sha>");
      const res = await fetch("/api/terminal/git", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo: `${repoInfo.owner}/${repoInfo.repo}`, op: "show", sha }),
      });
      if (!res.ok) return error(`git show: ${(await res.json()).error ?? "request failed"}`);
      const { diff } = await res.json();
      return { kind: "long", title: `git show ${sha}`, lineCount: diff.split("\n").length, body: diff };
    }

    return error(`git: '${sub}' is not a supported command here (log, show, status)`);
  },
};
