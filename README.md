# sahil-sanghvi(1)

Personal portfolio — an "engineering console" landing page (`/`), a virtual
terminal (`/terminal`) that reads straight from GitHub, and project pages
(`/projects`). Next.js 16 (App Router, Turbopack) + Tailwind v4.

## Two content modes

| | **static** (default) | **supabase** (automation) |
|---|---|---|
| Where content lives | `lib/content/static/*.ts`, committed | Supabase tables |
| How you update it | edit a file → `git push` → Vercel deploys | `/admin` panel: paste a GitHub URL, upload a résumé |
| Projects | curated list in `static/projects.ts`, hydrated from GitHub at build | GitHub-paste ingest + daily cron re-sync |
| External services | none (GitHub API optional) | Supabase + optional AI providers |

Switch with the `CONTENT_SOURCE` env var. Both paths render through the same
components — see [`docs/CONTENT.md`](docs/CONTENT.md).

## Local development

```bash
npm install
cp .env.example .env.local   # defaults are fine for static mode
npm run dev
```

Open http://localhost:3000.

- Edit content: `lib/content/static/profile.ts`, `skills.ts`, `experience.ts`,
  `education.ts`, `projects.ts`.
- Add a project: append an entry to `projectSources` in
  `lib/content/static/projects.ts` (`repo: "owner/name"` + a `slug`), commit,
  push. The build pulls stars, languages, the README, the live URL, and
  recent commits from GitHub.
- The résumé PDF served at `/resume.pdf` lives in `public/resume.pdf`.

## Travel photos (`/travel`)

A map of places plus their photos, one page per place (`/travel/<place>`),
built so the photos show up when someone searches "Sahil Sanghvi".

```bash
npm run travel      # local editor → http://localhost:5174
```

- Drop photos on the editor. They're resized to 1600px JPEGs in
  `public/travel/`; GPS and date come from the photo's EXIF, and photos
  taken near each other are grouped into one place.
- Fill in the place name, region, caption and story. "Describe this photo"
  sets a photo's alt text (optional; a good default is generated).
- Drag places to reorder: that's the numbering and the route on the map.
- Click **Tidy file names** before committing: photos get renamed to
  `sahil-sanghvi-<place>-<n>.jpg`.
- Commit `lib/content/static/travel.json` + `public/travel/` and push.

A place missing a name, pin or photo stays off the site until it's complete.
SEO: every photo is a plain `<img>` with descriptive alt text, listed in the
image sitemap (`/sitemap.xml`) and in schema.org `ImageObject` data credited
to the same Person as the home page. Submit the sitemap in Google Search
Console after the first deploy to get it crawled sooner.

## Deploy (Vercel)

1. Push this repo to GitHub.
2. Import it on [vercel.com/new](https://vercel.com/new). Framework preset:
   Next.js. No env vars are required for static mode.
3. Every push to `main` redeploys automatically.

Optional env on Vercel: `GITHUB_TOKEN` (higher GitHub rate limit),
`NEXT_PUBLIC_SITE_URL` (custom domain).

## Scripts

- `npm run dev` — dev server
- `npm run build` / `npm start` — production build + serve
- `npm run lint` — ESLint
