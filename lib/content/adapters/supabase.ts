import "server-only";
import { createPublicClient } from "@/lib/supabase/public";
import type { Profile, Skill, Experience, Education, Project, ProjectGithub, EmploymentType } from "../types";

/**
 * CONTENT_SOURCE=supabase implementations — the "automated mode" reads the
 * same tables the /admin panel and the resume/GitHub ingest pipelines write
 * to. See docs/CONTENT.md for how to turn this on.
 */

const FALLBACK_PROFILE: Profile = {
  full_name: "Sahil Sanghvi",
  headline: "I build the whole thing — the product, and the pipeline that runs it.",
  bio_md: null,
  location: null,
  public_email: null,
  socials: {},
  available_for_work: false,
  resume_url: null,
};

export async function getProfile(): Promise<Profile> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("profile")
    .select("full_name, headline, bio_md, location, public_email, socials, available_for_work, resume_public_url")
    .eq("singleton", true)
    .maybeSingle();
  if (!data) return FALLBACK_PROFILE;
  return {
    full_name: data.full_name ?? FALLBACK_PROFILE.full_name,
    headline: data.headline ?? FALLBACK_PROFILE.headline,
    bio_md: data.bio_md,
    location: data.location,
    public_email: data.public_email,
    socials: (data.socials as Record<string, string> | null) ?? {},
    available_for_work: data.available_for_work,
    resume_url: data.resume_public_url,
  };
}

export async function getSkills(): Promise<Skill[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("skills")
    .select("id, name, description, category, featured")
    .eq("status", "published")
    .order("sort_order");
  return (data ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    category: (s.category as Skill["category"]) ?? null,
    featured: s.featured,
  }));
}

export async function getExperience(): Promise<Experience[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("experience")
    .select(
      "id, org, role, employment_type, location, start_date, end_date, is_current, summary_md, highlights, tech"
    )
    .eq("status", "published")
    .order("start_date", { ascending: false });
  return (data ?? []).map((e) => ({
    id: e.id,
    org: e.org,
    role: e.role,
    employment_type: (e.employment_type as EmploymentType | null) ?? null,
    location: e.location,
    start_date: e.start_date,
    end_date: e.end_date,
    is_current: Boolean(e.is_current),
    summary_md: e.summary_md,
    highlights: e.highlights ?? [],
    tech: e.tech ?? [],
  }));
}

export async function getEducation(): Promise<Education[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("education")
    .select("id, institution, credential, field_of_study, location, start_date, end_date, is_current, highlights")
    .eq("status", "published")
    .order("start_date", { ascending: false });
  return (data ?? []).map((e) => ({
    id: e.id,
    institution: e.institution,
    credential: e.credential,
    field_of_study: e.field_of_study,
    location: e.location,
    start_date: e.start_date,
    end_date: e.end_date,
    is_current: Boolean(e.is_current),
    highlights: e.highlights ?? [],
  }));
}

type GhRow = {
  repo_owner: string;
  repo_name: string;
  default_branch: string | null;
  stars: number;
  primary_language: string | null;
  languages: unknown;
  topics: string[] | null;
  readme_md: string | null;
  readme_html: string | null;
  pushed_at: string | null;
  homepage: string | null;
};

function toGithub(row: GhRow | null | undefined): ProjectGithub | null {
  if (!row) return null;
  return {
    owner: row.repo_owner,
    repo: row.repo_name,
    default_branch: row.default_branch ?? "main",
    stars: row.stars ?? 0,
    primary_language: row.primary_language,
    languages: (row.languages as Record<string, number> | null) ?? {},
    topics: row.topics ?? [],
    readme_md: row.readme_md,
    readme_html: row.readme_html,
    pushed_at: row.pushed_at,
    html_url: `https://github.com/${row.repo_owner}/${row.repo_name}`,
    homepage: row.homepage,
  };
}

const PROJECT_SELECT =
  "id, slug, title, tagline, description_md, role, tech, live_url, repo_url, started_on, ended_on, featured, cover_image_url, " +
  "project_github(repo_owner, repo_name, default_branch, stars, primary_language, languages, topics, readme_md, readme_html, pushed_at, homepage)";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToProject(p: any): Project {
  const gh = Array.isArray(p.project_github) ? p.project_github[0] : p.project_github;
  return {
    id: p.id,
    slug: p.slug,
    // The DB schema predates the hackathon/project distinction added for
    // static mode — every automated-mode project renders as "project".
    kind: "project",
    title: p.title,
    tagline: p.tagline,
    description_md: p.description_md,
    role: p.role,
    tech: p.tech ?? [],
    live_url: p.live_url,
    repo_url: p.repo_url,
    started_on: p.started_on,
    ended_on: p.ended_on,
    featured: p.featured,
    cover_image_url: p.cover_image_url,
    project_github: toGithub(gh),
  };
}

export async function getProjects(): Promise<Project[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("projects")
    .select(PROJECT_SELECT)
    .eq("status", "published")
    .order("sort_order");
  return (data ?? []).map(rowToProject);
}

export async function getProject(slug: string): Promise<Project | null> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("projects")
    .select(PROJECT_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  return data ? rowToProject(data) : null;
}
