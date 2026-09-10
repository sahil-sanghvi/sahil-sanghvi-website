"use client";

import { useActionState } from "react";
import { sendMagicLink, type LoginState } from "./actions";

const initialState: LoginState = { status: "idle", email: "", message: "" };

/**
 * Magic-link sign-in — the only way into /admin. Single-admin site: this
 * form works for any email, but only sahilsanghvi0504@gmail.com is in
 * admin_allowlist, and public signup is disabled at the Supabase project
 * level (see supabase/config.toml), so no other account can ever exist.
 */
export default function LoginPage() {
  const [state, formAction, pending] = useActionState(sendMagicLink, initialState);

  return (
    <main className="mx-auto flex max-w-4xl flex-1 items-center justify-center px-6">
      <div className="border-border w-full max-w-md border">
        <div className="text-furniture text-muted-foreground border-border border-b px-4 py-2 tracking-wide">
          sahil@web: ~/login
        </div>
        <div className="px-4 py-8 sm:px-8">
          <p className="text-flag text-muted-foreground">
            $ <span className="text-signal-500">login --admin</span>
          </p>

          {state.status === "sent" ? (
            <p className="text-body text-foreground mt-6 max-w-[50ch]">
              Check {state.email} for a sign-in link.
            </p>
          ) : (
            <form action={formAction} className="mt-6 flex flex-col gap-3">
              <label htmlFor="email" className="text-flag text-muted-foreground">
                email:
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="border-border bg-ink-950 text-foreground text-body px-3 py-2 focus:border-signal-500 focus:outline-none"
                placeholder="you@example.com"
              />
              <button
                type="submit"
                disabled={pending}
                className="border-border hover:border-signal-500 hover:text-signal-500 text-body text-foreground mt-2 border px-4 py-2 text-left transition-colors disabled:opacity-50"
              >
                {pending ? "sending…" : "send magic link →"}
              </button>
              {state.status === "error" ? (
                <p className="text-flag text-destructive">{state.message}</p>
              ) : null}
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
