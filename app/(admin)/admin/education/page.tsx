import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createEducation, deleteEducation, toggleEducationStatus, updateEducation } from "./actions";
import { Field } from "@/components/admin/field";
import { SubmitButton } from "@/components/admin/submit-button";

/**
 * Education was already extracted by the resume parser (lib/resume/schema.ts)
 * but had no admin page and rendered nowhere on the site — every parsed
 * degree was reachable only via direct SQL. This closes that gap: create,
 * edit, delete, publish-toggle, same shape as /admin/experience.
 */
export default async function AdminEducationPage() {
  const supabase = await createServerSupabaseClient();
  const { data: rows } = await supabase
    .from("education")
    .select("id, institution, credential, field_of_study, start_date, end_date, status")
    .order("start_date", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <p className="text-section-head text-muted-foreground uppercase">Manage education</p>

      <div className="mt-6 flex flex-col gap-4 pl-6">
        {rows && rows.length > 0 ? (
          rows.map((r) => (
            <div key={r.id} className="border-border border-b pb-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-body text-foreground">
                    <span className="text-signal-500">{r.credential ?? "—"}</span> @ {r.institution}
                  </p>
                  <p className="text-flag text-muted-foreground mt-1">
                    {r.start_date ?? "—"} — {r.end_date ?? "present"} ({r.status})
                  </p>
                </div>
                <div className="flex shrink-0 gap-3">
                  <form action={toggleEducationStatus.bind(null, r.id, r.status)}>
                    <button type="submit" className="text-flag text-signal-500 hover:text-signal-600">
                      {r.status === "published" ? "unpublish" : "publish"}
                    </button>
                  </form>
                  <form action={deleteEducation.bind(null, r.id)}>
                    <button type="submit" className="text-flag text-destructive hover:text-destructive/80">
                      delete
                    </button>
                  </form>
                </div>
              </div>

              <details className="mt-2">
                <summary className="text-flag text-signal-500 hover:text-signal-600 cursor-pointer">
                  edit
                </summary>
                <form action={updateEducation.bind(null, r.id)} className="mt-3 flex flex-col gap-3 max-w-md">
                  <Field label="institution:" name="institution" defaultValue={r.institution} required />
                  <Field label="credential:" name="credential" defaultValue={r.credential} />
                  <Field label="field of study:" name="field_of_study" defaultValue={r.field_of_study} />
                  <div className="flex gap-4">
                    <Field label="start date:" name="start_date" type="date" defaultValue={r.start_date} />
                    <Field
                      label="end date (blank = current):"
                      name="end_date"
                      type="date"
                      defaultValue={r.end_date}
                    />
                  </div>
                  <SubmitButton>save →</SubmitButton>
                </form>
              </details>
            </div>
          ))
        ) : (
          <p className="text-body text-muted-foreground">No entries yet.</p>
        )}
      </div>

      <div className="border-border mt-10 border">
        <div className="text-furniture text-muted-foreground border-border border-b px-4 py-2 tracking-wide">
          add new
        </div>
        <form action={createEducation} className="flex flex-col gap-3 px-4 py-6 max-w-md">
          <Field label="institution:" name="institution" required />
          <Field label="credential:" name="credential" placeholder="B.S. Computer Science" />
          <Field label="field of study:" name="field_of_study" />
          <div className="flex gap-4">
            <Field label="start date:" name="start_date" type="date" />
            <Field label="end date (blank = current):" name="end_date" type="date" />
          </div>
          <SubmitButton>add entry →</SubmitButton>
        </form>
      </div>
    </div>
  );
}
