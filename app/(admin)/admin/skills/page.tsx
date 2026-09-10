import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createSkill, deleteSkill, toggleSkillStatus, updateSkill } from "./actions";
import { Field, SelectField, TextareaField, CheckboxField } from "@/components/admin/field";
import { SubmitButton } from "@/components/admin/submit-button";
import { SKILL_CATEGORY_OPTIONS } from "@/lib/resume/review-fields";

export default async function AdminSkillsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: skills } = await supabase
    .from("skills")
    .select("id, name, description, category, featured, status")
    .order("sort_order");

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <p className="text-section-head text-muted-foreground uppercase">Manage skills (OPTIONS)</p>

      <div className="mt-6 flex flex-col gap-4 pl-6">
        {skills && skills.length > 0 ? (
          skills.map((s) => (
            <div key={s.id} className="border-border border-b pb-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-flag text-signal-500">{s.name}</p>
                  <p className="text-body text-muted-foreground mt-1 max-w-[60ch]">{s.description}</p>
                  <p className="text-flag text-muted-foreground mt-1">({s.status})</p>
                </div>
                <div className="flex shrink-0 gap-3">
                  <form action={toggleSkillStatus.bind(null, s.id, s.status)}>
                    <button type="submit" className="text-flag text-signal-500 hover:text-signal-600">
                      {s.status === "published" ? "unpublish" : "publish"}
                    </button>
                  </form>
                  <form action={deleteSkill.bind(null, s.id)}>
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
                <form action={updateSkill.bind(null, s.id)} className="mt-3 flex flex-col gap-3 max-w-md">
                  <Field label="flag:" name="name" defaultValue={s.name} required />
                  <TextareaField label="description:" name="description" defaultValue={s.description} rows={2} />
                  <SelectField
                    label="category:"
                    name="category"
                    options={SKILL_CATEGORY_OPTIONS}
                    defaultValue={s.category}
                  />
                  <CheckboxField label="featured" name="featured" defaultChecked={s.featured} />
                  <SubmitButton>save →</SubmitButton>
                </form>
              </details>
            </div>
          ))
        ) : (
          <p className="text-body text-muted-foreground">No skills yet.</p>
        )}
      </div>

      <div className="border-border mt-10 border">
        <div className="text-furniture text-muted-foreground border-border border-b px-4 py-2 tracking-wide">
          add new
        </div>
        <form action={createSkill} className="flex flex-col gap-3 px-4 py-6">
          <label htmlFor="name" className="text-flag text-muted-foreground">
            flag (e.g. -py, --python):
          </label>
          <input
            id="name"
            name="name"
            required
            className="border-border bg-ink-950 text-foreground text-body px-3 py-2 focus:border-signal-500 focus:outline-none"
          />
          <label htmlFor="description" className="text-flag text-muted-foreground mt-2">
            description:
          </label>
          <textarea
            id="description"
            name="description"
            rows={2}
            className="border-border bg-ink-950 text-foreground text-body px-3 py-2 focus:border-signal-500 focus:outline-none"
          />
          <label htmlFor="category" className="text-flag text-muted-foreground mt-2">
            category:
          </label>
          <select
            id="category"
            name="category"
            className="border-border bg-ink-950 text-foreground text-body max-w-xs px-3 py-2 focus:border-signal-500 focus:outline-none"
          >
            <option value="practice">practice</option>
            <option value="language">language</option>
            <option value="framework">framework</option>
            <option value="tool">tool</option>
            <option value="platform">platform</option>
          </select>
          <label className="text-flag text-muted-foreground mt-2 flex items-center gap-2">
            <input type="checkbox" name="featured" defaultChecked />
            featured
          </label>
          <button
            type="submit"
            className="border-border hover:border-signal-500 hover:text-signal-500 text-body text-foreground mt-2 self-start border px-4 py-2 transition-colors"
          >
            add skill →
          </button>
        </form>
      </div>
    </div>
  );
}
