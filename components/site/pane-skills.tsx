import type { SkillGroup } from "@/lib/content";

export function SkillsPane({ groups }: { groups: SkillGroup[] }) {
  return (
    <article className="animate-slide">
      <header className="mb-14">
        <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tighter uppercase text-balance mb-6">
          Full stack,
          <br />
          <span className="text-primary">and then some.</span>
        </h1>
        <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
          Every language, framework, and tool I&apos;ve actually shipped with — straight from the résumé, grouped
          by where it&apos;s used.
        </p>
      </header>

      {groups.length > 0 ? (
        <div className="space-y-10">
          {groups.map((g) => (
            <div key={g.category}>
              <h2 className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3">{g.category}</h2>
              <div className="flex flex-wrap gap-2">
                {g.items.map((item) => (
                  <span
                    key={item}
                    className="text-[11px] text-foreground border border-border px-2.5 py-1 hover:border-primary/50 transition-colors"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">No skills listed yet.</p>
      )}
    </article>
  );
}
