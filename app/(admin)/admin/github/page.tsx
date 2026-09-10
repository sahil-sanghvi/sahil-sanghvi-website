import { createServerSupabaseClient } from "@/lib/supabase/server";
import { IngestForm } from "./ingest-form";

export default async function AdminGithubPage() {
  const supabase = await createServerSupabaseClient();
  const { data: jobs } = await supabase
    .from("ingest_jobs")
    .select("id, source_ref, status, error, created_at")
    .eq("kind", "github_repo")
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <p className="text-section-head text-muted-foreground uppercase">GitHub ingest</p>
      <p className="text-body text-muted-foreground mt-2 max-w-[68ch] pl-6">
        Paste a repo URL to pull its metadata, README, and recent commits
        automatically. Re-pasting the same URL updates the existing project
        rather than creating a duplicate. New projects land as{" "}
        <span className="text-signal-500">draft</span> — publish them from the
        Projects admin page once you&apos;ve added a tagline and role.
      </p>

      <div className="pl-6">
        <IngestForm />
      </div>

      <div className="mt-10 pl-6">
        <p className="text-flag text-muted-foreground uppercase">recent jobs</p>
        <div className="mt-3 flex flex-col gap-2">
          {jobs && jobs.length > 0 ? (
            jobs.map((j) => (
              <div key={j.id} className="text-flag">
                <span className="text-muted-foreground">{j.source_ref}</span>{" "}
                <span className={j.status === "applied" ? "text-signal-500" : "text-destructive"}>
                  {j.status}
                </span>
                {j.error ? <span className="text-muted-foreground"> — {j.error}</span> : null}
              </div>
            ))
          ) : (
            <p className="text-flag text-muted-foreground">No ingest jobs yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
