"use server";

import { createHash } from "node:crypto";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { extractResumeText } from "@/lib/resume/extract-text";
import { buildExtractionPrompt } from "@/lib/resume/prompt";
import { resumeExtractionSchema } from "@/lib/resume/schema";
import { buildStagingRecords } from "@/lib/resume/normalize";
import { runChain } from "@/lib/ai/run-chain";
import { ChainExhaustedError } from "@/lib/ai/types";
import { groqProvider } from "@/lib/ai/providers/groq";
import { geminiProvider } from "@/lib/ai/providers/gemini";
import { openrouterProvider } from "@/lib/ai/providers/openrouter";
import { openaiProvider } from "@/lib/ai/providers/openai";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_PAGES = 15;

export async function uploadResume(
  _prev: { ok: boolean; message: string },
  formData: FormData
): Promise<{ ok: boolean; message: string }> {
  const file = formData.get("resume") as File | null;
  if (!file || file.size === 0) {
    return { ok: false, message: "Choose a PDF file first." };
  }
  if (file.type !== "application/pdf") {
    return { ok: false, message: "Only PDF files are accepted." };
  }
  if (file.size > MAX_SIZE) {
    return { ok: false, message: "File is larger than 10MB." };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());

  // Magic-byte check: the first 4 bytes of a real PDF are "%PDF".
  const header = String.fromCharCode(...bytes.slice(0, 4));
  if (header !== "%PDF") {
    return { ok: false, message: "That file doesn't look like a valid PDF." };
  }

  const sha256 = createHash("sha256").update(bytes).digest("hex");

  const supabase = await createServerSupabaseClient();
  const admin = createAdminClient();

  const { data: existingUpload } = await supabase
    .from("resume_uploads")
    .select("id")
    .eq("sha256", sha256)
    .maybeSingle();
  if (existingUpload) {
    return { ok: false, message: "This exact file was already uploaded before." };
  }

  const extraction = await extractResumeText(bytes);
  if (extraction.pageCount > MAX_PAGES) {
    return { ok: false, message: `Resume has ${extraction.pageCount} pages — max is ${MAX_PAGES}.` };
  }

  const storagePath = `${crypto.randomUUID()}.pdf`;
  const { error: uploadError } = await admin.storage
    .from("resumes")
    .upload(storagePath, bytes, { contentType: "application/pdf" });
  if (uploadError) {
    return { ok: false, message: `Storage upload failed: ${uploadError.message}` };
  }

  const { data: uploadRow } = await supabase
    .from("resume_uploads")
    .insert({
      storage_path: storagePath,
      original_filename: file.name,
      file_size: file.size,
      sha256,
      page_count: extraction.pageCount,
      extracted_text: extraction.text,
      extraction_method: "unpdf",
      status: extraction.looksScanned ? "failed" : "extracted",
      error: extraction.looksScanned
        ? "Extracted text is too short — this looks like a scanned/image-only PDF. Native PDF-input parsing isn't implemented yet; try a text-based PDF export instead."
        : null,
    })
    .select("id")
    .single();

  if (extraction.looksScanned) {
    return {
      ok: false,
      message:
        "This looks like a scanned or image-only PDF — text extraction came back nearly empty. Export a text-based PDF (e.g. from Word/Google Docs) and try again.",
    };
  }

  const { data: job } = await supabase
    .from("ingest_jobs")
    .insert({
      kind: "resume_pdf",
      source_ref: uploadRow?.id,
      status: "running",
      started_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  try {
    const prompt = buildExtractionPrompt(extraction.text);
    const chain = await runChain(
      [groqProvider, geminiProvider, openrouterProvider, openaiProvider],
      prompt,
      resumeExtractionSchema
    );

    const stagingRecords = await buildStagingRecords(chain.data);

    if (stagingRecords.length > 0) {
      await supabase.from("staging_records").insert(
        // proposed/current_snapshot are plain objects at runtime (valid
        // jsonb), but TS can't unify Record<string, unknown> with the
        // generated Json type without a cast.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        stagingRecords.map((r) => ({ ...r, job_id: job!.id })) as any
      );
    }

    await supabase
      .from("ingest_jobs")
      .update({
        status: "needs_review",
        winning_provider: chain.provider,
        winning_model: chain.model,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        attempts: chain.attempts as any,
        total_ms: chain.totalMs,
        finished_at: new Date().toISOString(),
      })
      .eq("id", job!.id);
  } catch (err) {
    const attempts = err instanceof ChainExhaustedError ? err.attempts : [];
    await supabase
      .from("ingest_jobs")
      .update({
        status: "failed",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        attempts: attempts as any,
        error: "All four providers failed or were unavailable — see the attempt trace below.",
        finished_at: new Date().toISOString(),
      })
      .eq("id", job!.id);
  }

  redirect(`/admin/ingest/${job!.id}/review`);
}
