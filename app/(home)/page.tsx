import type { Metadata } from "next";
import { getProfile, getSkills, getTechnicalSkills, getExperience, getEducation, getProjects } from "@/lib/content";
import { OsShell } from "@/components/site/os-shell";
import { buildTimeline } from "@/lib/site/timeline";

export const revalidate = 3600;

/** Truncates at a word boundary near `max` chars — meta descriptions get
 *  cut off (and search engines may rewrite them) well past this anyway, so
 *  a long bio shouldn't be handed over verbatim. */
function truncate(text: string, max = 155): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  const description = truncate(profile.bio_md ?? profile.headline);
  return {
    title: `${profile.full_name} — ${profile.headline}`,
    description,
    alternates: { canonical: "/" },
    openGraph: { title: profile.full_name, description, url: "/" },
    twitter: { title: profile.full_name, description },
  };
}

export default async function HomePage() {
  const [profile, skills, technicalSkills, experience, education, projects] = await Promise.all([
    getProfile(),
    getSkills(),
    getTechnicalSkills(),
    getExperience(),
    getEducation(),
    getProjects(),
  ]);

  const stars = projects.reduce((sum, p) => sum + (p.project_github?.stars ?? 0), 0);
  const timeline = buildTimeline({ experience, education, projects });

  return (
    <OsShell
      profile={profile}
      skills={skills}
      technicalSkills={technicalSkills}
      experience={experience}
      projects={projects}
      timeline={timeline}
      metrics={{
        repos: projects.length,
        stars,
        available: profile.available_for_work,
      }}
    />
  );
}
