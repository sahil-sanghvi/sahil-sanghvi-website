# SEO

## Done

- Per-page metadata: dynamic title/description on `/` (from `profile`), plus
  `/projects`, `/projects/[slug]`, `/terminal` (`app/(home)/page.tsx`,
  `app/(site)/projects/page.tsx`, `app/(site)/projects/[slug]/page.tsx`,
  `app/terminal/layout.tsx`).
- Canonical URLs (`alternates.canonical`) on every page above, plus a
  site-wide default in `app/layout.tsx`.
- `Person` JSON-LD in `app/layout.tsx` — name, headline, socials, email,
  location, current `jobTitle`/`worksFor`, `alumniOf`, all pulled live from
  `lib/content` so it never drifts from the visible page.
- `robots.ts` / `sitemap.ts` already existed and are correct — sitemap
  includes every published project, robots disallows `/admin`, `/login`,
  `/auth`.
- Meta descriptions truncated to ~155 chars at a word boundary
  (`truncate()` in `app/(home)/page.tsx`) rather than dumping the full bio.

## Todo — needs info only Sahil has

- **Custom domain.** Currently `sahil-sanghvi-portfolio.vercel.app` — a
  `.dev`/`.com`/etc. under his own name would read better in search results
  and is easier to point Search Console / analytics at. Once he has one:
  add it in Vercel project settings, then set `NEXT_PUBLIC_SITE_URL` in
  Vercel env to the new domain (see `.env.example` / `lib/site-url.ts`) so
  metadata, canonicals, sitemap, and JSON-LD all switch over automatically.
- **Twitter/X handle**, for `twitter.creator`/`twitter.site` in
  `app/layout.tsx`'s `metadata.twitter` block (currently omitted).
- **Google Search Console verification** — needs a verification snippet
  (meta tag or DNS record) generated from his own Google account at
  search.google.com/search-console. Once he has the code, it's one line in
  `app/layout.tsx`'s `metadata.verification.google`.

## Possible follow-ups (not blocked on anything, just not done)

- Per-project dynamic OG images (`opengraph-image.tsx` is currently one
  static image site-wide) — would make project links look better when
  shared.
- `SoftwareSourceCode`/`CreativeWork` JSON-LD per project detail page.
