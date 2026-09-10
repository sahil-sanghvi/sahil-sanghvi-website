import "server-only";
import type { GithubRepoResponse } from "./client";
import { renderReadme } from "./readme";
import type { Json } from "@/lib/supabase/database.types";

const README_CHAR_LIMIT = 200_000; // ~200KB raw; rendered HTML stays well under Postgres text limits

export interface NormalizedGithub {
  github: {
    repo_owner: string;
    repo_name: string;
    default_branch: string | null;
    gh_description: string | null;
    homepage: string | null;
    stars: number;
    forks: number;
    watchers: number;
    open_issues: number;
    topics: string[];
    license_spdx: string | null;
    primary_language: string | null;
    languages: Record<string, number>;
    readme_md: string | null;
    readme_html: string | null;
    is_fork: boolean;
    is_archived: boolean;
    pushed_at: string | null;
    repo_created_at: string;
    last_synced_at: string;
    sync_status: "ok";
    raw: Json;
  };
  commits: {
    sha: string;
    short_sha: string;
    message: string;
    author_name: string | null;
    author_login: string | null;
    author_avatar_url: string | null;
    authored_at: string;
    html_url: string;
  }[];
}

export async function normalizeRepo(
  owner: string,
  name: string,
  data: GithubRepoResponse
): Promise<NormalizedGithub> {
  const repo = data.repository;
  if (!repo) throw new Error("Repo not found, or it's private. Check the URL.");

  const languages: Record<string, number> = {};
  for (const edge of repo.languages.edges) {
    languages[edge.node.name] = edge.size;
  }

  const rawReadme = repo.readme?.text ?? repo.readmeLower?.text ?? null;
  const branch = repo.defaultBranchRef?.name ?? "main";

  let readmeHtml: string | null = null;
  const readmeMd = rawReadme ? rawReadme.slice(0, README_CHAR_LIMIT) : null;
  if (readmeMd) {
    readmeHtml = await renderReadme(readmeMd, owner, name, branch);
  }

  const commitNodes = repo.defaultBranchRef?.target?.history.nodes ?? [];

  return {
    github: {
      repo_owner: owner,
      repo_name: name,
      default_branch: repo.defaultBranchRef?.name ?? null,
      gh_description: repo.description,
      homepage: repo.homepageUrl,
      stars: repo.stargazerCount,
      forks: repo.forkCount,
      watchers: repo.watchers.totalCount,
      open_issues: repo.issues.totalCount,
      topics: repo.repositoryTopics.nodes.map((n) => n.topic.name),
      license_spdx: repo.licenseInfo?.spdxId ?? null,
      primary_language: repo.primaryLanguage?.name ?? null,
      languages,
      readme_md: readmeMd,
      readme_html: readmeHtml,
      is_fork: repo.isFork,
      is_archived: repo.isArchived,
      pushed_at: repo.pushedAt,
      repo_created_at: repo.createdAt,
      last_synced_at: new Date().toISOString(),
      sync_status: "ok",
      raw: repo as unknown as Json,
    },
    commits: commitNodes.map((c) => ({
      sha: c.oid,
      short_sha: c.abbreviatedOid,
      message: c.messageHeadline,
      author_name: c.author.name,
      author_login: c.author.user?.login ?? null,
      author_avatar_url: c.author.user?.avatarUrl ?? null,
      authored_at: c.committedDate,
      html_url: c.url,
    })),
  };
}
