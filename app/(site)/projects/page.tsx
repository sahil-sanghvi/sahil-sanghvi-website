import type { Metadata } from "next";
import Link from "next/link";
import { getProjects } from "@/lib/content";

export const revalidate = 3600;

type ProjectsSearchParams = Promise<{ tech?: string | string[] }>;

function resolveTech(raw: string | string[] | undefined): string | undefined {
  return Array.isArray(raw) ? raw[0] : raw;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: ProjectsSearchParams;
}): Promise<Metadata> {
  const tech = resolveTech((await searchParams).tech);

  if (!tech) {
    return {
      title: "Projects — sahil-sanghvi(1)",
      description: "Real, working projects — hackathon builds and shipped code, each linked to its source.",
      alternates: { canonical: "/projects" },
    };
  }

  return {
    title: `Projects · ${tech} — sahil-sanghvi(1)`,
    alternates: { canonical: "/projects" },
  };
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: ProjectsSearchParams;
}) {
  const tech = resolveTech((await searchParams).tech);
  const projects = await getProjects();

  const filtered = tech ? projects.filter((p) => p.tech.includes(tech)) : projects;

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <div className="flex items-baseline justify-between">
        <p className="text-section-head text-muted-foreground uppercase">Projects</p>
        {tech ? (
          <div className="text-flag text-muted-foreground">
            filtered by <span className="text-signal-500">{tech}</span> ·{" "}
            <Link href="/projects" className="text-signal-500 hover:text-signal-600">
              clear
            </Link>
          </div>
        ) : null}
      </div>
      <div className="mt-6 pl-6">
        {filtered.length > 0 ? (
          <div className="flex flex-col gap-6">
            {filtered.map((p) => (
              <div key={p.slug}>
                <Link href={`/projects/${p.slug}`} className="group block">
                  <p className="text-body text-foreground group-hover:text-signal-500">
                    {p.title}
                    {p.kind === "hackathon" ? (
                      <span className="text-flag text-signal-500 ml-2 uppercase">hackathon</span>
                    ) : null}
                  </p>
                  {p.tagline ? <p className="text-body text-muted-foreground mt-1">{p.tagline}</p> : null}
                </Link>
                {p.tech.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {p.tech.map((t) => (
                      <Link
                        key={t}
                        href={`/projects?tech=${encodeURIComponent(t)}`}
                        className="text-flag border border-border px-2 py-1 text-signal-500 hover:text-signal-600 hover:border-signal-500"
                      >
                        {t}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-body text-muted-foreground max-w-[68ch]">
            No projects found{tech ? ` with ${tech}` : ""}.
          </p>
        )}
      </div>
    </main>
  );
}
