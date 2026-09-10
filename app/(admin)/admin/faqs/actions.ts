"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Both actions run against the session-authenticated client, not the
 * service-role admin client — RLS's "admin full access to faqs" policy
 * (is_admin()) is what actually authorizes the write, the same way it
 * would for any other authenticated request. The service-role client is
 * reserved for ingest pipelines that run without a browser session.
 */

export async function createFaq(formData: FormData) {
  const question = String(formData.get("question") ?? "").trim();
  const answer = String(formData.get("answer") ?? "").trim();
  if (!question || !answer) return;

  const supabase = await createServerSupabaseClient();
  const { data: existing } = await supabase
    .from("faqs")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  await supabase.from("faqs").insert({
    question,
    answer_md: answer,
    sort_order: (existing?.sort_order ?? -1) + 1,
    status: "published",
  });

  revalidatePath("/admin/faqs");
  revalidatePath("/");
}

export async function deleteFaq(id: string) {
  const supabase = await createServerSupabaseClient();
  await supabase.from("faqs").delete().eq("id", id);

  revalidatePath("/admin/faqs");
  revalidatePath("/");
}
