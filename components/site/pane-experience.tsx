import type { ShellExperience } from "./os-shell";
import { formatPeriod } from "@/lib/site/format";

export function ExperiencePane({ experience }: { experience: ShellExperience[] }) {
  return (
    <article className="animate-slide">
      <header className="mb-16">
        <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tighter uppercase text-balance mb-6">
          Where the
          <br />
          <span className="text-primary">work shipped.</span>
        </h1>
        <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
          A commit log of roles — real positions, in the order they happened.
        </p>
      </header>

      {experience.length > 0 ? (
        <section className="space-y-14 border-l border-border pl-8">
          {experience.map((job) => (
            <div
              key={job.id}
              className={`relative ${job.is_current ? "" : "opacity-70 hover:opacity-100 transition-opacity"}`}
            >
              <div
                className={`absolute -left-[37px] top-2 size-2 rounded-full ring-4 ring-background ${
                  job.is_current ? "bg-primary" : "bg-border"
                }`}
              />
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-4 mb-3">
                <h3 className="font-display text-xl font-extrabold uppercase tracking-tight truncate">{job.org}</h3>
                <span className="text-[11px] text-muted-foreground tabular-nums shrink-0">
                  {formatPeriod(job.start_date, job.end_date, job.is_current)}
                </span>
              </div>
              <div className="text-xs text-primary mb-4">
                {job.role}
                {job.location ? <span className="text-muted-foreground"> / {job.location}</span> : null}
              </div>
              {job.summary_md ? (
                <p className="text-muted-foreground leading-relaxed max-w-2xl text-sm mb-5">{job.summary_md}</p>
              ) : null}
              {job.tech.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {job.tech.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-1 bg-foreground/5 text-[9px] font-bold tracking-widest uppercase border border-border"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </section>
      ) : (
        <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
          No roles published yet — as a current student, this fills in as real experience gets added through the
          admin panel.
        </p>
      )}
    </article>
  );
}
