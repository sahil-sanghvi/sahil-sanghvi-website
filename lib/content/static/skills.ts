import type { Skill } from "../types";

/**
 * Rendered as CLI-flag documentation in the OPTIONS section
 * (components/site/pane-readme.tsx). The `name` is the flag; keep the
 * `-x, --long-name` shape — the heading is derived from the `--long-name`
 * part.
 */
export const skills: Skill[] = [
  {
    id: "python",
    name: "-py, --python",
    description:
      "My first language, at 14 — I taught it to 500+ students. Now it's for ML pipelines, data analysis, and glue.",
    category: "language",
    featured: true,
    related_projects: ["island-insight", "http-client", "tcp-analyzer"],
  },
  {
    id: "c-cpp",
    name: "-c, --c-cpp",
    description: "C and C++ — the systems fundamentals I taught alongside Python for four years.",
    category: "language",
    featured: true,
    related_projects: ["rasterizer", "recursive-raytracer", "pman-process-manager"],
  },
  {
    id: "typescript",
    name: "-ts, --typescript",
    description: "TypeScript end to end — this site, Palendar, PreCheck.ai.",
    category: "language",
    featured: true,
    related_projects: ["palendar", "precheck-ai"],
  },
  {
    id: "full-stack",
    name: "-web, --full-stack",
    description:
      "React and Next.js front to back, Postgres or SQLite behind it. Design, build, ship — this site included.",
    category: "practice",
    featured: true,
    related_projects: ["palendar", "precheck-ai"],
  },
  {
    id: "machine-learning",
    name: "-ml, --machine-learning",
    description:
      "Data analysis and model pipelines — RBC Borealis research cohort, AI-internship work at Protean.",
    category: "practice",
    featured: false,
    related_projects: ["island-insight", "exodetect"],
  },
  {
    id: "automation",
    name: "-auto, --automation",
    description:
      "Agentic pipelines that do real work unattended: repo ingest, resume parsing, provider failover. The automated mode of this very site.",
    category: "practice",
    featured: false,
    // No public projects.ts entry represents the site's own admin/ingest
    // pipeline — left empty rather than pointing at an unrelated project.
    related_projects: [],
  },
];
