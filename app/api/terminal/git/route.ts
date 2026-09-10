import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { getProjects } from "@/lib/content";
import { fetchRepoCommits } from "@/lib/content/github";

export const dynamic = "force-dynamic";

// Simple in-memory token bucket — a speed bump against casual scripting,
// not a security control. Serverless instances don't share this; the real
// control is the repo allowlist below.
const buckets = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;
const WINDOW_MS = 60_000;

function rateLimited(key: string): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  bucket.count++;
  return bucket.count > RATE_LIMIT;
}

const getCommitDiff = unstable_cache(
  async (owner: string, repo: string, sha: string) => {
    const token = process.env.GITHUB_TOKEN;
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits/${sha}`, {
      headers: {
        Accept: "application/vnd.github.v3.diff",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) throw new Error(`GitHub returned ${res.status}`);
    const diff = await res.text();
    const lines = diff.split("\n");
    return lines.length > 200 ? lines.slice(0, 200).join("\n") + `\n… ${lines.length - 200} more lines` : diff;
  },
  ["terminal-git-show"],
  { revalidate: 86_400, tags: ["gh-commit"] }
);

/** Repos the terminal is allowed to proxy — the curated project set only,
 *  or this endpoint becomes an open GitHub proxy on our rate limit. */
async function isAllowed(owner: string, repo: string): Promise<boolean> {
  const projects = await getProjects();
  return projects.some(
    (p) =>
      p.project_github?.owner.toLowerCase() === owner.toLowerCase() &&
      p.project_github?.repo.toLowerCase() === repo.toLowerCase()
  );
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const { repo, op, sha } = await request.json();
  if (typeof repo !== "string" || !repo.includes("/")) {
    return NextResponse.json({ error: "Invalid repo." }, { status: 400 });
  }
  const [owner, name] = repo.split("/");

  if (!(await isAllowed(owner, name))) {
    return NextResponse.json({ error: "Repo not recognized." }, { status: 404 });
  }

  if (op === "log") {
    const commits = await fetchRepoCommits(owner, name, 30);
    return NextResponse.json({ commits });
  }

  if (op === "show") {
    if (typeof sha !== "string") {
      return NextResponse.json({ error: "Missing sha." }, { status: 400 });
    }
    try {
      const diff = await getCommitDiff(owner, name, sha);
      return NextResponse.json({ diff });
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Failed to fetch diff." },
        { status: 502 }
      );
    }
  }

  return NextResponse.json({ error: "Unknown op." }, { status: 400 });
}
