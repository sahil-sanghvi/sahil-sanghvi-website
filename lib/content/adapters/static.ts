import "server-only";
import type { Profile, Skill, Experience, Education, Project } from "../types";
import { profile } from "../static/profile";
import { skills } from "../static/skills";
import { experience } from "../static/experience";
import { education } from "../static/education";
import { projectSources } from "../static/projects";
import { fetchRepoData } from "../github";

export async function getProfile(): Promise<Profile> {
  return profile;
}

export async function getSkills(): Promise<Skill[]> {
  return skills;
}

export async function getExperience(): Promise<Experience[]> {
  return experience;
}

export async function getEducation(): Promise<Education[]> {
  return education;
}

export async function getProjects(): Promise<Project[]> {
  const projects = await Promise.all(
    projectSources.map(async (src): Promise<Project> => {
      const [owner, name] = src.repo.split("/");
      const gh = await fetchRepoData(owner, name, src.path);

      const tech =
        src.tech ??
        (gh ? Object.keys(gh.languages).slice(0, 5) : []).filter((l) => l !== "Shell" && l !== "Dockerfile");

      return {
        id: src.slug,
        slug: src.slug,
        kind: src.kind ?? "project",
        title: src.title ?? name,
        tagline: src.tagline ?? gh?.readme_md?.split("\n").find((l) => l.trim() && !l.startsWith("#"))?.trim() ?? null,
        description_md: src.description_md ?? null,
        role: src.role ?? null,
        tech,
        live_url: src.live_url ?? gh?.homepage ?? null,
        repo_url: gh?.html_url ?? `https://github.com/${src.repo}`,
        started_on: src.started_on ?? null,
        ended_on: src.ended_on ?? null,
        featured: src.featured ?? false,
        // A monorepo subproject sharing the parent repo's OG card image
        // would look identical across every entry — fall back to the
        // initials tile (see components/site/pane-projects.tsx) instead.
        cover_image_url: src.path ? null : `https://opengraph.githubassets.com/1/${src.repo}`,
        project_github: gh,
      };
    })
  );
  return projects;
}
