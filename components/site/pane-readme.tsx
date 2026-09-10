import type { ShellProfile, ShellSkill } from "./os-shell";
import { titleFromFlag } from "@/lib/site/format";
import { Timeline } from "./timeline";
import type { TimelineItem } from "@/lib/site/timeline";

function SectionRule({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 mb-10">
      <h2 className="font-display text-2xl uppercase tracking-tighter">{label}</h2>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

export function ReadmePane({
  profile,
  skills,
  timeline,
}: {
  profile: ShellProfile | null;
  skills: ShellSkill[];
  timeline: TimelineItem[];
}) {
  const headline = profile?.headline ?? "CS student building full end-to-end software products.";
  const [line1, line2] = splitHeadline(headline);

  return (
    <article className="animate-slide">
      <header className="mb-14">
        <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tighter uppercase text-balance mb-6">
          {line1}
          {line2 ? (
            <>
              <br />
              <span className="text-primary">{line2}</span>
            </>
          ) : null}
        </h1>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap text-muted-foreground">
          <span className="border border-border px-2 py-0.5 text-[10px] uppercase tracking-widest shrink-0">
            {profile?.full_name ?? "Sahil Sanghvi"}
          </span>
          {profile?.location ? <span className="truncate text-xs">{profile.location}</span> : null}
          <div className="hidden sm:block h-px flex-1 bg-border" />
        </div>
      </header>

      {profile?.bio_md ? (
        <p className="text-muted-foreground leading-relaxed max-w-2xl text-sm mb-16">{profile.bio_md}</p>
      ) : null}

      <SectionRule label="Options" />
      {skills.length > 0 ? (
        <div className="space-y-8 mb-20">
          {skills.map((s) => (
            <div key={s.id} className="grid gap-2 md:grid-cols-[220px_minmax(0,1fr)] md:gap-8">
              <div className="text-primary text-xs pt-0.5">{s.name}</div>
              <div>
                <h3 className="font-display text-base font-extrabold uppercase tracking-tight mb-1">
                  {titleFromFlag(s.name)}
                </h3>
                {s.description ? (
                  <p className="text-[13px] text-muted-foreground leading-relaxed max-w-xl">{s.description}</p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[13px] text-muted-foreground leading-relaxed mb-20">No skills listed yet.</p>
      )}

      <SectionRule label="Timeline" />
      <Timeline items={timeline} />
    </article>
  );
}

/** Splits a headline on the first " — " (or " for ") so the second clause can carry the accent, matching the mock's two-line treatment without fabricating a tagline that isn't in the DB. */
function splitHeadline(headline: string): [string, string | null] {
  const marker = headline.includes(" — ") ? " — " : null;
  if (!marker) return [headline, null];
  const idx = headline.indexOf(marker);
  return [headline.slice(0, idx + 1), headline.slice(idx + marker.length)];
}
