import "server-only";
import { renderReadme } from "@/lib/github/readme";
import type { ProjectGithub } from "./types";

/**
 * Fetches a single public repo's metadata straight from GitHub's REST API —
 * no token required (unauthenticated REST works for public repos at 60
 * req/hr/IP; a GITHUB_TOKEN, if set, lifts that to 5000 and is used
 * automatically). Every call is ISR-cached for a day, and a failure
 * (rate-limit, outage, renamed repo) returns null rather than throwing, so
 * `next build` never breaks on GitHub being unavailable.
 */

const REVALIDATE = 86_400; // 1 day

function ghHeaders(extra: Record<string, string> = {}): HeadersInit {
  const token = process.env.GITHUB_TOKEN;
  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

type RepoMeta = {
  name: string;
  full_name: string;
  html_url: string;
  homepage: string | null;
  description: string | null;
  default_branch: string;
  stargazers_count: number;
  language: string | null;
  topics?: string[];
  pushed_at: string | null;
};

export async function fetchRepoData(owner: string, name: string): Promise<ProjectGithub | null> {
  try {
    const metaRes = await fetch(`https://api.github.com/repos/${owner}/${name}`, {
      headers: ghHeaders(),
      next: { revalidate: REVALIDATE },
    });
    if (!metaRes.ok) return null;
    const meta = (await metaRes.json()) as RepoMeta;
    const branch = meta.default_branch || "main";

    const [languages, readmeMd] = await Promise.all([
      fetchLanguages(owner, name),
      fetchReadme(owner, name),
    ]);

    const readmeHtml = readmeMd ? await renderReadme(readmeMd, owner, name, branch) : null;

    return {
      owner,
      repo: name,
      default_branch: branch,
      stars: meta.stargazers_count ?? 0,
      primary_language: meta.language ?? null,
      languages,
      topics: meta.topics ?? [],
      readme_md: readmeMd,
      readme_html: readmeHtml,
      pushed_at: meta.pushed_at,
      html_url: meta.html_url,
      homepage: meta.homepage && meta.homepage.trim() ? meta.homepage.trim() : null,
    };
  } catch {
    return null;
  }
}

async function fetchLanguages(owner: string, name: string): Promise<Record<string, number>> {
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${name}/languages`, {
      headers: ghHeaders(),
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) return {};
    return (await res.json()) as Record<string, number>;
  } catch {
    return {};
  }
}

const README_CHAR_LIMIT = 200_000;

async function fetchReadme(owner: string, name: string): Promise<string | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${name}/readme`, {
      headers: ghHeaders({ Accept: "application/vnd.github.raw+json" }),
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) return null;
    const text = await res.text();
    return text ? text.slice(0, README_CHAR_LIMIT) : null;
  } catch {
    return null;
  }
}

export type RepoCommit = {
  short_sha: string;
  message: string;
  author_name: string | null;
  authored_at: string;
};

/** Recent commits for the terminal's `git log`. ISR-cached, graceful on failure. */
export async function fetchRepoCommits(owner: string, name: string, limit = 30): Promise<RepoCommit[]> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${name}/commits?per_page=${limit}`,
      { headers: ghHeaders(), next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const raw = (await res.json()) as Array<{
      sha: string;
      commit: { message: string; author: { name: string | null; date: string } | null };
      author: { login: string } | null;
    }>;
    return raw.map((c) => ({
      short_sha: c.sha.slice(0, 7),
      message: c.commit.message.split("\n")[0],
      author_name: c.commit.author?.name ?? c.author?.login ?? null,
      authored_at: c.commit.author?.date ?? "",
    }));
  } catch {
    return [];
  }
}
