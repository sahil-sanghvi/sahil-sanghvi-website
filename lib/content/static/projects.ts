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
 * Most entries below are their own full repo — no `path` needed. `path`
 * pulls one project out of a monorepo that holds several (its own README,
 * scoped repo link); `news-search-app` is the only entry still using this,
 * scoped into the `sahil-sanghvi-projects` monorepo (the coursework that
 * used to live alongside it there has since been split into its own
 * dedicated per-course repos, each added as a plain standalone entry).
 * Everything else is optional — `title`, `tagline`, `tech`, and
 * `description_md` override what GitHub reports. Then commit and push.
 */
export const projectSources: ProjectSource[] = [
  {
    repo: "sahil-sanghvi/nwhacks2026-precheckai",
    slug: "precheck-ai",
    kind: "hackathon",
    title: "PreCheck.ai",
    tagline: "AI-powered health insurance claims assistant — Runner-Up (Google Gemini Track) & Best .tech Domain, nwHacks 2026.",
    description_md:
      "Shipped a healthtech MVP among 100+ competing teams in under 24 hours, leading a 4-person team. A 4-stage ML validation pipeline — Gemini Vision OCR, RAG-based policy retrieval, HistGradientBoosting risk scoring (0–100 denial probability), and a remediation dashboard with citation-level fixes — covering the full claim lifecycle across Prevention, Pre-Submission, and Appeal flows, validated against 10+ required fields.",
    tech: ["React", "TypeScript", "FastAPI", "scikit-learn", "RAG"],
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
    tagline: "97.3% accuracy classifying exoplanets from NASA light-curve data — People's Choice Award, NASA International SpaceApps Challenge 2025.",
    description_md:
      "Achieved 97.3% accuracy classifying exoplanets from NASA light-curve data with ensemble ML models, outperforming baselines by 40%. Cut API latency under 180ms and preprocessing compute time by 72% with a full-stack FastAPI + Docker + Next.js pipeline using vectorization and caching.",
    tech: ["TypeScript", "Next.js", "FastAPI", "XGBoost", "LightGBM"],
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

  // ── sahil-sanghvi-projects: a monorepo that used to hold a bunch of
  //    coursework/systems projects, each scoped individually via `path` so
  //    it got its own card/link instead of being buried in a generic
  //    grouped entry. That coursework has since been split out into its own
  //    dedicated per-course repos (see the standalone UVic-coursework
  //    entries below) — news-search-app is the only one left here. ──
  {
    repo: "sahil-sanghvi/sahil-sanghvi-projects",
    path: "projects/news-search-app",
    slug: "news-search-app",
    title: "News Search App",
    tagline: "A vanilla-JS front end searching live news via the GNews API.",
    tech: ["HTML", "CSS", "JavaScript"],
  },

  // ── UVic coursework, split into dedicated per-course repos. ──
  {
    repo: "sahil-sanghvi/fundamentals-of-programming-1",
    slug: "python-fundamentals",
    title: "Python Fundamentals",
    tagline: "10 labs and 10 assignments in Python — variables and functions through file I/O, dictionaries, and an early intro to classes.",
    tech: ["Python"],
  },
  {
    repo: "sahil-sanghvi/fundamentals-of-programming-2",
    slug: "java-data-structures",
    title: "Java Data Structures",
    tagline: "6 labs and 9 assignments in Java — ADTs from linked lists and stacks through heaps, BSTs, and hash maps.",
    tech: ["Java"],
  },
  {
    repo: "sahil-sanghvi/introduction-to-computer-graphics",
    slug: "graphics-from-scratch",
    title: "Graphics From Scratch",
    tagline: "Five C++ renderers built up in stages: 2D geometry, a ray tracer, a recursive ray tracer, a BVH-accelerated mesh renderer, and a software rasterizer.",
    tech: ["C++"],
  },
  {
    repo: "sahil-sanghvi/operating-systems",
    slug: "systems-programming-toolkit",
    title: "Systems Programming Toolkit",
    tagline: "Three Linux systems programs in C: a process manager, a pthreads-based concurrency simulator, and a FAT12 filesystem toolkit.",
    tech: ["C", "POSIX"],
  },
  {
    repo: "sahil-sanghvi/computer-communications-and-networks",
    slug: "network-protocol-tools",
    title: "Network Protocol Tools",
    tagline: "Three Python tools working at the raw packet level: an HTTP/HTTPS client, a TCP connection analyzer, and a traceroute path reconstructor.",
    tech: ["Python"],
  },
  {
    repo: "sahil-sanghvi/database-systems",
    slug: "sql-database-design",
    title: "SQL Database Design",
    tagline: "Relational algebra and analytical SQL across two assignments — a joint pizza/soccer exercise and a solo ships/S&P 500 exercise with window functions and constraint-enforcing views.",
    tech: ["SQL"],
  },
  {
    repo: "sahil-sanghvi/software-development-methods",
    slug: "survey-response-analyzer",
    title: "Survey Response Analyzer",
    tagline: "A modular C program analyzing Likert-scale survey data, split across five single-responsibility modules.",
    tech: ["C"],
  },
  {
    repo: "sahil-sanghvi/software-testing",
    slug: "pacman-test-suite",
    title: "Pacman Test Suite",
    tagline: "A JUnit 5 + property-based (jqwik) test suite written against the open-source JPacman engine.",
    tech: ["Java", "JUnit 5", "jqwik"],
  },
  {
    repo: "sahil-sanghvi/algorithms-and-data-structures-1",
    slug: "algorithm-performance-lab",
    title: "Algorithm Performance Lab",
    tagline: "Two algorithms exercises comparing approaches by measured performance at scale: array matching and brute-force-vs-sorted pair finding.",
    tech: ["Java"],
  },
  {
    repo: "sahil-sanghvi/algorithms-and-data-structures-2",
    slug: "network-flow-matching",
    title: "Network Flow Matching",
    tagline: "An Edmonds-Karp max-flow solver for a flight/pilot assignment feasibility problem.",
    tech: ["Java"],
  },
  {
    repo: "sahil-sanghvi/introduction-to-computer-architecture",
    slug: "embedded-avr-projects",
    title: "Embedded AVR Projects",
    tagline: "Four assignments on an ATmega2560: bit-manipulation in AVR assembly, a signalling exercise, an interrupt-driven LCD display, and a C-based digital clock.",
    tech: ["AVR Assembly", "C"],
  },
  {
    repo: "sahil-sanghvi/the-practice-of-computer-science",
    slug: "olympics-sql-analytics",
    title: "Olympics SQL Analytics",
    tagline: "A SQLite exercise querying an Olympics athletes/events/medals database.",
    tech: ["SQL"],
  },
  {
    repo: "sahil-sanghvi/world-wide-web-and-mobile-applications",
    slug: "web-dev-fundamentals",
    title: "Web Dev Fundamentals",
    tagline: "Two projects and four labs covering HTML/CSS/JavaScript fundamentals.",
    tech: ["HTML", "CSS", "JavaScript"],
  },
  {
    repo: "sahil-sanghvi/data-science",
    slug: "statistical-computing-r",
    title: "Statistical Computing in R",
    tagline: "Four assignments and ten labs in R Markdown — sampling design, data wrangling, hypothesis testing, and regression.",
    tech: ["R"],
  },
  {
    repo: "sahil-sanghvi/3d-printing-rapid-prototyping-and-design",
    slug: "cad-3d-printing-designs",
    title: "CAD & 3D Printing Designs",
    tagline: "CAD models and print-ready files from a hands-on 3D design and printing breadth course.",
    tech: ["CAD", "3D Printing"],
  },
  {
    repo: "sahil-sanghvi/programming-languages",
    slug: "programming-languages",
    title: "Programming Languages",
    tagline: "Five assignments across OCaml, Racket, Ruby, and APL — functional sets, streams, an interpreter built in two paradigms, and DNA-sequence analysis.",
    tech: ["OCaml", "Racket", "Ruby", "APL"],
  },
];
