# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary audience: recruiters and hiring managers evaluating Sahil for a role. They land here with limited time and are scanning for evidence of real ability — working projects, technical depth, and evidence of care in execution — not marketing language. Secondary, incidental audience: peers and other engineers who find a project or the terminal page and explore further, but the site is not built around funneling them anywhere specific.

## Product Purpose

A personal portfolio for Sahil, a computer science student. It runs in one of two content modes (see `docs/CONTENT.md`):

- **static** (default): content is committed TypeScript in `lib/content/static/*`. Updating the site is: edit a file, `git push`, Vercel redeploys. Projects are a curated list of GitHub repos, hydrated with stars / languages / README / commit history from the GitHub API at build time. No external services.
- **supabase** (automation): an authenticated admin area where pasting a GitHub repo URL auto-populates a project and uploading a resume PDF auto-extracts experience/education/skills into a review queue. Opt-in behind `CONTENT_SOURCE=supabase`.

Success either way: a recruiter can assess Sahil's actual work quickly, and Sahil can add a project or update his experience without hand-writing marketing copy.

## Positioning

Sahil builds full end-to-end software products, agentic automation pipelines, and ML-based data analysis — as a student, not a career-switcher or bootcamp grad claiming senior experience. The site's own admin/ingest system is itself evidence of this positioning: the portfolio that updates itself is a working example of the kind of automation pipeline he builds elsewhere.

## Operating Context

- Sahil logs into an admin area, pastes a GitHub repo URL, and the project's metadata/README/commits populate automatically without manual data entry.
- Sahil uploads a resume PDF; experience, education, skills, and profile fields are extracted and presented in a review/diff UI where he can also correct any field before accepting. Nothing is auto-published from a resume — accepting a record in review is the one approval gate, and accepting publishes it immediately (no separate second publish step).
- He can also add, edit, and delete projects, experience, education, and skills by hand at any time, independent of either ingest path — editing isn't limited to fixing an AI mistake before it lands.
- A landing-page timeline merges experience (including volunteering), education, and projects into one date-ordered view.
- A separate `/terminal` page lets visitors navigate a virtual filesystem of his projects using unix + git-flavored commands (`cd`, `ls`, `cat`, `git log`), reading the same published content as the main site.

## Capabilities and Constraints

- Single-admin site — Sahil is the only account that can ever authenticate into the admin area; there is no multi-user or team concept.
- No client work exists yet, so there is no services/pricing section and no real testimonials. GitHub activity (stars, languages, commit history) stands in as social proof instead of fabricated quotes or invented pricing tiers.
- Social links (GitHub, LinkedIn, X) are configured through the admin panel, not hardcoded — Sahil will add his actual handles once the admin CRUD exists (build increment 8). Until then, treat social links as unset, not as placeholder URLs.
- Dark-only visual theme for v1.

## Brand Commitments

- Name: Sahil Sanghvi.
- Tagline (drafted by me at Sahil's request, since he doesn't have one — treat as a starting proposal to confirm or revise, not a locked fact): **"I build the whole thing — the product, and the pipeline that keeps it running without me."** Reflects the actual positioning (full end-to-end products + agentic automation) without marketing language.

## Evidence on Hand

Populated from Sahil's real résumé (`lib/content/static/*`): profile/bio, one education entry (UVic, B.Sc. CS), seven experience entries (Protean eGov AI internship, RBC Borealis ML fellowship, VIMEA technical consulting, UVic mentorship + UMANG VP as volunteering, Smoke 2 Snack part-time, Royal Technosoft teaching), six technical skill flags, and five curated projects from `github.com/sahil-sanghvi`. The résumé PDF is at `public/resume.pdf`. Still do not fabricate metrics or accomplishments beyond what the résumé and GitHub actually say.

## Product Principles

1. **The site publishes what Sahil approves, never what a model or an ingest pipeline infers.** GitHub facts (stars, languages) write directly since they aren't inferred, but every resume-derived record sits in a review/diff queue — editable in place — until he explicitly accepts it. Accepting *is* publishing; there's no second manual step, but nothing reaches the site without that one explicit approval.
2. **Automation is the point, not just a convenience.** The GitHub-paste and resume-upload flows are themselves demonstrations of the automation/agentic-pipeline work described in the Positioning section — build them with the same care as anything meant to be shown off.
3. **Real evidence over invented polish.** No fabricated testimonials, no invented client logos, no pricing for services that don't exist. GitHub stats and real commit history carry the credibility instead.
4. **A recruiter should be able to assess the work in minutes.** Favor scanability and working links over exhaustive detail; the terminal page is a novelty layer for people who want to dig deeper, never the only way to reach real content.
5. **Manual entry is always a fallback, never a dependency.** Every ingest path (GitHub, resume) must degrade to ordinary admin forms if it fails, since Sahil is a student maintaining this alone with no ops support.

## Accessibility & Inclusion

No specific standard was mandated, but the `/terminal` surface is a known accessibility risk (a DOM-based terminal is inherently hostile to screen readers and keyboard-only users) and must ship with a real `<input>`, `role="log"` output, a persistent non-terminal escape hatch, and no content exclusive to that surface — every fact reachable through the terminal must also exist on the ordinary site.
