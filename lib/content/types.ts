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
  /** Slugs of entries in projects.ts that demonstrate this skill — rendered
   *  as "used in" links under the skill's description. Empty when no
   *  specific project maps cleanly (e.g. a skill only exercised in coursework
   *  or an internship with no public repo). */
  related_projects: string[];
}

/** One category in the Skills.yaml tab — a raw, comprehensive technology
 *  list straight from the résumé (distinct from `Skill`, which is the
 *  curated flag-style list in the README's OPTIONS section). */
export interface SkillGroup {
  category: string;
  items: string[];
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

/** One row in the Courses.yaml tab — a UVic course with its own dedicated
 *  coursework repo (see lib/content/static/courses.ts). Distinct from
 *  `Project`: courses are academic record, not portfolio work, so they get
 *  their own tab instead of living in the Timeline or the Projects tab. */
export interface Course {
  id: string; // stable slug, e.g. "csc-110"
  code: string; // "CSC 110"
  title: string; // official UVic calendar title, e.g. "Fundamentals of Programming I"
  term: string | null; // "Fall 2023", or null if not tracked
  year: number; // 1-4, which year of the degree — used to group the list
  summary: string; // one line — what the repo contains, or why there isn't one
  repo_url: string | null; // null when there's no dedicated coursework repo (e.g. a math/writing requirement)
  project_slug?: string; // set when the coursework shipped as its own curated project (see lib/content/static/projects.ts) instead of a plain repo
  external_url?: string; // set when the course has its own site/subdomain (e.g. a project proposal page) that isn't a GitHub repo or an internal /projects page
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
