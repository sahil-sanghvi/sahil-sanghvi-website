import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createExperience, deleteExperience, toggleExperienceStatus, updateExperience } from "./actions";
import { Field, SelectField, TextareaField } from "@/components/admin/field";
import { SubmitButton } from "@/components/admin/submit-button";
import { EMPLOYMENT_TYPE_OPTIONS } from "@/lib/resume/review-fields";

export default async function AdminExperiencePage() {
  const supabase = await createServerSupabaseClient();
  const { data: roles } = await supabase
    .from("experience")
    .select("id, org, role, employment_type, location, start_date, end_date, summary_md, tech, status")
    .order("start_date", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <p className="text-section-head text-muted-foreground uppercase">Manage experience (HISTORY)</p>

      <div className="mt-6 flex flex-col gap-4 pl-6">
        {roles && roles.length > 0 ? (
          roles.map((r) => (
            <div key={r.id} className="border-border border-b pb-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-body text-foreground">
                    <span className="text-signal-500">{r.role}</span> @ {r.org}
                    {r.employment_type === "volunteer" ? (
                      <span className="text-flag text-muted-foreground"> (volunteer)</span>
                    ) : null}
                  </p>
                  <p className="text-flag text-muted-foreground mt-1">
                    {r.start_date} — {r.end_date ?? "present"} ({r.status})
                  </p>
                </div>
                <div className="flex shrink-0 gap-3">
                  <form action={toggleExperienceStatus.bind(null, r.id, r.status)}>
                    <button type="submit" className="text-flag text-signal-500 hover:text-signal-600">
                      {r.status === "published" ? "unpublish" : "publish"}
                    </button>
                  </form>
                  <form action={deleteExperience.bind(null, r.id)}>
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
                <form
                  action={updateExperience.bind(null, r.id)}
                  className="mt-3 flex flex-col gap-3 max-w-md"
                >
                  <Field label="organization:" name="org" defaultValue={r.org} required />
                  <Field label="role:" name="role" defaultValue={r.role} required />
                  <SelectField
                    label="employment type:"
                    name="employment_type"
                    options={EMPLOYMENT_TYPE_OPTIONS}
                    defaultValue={r.employment_type}
                  />
                  <Field label="location:" name="location" defaultValue={r.location} />
                  <div className="flex gap-4">
                    <Field label="start date:" name="start_date" type="date" defaultValue={r.start_date} required />
                    <Field
                      label="end date (blank = current):"
                      name="end_date"
                      type="date"
                      defaultValue={r.end_date}
                    />
                  </div>
                  <TextareaField label="summary:" name="summary_md" defaultValue={r.summary_md} />
                  <Field
                    label="tech (comma-separated):"
                    name="tech"
                    defaultValue={r.tech?.join(", ")}
                  />
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
        <form action={createExperience} className="flex flex-col gap-3 px-4 py-6">
          <label htmlFor="org" className="text-flag text-muted-foreground">
            organization:
          </label>
          <input
            id="org"
            name="org"
            required
            className="border-border bg-ink-950 text-foreground text-body max-w-md px-3 py-2 focus:border-signal-500 focus:outline-none"
          />
          <label htmlFor="role" className="text-flag text-muted-foreground mt-2">
            role:
          </label>
          <input
            id="role"
            name="role"
            required
            className="border-border bg-ink-950 text-foreground text-body max-w-md px-3 py-2 focus:border-signal-500 focus:outline-none"
          />
          <label htmlFor="employment_type" className="text-flag text-muted-foreground mt-2">
            employment type:
          </label>
          <select
            id="employment_type"
            name="employment_type"
            className="border-border bg-ink-950 text-foreground text-body max-w-xs px-3 py-2 focus:border-signal-500 focus:outline-none"
          >
            {EMPLOYMENT_TYPE_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          <div className="mt-2 flex gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="start_date" className="text-flag text-muted-foreground">
                start date:
              </label>
              <input
                id="start_date"
                name="start_date"
                type="date"
                required
                className="border-border bg-ink-950 text-foreground text-body px-3 py-2 focus:border-signal-500 focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="end_date" className="text-flag text-muted-foreground">
                end date (blank = current):
              </label>
              <input
                id="end_date"
                name="end_date"
                type="date"
                className="border-border bg-ink-950 text-foreground text-body px-3 py-2 focus:border-signal-500 focus:outline-none"
              />
            </div>
          </div>
          <label htmlFor="summary_md" className="text-flag text-muted-foreground mt-2">
            summary:
          </label>
          <textarea
            id="summary_md"
            name="summary_md"
            rows={3}
            className="border-border bg-ink-950 text-foreground text-body px-3 py-2 focus:border-signal-500 focus:outline-none"
          />
          <label htmlFor="tech" className="text-flag text-muted-foreground mt-2">
            tech (comma-separated):
          </label>
          <input
            id="tech"
            name="tech"
            placeholder="TypeScript, Next.js, Postgres"
            className="border-border bg-ink-950 text-foreground text-body px-3 py-2 focus:border-signal-500 focus:outline-none"
          />
          <button
            type="submit"
            className="border-border hover:border-signal-500 hover:text-signal-500 text-body text-foreground mt-2 self-start border px-4 py-2 transition-colors"
          >
            add entry →
          </button>
        </form>
      </div>
    </div>
  );
}
