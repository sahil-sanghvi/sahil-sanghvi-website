"use client";

import { useActionState } from "react";
import { uploadResume } from "./actions";

const initialState = { ok: true, message: "" };

export function UploadForm() {
  const [state, formAction, pending] = useActionState(uploadResume, initialState);

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-3">
      <label htmlFor="resume" className="text-flag text-muted-foreground">
        resume PDF:
      </label>
      <input
        id="resume"
        name="resume"
        type="file"
        accept="application/pdf"
        required
        className="text-body text-foreground"
      />
      <button
        type="submit"
        disabled={pending}
        className="border-border hover:border-signal-500 hover:text-signal-500 text-body text-foreground mt-2 self-start border px-4 py-2 transition-colors disabled:opacity-50"
      >
        {pending ? "parsing…" : "upload & parse →"}
      </button>
      {state.message ? (
        <p className={`text-flag ${state.ok ? "text-signal-500" : "text-destructive"}`}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
