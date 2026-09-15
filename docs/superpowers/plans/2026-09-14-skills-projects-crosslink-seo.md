# Skills/Projects Cross-Linking + JSON-LD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the one concrete, code-level gap found across four competitor portfolios researched (tanujdargan.com, adityapadmarajan.com, rahilw.com, eshu.earth) — none of them link a skill to the project(s) that demonstrate it, and none make a project's tech stack clickable to find related work — plus add the one universally-missing SEO primitive (JSON-LD `Person` structured data).

**Architecture:** Three independent, additive changes to the existing static content layer (`lib/content/static/*`) and its two render surfaces (the `/projects` route pages, and the OS-shell `ReadmePane`). No new subsystems, no new dependencies, no schema migration on the Supabase ("automated mode") side — `related_projects` is added to the `Skill` type as an optional-by-default array that the Supabase adapter reports as `[]` until a future migration backs it.

**Tech Stack:** Next.js 16.2.12 (App Router), React Server Components, TypeScript. No test runner is configured in this repo (`package.json` has no `vitest`/`jest`/`playwright` dependency) — verification is `npx tsc --noEmit`, `npm run build`, and manual checks against `npm run dev`.

**Spec:** This plan is self-contained; it was derived directly from a multi-agent research pass (see conversation history) over four competitor portfolios plus a direct read of this repo's content layer (`lib/content/types.ts`, `lib/content/static/*`, `lib/content/adapters/*`, `components/site/os-shell.tsx`, `components/site/pane-readme.tsx`, `components/site/pane-projects.tsx`, `app/layout.tsx`, `app/(site)/projects/page.tsx`, `app/(site)/projects/[slug]/page.tsx`). There is no separate spec doc.

## Global Constraints

- Next.js 16.2.12: `params` and `searchParams` on page components are **Promises** — always `await` them (confirmed in `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md`). Follow the existing manual-typing style already used in `app/(site)/projects/[slug]/page.tsx` (`params: Promise<{ slug: string }>`) rather than introducing the `PageProps<'route'>` helper, which isn't used anywhere else in this repo yet.
- JSON-LD in Next.js is a raw `<script type="application/ld+json">` with `dangerouslySetInnerHTML`, **not** `next/script`, and the payload must be sanitized with `.replace(/</g, '\\u003c')` (confirmed in `node_modules/next/dist/docs/01-app/02-guides/json-ld.md`).
- `Skill`, `Project`, etc. field names are intentionally **snake_case** (see the doc comment at the top of `lib/content/types.ts`) — match that convention in any new field.
- Both content adapters (`lib/content/adapters/static.ts` for `CONTENT_SOURCE=static`, `lib/content/adapters/supabase.ts` for `CONTENT_SOURCE=supabase`) must keep compiling and returning valid data for every `Skill`/`Project` field — don't make a new field required without a safe default in both.
- No test framework exists in this repo — do not add one as part of this plan. Verify with `npx tsc --noEmit`, `npm run build`, and manual browser checks via `npm run dev`.
- Don't touch `components/site/pane-projects.tsx` (the OS-shell "Projects.json" pane)'s tech chips — each project card there is already wrapped in one outer `<Link>`, and turning individual tech chips into their own links would nest an `<a>` inside an `<a>`, which is invalid HTML. The tech-filter feature in this plan lives only on the dedicated `/projects` and `/projects/[slug]` routes, which don't have that constraint.
- Keep the existing CLI/man-page visual language (IBM Plex Mono, uppercase tracked labels, `text-signal-500` link color, `text-flag`/`text-muted-foreground` utility classes) — don't introduce new colors, fonts, or component primitives.

---

## File Structure

| File | Responsibility |
|---|---|
| `app/layout.tsx` | Modify — root layout becomes `async`, fetches `getProfile()`, renders a `Person` JSON-LD `<script>` |
| `app/(site)/projects/page.tsx` | Modify — reads `?tech=` from `searchParams`, filters the list, renders each project's tech as clickable chips |
| `app/(site)/projects/[slug]/page.tsx` | Modify — the existing plain-text `tech: A, B, C` line becomes individually clickable chips linking to `/projects?tech=A` |
| `lib/content/types.ts` | Modify — adds `related_projects: string[]` to the `Skill` interface |
| `lib/content/static/skills.ts` | Modify — populates `related_projects` with real project slugs for the skills that already reference specific projects in their prose (`typescript`, `full-stack`, `machine-learning`), sets `[]` for the rest |
| `lib/content/adapters/supabase.ts` | Modify — `getSkills()` maps `related_projects: []` (documented as a follow-up: the `skills` table has no such column yet) |
| `components/site/os-shell.tsx` | Modify — passes `projects` into `<ReadmePane>` |
| `components/site/pane-readme.tsx` | Modify — accepts a new `projects` prop, resolves each skill's `related_projects` slugs to titles, renders a linked "→ used in" line |

