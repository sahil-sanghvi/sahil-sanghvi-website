import { createServerSupabaseClient } from "@/lib/supabase/server";
import { updateProfile } from "./actions";

export default async function AdminProfilePage() {
  const supabase = await createServerSupabaseClient();
  const { data: profile } = await supabase
    .from("profile")
    .select("full_name, headline, bio_md, public_email, socials, available_for_work")
    .eq("singleton", true)
    .maybeSingle();

  const socials = (profile?.socials as Record<string, string> | null) ?? {};

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <p className="text-section-head text-muted-foreground uppercase">Profile</p>

      <form action={updateProfile} className="mt-6 flex flex-col gap-3 pl-6">
        <label htmlFor="full_name" className="text-flag text-muted-foreground">
          full name:
        </label>
        <input
          id="full_name"
          name="full_name"
          defaultValue={profile?.full_name ?? ""}
          className="border-border bg-ink-950 text-foreground text-body max-w-md px-3 py-2 focus:border-signal-500 focus:outline-none"
        />

        <label htmlFor="headline" className="text-flag text-muted-foreground mt-2">
          headline (SYNOPSIS line):
        </label>
        <textarea
          id="headline"
          name="headline"
          rows={2}
          defaultValue={profile?.headline ?? ""}
          className="border-border bg-ink-950 text-foreground text-body max-w-xl px-3 py-2 focus:border-signal-500 focus:outline-none"
        />

        <label htmlFor="bio_md" className="text-flag text-muted-foreground mt-2">
          bio (DESCRIPTION):
        </label>
        <textarea
          id="bio_md"
          name="bio_md"
          rows={5}
          defaultValue={profile?.bio_md ?? ""}
          className="border-border bg-ink-950 text-foreground text-body max-w-xl px-3 py-2 focus:border-signal-500 focus:outline-none"
        />

        <label htmlFor="public_email" className="text-flag text-muted-foreground mt-2">
          public contact email:
        </label>
        <input
          id="public_email"
          name="public_email"
          type="email"
          defaultValue={profile?.public_email ?? ""}
          className="border-border bg-ink-950 text-foreground text-body max-w-md px-3 py-2 focus:border-signal-500 focus:outline-none"
        />

        <label htmlFor="github" className="text-flag text-muted-foreground mt-2">
          GitHub URL:
        </label>
        <input
          id="github"
          name="github"
          defaultValue={socials.github ?? ""}
          placeholder="https://github.com/yourusername"
          className="border-border bg-ink-950 text-foreground text-body max-w-md px-3 py-2 focus:border-signal-500 focus:outline-none"
        />

        <label htmlFor="linkedin" className="text-flag text-muted-foreground mt-2">
          LinkedIn URL:
        </label>
        <input
          id="linkedin"
          name="linkedin"
          defaultValue={socials.linkedin ?? ""}
          placeholder="https://linkedin.com/in/yourusername"
          className="border-border bg-ink-950 text-foreground text-body max-w-md px-3 py-2 focus:border-signal-500 focus:outline-none"
        />

        <label htmlFor="x" className="text-flag text-muted-foreground mt-2">
          X URL:
        </label>
        <input
          id="x"
          name="x"
          defaultValue={socials.x ?? ""}
          placeholder="https://x.com/yourusername"
          className="border-border bg-ink-950 text-foreground text-body max-w-md px-3 py-2 focus:border-signal-500 focus:outline-none"
        />

        <label className="text-flag text-muted-foreground mt-3 flex items-center gap-2">
          <input
            type="checkbox"
            name="available_for_work"
            defaultChecked={profile?.available_for_work ?? true}
          />
          available for work
        </label>

        <button
          type="submit"
          className="border-border hover:border-signal-500 hover:text-signal-500 text-body text-foreground mt-4 self-start border px-4 py-2 transition-colors"
        >
          save →
        </button>
      </form>
    </div>
  );
}
