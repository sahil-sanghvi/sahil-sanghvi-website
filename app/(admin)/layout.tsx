import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { CONTENT_SOURCE } from "@/lib/content";

export const dynamic = "force-dynamic";

function AutomationDisabled() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-20">
      <p className="text-section-head text-muted-foreground uppercase">Automation is off</p>
      <p className="text-body text-foreground mt-6 max-w-[68ch]">
        This site is running in <span className="text-signal-500">static content mode</span>. Content
        lives in <code className="text-signal-500">lib/content/static/*.ts</code> and ships with a
        git push — there&apos;s no admin panel to log into.
      </p>
      <p className="text-body text-muted-foreground mt-4 max-w-[68ch]">
        To turn the resume-upload / GitHub-paste pipelines back on, set{" "}
        <code>CONTENT_SOURCE=supabase</code> plus the Supabase env vars and run the migrations. Full
        steps are in <code>docs/CONTENT.md</code>.
      </p>
      <Link href="/" className="text-flag text-signal-500 hover:text-signal-600 mt-8 inline-block">
        ← back to site
      </Link>
    </main>
  );
}

/**
 * Server-side auth gate — defense in depth alongside proxy.ts's edge check.
 * An authenticated non-admin should never even reach this far, but this
 * re-checks is_admin() directly rather than trusting the proxy alone.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (CONTENT_SOURCE !== "supabase") return <AutomationDisabled />;

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: allowlisted } = await supabase
    .from("admin_allowlist")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!allowlisted) redirect("/login?error=not_admin");

  return (
    <>
      <header className="border-border sticky top-0 z-50 border-b bg-ink-950">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
          <span className="text-furniture text-foreground tracking-wide">
            SAHIL-SANGHVI(1) — admin
          </span>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-furniture text-muted-foreground hover:text-foreground">
              ← back to site
            </Link>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="text-furniture text-muted-foreground hover:text-foreground"
              >
                sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </>
  );
}
