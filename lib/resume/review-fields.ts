/**
 * Drives the editable form on the ingest review screen
 * (app/(admin)/admin/ingest/[jobId]/review/page.tsx). `proposed` payloads
 * are already shaped to their destination table's columns (see
 * lib/resume/normalize.ts) but differ per target_table, so rather than
 * generic JSON editing, each table gets an explicit whitelist of which
 * fields are shown and how to render/parse them.
 */
export type FieldSpec = {
  key: string;
  label: string;
  type: "text" | "textarea" | "date" | "select" | "list";
  options?: string[];
  /** For type "list" only — how the textarea's raw text splits into an array. */
  separator?: "comma" | "newline";
};

export type ReviewTable = "experience" | "education" | "skills" | "profile";

export const EMPLOYMENT_TYPE_OPTIONS = [
  "full-time",
  "part-time",
  "contract",
  "freelance",
  "internship",
  "volunteer",
];

export const SKILL_CATEGORY_OPTIONS = ["language", "framework", "tool", "platform", "practice"];

export const REVIEW_FIELDS: Record<ReviewTable, FieldSpec[]> = {
  experience: [
    { key: "org", label: "Organization", type: "text" },
    { key: "role", label: "Role", type: "text" },
    { key: "employment_type", label: "Type", type: "select", options: EMPLOYMENT_TYPE_OPTIONS },
    { key: "location", label: "Location", type: "text" },
    { key: "start_date", label: "Start date", type: "date" },
    { key: "end_date", label: "End date (blank = current)", type: "date" },
    { key: "summary_md", label: "Summary", type: "textarea" },
    { key: "highlights", label: "Highlights (one per line)", type: "list", separator: "newline" },
    { key: "tech", label: "Tech (comma-separated)", type: "list", separator: "comma" },
  ],
  education: [
    { key: "institution", label: "Institution", type: "text" },
    { key: "credential", label: "Credential", type: "text" },
    { key: "field_of_study", label: "Field of study", type: "text" },
    { key: "start_date", label: "Start date", type: "date" },
    { key: "end_date", label: "End date (blank = current)", type: "date" },
  ],
  skills: [
    { key: "name", label: "Name", type: "text" },
    { key: "category", label: "Category", type: "select", options: SKILL_CATEGORY_OPTIONS },
  ],
  profile: [
    { key: "full_name", label: "Full name", type: "text" },
    { key: "headline", label: "Headline", type: "text" },
    { key: "location", label: "Location", type: "text" },
    { key: "public_email", label: "Public email", type: "text" },
  ],
};

/** "['a','b']" (jsonb array) <-> multi-line/comma text for the list field types. */
export function listToText(value: unknown, separator: "comma" | "newline"): string {
  if (!Array.isArray(value)) return "";
  return value.join(separator === "comma" ? ", " : "\n");
}

export function textToList(text: string, separator: "comma" | "newline"): string[] {
  return text
    .split(separator === "comma" ? "," : "\n")
    .map((s) => s.trim())
    .filter(Boolean);
}
