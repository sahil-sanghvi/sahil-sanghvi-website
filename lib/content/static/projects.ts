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

  // ── sahil-sanghvi-projects: a monorepo of coursework/systems projects.
  //    Each one below is its own subfolder with its own README — scoped
  //    individually rather than grouped, so e.g. the airline check-in
  //    simulator gets its own card/link instead of being buried inside a
  //    generic "Systems" entry. README and repo link are scoped to the
  //    folder. news-search-app, survey-analyzer, and jpacman-test-suite
  //    aren't split further — each of those is already one project. ──
  {
    repo: "sahil-sanghvi/sahil-sanghvi-projects",
    path: "projects/graphics/rasterizer",
    slug: "rasterizer",
    title: "Rasterizer",
    tagline: "A software rasterization pipeline built from scratch — vertex/fragment/blending shaders, a z-buffer, animated output.",
    tech: ["C++"],
  },
  {
    repo: "sahil-sanghvi/sahil-sanghvi-projects",
    path: "projects/graphics/raytracer-advanced",
    slug: "recursive-raytracer",
    title: "Recursive Ray Tracer",
    tagline: "Shadows, reflection, refraction, and a procedural Perlin-noise texture, recursively traced on top of a basic ray tracer.",
    tech: ["C++"],
  },
  {
    repo: "sahil-sanghvi/sahil-sanghvi-projects",
    path: "projects/graphics/raytracer",
    slug: "raytracer",
    title: "Ray Tracer",
    tagline: "Orthographic and perspective cameras, ray-sphere/ray-parallelogram intersection, Blinn-Phong shading.",
    tech: ["C++"],
  },
  {
    repo: "sahil-sanghvi/sahil-sanghvi-projects",
    path: "projects/graphics/bvh-mesh-renderer",
    slug: "bvh-mesh-renderer",
    title: "BVH Mesh Renderer",
    tagline: "Ray tracing extended to triangle meshes, accelerated with a bounding-volume hierarchy instead of testing every triangle per ray.",
    tech: ["C++"],
  },
  {
    repo: "sahil-sanghvi/sahil-sanghvi-projects",
    path: "projects/graphics/geometry",
    slug: "computational-geometry",
    title: "Geometry",
    tagline: "2D computational geometry warm-up: point-in-polygon classification via ray casting.",
    tech: ["C++"],
  },
  {
    repo: "sahil-sanghvi/sahil-sanghvi-projects",
    path: "projects/systems/airline-checkin-sim",
    slug: "airline-checkin-sim",
    title: "Airline Check-in Simulation",
    tagline:
      "A multithreaded airline check-in counter — a fixed clerk pool pulling from two priority queues, with per-customer and per-clerk wait-time stats.",
    tech: ["C", "POSIX Threads"],
  },
  {
    repo: "sahil-sanghvi/sahil-sanghvi-projects",
    path: "projects/systems/fat12-toolkit",
    slug: "fat12-toolkit",
    title: "FAT12 Toolkit",
    tagline: "Four command-line tools that read and write a FAT12 filesystem image directly — mmap and manual structure parsing, no OS driver.",
    tech: ["C"],
  },
  {
    repo: "sahil-sanghvi/sahil-sanghvi-projects",
    path: "projects/systems/pman",
    slug: "pman-process-manager",
    title: "PMan — Process Manager",
    tagline: "An interactive shell that launches and manages background jobs with fork/exec, POSIX signals, and /proc.",
    tech: ["C", "POSIX"],
  },
  {
    repo: "sahil-sanghvi/sahil-sanghvi-projects",
    path: "projects/network-analysis/http-client",
    slug: "http-client",
    title: "HTTP Client",
    tagline: "A minimal HTTP/HTTPS client built directly on socket and ssl — no requests, no http.client.",
    tech: ["Python"],
  },
  {
    repo: "sahil-sanghvi/sahil-sanghvi-projects",
    path: "projects/network-analysis/tcp-analyzer",
    slug: "tcp-analyzer",
    title: "TCP Analyzer",
    tagline: "Parses a pcap file and reports every TCP connection it finds, without any packet-parsing library.",
    tech: ["Python"],
  },
  {
    repo: "sahil-sanghvi/sahil-sanghvi-projects",
    path: "projects/network-analysis/traceroute-analyzer",
    slug: "traceroute-analyzer",
    title: "Traceroute Analyzer",
    tagline: "Reconstructs a traceroute path from a raw packet capture, handling both major implementations and IP fragmentation.",
    tech: ["Python"],
  },
  {
    repo: "sahil-sanghvi/sahil-sanghvi-projects",
    path: "projects/data-structures/binary-search-tree-map",
    slug: "bst-map",
    title: "BST / Hash / Linked Map",
    tagline: "A Map ADT backed by three different structures — a BST, a hash table, and a linked list — behind one interface, with lookup-cost instrumentation.",
    tech: ["Java"],
  },
  {
    repo: "sahil-sanghvi/sahil-sanghvi-projects",
    path: "projects/data-structures/priority-queue",
    slug: "priority-queue",
    title: "Priority Queue",
    tagline: "A priority queue ADT — a binary-heap implementation compared against a sorted-linked-list one.",
    tech: ["Java"],
  },
  {
    repo: "sahil-sanghvi/sahil-sanghvi-projects",
    path: "projects/data-structures/queue",
    slug: "queue-adt",
    title: "Queue",
    tagline: "A generic queue ADT, applied to an event-lineup simulation.",
    tech: ["Java"],
  },
  {
    repo: "sahil-sanghvi/sahil-sanghvi-projects",
    path: "projects/data-structures/stack",
    slug: "stack-adt",
    title: "Stack",
    tagline: "A stack ADT plus a custom array-backed list, split across interface and implementation.",
    tech: ["Java"],
  },
  {
    repo: "sahil-sanghvi/sahil-sanghvi-projects",
    path: "projects/data-structures/linked-list",
    slug: "linked-list",
    title: "Linked List",
    tagline: "A singly linked list — a ListADT interface with SinglyLinkedList and ListNode behind it.",
    tech: ["Java"],
  },
  {
    repo: "sahil-sanghvi/sahil-sanghvi-projects",
    path: "projects/algorithms/maxflow-scheduler",
    slug: "maxflow-scheduler",
    title: "Max-Flow Scheduler",
    tagline: "Edmonds-Karp max-flow scheduling for a pilot/flight assignment feasibility problem.",
    tech: ["Java"],
  },
  {
    repo: "sahil-sanghvi/sahil-sanghvi-projects",
    path: "projects/algorithms/array-matching",
    slug: "array-matching",
    title: "Array Matching",
    tagline: "A divide-and-conquer algorithm for matching elements between two arrays.",
    tech: ["Java"],
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
    path: "projects/jpacman-test-suite",
    slug: "jpacman-test-suite",
    title: "JPacman Test Suite",
    tagline: "A JUnit + property-based test suite written against the open-source JPacman engine.",
    tech: ["Java", "JUnit 5", "jqwik"],
  },
];
