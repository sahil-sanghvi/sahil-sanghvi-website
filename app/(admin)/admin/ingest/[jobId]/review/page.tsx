import { createServerSupabaseClient } from "@/lib/supabase/server";
import { applyReview } from "./actions";
import { REVIEW_FIELDS, listToText, type ReviewTable } from "@/lib/resume/review-fields";

type AttemptLog = {
  provider: string;
  model: string;
  ok: boolean;
  status?: string;
  errorKind?: string;
  latencyMs: number;
};

const INPUT_CLASS =
  "border-border bg-ink-950 text-foreground text-body px-3 py-2 focus:border-signal-500 focus:outline-none w-full";

function isReviewTable(t: string): t is ReviewTable {
  return t === "experience" || t === "education" || t === "skills" || t === "profile";
}

export default async function ReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ jobId: string }>;
  searchParams: Promise<{ applyError?: string }>;
}) {
  const { jobId } = await params;
  const { applyError } = await searchParams;
  const supabase = await createServerSupabaseClient();

  const { data: job } = await supabase
    .from("ingest_jobs")
    .select("id, status, winning_provider, winning_model, attempts, error")
    .eq("id", jobId)
    .maybeSingle();

  const { data: records } = await supabase
    .from("staging_records")
    .select("id, target_table, operation, proposed, current_snapshot, confidence, source_quote, status")
    .eq("job_id", jobId)
    .order("target_table");

  const attempts = (job?.attempts as AttemptLog[] | null) ?? [];
  const pending = records?.filter((r) => r.status === "pending") ?? [];
  const jobFailed = job?.status === "failed";
  // Previously this and "nothing left pending" shared one destructive
  // message, so revisiting a job that had already been fully applied
  // falsely reported "all providers failed". They're distinct states now.
  const nothingPending = !jobFailed && pending.length === 0;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <p className="text-section-head text-muted-foreground uppercase">Review ingest</p>

      {applyError ? (
        <p className="text-body text-destructive mt-4 pl-6 max-w-[68ch]">
          {applyError} record{applyError === "1" ? "" : "s"} failed to write and are still pending below —
          fix and resubmit, or check for a conflict (e.g. a duplicate skill name).
        </p>
      ) : null}

      {attempts.length > 0 ? (
        <div className="mt-4 pl-6">
          <p className="text-flag text-muted-foreground uppercase">provider trace</p>
          <div className="mt-2 flex flex-col gap-1">
            {attempts.map((a, i) => (
              <p key={i} className="text-flag">
                <span className="text-muted-foreground">{a.provider}</span>{" "}
                <span className={a.ok ? "text-signal-500" : "text-destructive"}>
                  {a.status ?? (a.ok ? "success" : "failed")}
                </span>
                {a.errorKind ? <span className="text-muted-foreground"> ({a.errorKind})</span> : null}{" "}
                <span className="text-muted-foreground">{a.latencyMs}ms</span>
              </p>
            ))}
          </div>
        </div>
      ) : null}

      {jobFailed ? (
        <div className="mt-8 pl-6">
          <p className="text-body text-destructive max-w-[68ch]">
            {job?.error ?? "All providers failed — nothing to review."}
          </p>
          <p className="text-body text-muted-foreground mt-2 max-w-[68ch]">
            The AI is an accelerator, never a dependency — enter this resume&apos;s content by hand
            instead:
          </p>
          <div className="mt-2 flex gap-4">
            <a href="/admin/experience" className="text-flag text-signal-500 hover:text-signal-600">
              → Experience
            </a>
            <a href="/admin/skills" className="text-flag text-signal-500 hover:text-signal-600">
              → Skills
            </a>
          </div>
        </div>
      ) : nothingPending ? (
        <div className="mt-8 pl-6">
          <p className="text-body text-foreground max-w-[68ch]">
            Nothing left to review on this job — every record was already accepted or rejected.
          </p>
          <a href="/admin/resume" className="text-flag text-signal-500 hover:text-signal-600 mt-2 inline-block">
            → back to resume uploads
          </a>
        </div>
      ) : (
        <form action={applyReview.bind(null, jobId)} className="mt-8 flex flex-col gap-8 pl-6">
          {pending.map((r) => {
            const table = isReviewTable(r.target_table) ? r.target_table : null;
            const fields = table ? REVIEW_FIELDS[table] : [];
            const proposed = (r.proposed ?? {}) as Record<string, unknown>;
            const snapshot = (r.current_snapshot ?? null) as Record<string, unknown> | null;

            return (
              <div key={r.id} className="border-border border-b pb-6">
                <label className="flex items-start gap-3">
                  <input type="checkbox" name={`accept-${r.id}`} defaultChecked className="mt-1" />
                  <p className="text-flag text-muted-foreground uppercase">
                    {r.operation} → {r.target_table}
                  </p>
                </label>

                {fields.length > 0 ? (
                  <div className="mt-3 ml-6 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
                    {fields.map((f) => {
                      const raw = proposed[f.key];
                      const currentRaw = snapshot ? snapshot[f.key] : undefined;
                      const name = `field-${r.id}-${f.key}`;
                      const showDiff =
                        r.operation === "update" &&
                        currentRaw !== undefined &&
                        JSON.stringify(currentRaw) !== JSON.stringify(raw);

                      return (
                        <div
                          key={f.key}
                          className={f.type === "textarea" || f.type === "list" ? "sm:col-span-2" : ""}
                        >
                          <label className="text-flag text-muted-foreground block mb-1">{f.label}</label>
                          {f.type === "select" ? (
                            <select name={name} defaultValue={(raw as string) ?? ""} className={INPUT_CLASS}>
                              <option value="">—</option>
                              {f.options?.map((o) => (
                                <option key={o} value={o}>
                                  {o}
                                </option>
                              ))}
                            </select>
                          ) : f.type === "textarea" ? (
                            <textarea name={name} defaultValue={(raw as string) ?? ""} rows={3} className={INPUT_CLASS} />
                          ) : f.type === "list" ? (
                            <textarea
                              name={name}
                              defaultValue={listToText(raw, f.separator ?? "comma")}
                              rows={2}
                              className={INPUT_CLASS}
                            />
                          ) : (
                            <input
                              type={f.type === "date" ? "date" : "text"}
                              name={name}
                              defaultValue={(raw as string) ?? ""}
                              className={INPUT_CLASS}
                            />
                          )}
                          {showDiff ? (
                            <p className="text-flag text-muted-foreground mt-1">
                              was: {currentRaw === null || currentRaw === "" ? "—" : String(currentRaw)}
                            </p>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  // Unrecognized target_table (shouldn't happen from the resume
                  // pipeline today) — fall back to a read-only dump rather than
                  // silently dropping the record.
                  <pre className="text-body text-foreground mt-2 ml-6 max-w-[60ch] whitespace-pre-wrap">
                    {JSON.stringify(proposed, null, 2)}
                  </pre>
                )}

                <p className="text-flag text-muted-foreground mt-3 ml-6">
                  confidence {Math.round((r.confidence ?? 0) * 100)}% — source: &quot;{r.source_quote}&quot;
                </p>
              </div>
            );
          })}

          <button
            type="submit"
            className="border-border hover:border-signal-500 hover:text-signal-500 text-body text-foreground self-start border px-4 py-2 transition-colors"
          >
            apply accepted →
          </button>
        </form>
      )}
    </div>
  );
}
