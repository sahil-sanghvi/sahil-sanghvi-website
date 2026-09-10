export interface ParsedRepo {
  owner: string;
  name: string;
}

const NAME_CHARS = /^[A-Za-z0-9._-]+$/;

/**
 * Accepts https://github.com/owner/repo, .git suffix, /tree/branch paths,
 * SSH form, and bare owner/repo. Rejects anything else with a specific
 * message rather than a generic parse failure.
 */
export function parseGithubUrl(input: string): ParsedRepo {
  const trimmed = input.trim();
  if (!trimmed) throw new Error("Enter a GitHub repository URL.");

  let owner: string | undefined;
  let name: string | undefined;

  const sshMatch = trimmed.match(/^git@github\.com:([^/]+)\/([^/]+?)(\.git)?$/);
  if (sshMatch) {
    [, owner, name] = sshMatch;
  } else {
    let candidate = trimmed;
    if (!/^https?:\/\//i.test(candidate) && !candidate.includes("/")) {
      throw new Error("That doesn't look like a GitHub URL or owner/repo.");
    }
    if (!/^https?:\/\//i.test(candidate)) {
      // bare "owner/repo"
      const parts = candidate.split("/").filter(Boolean);
      if (parts.length !== 2) {
        throw new Error("Expected format: owner/repo, or a full GitHub URL.");
      }
      [owner, name] = parts;
    } else {
      try {
        const url = new URL(candidate);
        if (!/(^|\.)github\.com$/i.test(url.hostname)) {
          throw new Error("Only github.com URLs are supported.");
        }
        const parts = url.pathname.split("/").filter(Boolean);
        if (parts.length < 2) {
          throw new Error("URL doesn't contain an owner and repo name.");
        }
        [owner, name] = parts;
      } catch {
        throw new Error("Couldn't parse that as a URL.");
      }
    }
  }

  if (!owner || !name) {
    throw new Error("Couldn't find both an owner and a repo name.");
  }

  name = name.replace(/\.git$/i, "");

  if (!NAME_CHARS.test(owner) || !NAME_CHARS.test(name)) {
    throw new Error("Owner or repo name contains invalid characters.");
  }
  if (name.length > 100) {
    throw new Error("Repo name is too long to be valid.");
  }

  return { owner, name };
}
