import { getProfile, getSkills, getExperience, getEducation, getProjects } from "@/lib/content";
import { OsShell } from "@/components/site/os-shell";
import { buildTimeline } from "@/lib/site/timeline";

export const revalidate = 3600;

export default async function HomePage() {
  const [profile, skills, experience, education, projects] = await Promise.all([
    getProfile(),
    getSkills(),
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
