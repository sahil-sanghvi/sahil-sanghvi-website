import type { Experience } from "../types";

/**
 * Ordered newest-first. `employment_type: "volunteer"` routes an entry to
 * the VOLUNTEER lane on the landing-page timeline; everything else is WORK.
 * `end_date: null` marks a role as current.
 */
export const experience: Experience[] = [
  {
    id: "stealth-startup",
    org: "Stealth Startup",
    role: "Head Software Engineer",
    employment_type: "full-time",
    location: "Remote",
    start_date: "2026-05-01",
    end_date: null,
    is_current: true,
    summary_md:
      "Leading a team of 3 engineers building 3 products end-to-end: a mentor-mentee marketplace, an AI interview practice bot, and a career-services platform.",
    highlights: [
      "Own system design for an Airbnb-style marketplace connecting mentees with mentors for skills-based, hourly-rate sessions — discovery, booking, and payments.",
      "Built an AI interview practice bot on FastAPI with live video/audio capture and real-time voice synthesis, backed by multi-provider LLM and speech-to-text failover chains.",
      "Integrated HMAC-verified Razorpay payments to gate access to interview results.",
      "Built the startup's WordPress marketing site and a custom PHP admin portal, integrated with the interview bot via a REST bridge, for recruiters to manage interviews, candidates, and payments from one dashboard.",
    ],
    tech: ["FastAPI", "PHP", "WordPress"],
  },
  {
    id: "protean-egov",
    org: "Protean eGov Technologies",
    role: "AI Intern — CIO Department",
    employment_type: "internship",
    location: "Mumbai, India (remote)",
    start_date: "2026-05-01",
    end_date: "2026-08-01",
    is_current: false,
    summary_md:
      "Designed the architecture for an agentic AI platform automating end-to-end social media marketing, technical SEO, and Generative Engine Optimization (GEO) across 5 platforms for a national e-governance infrastructure company.",
    highlights: [
      "Architected a 6-agent LangGraph orchestration system (Trend, Competitor, Performance, Prediction, Strategy, Calendar) with a custom LLM Gateway for per-agent model tiering, cost caps, and hot-swappable routing.",
      "Backed the platform with a Redis caching layer and pgvector semantic search over 30 competitor handles for RAG-powered competitive intelligence.",
      "Shipped a production NLP/RAG chatbot, now in UAT and impacting 1,000+ employees, with role-based access control and hallucination guardrails.",
      "Architected a serverless, event-driven GCP deployment scaling to zero at $260–280/month with Microsoft Entra ID SSO/OIDC and RBAC.",
      "Authored the Solutions & Architecture Document, security protocols, and a NIST CSF sign-off checklist, bringing the platform into DPDP Act 2023 compliance.",
    ],
    tech: ["Python", "LangGraph", "GCP", "Redis", "pgvector"],
  },
  {
    id: "rbc-borealis-lsi",
    org: "RBC Borealis — Let's Solve It Mentorship",
    role: "AI & Machine Learning Research Fellow",
    employment_type: "internship",
    location: "Remote, Canada",
    start_date: "2026-03-01",
    end_date: "2026-05-01",
    is_current: false,
    summary_md:
      "Selected for RBC Borealis' competitive Spring 2026 cohort. Developed a real-world AI/ML solution in a team of 4 mentees alongside 2 senior RBC AI researchers (Team Island Insight x KHLF).",
    highlights: [
      "Surfaced disengagement signals across 20+ behavioural features via exploratory data analysis on 1,500+ longitudinal youth health engagement records spanning 3+ years.",
      "Isolated 4+ distinct user cohorts by reducing high-dimensional engagement data to 2D embeddings with UMAP clustering in scikit-learn.",
      "Engineered a PyTorch pipeline to flag at-risk youth navigating chronic illness, enabling earlier clinical intervention.",
      "Corrected inflated raw DAU from 40 to 27 for stakeholder and funder reporting by building a GA4 analytics pipeline with bot-aware filtering across 1,048 days of data.",
      "Designed a multi-page Streamlit dashboard backed by 5 ML models spanning forecasting, anomaly detection, and clustering, serving 4+ clinical and program teams.",
    ],
    tech: ["Python", "PyTorch", "scikit-learn", "UMAP", "Streamlit"],
  },
  {
    id: "vimea-uvic",
    org: "VIMEA — Manufacturing Collaboration Platform (UVic)",
    role: "Technical Consultant",
    employment_type: "contract",
    location: "Victoria, BC",
    start_date: "2025-09-01",
    end_date: "2025-12-01",
    is_current: false,
    summary_md:
      "Requirements engineering and technical documentation for a manufacturing collaboration platform, working with UX specialists, business stakeholders, and technical mentors.",
    highlights: [
      "Ran stakeholder interviews and requirements engineering to define the project specification.",
      "Produced technical documentation and mentor-meeting reports tracking delivery.",
    ],
    tech: [],
  },
  {
    id: "interconnect-mentor",
    org: "First Year Interconnect Mentorship Program (UVic)",
    role: "Mentor",
    employment_type: "volunteer",
    location: "Victoria, BC",
    start_date: "2025-09-01",
    end_date: null,
    is_current: true,
    summary_md:
      "Mentor first-year students through the transition to university, connecting them to campus resources and residence life.",
    highlights: [
      "Build one-on-one relationships with mentees to help them navigate campus resources.",
      "Support student well-being with regular check-ins and referrals to university services.",
    ],
    tech: [],
  },
  {
    id: "umang-isa",
    org: "UVic UMANG Indian Students Association",
    role: "Vice President",
    employment_type: "volunteer",
    location: "Victoria, BC",
    start_date: "2023-09-01",
    end_date: null,
    is_current: true,
    summary_md:
      "Lead cross-cultural programming initiatives for 100+ students at UVic's Indian Students Association, preparing formal proposals for university departments and external stakeholders.",
    highlights: [
      "Lead an executive team running cultural events and workshops for 100+ students.",
      "Coordinate large-scale event logistics: venues, vendors, and volunteers.",
      "Partner with university administration on campus diversity initiatives.",
      "Mentor new members on academic resources and campus integration.",
      "Organize large-scale orientation events — timelines, logistics, and sponsorship/volunteer records via Google Workspace.",
    ],
    tech: [],
  },
  {
    id: "da-iict-guest-lecture",
    org: "DA-IICT",
    role: "Assistant Guest Lecturer — Augmented Reality and C",
    employment_type: "volunteer",
    location: "Gandhinagar, India",
    start_date: "2019-08-01",
    end_date: "2019-08-01",
    is_current: false,
    summary_md: "Assisted in guest-lecturing a session on Augmented Reality and C programming.",
    highlights: [],
    tech: ["C", "Augmented Reality"],
  },
  {
    id: "royal-technosoft",
    org: "Royal Technosoft",
    role: "Programming Instructor",
    employment_type: "part-time",
    location: "Ahmedabad, India",
    start_date: "2018-03-01",
    end_date: "2022-06-01",
    is_current: false,
    summary_md:
      "Taught Python and C/C++ to 500+ students, guiding them through end-to-end programming projects and clean-code practices.",
    highlights: [
      "Mentored 500+ students in Python and C/C++ with personalized learning pathways.",
      "Guided students through full programming projects, reinforcing problem-solving and clean code.",
      "Grew advanced-course enrollment 30% through technical consultations on project design.",
    ],
    tech: ["Python", "C/C++"],
  },
];
