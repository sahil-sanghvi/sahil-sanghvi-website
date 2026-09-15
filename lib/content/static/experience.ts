import type { Experience } from "../types";

/**
 * Ordered newest-first. `employment_type: "volunteer"` routes an entry to
 * the VOLUNTEER lane on the landing-page timeline; everything else is WORK.
 * `end_date: null` marks a role as current.
 */
export const experience: Experience[] = [
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
      "AI intern in the CIO department of a national e-governance infrastructure company, working across a large remote, cross-cultural enterprise team.",
    highlights: [
      "Collaborated cross-functionally with the marketing team to align technical work with business and communication goals.",
      "Translated complex technical concepts for non-technical stakeholders across a large distributed organization.",
      "Coordinated with security, compliance, and leadership to turn requirements into a shared project plan.",
    ],
    tech: [],
  },
  {
    id: "rbc-borealis-lsi",
    org: "RBC Borealis — Let's Solve It 2026",
    role: "ML Research Fellow",
    employment_type: "internship",
    location: "Remote, Canada",
    start_date: "2026-03-01",
    end_date: "2026-05-01",
    is_current: false,
    summary_md:
      "Selected for a competitive national ML research cohort. Delivered a project end-to-end with a team of 4 peers and 2 senior researchers (Team Island Insight x KHLF).",
    highlights: [
      "Owned a shared ML project end-to-end alongside a small research team.",
      "Reported findings and progress to stakeholders and funders in clear, accessible language.",
      "Built consensus on project direction across diverse working styles.",
    ],
    tech: ["Python", "Machine Learning", "Streamlit"],
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
    id: "smoke-2-snack",
    org: "Smoke 2 Snack Victoria",
    role: "Sales Associate",
    employment_type: "part-time",
    location: "Victoria, BC",
    start_date: "2025-06-01",
    end_date: "2026-04-01",
    is_current: false,
    summary_md: "Customer service in a fast-paced retail environment, balanced alongside full-time studies.",
    highlights: [
      "De-escalated difficult customer situations with active listening and problem-solving.",
      "Helped coworkers pick up new tools to better serve customers.",
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
      "Lead the executive team for UVic's Indian Students Association — 300+ members, cultural events, workshops, and social programming.",
    highlights: [
      "Lead an executive team running cultural events and workshops for 300+ members.",
      "Coordinate large-scale event logistics: venues, vendors, and volunteers.",
      "Partner with university administration on campus diversity initiatives.",
      "Mentor new members on academic resources and campus integration.",
    ],
    tech: [],
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
