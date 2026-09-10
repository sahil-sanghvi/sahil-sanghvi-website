"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { parseGithubUrl } from "@/lib/github/parse-url";
import { fetchRepo, GithubApiError } from "@/lib/github/client";
import { normalizeRepo } from "@/lib/github/normalize";

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function ingestGithubRepo(
  formData: FormData
): Promise<{ ok: boolean; message: string }> {
  const url = String(formData.get("url") ?? "");
  const supabase = await createServerSupabaseClient();
  const startedAt = new Date().toISOString();

  const { data: job } = await supabase
    .from("ingest_jobs")
    .insert({ kind: "github_repo", source_ref: url, status: "running", started_at: startedAt })
    .select("id")
    .single();

  try {
    const { owner, name } = parseGithubUrl(url);
    const data = await fetchRepo(owner, name);
    const normalized = await normalizeRepo(owner, name, data);

    const { data: existingGithub } = await supabase
      .from("project_github")
      .select("project_id")
      .eq("repo_owner", owner)
      .eq("repo_name", name)
      .maybeSingle();

    let projectId: string;

    if (existingGithub) {
      projectId = existingGithub.project_id;
    } else {
      const { data: newProject, error: projectError } = await supabase
        .from("projects")
        .insert({
          slug: slugify(name),
          title: name,
          tagline: normalized.github.gh_description,
          repo_url: `https://github.com/${owner}/${name}`,
          live_url: normalized.github.homepage,
          tech: normalized.github.primary_language ? [normalized.github.primary_language] : [],
          status: "draft",
        })
        .select("id")
        .single();

      if (projectError || !newProject) {
        throw new Error(projectError?.message ?? "Failed to create project row.");
      }
      projectId = newProject.id;
    }

    await supabase
      .from("project_github")
      .upsert({ project_id: projectId, ...normalized.github }, { onConflict: "project_id" });

    if (normalized.commits.length > 0) {
      await supabase
        .from("project_commits")
        .upsert(
          normalized.commits.map((c) => ({ project_id: projectId, ...c })),
          { onConflict: "project_id,sha" }
        );
    }

    await supabase
      .from("ingest_jobs")
      .update({
        status: "applied",
        finished_at: new Date().toISOString(),
        total_ms: Date.now() - new Date(startedAt).getTime(),
      })
      .eq("id", job!.id);

    revalidatePath("/admin/projects");
    revalidatePath("/");
    revalidatePath("/projects");

    return {
      ok: true,
      message: `Ingested ${owner}/${name} — it's saved as a draft project. Publish it from the Projects admin page once you've filled in a tagline/role.`,
    };
  } catch (err) {
    const message = err instanceof GithubApiError || err instanceof Error ? err.message : "Unknown error.";
    await supabase
      .from("ingest_jobs")
      .update({ status: "failed", error: message, finished_at: new Date().toISOString() })
      .eq("id", job!.id);

    return { ok: false, message };
  }
}
