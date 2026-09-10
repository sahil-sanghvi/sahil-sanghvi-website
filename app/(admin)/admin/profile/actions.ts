"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function updateProfile(formData: FormData) {
  const supabase = await createServerSupabaseClient();

  const github = String(formData.get("github") ?? "").trim();
  const linkedin = String(formData.get("linkedin") ?? "").trim();
  const x = String(formData.get("x") ?? "").trim();

  const socials: Record<string, string> = {};
  if (github) socials.github = github;
  if (linkedin) socials.linkedin = linkedin;
  if (x) socials.x = x;

  await supabase
    .from("profile")
    .update({
      full_name: String(formData.get("full_name") ?? "").trim(),
      headline: String(formData.get("headline") ?? "").trim(),
      bio_md: String(formData.get("bio_md") ?? "").trim(),
      public_email: String(formData.get("public_email") ?? "").trim() || null,
      socials,
      available_for_work: formData.get("available_for_work") === "on",
    })
    .eq("singleton", true);

  revalidatePath("/admin/profile");
  revalidatePath("/");
}
