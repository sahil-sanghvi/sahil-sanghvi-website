"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function createExperience(formData: FormData) {
  const org = String(formData.get("org") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();
  const startDate = String(formData.get("start_date") ?? "").trim();
  if (!org || !role || !startDate) return;

  const endDate = String(formData.get("end_date") ?? "").trim();
  const tech = String(formData.get("tech") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const supabase = await createServerSupabaseClient();
  const { data: existing } = await supabase
    .from("experience")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  await supabase.from("experience").insert({
    org,
    role,
    employment_type: String(formData.get("employment_type") ?? "") || null,
    start_date: startDate,
    end_date: endDate || null,
    summary_md: String(formData.get("summary_md") ?? "").trim() || null,
    tech,
    sort_order: (existing?.sort_order ?? -1) + 1,
    status: "published",
  });

  revalidatePath("/admin/experience");
  revalidatePath("/");
}

export async function updateExperience(id: string, formData: FormData) {
  const org = String(formData.get("org") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();
  const startDate = String(formData.get("start_date") ?? "").trim();
  if (!org || !role || !startDate) return;

  const endDate = String(formData.get("end_date") ?? "").trim();
  const tech = String(formData.get("tech") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const supabase = await createServerSupabaseClient();
  await supabase
    .from("experience")
    .update({
      org,
      role,
      employment_type: String(formData.get("employment_type") ?? "") || null,
      location: String(formData.get("location") ?? "").trim() || null,
      start_date: startDate,
      end_date: endDate || null,
      summary_md: String(formData.get("summary_md") ?? "").trim() || null,
      tech,
    })
    .eq("id", id);

  revalidatePath("/admin/experience");
  revalidatePath("/");
}

export async function deleteExperience(id: string) {
  const supabase = await createServerSupabaseClient();
  await supabase.from("experience").delete().eq("id", id);
  revalidatePath("/admin/experience");
  revalidatePath("/");
}

export async function toggleExperienceStatus(id: string, currentStatus: string) {
  const supabase = await createServerSupabaseClient();
  await supabase
    .from("experience")
    .update({ status: currentStatus === "published" ? "draft" : "published" })
    .eq("id", id);
  revalidatePath("/admin/experience");
  revalidatePath("/");
}
