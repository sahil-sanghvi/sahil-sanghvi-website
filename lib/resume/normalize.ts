import "server-only";
import type { ResumeExtraction } from "./schema";
import { createAdminClient } from "@/lib/supabase/admin";

function monthToDate(m: string): string {
  return m.length === 4 ? `${m}-01-01` : `${m}-01`;
}

export interface StagingRecordInput {
  target_table: "experience" | "education" | "skills" | "profile";
  target_id: string | null;
  operation: "insert" | "update";
  proposed: Record<string, unknown>;
  current_snapshot: Record<string, unknown> | null;
  confidence: number;
  source_quote: string;
  dedupe_key: string;
}

/**
 * Normalizes AI output into rows already shaped to their destination
 * table's columns, and decides insert vs update by matching a computed
 * dedupe_key against existing rows — this is what stops a second resume
 * upload duplicating every job, and what makes the apply step in the review
 * UI a mechanical insert/update with no LLM-shape leakage into the write
 * path.
 *
 * Note: `proposed` deliberately carries no `status` key. Whether an accepted
 * record publishes or just updates an already-published row is
 * applyReview's decision (see review/actions.ts), not this function's — a
 * hardcoded status here previously meant every accepted record landed as
 * 'draft', and every accepted *update* silently unpublished an already-live
 * entry.
 */
export async function buildStagingRecords(
  extraction: ResumeExtraction
): Promise<StagingRecordInput[]> {
  const supabase = createAdminClient();
  const records: StagingRecordInput[] = [];

  const { data: existingExperience } = await supabase.from("experience").select("id, org, role");
  const { data: existingSkills } = await supabase.from("skills").select("id, name");
  const { data: existingEducation } = await supabase.from("education").select("id, institution, credential");

  for (const exp of extraction.experience) {
    const dedupeKey = `${exp.org.toLowerCase()}|${exp.role.toLowerCase()}`;
    const match = existingExperience?.find(
      (e) => `${e.org.toLowerCase()}|${e.role.toLowerCase()}` === dedupeKey
    );

    records.push({
      target_table: "experience",
      target_id: match?.id ?? null,
      operation: match ? "update" : "insert",
      proposed: {
        org: exp.org,
        role: exp.role,
        employment_type: exp.employmentType ?? null,
        location: exp.location ?? null,
        start_date: monthToDate(exp.startDate),
        end_date: exp.endDate ? monthToDate(exp.endDate) : null,
        summary_md: exp.summary ?? null,
        highlights: exp.highlights ?? [],
        tech: exp.tech ?? [],
      },
      current_snapshot: match ?? null,
      confidence: exp.confidence,
      source_quote: exp.sourceQuote,
      dedupe_key: dedupeKey,
    });
  }

  for (const skill of extraction.skills) {
    const dedupeKey = skill.name.toLowerCase();
    const match = existingSkills?.find((s) => s.name.toLowerCase() === dedupeKey);

    records.push({
      target_table: "skills",
      target_id: match?.id ?? null,
      operation: match ? "update" : "insert",
      proposed: {
        name: skill.name,
        category: skill.category ?? null,
      },
      current_snapshot: match ?? null,
      confidence: skill.confidence,
      source_quote: skill.sourceQuote,
      dedupe_key: dedupeKey,
    });
  }

  for (const edu of extraction.education) {
    // Same dedupe treatment as experience/skills — previously this always
    // inserted, so re-uploading a resume duplicated every degree.
    const dedupeKey = `${edu.institution.toLowerCase()}|${(edu.credential ?? "").toLowerCase()}`;
    const match = existingEducation?.find(
      (e) => `${e.institution.toLowerCase()}|${(e.credential ?? "").toLowerCase()}` === dedupeKey
    );

    records.push({
      target_table: "education",
      target_id: match?.id ?? null,
      operation: match ? "update" : "insert",
      proposed: {
        institution: edu.institution,
        credential: edu.credential ?? null,
        field_of_study: edu.fieldOfStudy ?? null,
        start_date: edu.startDate ? monthToDate(edu.startDate) : null,
        end_date: edu.endDate ? monthToDate(edu.endDate) : null,
      },
      current_snapshot: match ?? null,
      confidence: edu.confidence,
      source_quote: edu.sourceQuote,
      dedupe_key: dedupeKey,
    });
  }

  const profile = extraction.profile;
  const hasProfileFields =
    profile && (profile.fullName || profile.headline || profile.location || profile.email);
  if (hasProfileFields) {
    const { data: existingProfile } = await supabase
      .from("profile")
      .select("id, full_name, headline, location, public_email")
      .eq("singleton", true)
      .maybeSingle();

    if (existingProfile) {
      records.push({
        target_table: "profile",
        target_id: existingProfile.id,
        operation: "update",
        proposed: {
          ...(profile.fullName ? { full_name: profile.fullName } : {}),
          ...(profile.headline ? { headline: profile.headline } : {}),
          ...(profile.location ? { location: profile.location } : {}),
          ...(profile.email ? { public_email: profile.email } : {}),
        },
        current_snapshot: existingProfile,
        // Profile fields aren't per-entry claims like a job or a degree —
        // there's no single sourceQuote/confidence pair from the schema, so
        // this is reviewed like everything else but without that context.
        confidence: 0.6,
        source_quote: "Resume header / contact section",
        dedupe_key: "profile-singleton",
      });
    }
    // No existing singleton row is an unrecoverable schema-invariant
    // violation (the DB requires exactly one) — not something to silently
    // paper over by inserting a second one, so this case is skipped.
  }

  return records;
}
