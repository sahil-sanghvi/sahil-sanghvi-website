import type { Metadata } from "next";
import Link from "next/link";
import { getProjects } from "@/lib/content";

export const metadata: Metadata = {
  title: "Projects — sahil-sanghvi(1)",
};

export const revalidate = 3600;

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <p className="text-section-head text-muted-foreground uppercase">Projects</p>
      <div className="mt-6 pl-6">
        {projects.length > 0 ? (
          <div className="flex flex-col gap-6">
            {projects.map((p) => (
              <Link key={p.slug} href={`/projects/${p.slug}`} className="group block">
                <p className="text-body text-foreground group-hover:text-signal-500">
                  {p.title}
                  {p.kind === "hackathon" ? (
                    <span className="text-flag text-signal-500 ml-2 uppercase">hackathon</span>
                  ) : null}
                </p>
                {p.tagline ? <p className="text-body text-muted-foreground mt-1">{p.tagline}</p> : null}
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-body text-muted-foreground max-w-[68ch]">No projects yet.</p>
        )}
      </div>
    </main>
  );
}
