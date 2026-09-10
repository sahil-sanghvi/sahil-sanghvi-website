import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createProject, deleteProject, toggleProjectStatus, updateProject } from "./actions";
import { Field, TextareaField, CheckboxField } from "@/components/admin/field";
import { SubmitButton } from "@/components/admin/submit-button";

export default async function AdminProjectsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: projects } = await supabase
    .from("projects")
    .select(
      "id, slug, title, tagline, description_md, role, live_url, repo_url, tech, started_on, ended_on, status, featured"
    )
    .order("sort_order");

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <p className="text-section-head text-muted-foreground uppercase">Manage projects (EXAMPLES)</p>
      <p className="text-body text-muted-foreground mt-2 max-w-[68ch] pl-6">
        GitHub-repo auto-fill isn&apos;t built yet (that&apos;s the ingest pipeline) —
        add projects by hand here for now. New projects start as{" "}
        <span className="text-signal-500">draft</span> until you publish them.
      </p>

      <div className="mt-6 flex flex-col gap-4 pl-6">
        {projects && projects.length > 0 ? (
          projects.map((p) => (
            <div key={p.id} className="border-border border-b pb-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-body text-foreground">
                    {p.title} {p.featured ? <span className="text-flag text-signal-500">★</span> : null}
                  </p>
                  <p className="text-body text-muted-foreground mt-1">{p.tagline}</p>
                  <p className="text-flag text-muted-foreground mt-1">
                    /{p.slug} ({p.status})
                  </p>
                </div>
                <div className="flex shrink-0 gap-3">
                  <form action={toggleProjectStatus.bind(null, p.id, p.status)}>
                    <button type="submit" className="text-flag text-signal-500 hover:text-signal-600">
                      {p.status === "published" ? "unpublish" : "publish"}
                    </button>
                  </form>
                  <form action={deleteProject.bind(null, p.id)}>
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
                <form action={updateProject.bind(null, p.id)} className="mt-3 flex flex-col gap-3 max-w-md">
                  <Field label="title:" name="title" defaultValue={p.title} required />
                  <Field label="tagline:" name="tagline" defaultValue={p.tagline} />
                  <TextareaField label="description:" name="description_md" defaultValue={p.description_md} rows={4} />
                  <Field label="your role:" name="role" defaultValue={p.role} />
                  <div className="flex gap-4">
                    <Field label="live URL:" name="live_url" defaultValue={p.live_url} />
                    <Field label="repo URL:" name="repo_url" defaultValue={p.repo_url} />
                  </div>
                  <div className="flex gap-4">
                    <Field label="started:" name="started_on" type="date" defaultValue={p.started_on} />
                    <Field label="ended (blank = ongoing):" name="ended_on" type="date" defaultValue={p.ended_on} />
                  </div>
                  <Field label="tech (comma-separated):" name="tech" defaultValue={p.tech?.join(", ")} />
                  <CheckboxField label="featured" name="featured" defaultChecked={p.featured} />
                  <SubmitButton>save →</SubmitButton>
                </form>
              </details>
            </div>
          ))
        ) : (
          <p className="text-body text-muted-foreground">No projects yet.</p>
        )}
      </div>

      <div className="border-border mt-10 border">
        <div className="text-furniture text-muted-foreground border-border border-b px-4 py-2 tracking-wide">
          add new
        </div>
        <form action={createProject} className="flex flex-col gap-3 px-4 py-6">
          <label htmlFor="title" className="text-flag text-muted-foreground">
            title:
          </label>
          <input
            id="title"
            name="title"
            required
            className="border-border bg-ink-950 text-foreground text-body max-w-md px-3 py-2 focus:border-signal-500 focus:outline-none"
          />
          <label htmlFor="tagline" className="text-flag text-muted-foreground mt-2">
            tagline (one line):
          </label>
          <input
            id="tagline"
            name="tagline"
            className="border-border bg-ink-950 text-foreground text-body max-w-xl px-3 py-2 focus:border-signal-500 focus:outline-none"
          />
          <label htmlFor="description_md" className="text-flag text-muted-foreground mt-2">
            description:
          </label>
          <textarea
            id="description_md"
            name="description_md"
            rows={4}
            className="border-border bg-ink-950 text-foreground text-body px-3 py-2 focus:border-signal-500 focus:outline-none"
          />
          <label htmlFor="role" className="text-flag text-muted-foreground mt-2">
            your role:
          </label>
          <input
            id="role"
            name="role"
            className="border-border bg-ink-950 text-foreground text-body max-w-md px-3 py-2 focus:border-signal-500 focus:outline-none"
          />
          <div className="mt-2 flex gap-4">
            <div className="flex flex-1 flex-col gap-1">
              <label htmlFor="live_url" className="text-flag text-muted-foreground">
                live URL:
              </label>
              <input
                id="live_url"
                name="live_url"
                className="border-border bg-ink-950 text-foreground text-body px-3 py-2 focus:border-signal-500 focus:outline-none"
              />
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <label htmlFor="repo_url" className="text-flag text-muted-foreground">
                repo URL:
              </label>
              <input
                id="repo_url"
                name="repo_url"
                className="border-border bg-ink-950 text-foreground text-body px-3 py-2 focus:border-signal-500 focus:outline-none"
              />
            </div>
          </div>
          <label htmlFor="tech" className="text-flag text-muted-foreground mt-2">
            tech (comma-separated):
          </label>
          <input
            id="tech"
            name="tech"
            placeholder="TypeScript, Next.js, Postgres"
            className="border-border bg-ink-950 text-foreground text-body px-3 py-2 focus:border-signal-500 focus:outline-none"
          />
          <label className="text-flag text-muted-foreground mt-2 flex items-center gap-2">
            <input type="checkbox" name="featured" />
            featured
          </label>
          <button
            type="submit"
            className="border-border hover:border-signal-500 hover:text-signal-500 text-body text-foreground mt-2 self-start border px-4 py-2 transition-colors"
          >
            add project →
          </button>
        </form>
      </div>
    </div>
  );
}
