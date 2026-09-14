/**
 * Domain content types — the shape the site actually renders.
 *
 * Field names are snake_case on purpose: they match what the pane components
 * (components/site/pane-*.tsx) and lib/site/timeline.ts already read, so the
 * static/Supabase source swap needs no component changes. Both content
 * adapters (lib/content/static/*, lib/content/adapters/supabase.ts) produce
 * these types.
 */

export type Socials = Record<string, string>; // label -> url, e.g. { GitHub: "https://..." }

export interface Profile {
  full_name: string;
  headline: string;
  bio_md: string | null;
  location: string | null;
  public_email: string | null;
  socials: Socials;
  available_for_work: boolean;
  resume_url: string | null;
}

export type SkillCategory = "language" | "framework" | "tool" | "platform" | "practice";

export interface Skill {
  id: string; // stable slug
  name: string; // "-ml, --machine-learning"
  description: string | null;
  category: SkillCategory | null;
  featured: boolean;
}

export type EmploymentType =
  | "full-time"
  | "part-time"
  | "contract"
  | "freelance"
  | "internship"
  | "volunteer";

export interface Experience {
  id: string;
  org: string;
  role: string;
  employment_type: EmploymentType | null;
  location: string | null;
  start_date: string; // "YYYY-MM-DD"
  end_date: string | null; // null = current
  is_current: boolean;
  summary_md: string | null;
  highlights: string[];
  tech: string[];
}

export interface Education {
  id: string;
  institution: string;
  credential: string | null;
  field_of_study: string | null;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  highlights: string[];
}

export interface ProjectGithub {
  owner: string;
  repo: string;
  default_branch: string;
  stars: number;
  primary_language: string | null;
  languages: Record<string, number>; // language -> bytes
  topics: string[];
  readme_md: string | null;
  readme_html: string | null;
  pushed_at: string | null;
  html_url: string;
  homepage: string | null;
}

/** "hackathon" gets its own badge on the projects tab/timeline; everything else is "project". */
export type ProjectKind = "project" | "hackathon";

export interface Project {
  id: string;
  slug: string;
  kind: ProjectKind;
  title: string;
  tagline: string | null;
  description_md: string | null;
  role: string | null;
  tech: string[];
  live_url: string | null;
  repo_url: string | null;
  started_on: string | null;
  ended_on: string | null;
  featured: boolean;
  cover_image_url: string | null;
  project_github: ProjectGithub | null;
}

/** A curated project entry in lib/content/static/projects.ts. */
export interface ProjectSource {
  /** "owner/name" on GitHub. */
  repo: string;
  /** Subdirectory within the repo, for a monorepo holding several projects
   *  (e.g. "projects/graphics") — the README, and repo_url, are scoped to
   *  it. Repo-wide stats (stars, languages) don't make sense per-folder, so
   *  a scoped entry should always set `tech` explicitly. */
  path?: string;
  slug: string;
  kind?: ProjectKind;
  /** Overrides the GitHub repo name. */
  title?: string;
  /** Overrides the GitHub description. */
  tagline?: string;
  /** Overrides GitHub's repo "homepage" field — set this explicitly for any
   *  repo without one configured on GitHub (or to point somewhere else). */
  live_url?: string;
  /** Full prose shown on /projects/[slug] above the README. */
  description_md?: string;
  role?: string;
  /** Overrides GitHub language stats for the card/timeline chips. */
  tech?: string[];
  featured?: boolean;
  started_on?: string;
  ended_on?: string;
}
