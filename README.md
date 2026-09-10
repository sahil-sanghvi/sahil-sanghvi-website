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
