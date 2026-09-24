import type { SkillGroup } from "../types";

/**
 * The "Technical Skills" section straight from the résumé (public/resume.pdf),
 * grouped exactly as it's written there. Rendered on the Skills.yaml tab.
 * Keep this in sync with the résumé — when it changes, update here too.
 */
export const technicalSkillGroups: SkillGroup[] = [
  {
    category: "Languages",
    items: ["Python", "Java", "C#", "JavaScript", "TypeScript", "Go", "C", "C++", "SQL"],
  },
  {
    category: "Frontend & Web",
    items: ["React.js", "Next.js", "Tailwind CSS", "HTML5", "CSS3", "Recharts", "Chart.js", "Responsive Design"],
  },
  {
    category: "Backend & APIs",
    items: ["FastAPI", "RESTful APIs", "Pydantic", "SQLAlchemy", "Alembic", "Node.js", ".NET 8", "Microservices"],
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
    ],
  },
  {
    category: "Databases & Caching",
    items: ["PostgreSQL", "SQL Server", "MySQL", "Redis", "Tableau", "Power BI"],
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
    ],
  },
  {
    category: "Testing",
    items: ["JUnit", "pytest", "Selenium IDE", "TDD", "Mutation Testing", "Property-Based Testing"],
  },
  {
    category: "AI-Assisted Dev",
    items: ["Cursor", "Claude Code", "GitHub Copilot", "ChatGPT"],
  },
];
