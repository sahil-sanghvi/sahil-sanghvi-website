import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { UploadForm } from "./upload-form";

export default async function AdminResumePage() {
  const supabase = await createServerSupabaseClient();
  const { data: jobs } = await supabase
    .from("ingest_jobs")
    .select("id, status, winning_provider, error, created_at")
    .eq("kind", "resume_pdf")
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <p className="text-section-head text-muted-foreground uppercase">Resume ingest</p>
      <p className="text-body text-muted-foreground mt-2 max-w-[68ch] pl-6">
        Upload a resume PDF. Text is extracted and sent through a provider
        chain (Groq → Gemini → OpenRouter → OpenAI) — whichever one
        succeeds first wins. Nothing publishes automatically: every
        extracted entry lands in a review queue where you accept, edit, or
        reject it before it touches your live experience/skills/education.
      </p>

      <div className="pl-6">
        <UploadForm />
      </div>

      <div className="mt-10 pl-6">
        <p className="text-flag text-muted-foreground uppercase">recent jobs</p>
        <div className="mt-3 flex flex-col gap-2">
          {jobs && jobs.length > 0 ? (
            jobs.map((j) => (
              <div key={j.id} className="text-flag">
                <Link href={`/admin/ingest/${j.id}/review`} className="text-signal-500 hover:text-signal-600">
                  {j.id.slice(0, 8)}
                </Link>{" "}
                <span className={j.status === "needs_review" ? "text-signal-500" : "text-muted-foreground"}>
                  {j.status}
                </span>
                {j.winning_provider ? (
                  <span className="text-muted-foreground"> via {j.winning_provider}</span>
                ) : null}
                {j.error ? <span className="text-muted-foreground"> — {j.error}</span> : null}
              </div>
            ))
          ) : (
            <p className="text-flag text-muted-foreground">No resume uploads yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
