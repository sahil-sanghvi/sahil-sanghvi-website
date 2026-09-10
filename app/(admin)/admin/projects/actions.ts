"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createProject(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const tech = String(formData.get("tech") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const supabase = await createServerSupabaseClient();
  const { data: existing } = await supabase
    .from("projects")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  await supabase.from("projects").insert({
    slug: slugify(title),
    title,
    tagline: String(formData.get("tagline") ?? "").trim() || null,
    description_md: String(formData.get("description_md") ?? "").trim() || null,
    role: String(formData.get("role") ?? "").trim() || null,
    live_url: String(formData.get("live_url") ?? "").trim() || null,
    repo_url: String(formData.get("repo_url") ?? "").trim() || null,
    tech,
    featured: formData.get("featured") === "on",
    sort_order: (existing?.sort_order ?? -1) + 1,
    status: "draft",
  });

  revalidatePath("/admin/projects");
  revalidatePath("/");
  revalidatePath("/projects");
}

export async function updateProject(id: string, formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const tech = String(formData.get("tech") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const supabase = await createServerSupabaseClient();
  const { data: updated } = await supabase
    .from("projects")
    .update({
      title,
      tagline: String(formData.get("tagline") ?? "").trim() || null,
      description_md: String(formData.get("description_md") ?? "").trim() || null,
      role: String(formData.get("role") ?? "").trim() || null,
      live_url: String(formData.get("live_url") ?? "").trim() || null,
      repo_url: String(formData.get("repo_url") ?? "").trim() || null,
      tech,
      started_on: String(formData.get("started_on") ?? "").trim() || null,
      ended_on: String(formData.get("ended_on") ?? "").trim() || null,
      featured: formData.get("featured") === "on",
    })
    .eq("id", id)
    .select("slug")
    .maybeSingle();

  revalidatePath("/admin/projects");
  revalidatePath("/");
  revalidatePath("/projects");
  // Individual project detail pages previously never revalidated after an
  // edit, so they could stay stale for up to an hour (the ISR window).
  if (updated?.slug) revalidatePath(`/projects/${updated.slug}`);
}

export async function deleteProject(id: string) {
  const supabase = await createServerSupabaseClient();
  await supabase.from("projects").delete().eq("id", id);
  revalidatePath("/admin/projects");
  revalidatePath("/");
  revalidatePath("/projects");
}

export async function toggleProjectStatus(id: string, currentStatus: string) {
  const supabase = await createServerSupabaseClient();
  await supabase
    .from("projects")
    .update({ status: currentStatus === "published" ? "draft" : "published" })
    .eq("id", id);
  revalidatePath("/admin/projects");
  revalidatePath("/");
  revalidatePath("/projects");
}
