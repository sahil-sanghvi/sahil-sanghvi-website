import type { ProjectSource } from "../types";

/**
 * Curated project list. Each entry names a GitHub repo (`owner/name`); the
 * build fetches its stars, languages, README, live URL, and recent commits
 * from GitHub and merges them in. The terminal's `~/projects` directory and
 * `git log` read from this same list.
 *
 * Add a project: append an entry with its `repo` and a `slug`. Everything
 * else is optional — `title`, `tagline`, `tech`, and `description_md`
 * override what GitHub reports. Then commit and push.
 */
export const projectSources: ProjectSource[] = [
  {
    repo: "sahil-sanghvi/nwhacks2026-precheckai",
    slug: "precheck-ai",
    title: "PreCheck.ai",
    tagline: "Pre-visit clinical intake triage — nwHacks 2026 (Best Use of Gemini API finalist).",
    tech: ["TypeScript", "React", "Python", "Gemini API"],
    featured: true,
    started_on: "2026-01-17",
    ended_on: "2026-01-18",
  },
  {
    repo: "sahil-sanghvi/lsi26-uvic-khlf",
    slug: "island-insight",
    title: "Island Insight",
    tagline: "Youth-health engagement analysis for RBC Borealis' Let's Solve It 2026 (Team Island Insight x KHLF).",
    tech: ["Python", "Jupyter", "Streamlit"],
    featured: true,
    started_on: "2026-03-01",
  },
  {
    repo: "sahil-sanghvi/palendar",
    slug: "palendar",
    title: "Palendar",
    tagline: "A calendar built for a Human–Computer Interaction course — interaction design as a first-class concern.",
    tech: ["TypeScript", "React"],
    started_on: "2026-02-06",
    ended_on: "2026-06-15",
  },
  {
    repo: "sahil-sanghvi/Medilink",
    slug: "medilink",
    title: "Medilink",
    tagline: "CRUD operations with at-rest encryption over JSON storage, built for a software-engineering course.",
    tech: ["Python"],
    started_on: "2026-02-17",
    ended_on: "2026-02-17",
  },
  {
    repo: "sahil-sanghvi/sign-and-remember",
    slug: "sign-and-remember",
    title: "Sign & Remember",
    tagline: "A memory game for learning the ASL alphabet.",
    tech: ["JavaScript"],
    started_on: "2024-02-27",
    ended_on: "2025-04-07",
  },
];
