import type { ProjectSource } from "../types";

/**
 * Curated project list. Each entry names a GitHub repo (`owner/name`); the
 * build fetches its stars, languages, README, live URL, and recent commits
 * from GitHub and merges them in. The terminal's `~/projects` directory and
 * `git log` read from this same list.
 *
 * Add a project: append an entry with its `repo` and a `slug`, and set
 * `live_url` to wherever it's actually deployed — GitHub's repo "homepage"
 * field is only used as a fallback when `live_url` is omitted, and most
 * repos don't have one set. Set `kind: "hackathon"` for anything built at a
 * hackathon (badge on the card); everything else defaults to "project".
 * `path` pulls one project out of a monorepo that holds several (its own
 * README, scoped repo link) — see the sahil-sanghvi-projects entries below
 * for the pattern. Everything else is optional — `title`, `tagline`,
 * `tech`, and `description_md` override what GitHub reports. Then commit
 * and push.
 */
export const projectSources: ProjectSource[] = [
  {
    repo: "sahil-sanghvi/nwhacks2026-precheckai",
    slug: "precheck-ai",
    kind: "hackathon",
    title: "PreCheck.ai",
    tagline: "Pre-visit clinical intake triage — nwHacks 2026 (Best Use of Gemini API finalist).",
    tech: ["TypeScript", "React", "Python", "Gemini API"],
    featured: true,
  },
  {
    repo: "sahil-sanghvi/lsi26-uvic-khlf",
    slug: "island-insight",
    title: "Island Insight",
    tagline: "Youth-health engagement analysis for RBC Borealis' Let's Solve It 2026 (Team Island Insight x KHLF).",
    tech: ["Python", "Jupyter", "Streamlit"],
    featured: true,
  },
  {
    repo: "sahil-sanghvi/puppeteer",
    slug: "puppeteer",
    kind: "hackathon",
    title: "Puppeteer",
    tagline: "An AI-runtime proof of concept, built in 30 hours — Hack the North 2025 Grand Finalist.",
    tech: ["Python"],
    featured: true,
  },
  {
    repo: "sahil-sanghvi/exodetect",
    slug: "exodetect",
    kind: "hackathon",
    title: "ExoDetect",
    tagline: "AI-powered exoplanet detection on NASA Kepler mission data — NASA Space Apps Challenge 2025.",
    tech: ["TypeScript", "Python", "FastAPI", "Machine Learning"],
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

  // ── sahil-sanghvi-projects: a monorepo of coursework/systems projects,
  //    one folder each — README and repo link are scoped to the folder. ──
  {
    repo: "sahil-sanghvi/sahil-sanghvi-projects",
    path: "projects/graphics",
    slug: "graphics-pipeline",
    title: "Graphics",
    tagline:
      "Five C++ renderers building up to a full software rasterization pipeline — geometry, ray tracing, BVH acceleration, and animated output.",
    tech: ["C++", "Eigen"],
  },
  {
    repo: "sahil-sanghvi/sahil-sanghvi-projects",
    path: "projects/systems",
    slug: "systems-programs",
    title: "Systems",
    tagline: "Three Linux systems programs in C: process control, thread synchronization, and raw FAT12 filesystem I/O.",
    tech: ["C", "POSIX"],
  },
  {
    repo: "sahil-sanghvi/sahil-sanghvi-projects",
    path: "projects/network-analysis",
    slug: "network-analysis",
    title: "Network Analysis",
    tagline:
      "Hand-rolled packet parsers in Python — an HTTP/HTTPS client, a TCP connection analyzer, and a traceroute analyzer, no scapy or requests.",
    tech: ["Python"],
  },
  {
    repo: "sahil-sanghvi/sahil-sanghvi-projects",
    path: "projects/news-search-app",
    slug: "news-search-app",
    title: "News Search App",
    tagline: "A vanilla-JS front end searching live news via the GNews API.",
    tech: ["HTML", "CSS", "JavaScript"],
  },
  {
    repo: "sahil-sanghvi/sahil-sanghvi-projects",
    path: "projects/survey-analyzer",
    slug: "survey-analyzer",
    title: "Survey Analyzer",
    tagline: "A modular C program analyzing Likert-scale survey data, with reverse-coded scoring split across five focused modules.",
    tech: ["C"],
  },
  {
    repo: "sahil-sanghvi/sahil-sanghvi-projects",
    path: "projects/data-structures",
    slug: "data-structures",
    title: "Data Structures",
    tagline: "Five ADT implementations in Java — list, stack, queue, priority queue, map — each with an interface/implementation split.",
    tech: ["Java"],
  },
  {
    repo: "sahil-sanghvi/sahil-sanghvi-projects",
    path: "projects/algorithms",
    slug: "algorithms",
    title: "Algorithms",
    tagline: "Edmonds-Karp max-flow scheduling and a divide-and-conquer array-matching algorithm, in Java.",
    tech: ["Java"],
  },
  {
    repo: "sahil-sanghvi/sahil-sanghvi-projects",
    path: "projects/jpacman-test-suite",
    slug: "jpacman-test-suite",
    title: "JPacman Test Suite",
    tagline: "A JUnit + property-based test suite written against the open-source JPacman engine.",
    tech: ["Java", "JUnit 5", "jqwik"],
  },
];
