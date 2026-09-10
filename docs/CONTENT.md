# Content architecture

Every page reads content through `lib/content` — a thin switch over two
adapters. Components never touch Supabase or GitHub directly.

```
lib/content/
  index.ts              getProfile / getSkills / getExperience /
                        getEducation / getProjects / getProject(slug)
                        + CONTENT_SOURCE  ("static" | "supabase")
  types.ts              domain types (snake_case, so panes need no changes)
  github.ts             fetchRepoData() / fetchRepoCommits() — GitHub REST
  static/               profile.ts, skills.ts, experience.ts, education.ts,
                        projects.ts   ← the committed content
  adapters/
    static.ts           reads static/*, hydrates projects from github.ts
    supabase.ts          reads the DB the /admin panel writes to
```

`getProjects()` and friends are wrapped in React `cache()`, so a request
fetches each repo from GitHub at most once.

## Static mode (default)

`CONTENT_SOURCE` unset or `= static`.

- Content = the `static/*.ts` files. Edit, commit, push.
- Projects: `static/projects.ts` lists repos (`owner/name` + `slug`); the
  build merges in stars, languages, README, live URL, topics, and recent
  commits from GitHub's REST API. Unauthenticated (60 req/hr/IP) unless
  `GITHUB_TOKEN` is set (5000/hr). Every GitHub call is ISR-cached for a day
  and fails soft — a rate-limit or outage yields a project with no GitHub
  data, never a broken build.
- `/terminal` builds its filesystem from the same getters. `git log` /
  `git show` in the terminal proxy GitHub through `/api/terminal/git`, which
  only allows repos in the curated project list.
- `/admin`, `/login` are inert — the admin layout renders an explainer,
  `/login` redirects home. `proxy.ts` and the sync-github cron no-op.

## Automated mode

`CONTENT_SOURCE=supabase` **plus**:

1. **Env** (`.env.local` and Vercel project settings):
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAIL`, `CRON_SECRET`, `GITHUB_TOKEN`
   (required here — the ingest uses GitHub GraphQL, which needs a token), and
   any of the AI provider keys.
2. **Database**: run the migrations in `supabase/migrations/` against the
   project (`npx supabase db push` with the project linked), then add your
   user to `admin_allowlist`.
3. **Cron** (optional, re-syncs GitHub data daily): add back to `vercel.json`
   ```json
   { "crons": [{ "path": "/api/cron/sync-github", "schedule": "0 4 * * *" }] }
   ```
4. Redeploy. `/admin` now works: paste a GitHub repo URL to add a project,
   upload a résumé PDF to extract experience/education/skills into a review
   queue.

The two modes are independent — switching to `supabase` doesn't migrate the
`static/*.ts` content into the DB, and switching back doesn't delete DB rows.
