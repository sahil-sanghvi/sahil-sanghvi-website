"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { REVIEW_FIELDS, textToList, type ReviewTable } from "@/lib/resume/review-fields";

// staging_records.target_table's DB CHECK also allows 'projects' (used by a
// future github-ingest-through-review path, not the resume pipeline today),
// so the write-dispatch type is broader than ReviewTable, which only covers
// tables the review screen renders editable fields for.
type TargetTable = ReviewTable | "projects";

function isReviewTable(t: string): t is ReviewTable {
  return t === "experience" || t === "education" || t === "skills" || t === "profile";
}

/**
 * Reads this record's `field-${id}-*` inputs back out of the submitted
 * form and returns only the keys that differ from `proposed` — that diff is
 * what gets persisted to staging_records.edited, so it stays a legible
 * record of what the human corrected rather than a full duplicate payload.
 */
function collectEdits(
  table: ReviewTable,
  recordId: string,
  proposed: Record<string, unknown>,
  formData: FormData
): Record<string, unknown> {
  const edited: Record<string, unknown> = {};
  for (const field of REVIEW_FIELDS[table]) {
    const raw = formData.get(`field-${recordId}-${field.key}`);
    if (raw === null) continue;
    const text = String(raw);

    const value: unknown =
      field.type === "list" ? textToList(text, field.separator ?? "comma") : text.trim() === "" ? null : text.trim();

    if (JSON.stringify(value) !== JSON.stringify(proposed[field.key] ?? null)) {
      edited[field.key] = value;
    }
  }
  return edited;
}

/**
 * One pass: reads every staging row the form submitted as accepted, applies
 * inserts/updates (proposed, with any per-field edits merged on top) to its
 * real destination table, marks each row applied/rejected, and closes out
 * the job.
 *
 * Accepting now publishes directly — an accepted insert writes
 * status:'published'; an accepted update omits status entirely, preserving
 * whatever publish state the row already had, rather than the previous
 * behavior of unconditionally writing 'draft' and requiring a second manual
 * publish step (and, for updates, silently unpublishing anything already
 * live).
 */
export async function applyReview(jobId: string, formData: FormData) {
  const supabase = await createServerSupabaseClient();

  const { data: records } = await supabase
    .from("staging_records")
    .select("id, target_table, target_id, operation, proposed, status")
    .eq("job_id", jobId)
    .eq("status", "pending");

  let failures = 0;

  for (const record of records ?? []) {
    const accepted = formData.get(`accept-${record.id}`) === "on";

    if (!accepted) {
      await supabase
        .from("staging_records")
        .update({ status: "rejected", reviewed_at: new Date().toISOString() })
        .eq("id", record.id);
      continue;
    }

    const table = record.target_table as TargetTable;
    const proposed = record.proposed as Record<string, unknown>;
    const edited = isReviewTable(record.target_table) ? collectEdits(table as ReviewTable, record.id, proposed, formData) : {};
    const merged: Record<string, unknown> = { ...proposed, ...edited };

    let writeError: { message: string } | null = null;

    // Dynamic dispatch across tables can't be typed strictly against the
    // generated per-table Insert/Update shapes — proposed was already
    // normalized to the destination table's exact column shape in
    // normalize.ts, before it ever reached staging_records.
    if (record.operation === "insert") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await supabase.from(table).insert({ ...merged, status: "published" } as any);
      writeError = error;
    } else if (record.target_id) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await supabase.from(table).update(merged as any).eq("id", record.target_id);
      writeError = error;
    }

    if (writeError) {
      // Leave the staging row 'pending' rather than falsely marking it
      // applied — a failed write (e.g. the skills case-insensitive unique
      // index) is now visible instead of silently discarded.
      failures++;
      continue;
    }

    if (Object.keys(edited).length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await supabase.from("staging_records").update({ edited: edited as any }).eq("id", record.id);
    }
    await supabase
      .from("staging_records")
      .update({ status: "applied", reviewed_at: new Date().toISOString() })
      .eq("id", record.id);
  }

  const { count: stillPendingCount } = await supabase
    .from("staging_records")
    .select("id", { count: "exact", head: true })
    .eq("job_id", jobId)
    .eq("status", "pending");

  // Only close the job out once nothing is left pending — a failed write
  // (see `failures` above) keeps its staging row 'pending' so retrying is
  // possible, and the job should keep reflecting that it isn't done.
  if (!stillPendingCount) {
    await supabase.from("ingest_jobs").update({ status: "applied" }).eq("id", jobId);
  }

  revalidatePath("/admin/experience");
  revalidatePath("/admin/education");
  revalidatePath("/admin/skills");
  revalidatePath("/admin/profile");
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/terminal");

  if (failures > 0) {
    redirect(`/admin/ingest/${jobId}/review?applyError=${failures}`);
  }
  redirect("/admin/resume");
}
