import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Design tokens — dev",
  robots: { index: false, follow: false },
};

const neutrals = [
  { name: "ink-950", cls: "bg-ink-950", role: "Terminal Paper — page background", value: "oklch(15% 0.008 75)" },
  { name: "ink-900", cls: "bg-ink-900", role: "raised surface — cards, popovers", value: "oklch(19% 0.009 75)" },
  { name: "ink-700", cls: "bg-ink-700", role: "Rule Line — hairlines, borders, inputs", value: "oklch(30% 0.010 75)" },
  { name: "ink-400", cls: "bg-ink-400", role: "Muted Ink — furniture, secondary text", value: "oklch(58% 0.012 75)" },
  { name: "ink-050", cls: "bg-ink-050", role: "Body Ink — primary text", value: "oklch(93% 0.010 75)" },
];

const signal = [
  { name: "signal-500", cls: "bg-signal-500", role: "the one accent — links, active state, focus", value: "oklch(75% 0.15 65)" },
  { name: "signal-600", cls: "bg-signal-600", role: "hover / pressed", value: "oklch(65% 0.14 60)" },
];

const semantics = [
  { name: "background", cls: "bg-background border border-border" },
  { name: "foreground", cls: "bg-foreground" },
  { name: "card", cls: "bg-card border border-border" },
  { name: "primary", cls: "bg-primary" },
  { name: "accent", cls: "bg-accent border border-border" },
  { name: "muted-foreground", cls: "bg-muted-foreground" },
  { name: "destructive", cls: "bg-destructive" },
];

const radii = [
  { name: "radius-sm", cls: "rounded-sm" },
  { name: "radius-md", cls: "rounded-md" },
  { name: "radius-lg", cls: "rounded-lg" },
  { name: "radius-xl", cls: "rounded-xl" },
];

const spacingSteps = [2, 4, 8, 12, 16, 24, 32, 48, 64, 96];

function Swatch({ name, cls, role, value }: { name: string; cls: string; role?: string; value?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className={`h-16 w-full border border-border ${cls}`} />
      <div className="text-flag">
        <p className="text-foreground">{name}</p>
        {value ? <p className="text-muted-foreground">{value}</p> : null}
        {role ? <p className="text-muted-foreground">{role}</p> : null}
      </div>
    </div>
  );
}

export default function TokensPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16 flex flex-col gap-16">
      <header className="flex flex-col gap-2 border-b border-border pb-6">
        <p className="text-furniture text-muted-foreground uppercase">dev / tokens</p>
        <h1 className="text-display text-foreground">Design tokens</h1>
        <p className="text-body text-muted-foreground max-w-[68ch]">
          Internal QA page for &quot;The Man Page&quot; token system — not part of the public
          site. See DESIGN.md for the full rationale behind every value here.
        </p>
      </header>

      <section className="flex flex-col gap-6">
        <h2 className="text-section-head text-foreground uppercase">Neutral ramp</h2>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
          {neutrals.map((s) => (
            <Swatch key={s.name} {...s} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-section-head text-foreground uppercase">Signal accent</h2>
        <p className="text-body text-muted-foreground max-w-[68ch]">
          The One-Accent Rule: appears only on interactive or &quot;live&quot; elements.
          Deliberately amber, never green/cyan (The No-Green Rule).
        </p>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
          {signal.map((s) => (
            <Swatch key={s.name} {...s} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-section-head text-foreground uppercase">Semantic roles (shadcn-reconciled)</h2>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {semantics.map((s) => (
            <Swatch key={s.name} {...s} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-section-head text-foreground uppercase">Typography</h2>
        <div className="flex flex-col gap-6 border-l border-border pl-6">
          <div>
            <p className="text-display text-foreground">The one-line SYNOPSIS is the hero.</p>
            <p className="text-flag text-muted-foreground mt-1">text-display — 700, clamp(1.75rem, 1.1rem + 3vw, 3.25rem)</p>
          </div>
          <div>
            <p className="text-section-head text-foreground uppercase">SYNOPSIS</p>
            <p className="text-flag text-muted-foreground mt-1">text-section-head — 700 uppercase, 0.9375rem, tracking 0.08em</p>
          </div>
          <div>
            <p className="text-body text-foreground max-w-[68ch]">
              Body copy sets at a comfortable reading size with generous line-height for a
              monospace face — this is the DESCRIPTION section&apos;s register.
            </p>
            <p className="text-flag text-muted-foreground mt-1">text-body — 400, 1rem, line-height 1.7</p>
          </div>
          <div>
            <p className="text-flag text-foreground">-ml, --machine-learning    Data analysis &amp; model pipelines</p>
            <p className="text-flag text-muted-foreground mt-1">text-flag — 400, 0.9375rem (OPTIONS rows)</p>
          </div>
          <div>
            <p className="text-furniture text-muted-foreground uppercase">SAHIL-SANGHVI(1) — General Commands Manual</p>
            <p className="text-flag text-muted-foreground mt-1">text-furniture — 0.8125rem, tracking 0.05em (running header/footer)</p>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-section-head text-foreground uppercase">Shapes (radius)</h2>
        <p className="text-body text-muted-foreground max-w-[68ch]">
          Base radius is 2px — the least rounding that still reads as intentional, never
          SaaS-card-round.
        </p>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {radii.map((r) => (
            <div key={r.name} className="flex flex-col gap-2">
              <div className={`h-16 w-full border border-border bg-card ${r.cls}`} />
              <p className="text-flag text-muted-foreground">{r.name}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-section-head text-foreground uppercase">Elevation &amp; depth</h2>
        <p className="text-body text-muted-foreground max-w-[68ch]">
          The Flat Document Rule: no shadow tokens exist. Depth comes from rule lines and
          indentation only, as below.
        </p>
        <div className="border border-border p-6 pl-10">
          <p className="text-flag text-foreground">Indented content, bounded by a hairline rule — no box-shadow anywhere.</p>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-section-head text-foreground uppercase">Spacing rhythm</h2>
        <div className="flex flex-col gap-3">
          {spacingSteps.map((px) => (
            <div key={px} className="flex items-center gap-4">
              <span className="text-flag text-muted-foreground w-12 shrink-0">{px}px</span>
              <div className="bg-ink-400" style={{ width: px, height: 8 }} />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
