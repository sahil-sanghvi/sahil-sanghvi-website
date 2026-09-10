import type { Experience, Education, Project } from "@/lib/content";

export type TimelineKind = "work" | "volunteering" | "education" | "project";

export type TimelineItem = {
  id: string;
  kind: TimelineKind;
  title: string; // org / institution / project title
  subtitle: string | null; // role / credential / tagline
  start: string | null;
  end: string | null;
  isCurrent: boolean;
  tags: string[];
  href: string | null; // projects link to /projects/[slug]
  location: string | null; // experience/education only; null for projects
  highlights: string[]; // experience/education only; [] for projects
  summary: string | null; // experience.summary_md / project.description_md; null for education
};

const KIND_LABEL: Record<TimelineKind, string> = {
  work: "WORK",
  volunteering: "VOLUNTEER",
  education: "EDU",
  project: "PROJECT",
};

export function timelineLabel(kind: TimelineKind): string {
  return KIND_LABEL[kind];
}

/**
 * Merges experience (splitting out volunteering by employment_type),
 * education, and projects into one date-ordered list for the landing
 * page's Timeline section (components/site/timeline.tsx). Pure — no I/O —
 * so it's straightforward to reason about and doesn't force the shape of
 * the Supabase queries in app/(home)/page.tsx.
 */
export function buildTimeline(input: {
  experience: Experience[];
  education: Education[];
  projects: Project[];
}): TimelineItem[] {
  const items: TimelineItem[] = [];

  for (const e of input.experience) {
    items.push({
      id: e.id,
      kind: e.employment_type === "volunteer" ? "volunteering" : "work",
      title: e.org,
      subtitle: e.role,
      start: e.start_date,
      end: e.end_date,
      isCurrent: Boolean(e.is_current),
      tags: e.tech,
      href: null,
      location: e.location,
      highlights: e.highlights,
      summary: e.summary_md,
    });
  }

  for (const edu of input.education) {
    items.push({
      id: edu.id,
      kind: "education",
      title: edu.institution,
      subtitle: edu.credential ?? edu.field_of_study,
      start: edu.start_date,
      end: edu.end_date,
      isCurrent: Boolean(edu.is_current),
      tags: [],
      href: null,
      location: edu.location,
      highlights: edu.highlights,
      summary: null,
    });
  }

  for (const p of input.projects) {
    items.push({
      id: p.id,
      kind: "project",
      title: p.title,
      subtitle: p.tagline,
      start: p.started_on,
      end: p.ended_on,
      isCurrent: !p.ended_on && Boolean(p.started_on),
      tags: p.tech,
      href: `/projects/${p.slug}`,
      location: null,
      highlights: [],
      summary: p.description_md,
    });
  }

  // Undated entries (projects most often, since started_on is optional)
  // sort last rather than first — an unknown date reading as "most recent"
  // would be misleading.
  return items.sort((a, b) => {
    if (!a.start && !b.start) return 0;
    if (!a.start) return 1;
    if (!b.start) return -1;
    return b.start.localeCompare(a.start);
  });
}
