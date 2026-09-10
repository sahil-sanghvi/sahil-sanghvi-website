import Link from "next/link";
import type { ShellProject } from "./os-shell";

function statusFor(p: ShellProject): string {
  return p.ended_on ? "SHIPPED" : "ACTIVE";
}

export function ProjectsPane({ projects }: { projects: ShellProject[] }) {
  return (
    <article className="animate-slide">
      <header className="mb-14">
        <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tighter uppercase text-balance mb-6">
          Open source
          <br />
          <span className="text-primary">/ lab.</span>
        </h1>
        <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
          Things built to run unattended. Each entry is a real repository, not a demo.
        </p>
      </header>

      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((p, i) => (
            <Link key={p.id} href={`/projects/${p.slug}`} className="group flex flex-col gap-4">
              <div className="relative overflow-hidden border border-border group-hover:border-primary/50 transition-colors aspect-video">
                {p.cover_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element -- external/user-uploaded source, not in next/image's domain allowlist
                  <img
                    src={p.cover_image_url}
                    alt={`${p.title} preview`}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-panel flex items-center justify-center">
                    <span className="font-display text-3xl font-extrabold text-muted-foreground/30 uppercase">
                      {p.title.slice(0, 2)}
                    </span>
                  </div>
                )}
                <span className="absolute top-2 left-2 bg-background/80 px-2 py-0.5 text-[9px] tracking-[0.2em] uppercase text-primary">
                  {String(i + 1).padStart(2, "0")} / {statusFor(p)}
                </span>
              </div>
              <div>
                <h4 className="font-display text-base font-extrabold uppercase tracking-tight mb-1">{p.title}</h4>
                {p.tagline ? (
                  <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">{p.tagline}</p>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  {p.tech.map((s) => (
                    <span
                      key={s}
                      className="text-[9px] uppercase tracking-widest text-muted-foreground border border-border px-2 py-0.5"
                    >
                      {s}
                    </span>
                  ))}
                  {p.project_github?.stars ? (
                    <span className="text-[9px] uppercase tracking-widest text-muted-foreground border border-border px-2 py-0.5">
                      ★ {p.project_github.stars}
                    </span>
                  ) : null}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
          No projects published yet. This section populates automatically once a GitHub repo is ingested through the
          admin panel.
        </p>
      )}
    </article>
  );
}
