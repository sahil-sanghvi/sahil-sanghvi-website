import type { ShellCourse } from "./os-shell";

const YEAR_LABEL: Record<number, string> = {
  1: "Year 1",
  2: "Year 2",
  3: "Year 3",
  4: "Year 4",
};

function CourseRow({ c }: { c: ShellCourse }) {
  const inner = (
    <>
      <div className="flex items-baseline gap-3">
        <span className="text-[11px] text-primary tabular-nums shrink-0">{c.code}</span>
        <span className="text-sm text-foreground">{c.title}</span>
        {c.term ? (
          <span className="ml-auto text-[10px] text-muted-foreground uppercase tracking-widest shrink-0">
            {c.term}
          </span>
        ) : null}
      </div>
      <p className="text-[12px] text-muted-foreground leading-relaxed">{c.summary}</p>
    </>
  );

  if (!c.repo_url) {
    return <div className="flex flex-col gap-1 py-5 px-2 -mx-2">{inner}</div>;
  }

  return (
    <a
      href={c.repo_url}
      target="_blank"
      rel="noreferrer"
      className="group flex flex-col gap-1 py-5 hover:bg-foreground/5 transition-colors px-2 -mx-2"
    >
      {inner}
    </a>
  );
}

export function CoursesPane({ courses }: { courses: ShellCourse[] }) {
  const byYear = new Map<number, ShellCourse[]>();
  for (const c of courses) {
    const list = byYear.get(c.year) ?? [];
    list.push(c);
    byYear.set(c.year, list);
  }
  const years = [...byYear.keys()].sort((a, b) => a - b);

  return (
    <article className="animate-slide">
      <header className="mb-14">
        <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tighter uppercase text-balance mb-6">
          Courses
          <br />
          <span className="text-primary">taken.</span>
        </h1>
        <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
          Every UVic course so far. The ones with real coursework behind them link out to a dedicated repo — labs,
          assignments, and a README documenting all of it.
        </p>
      </header>

      {years.length > 0 ? (
        <div className="space-y-12">
          {years.map((year) => (
            <div key={year}>
              <h2 className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">
                {YEAR_LABEL[year] ?? `Year ${year}`}
              </h2>
              <div className="flex flex-col divide-y divide-border border-t border-b border-border">
                {byYear.get(year)!.map((c) => (
                  <CourseRow key={c.id} c={c} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">No courses listed yet.</p>
      )}
    </article>
  );
}
