"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function createSkill(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const supabase = await createServerSupabaseClient();
  const { data: existing } = await supabase
    .from("skills")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  await supabase.from("skills").insert({
    name,
    description: String(formData.get("description") ?? "").trim() || null,
    category: String(formData.get("category") ?? "") || null,
    featured: formData.get("featured") === "on",
    sort_order: (existing?.sort_order ?? -1) + 1,
    status: "published",
  });

  revalidatePath("/admin/skills");
  revalidatePath("/");
}

export async function updateSkill(id: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const supabase = await createServerSupabaseClient();
  await supabase
    .from("skills")
    .update({
      name,
      description: String(formData.get("description") ?? "").trim() || null,
      category: String(formData.get("category") ?? "") || null,
      featured: formData.get("featured") === "on",
    })
    .eq("id", id);

  revalidatePath("/admin/skills");
  revalidatePath("/");
}

export async function deleteSkill(id: string) {
  const supabase = await createServerSupabaseClient();
  await supabase.from("skills").delete().eq("id", id);
  revalidatePath("/admin/skills");
  revalidatePath("/");
}

export async function toggleSkillStatus(id: string, currentStatus: string) {
  const supabase = await createServerSupabaseClient();
  await supabase
    .from("skills")
    .update({ status: currentStatus === "published" ? "draft" : "published" })
    .eq("id", id);
  revalidatePath("/admin/skills");
  revalidatePath("/");
}
