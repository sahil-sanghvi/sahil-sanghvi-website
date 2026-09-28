import type { SkillGroup } from "../types";

/**
 * The "Technical Skills" section rendered on the Skills.yaml tab. Originally
 * transcribed straight from the résumé (public/resume.pdf); now kept in sync
 * with the résumé *and* cross-referenced against every project, course, and
 * role in lib/content/static/{projects,courses,experience}.ts so nothing
 * actually shipped is missing here. When any of those change, check this
 * file too.
 */
export const technicalSkillGroups: SkillGroup[] = [
  {
    category: "Languages",
    items: [
      "Python",
      "Java",
      "C#",
      "JavaScript",
      "TypeScript",
      "Go",
      "C",
      "C++",
      "SQL",
      "PHP",
      "R",
      "OCaml",
      "Racket",
      "Ruby",
      "APL",
      "AVR Assembly",
    ],
  },
  {
    category: "Frontend & Web",
    items: [
      "React.js",
      "Next.js",
      "Tailwind CSS",
      "HTML5",
      "CSS3",
      "Recharts",
      "Chart.js",
      "Responsive Design",
      "PyQt6",
      "WordPress",
    ],
  },
  {
    category: "Backend & APIs",
    items: [
      "FastAPI",
      "RESTful APIs",
      "Pydantic",
      "SQLAlchemy",
      "Alembic",
      "Node.js",
      ".NET 8",
      "Microservices",
      "Razorpay",
    ],
  },
  {
    category: "AI/ML & Data",
    items: [
      "LangGraph",
      "RAG",
      "Embedding Models",
      "Vector Search",
      "LLM APIs (Claude, GPT-4o, Gemini, Groq)",
      "scikit-learn",
      "XGBoost",
      "LightGBM",
      "PyTorch",
      "NumPy",
      "Pandas",
      "pgvector",
      "Jupyter",
      "Streamlit",
      "UMAP",
    ],
  },
  {
    category: "Databases & Caching",
    items: ["PostgreSQL", "SQL Server", "MySQL", "SQLite", "Redis", "Tableau", "Power BI"],
  },
  {
    category: "Cloud & DevOps",
    items: [
      "GCP (Cloud Run, Cloud Scheduler, Secret Manager, Artifact Registry)",
      "AWS",
      "Azure",
      "Docker",
      "Kubernetes",
      "CI/CD",
      "Git/GitHub",
      "Unix/Linux",
      "POSIX",
      "Microsoft Entra ID (OIDC/SSO, RBAC)",
    ],
  },
  {
    category: "Testing",
    items: ["JUnit", "jqwik", "pytest", "Selenium IDE", "TDD", "Mutation Testing", "Property-Based Testing"],
  },
  {
    category: "AI-Assisted Dev",
    items: ["Cursor", "Claude Code", "GitHub Copilot", "ChatGPT"],
  },
];
