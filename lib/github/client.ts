import "server-only";

/**
 * GitHub is never called on a visitor request path — every call happens in
 * an admin action or the sync cron, server-side, with GITHUB_TOKEN. The
 * `server-only` import makes an accidental client-component import fail at
 * build time rather than leak the token at runtime.
 *
 * One GraphQL query, not five REST calls: repo metadata, languages, topics,
 * license, README, and recent commits all come back in a single request
 * costing one rate-limit point. GraphQL requires a token — unauthenticated
 * REST's 60/hr-per-IP limit is unusable on serverless anyway, since the IP
 * is shared across all visitors.
 */

const REPO_QUERY = `
query Repo($owner: String!, $name: String!) {
  repository(owner: $owner, name: $name) {
    name
    description
    homepageUrl
    url
    createdAt
    pushedAt
    stargazerCount
    forkCount
    isFork
    isArchived
    isEmpty
    watchers { totalCount }
    issues(states: OPEN) { totalCount }
    licenseInfo { spdxId name }
    primaryLanguage { name }
    repositoryTopics(first: 20) { nodes { topic { name } } }
    languages(first: 15, orderBy: { field: SIZE, direction: DESC }) {
      edges { size node { name } }
    }
    defaultBranchRef {
      name
      target {
        ... on Commit {
          history(first: 30) {
            nodes {
              oid
              abbreviatedOid
              messageHeadline
              committedDate
              url
              author { name user { login avatarUrl } }
            }
          }
        }
      }
    }
    readme: object(expression: "HEAD:README.md") { ... on Blob { text } }
    readmeLower: object(expression: "HEAD:readme.md") { ... on Blob { text } }
  }
}`;

export interface GithubRepoResponse {
  repository: {
    name: string;
    description: string | null;
    homepageUrl: string | null;
    url: string;
    createdAt: string;
    pushedAt: string | null;
    stargazerCount: number;
    forkCount: number;
    isFork: boolean;
    isArchived: boolean;
    isEmpty: boolean;
    watchers: { totalCount: number };
    issues: { totalCount: number };
    licenseInfo: { spdxId: string | null; name: string } | null;
    primaryLanguage: { name: string } | null;
    repositoryTopics: { nodes: { topic: { name: string } }[] };
    languages: { edges: { size: number; node: { name: string } }[] };
    defaultBranchRef: {
      name: string;
      target: {
        history: {
          nodes: {
            oid: string;
            abbreviatedOid: string;
            messageHeadline: string;
            committedDate: string;
            url: string;
            author: { name: string | null; user: { login: string; avatarUrl: string } | null };
          }[];
        };
      } | null;
    } | null;
    readme: { text: string } | null;
    readmeLower: { text: string } | null;
  } | null;
}

export class GithubApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}

export async function fetchRepo(owner: string, name: string): Promise<GithubRepoResponse> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new GithubApiError(
      "GITHUB_TOKEN isn't configured yet — add a fine-grained PAT (public repo metadata, read-only) to .env.local to enable GitHub ingest."
    );
  }

  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: REPO_QUERY, variables: { owner, name } }),
  });

  if (res.status === 401) {
    throw new GithubApiError("GitHub token is missing or invalid.", 401);
  }
  if (res.status === 403 && res.headers.get("x-ratelimit-remaining") === "0") {
    const resetAt = res.headers.get("x-ratelimit-reset");
    const resetDate = resetAt ? new Date(Number(resetAt) * 1000).toLocaleTimeString() : "soon";
    throw new GithubApiError(`GitHub rate limit reached, resets at ${resetDate}.`, 403);
  }
  if (!res.ok) {
    throw new GithubApiError(`GitHub API error (${res.status}).`, res.status);
  }

  const json = await res.json();
  if (json.errors?.length) {
    const notFound = json.errors.some((e: { type?: string }) => e.type === "NOT_FOUND");
    if (notFound) {
      throw new GithubApiError("Repo not found, or it's private. Check the URL.", 404);
    }
    throw new GithubApiError(json.errors[0]?.message ?? "GitHub GraphQL error.");
  }

  if (!json.data?.repository) {
    throw new GithubApiError("Repo not found, or it's private. Check the URL.", 404);
  }

  return json.data;
}
