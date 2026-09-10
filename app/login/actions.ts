"use server";

import { headers } from "next/headers";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface LoginState {
  status: "idle" | "sent" | "error";
  email: string;
  message: string;
}

/**
 * Runs server-side rather than calling supabase.auth.signInWithOtp() from
 * the browser. @supabase/supabase-js isn't tree-shakeable per-feature —
 * importing any part of it client-side pulls in auth+postgrest+realtime+
 * storage together (~600KB+ of raw source), which showed up as the single
 * largest avoidable chunk on every public page once bundle-analyzed. A
 * server action needs zero Supabase JS in the browser for this form.
 */
export async function sendMagicLink(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { status: "error", email, message: "Enter an email address." };

  const supabase = await createServerSupabaseClient();
  const headersList = await headers();
  const origin = headersList.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      // Public signup is disabled project-wide (supabase/config.toml).
      // Without this, signInWithOtp's default shouldCreateUser: true trips
      // that restriction even for an email that already has an account —
      // this tells Auth to only sign in an existing user, never create one.
      shouldCreateUser: false,
    },
  });

  if (error) {
    // "Signups not allowed for otp" is Supabase's literal, cryptic wording
    // for "this email has no account and shouldCreateUser:false means I
    // won't make one" — translate it to something a real visitor understands.
    const message = /signups not allowed/i.test(error.message)
      ? "That email isn't recognized — sign-in is limited to the site owner."
      : error.message;
    return { status: "error", email, message };
  }
  return { status: "sent", email, message: "" };
}