---

## Task 1: JSON-LD `Person` structured data

**Files:**
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: `getProfile(): Promise<Profile>` from `@/lib/content` (already defined, used elsewhere e.g. `app/(home)/page.tsx:1`). `Profile.socials` is `Record<string, string>` (label → URL).
- Produces: nothing consumed by later tasks — this task is fully self-contained.

- [ ] **Step 1: Read the current root layout to confirm the exact insertion point**

Already read in full during planning — `app/layout.tsx` currently exports a synchronous `RootLayout` and a static `metadata` object built from hardcoded `origin`/`description` constants. No content-layer fetch happens in this file today.

- [ ] **Step 2: Make `RootLayout` async and fetch the profile**

Edit `app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter_Tight, JetBrains_Mono } from "next/font/google";
import { MotionProvider } from "@/components/motion/motion-provider";
import { siteUrl } from "@/lib/site-url";
import { getProfile } from "@/lib/content";
import "./globals.css";
```

(Add the `getProfile` import alongside the existing imports — don't reorder the others.)

- [ ] **Step 3: Build and inject the JSON-LD script**

Change the `export default function RootLayout` to `export default async function RootLayout`, fetch the profile, and add the script tag as the first child of `<body>`, before `<noscript>`:

```tsx
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await getProfile();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.full_name,
    url: origin,
    description: profile.headline,
    sameAs: Object.values(profile.socials),
    ...(profile.public_email ? { email: profile.public_email } : {}),
  };

  return (
    <html
      lang="en"
      className={`${plexMono.variable} ${jetbrainsMono.variable} ${interTight.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
        {/* content-hidden-at-rest backstop: if JS never runs, [data-reveal]
            elements must still be visible. See globals.css for the paired
            prefers-reduced-motion rule. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1 !important;transform:none !important}`}</style>
        </noscript>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
```

Keep every existing line (the `noscript` block, `MotionProvider`, the `metadata` export, the font setup) exactly as-is — only the function signature and the new fetch/script are additions.

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors. (`getProfile` is already exported from `@/lib/content`, and `Profile` fields used here — `full_name`, `headline`, `socials`, `public_email` — all exist on the type.)

- [ ] **Step 5: Manual verification**

Run: `npm run dev`, open `http://localhost:3000`, view page source (not the rendered DOM — `Ctrl+U` / "View Page Source"), and confirm a `<script type="application/ld+json">` tag is present in `<body>` containing `"@type":"Person"` and the real name/socials. Then paste the page URL into https://validator.schema.org/ to confirm it parses as valid `Person` structured data.

- [ ] **Step 6: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: add Person JSON-LD structured data to root layout"
```

---

## Task 2: Clickable tech chips that filter `/projects` by tech

**Files:**
- Modify: `app/(site)/projects/page.tsx`
- Modify: `app/(site)/projects/[slug]/page.tsx`

**Interfaces:**
- Consumes: `getProjects(): Promise<Project[]>`, `getProject(slug): Promise<Project | null>` from `@/lib/content` (existing, unchanged). `Project.tech: string[]` (existing field, already populated per-project in `lib/content/static/projects.ts` and by GitHub language stats).
- Produces: a URL contract — `/projects?tech=<value>` filters the listing to projects whose `tech` array includes `<value>` (exact, case-sensitive match, matching how `tech` strings are already written verbatim, e.g. `"TypeScript"` not `"typescript"`). Task 3 does not depend on this, but any future work linking into `/projects` by tech should use this same query param.

- [ ] **Step 1: Add tech chips and `?tech=` filtering to the listing page**

Replace the full contents of `app/(site)/projects/page.tsx`:

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { getProjects } from "@/lib/content";

export const metadata: Metadata = {
  title: "Projects — sahil-sanghvi(1)",
};

export const revalidate = 3600;

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ tech?: string }>;
}) {
  const { tech } = await searchParams;
  const allProjects = await getProjects();
  const projects = tech ? allProjects.filter((p) => p.tech.includes(tech)) : allProjects;

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <p className="text-section-head text-muted-foreground uppercase">Projects</p>
      {tech ? (
        <p className="mt-2 text-flag text-muted-foreground">
          filtered by <span className="text-signal-500">{tech}</span> ·{" "}
          <Link href="/projects" className="text-signal-500 hover:text-signal-600">
            clear
          </Link>
        </p>
      ) : null}
      <div className="mt-6 pl-6">
        {projects.length > 0 ? (
          <div className="flex flex-col gap-6">
            {projects.map((p) => (
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
                  <div className="mt-2 flex flex-wrap gap-2">
                    {p.tech.map((t) => (
                      <Link
                        key={t}
                        href={`/projects?tech=${encodeURIComponent(t)}`}
                        className="text-[10px] uppercase tracking-widest text-muted-foreground border border-border px-2 py-0.5 hover:border-signal-500 hover:text-signal-500"
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
            {tech ? `No projects use ${tech}.` : "No projects yet."}
          </p>
        )}
      </div>
    </main>
  );
}
```

Note the tech-chip `<Link>` is a **sibling** of the title `<Link>`, not nested inside it — this avoids the invalid nested-`<a>` problem called out in Global Constraints.

- [ ] **Step 2: Make the project-detail page's tech line clickable**

In `app/(site)/projects/[slug]/page.tsx`, replace:

```tsx
      {project.tech.length > 0 ? (
        <p className="text-flag text-muted-foreground mt-6">tech: {project.tech.join(", ")}</p>
      ) : null}
```

with:

```tsx
      {project.tech.length > 0 ? (
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="text-flag text-muted-foreground">tech:</span>
          {project.tech.map((t) => (
            <Link
              key={t}
              href={`/projects?tech=${encodeURIComponent(t)}`}
              className="text-flag text-muted-foreground border border-border px-2 py-0.5 hover:border-signal-500 hover:text-signal-500"
            >
              {t}
            </Link>
          ))}
        </div>
      ) : null}
```

Add the `Link` import at the top of the file (it currently has no `next/link` import):

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, getProjects } from "@/lib/content";
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 4: Manual verification**

Run: `npm run dev`.
- Open `http://localhost:3000/projects` — confirm every project shows tech chips below its tagline.
- Click a chip (e.g. "Python") — confirm the URL becomes `/projects?tech=Python` and only Python projects remain, with a "filtered by Python · clear" line above the list.
- Click "clear" — confirm it returns to the full list.
- Open any `/projects/[slug]` page with a `tech` array (e.g. `/projects/palendar`) — confirm the tech line now renders as individually-bordered clickable chips, and clicking one lands on the matching filtered `/projects?tech=...` page.

- [ ] **Step 5: Commit**

```bash
git add "app/(site)/projects/page.tsx" "app/(site)/projects/[slug]/page.tsx"
git commit -m "feat: make project tech tags clickable filters on /projects"
```

---

## Task 3: Skill → project cross-links ("→ used in")

**Files:**
- Modify: `lib/content/types.ts`
- Modify: `lib/content/static/skills.ts`
- Modify: `lib/content/adapters/supabase.ts`
- Modify: `components/site/os-shell.tsx`
- Modify: `components/site/pane-readme.tsx`

**Interfaces:**
- Consumes: `ShellProject` (= `Project`, already defined in `lib/content/types.ts`), specifically `.slug` and `.title`.
- Produces: `Skill.related_projects: string[]` — an array of `Project.slug` values. Any future reader of `Skill` (admin UI, resume export, etc.) can rely on this field existing and being `string[]` (never `undefined`) on every `Skill`, in both content modes.

- [ ] **Step 1: Add the field to the `Skill` type**

In `lib/content/types.ts`, change:

```ts
export interface Skill {
  id: string; // stable slug
  name: string; // "-ml, --machine-learning"
  description: string | null;
  category: SkillCategory | null;
  featured: boolean;
}
```

to:

```ts
export interface Skill {
  id: string; // stable slug
  name: string; // "-ml, --machine-learning"
  description: string | null;
  category: SkillCategory | null;
  featured: boolean;
  /** Slugs of entries in projects.ts that demonstrate this skill — rendered
   *  as "used in" links under the skill's description. Empty when no
   *  specific project maps cleanly (e.g. a skill only exercised in coursework
   *  or an internship with no public repo). */
  related_projects: string[];
}
```

- [ ] **Step 2: Populate real slugs in the static skills data**

In `lib/content/static/skills.ts`, add `related_projects` to every entry, using only slugs that already exist in `lib/content/static/projects.ts` and that match what each skill's own `description` already claims:

```ts
export const skills: Skill[] = [
  {
    id: "python",
    name: "-py, --python",
    description:
      "My first language, at 14 — I taught it to 500+ students. Now it's for ML pipelines, data analysis, and glue.",
    category: "language",
    featured: true,
    related_projects: ["island-insight", "http-client", "tcp-analyzer"],
  },
  {
    id: "c-cpp",
    name: "-c, --c-cpp",
    description: "C and C++ — the systems fundamentals I taught alongside Python for four years.",
    category: "language",
    featured: true,
    related_projects: ["rasterizer", "recursive-raytracer", "pman-process-manager"],
  },
  {
    id: "typescript",
    name: "-ts, --typescript",
    description: "TypeScript end to end — this site, Palendar, PreCheck.ai.",
    category: "language",
    featured: true,
    related_projects: ["palendar", "precheck-ai"],
  },
  {
    id: "full-stack",
    name: "-web, --full-stack",
    description:
      "React and Next.js front to back, Postgres or SQLite behind it. Design, build, ship — this site included.",
    category: "practice",
    featured: true,
    related_projects: ["palendar", "precheck-ai"],
  },
  {
    id: "machine-learning",
    name: "-ml, --machine-learning",
    description:
      "Data analysis and model pipelines — RBC Borealis research cohort, AI-internship work at Protean.",
    category: "practice",
    featured: false,
    related_projects: ["island-insight", "exodetect"],
  },
  {
    id: "automation",
    name: "-auto, --automation",
    description:
      "Agentic pipelines that do real work unattended: repo ingest, resume parsing, provider failover. The automated mode of this very site.",
    category: "practice",
    featured: false,
    // No public projects.ts entry represents the site's own admin/ingest
    // pipeline — left empty rather than pointing at an unrelated project.
    related_projects: [],
  },
];
```

- [ ] **Step 3: Give the Supabase adapter a safe default**

In `lib/content/adapters/supabase.ts`, in `getSkills()`, change:

```ts
  return (data ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    category: (s.category as Skill["category"]) ?? null,
    featured: s.featured,
  }));
