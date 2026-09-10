import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchRepo, GithubApiError } from "@/lib/github/client";
import { normalizeRepo } from "@/lib/github/normalize";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Vercel Hobby allows one cron invocation per day — schedule 0 4 * * * in
 * vercel.json. Re-syncs every published project's GitHub data. Runs with
 * the service-role client since there's no browser session in a cron job.
 */
export async function GET(request: Request) {
  // Only meaningful in automated mode. In static mode, project data is
  // fetched from GitHub at build time (lib/content/github.ts) and there's
  // nothing to sync into — see docs/CONTENT.md.
  if (process.env.CONTENT_SOURCE !== "supabase") {
    return NextResponse.json({ skipped: "static content mode" });
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("id, project_github(repo_owner, repo_name)")
    .eq("status", "published");

  const results: { repo: string; ok: boolean; error?: string }[] = [];

  for (const project of projects ?? []) {
    const gh = Array.isArray(project.project_github)
      ? project.project_github[0]
      : project.project_github;
    if (!gh) continue;

    const repoLabel = `${gh.repo_owner}/${gh.repo_name}`;
    try {
      const data = await fetchRepo(gh.repo_owner, gh.repo_name);
      const normalized = await normalizeRepo(gh.repo_owner, gh.repo_name, data);

      await supabase
        .from("project_github")
        .upsert({ project_id: project.id, ...normalized.github }, { onConflict: "project_id" });

      if (normalized.commits.length > 0) {
        await supabase
          .from("project_commits")
          .upsert(
            normalized.commits.map((c) => ({ project_id: project.id, ...c })),
            { onConflict: "project_id,sha" }
          );
      }

      results.push({ repo: repoLabel, ok: true });
    } catch (err) {
      const message = err instanceof GithubApiError || err instanceof Error ? err.message : "Unknown error";
      await supabase
        .from("project_github")
        .update({ sync_status: "error", sync_error: message })
        .eq("project_id", project.id);
      results.push({ repo: repoLabel, ok: false, error: message });
    }
  }

  return NextResponse.json({ synced: results.length, results });
}
