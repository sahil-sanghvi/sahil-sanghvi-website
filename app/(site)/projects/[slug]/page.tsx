import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProject, getProjects } from "@/lib/content";

export const revalidate = 3600;

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return {};
  return {
    title: `${project.title} — sahil-sanghvi(1)`,
    description: project.tagline ?? undefined,
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const gh = project.project_github;

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <p className="text-section-head text-muted-foreground uppercase">{project.title}</p>
      {project.tagline ? (
        <p className="text-display text-foreground mt-3 max-w-none">{project.tagline}</p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-4 text-flag">
        <span className="text-signal-500">{project.kind === "hackathon" ? "hackathon" : "project"}</span>
        {project.live_url ? (
          <a href={project.live_url} className="text-signal-500 hover:text-signal-600">
            → live
          </a>
        ) : null}
        {project.repo_url ? (
          <a href={project.repo_url} className="text-signal-500 hover:text-signal-600">
            → source
          </a>
        ) : null}
        {gh?.stars ? <span className="text-muted-foreground">★ {gh.stars}</span> : null}
        {gh?.primary_language ? (
          <span className="text-muted-foreground">{gh.primary_language}</span>
        ) : null}
      </div>

      {project.description_md ? (
        <p className="text-body text-foreground mt-8 max-w-[68ch]">{project.description_md}</p>
      ) : null}

      {project.tech.length > 0 ? (
        <p className="text-flag text-muted-foreground mt-6">tech: {project.tech.join(", ")}</p>
      ) : null}

      {gh?.readme_html ? (
        <div className="border-border mt-10 border-t pt-8">
          <p className="text-flag text-muted-foreground mb-4 uppercase">README</p>
          {/* Sanitized server-side via remark/rehype/rehype-sanitize
              (lib/github/readme.ts) — not raw user input. */}
          <div
            className="prose-terminal max-w-[75ch]"
            dangerouslySetInnerHTML={{ __html: gh.readme_html }}
          />
        </div>
      ) : null}
    </main>
  );
}