```

to:

```ts
  return (data ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    category: (s.category as Skill["category"]) ?? null,
    featured: s.featured,
    // The `skills` table has no related-projects column yet — automated
    // mode reports none until a future migration + admin-UI field add it.
    related_projects: [],
  }));
```

- [ ] **Step 4: Type-check before touching the UI**

Run: `npx tsc --noEmit`
Expected: no errors — this confirms every `Skill` producer (both adapters) now satisfies the new required field before any consumer changes.

- [ ] **Step 5: Pass `projects` down to `ReadmePane`**

In `components/site/os-shell.tsx`, find the JSX that renders `<ReadmePane ... />` inside the `active === "readme"` branch (search for `ReadmePane` in the file — it's called with `profile`, `skills`, and `timeline` today). Add `projects={projects}`:

```tsx
<ReadmePane profile={profile} skills={skills} projects={projects} timeline={timeline} />
```

`projects` is already a prop of `OsShell` (`projects: ShellProject[]`, see the function signature read during planning), so no new data-fetching is needed here — it's already available in scope.

- [ ] **Step 6: Render the "used in" links in `ReadmePane`**

In `components/site/pane-readme.tsx`, add imports and update the props type:

```tsx
import Link from "next/link";
import type { ShellProfile, ShellSkill, ShellProject } from "./os-shell";
import { titleFromFlag } from "@/lib/site/format";
import { Timeline } from "./timeline";
import type { TimelineItem } from "@/lib/site/timeline";
```

Update the function signature:

```tsx
export function ReadmePane({
  profile,
  skills,
  projects,
  timeline,
}: {
  profile: ShellProfile | null;
  skills: ShellSkill[];
  projects: ShellProject[];
  timeline: TimelineItem[];
}) {
```

Build a slug→project lookup right after the existing `splitHeadline` call (inside the function body, before the `return`):

```tsx
  const projectBySlug = new Map(projects.map((p) => [p.slug, p]));
```

Then, inside the skills-mapping block, add the "used in" line after the existing description paragraph:

```tsx
              <div>
                <h3 className="font-display text-base font-extrabold uppercase tracking-tight mb-1">
                  {titleFromFlag(s.name)}
                </h3>
                {s.description ? (
                  <p className="text-[13px] text-muted-foreground leading-relaxed max-w-xl">{s.description}</p>
                ) : null}
                {s.related_projects.length > 0 ? (
                  <p className="text-[11px] text-muted-foreground mt-2">
                    <span className="uppercase tracking-widest">used in:</span>{" "}
                    {s.related_projects.map((slug, i) => {
                      const p = projectBySlug.get(slug);
                      if (!p) return null;
                      return (
                        <span key={slug}>
                          {i > 0 ? ", " : " "}
                          <Link href={`/projects/${p.slug}`} className="text-signal-500 hover:text-signal-600">
                            {p.title}
                          </Link>
                        </span>
                      );
                    })}
                  </p>
                ) : null}
              </div>
```

`p` being possibly missing (`if (!p) return null`) handles the case where a slug in `related_projects` doesn't match any currently-published project — it silently omits that one link rather than crashing or showing a broken link.

- [ ] **Step 7: Type-check and build**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npm run build`
Expected: succeeds (this also re-runs `getProjects()` at build time for the static content source, which hits the real GitHub API for each `projectSources` entry — expect it to take a minute or two, same as any normal build in this repo).

- [ ] **Step 8: Manual verification**

Run: `npm run dev`, open `http://localhost:3000`, confirm the "README.md" pane (default view) shows, under each of TypeScript / Full-Stack / Machine Learning / C & C++ / Python's descriptions, a "used in: X, Y" line where X/Y are real project titles that link to their `/projects/[slug]` pages. Confirm "Automation" shows no "used in" line (empty array, nothing renders).

- [ ] **Step 9: Commit**

```bash
git add lib/content/types.ts lib/content/static/skills.ts lib/content/adapters/supabase.ts components/site/os-shell.tsx components/site/pane-readme.tsx
git commit -m "feat: link each skill to the projects that demonstrate it"
```

---

## Self-Review Notes

- **Spec coverage:** All three research-backed findings that were concretely actionable in code are covered — JSON-LD (Task 1), tech→project discoverability (Task 2), skill→project evidence links (Task 3). Two other research findings were deliberately **excluded** as non-code tasks: (a) auditing resume bullets for quantified metrics is a content edit to `lib/resume` data / the actual resume PDF, not a code change, and (b) listing the portfolio site itself as a project would require fabricating metrics not available during planning — both are called out as manual follow-ups below, not silently dropped.
- **Placeholder scan:** No TBD/TODO markers; every step has literal code, not a description of code.
- **Type consistency:** `Skill.related_projects: string[]` is defined once (Task 3, Step 1) and used with that exact name and type everywhere else (`skills.ts` data, `supabase.ts` mapping, `pane-readme.tsx` render). `ShellProject`/`Project` `.slug`/`.title` used in Task 3 Step 6 match the existing `Project` interface in `lib/content/types.ts` (no renames introduced).

## Manual Follow-Ups (not code tasks — do not delegate these to an executor)

1. **Audit resume + `lib/content/static/experience.ts` bullets for hard numbers**, per the research finding that every competitor portfolio quantifies every bullet. This is content editing, not implementation — go through `experience.ts`/`education.ts`/the live resume PDF by hand.
2. **Consider adding this portfolio site itself to `projectSources`** in `lib/content/static/projects.ts` (the `full-stack` and `automation` skill descriptions already claim "this site" as evidence, but it isn't actually a linkable project) — only do this once you have real metrics to put in its `tagline`/`description_md` (e.g. actual terminal command latency, GitHub sync interval), not invented ones.

---

**Plan complete and saved to `docs/superpowers/plans/2026-09-14-skills-projects-crosslink-seo.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
