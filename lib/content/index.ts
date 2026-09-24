import "server-only";
import { cache } from "react";
import type { Profile, Skill, Experience, Education, Project, SkillGroup } from "./types";
import * as staticSource from "./adapters/static";
import * as supabaseSource from "./adapters/supabase";

export type { Profile, Skill, Experience, Education, Project, ProjectGithub, SkillGroup } from "./types";

/**
 * "static" (default) reads committed files in lib/content/static/*, hydrating
 * projects from GitHub at build time. "supabase" reads the DB the /admin
 * panel and ingest pipelines write to. Flip with the CONTENT_SOURCE env var
 * — see docs/CONTENT.md.
 */
export const CONTENT_SOURCE: "static" | "supabase" =
  process.env.CONTENT_SOURCE === "supabase" ? "supabase" : "static";

const source = CONTENT_SOURCE === "supabase" ? supabaseSource : staticSource;

export const getProfile = cache((): Promise<Profile> => source.getProfile());
export const getSkills = cache((): Promise<Skill[]> => source.getSkills());
export const getTechnicalSkills = cache((): Promise<SkillGroup[]> => source.getTechnicalSkills());
export const getExperience = cache((): Promise<Experience[]> => source.getExperience());
export const getEducation = cache((): Promise<Education[]> => source.getEducation());
export const getProjects = cache((): Promise<Project[]> => source.getProjects());

export const getProject = cache(async (slug: string): Promise<Project | null> => {
  if (CONTENT_SOURCE === "supabase") return supabaseSource.getProject(slug);
  const all = await staticSource.getProjects();
  return all.find((p) => p.slug === slug) ?? null;
});
