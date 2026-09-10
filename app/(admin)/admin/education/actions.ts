"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function createEducation(formData: FormData) {
  const institution = String(formData.get("institution") ?? "").trim();
  if (!institution) return;

  const supabase = await createServerSupabaseClient();
  const { data: existing } = await supabase
    .from("education")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  await supabase.from("education").insert({
    institution,
    credential: String(formData.get("credential") ?? "").trim() || null,
    field_of_study: String(formData.get("field_of_study") ?? "").trim() || null,
    start_date: String(formData.get("start_date") ?? "").trim() || null,
    end_date: String(formData.get("end_date") ?? "").trim() || null,
    sort_order: (existing?.sort_order ?? -1) + 1,
    status: "published",
  });

  revalidatePath("/admin/education");
  revalidatePath("/");
}

export async function updateEducation(id: string, formData: FormData) {
  const institution = String(formData.get("institution") ?? "").trim();
  if (!institution) return;

  const supabase = await createServerSupabaseClient();
  await supabase
    .from("education")
    .update({
      institution,
      credential: String(formData.get("credential") ?? "").trim() || null,
      field_of_study: String(formData.get("field_of_study") ?? "").trim() || null,
      start_date: String(formData.get("start_date") ?? "").trim() || null,
      end_date: String(formData.get("end_date") ?? "").trim() || null,
    })
    .eq("id", id);

  revalidatePath("/admin/education");
  revalidatePath("/");
}

export async function deleteEducation(id: string) {
  const supabase = await createServerSupabaseClient();
  await supabase.from("education").delete().eq("id", id);
  revalidatePath("/admin/education");
  revalidatePath("/");
}

export async function toggleEducationStatus(id: string, currentStatus: string) {
  const supabase = await createServerSupabaseClient();
  await supabase
    .from("education")
    .update({ status: currentStatus === "published" ? "draft" : "published" })
    .eq("id", id);
  revalidatePath("/admin/education");
  revalidatePath("/");
}
