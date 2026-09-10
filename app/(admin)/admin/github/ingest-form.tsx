"use client";

import { useActionState } from "react";
import { ingestGithubRepo } from "./actions";

const initialState = { ok: true, message: "" };

export function IngestForm() {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => ingestGithubRepo(formData),
    initialState
  );

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-3">
      <label htmlFor="url" className="text-flag text-muted-foreground">
        repo URL:
      </label>
      <input
        id="url"
        name="url"
        required
        placeholder="https://github.com/owner/repo"
        className="border-border bg-ink-950 text-foreground text-body max-w-md px-3 py-2 focus:border-signal-500 focus:outline-none"
      />
      <button
        type="submit"
        disabled={pending}
        className="border-border hover:border-signal-500 hover:text-signal-500 text-body text-foreground mt-2 self-start border px-4 py-2 transition-colors disabled:opacity-50"
      >
        {pending ? "ingesting…" : "ingest →"}
      </button>
      {state.message ? (
        <p className={`text-flag ${state.ok ? "text-signal-500" : "text-destructive"}`}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
