"use server";

import { Resend } from "resend";
import { getProfile } from "@/lib/content";

export type ContactState = { status: "idle" | "sent" | "error"; message: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Sends the contact form via Resend. `onboarding@resend.dev` (Resend's
 * default sender) needs no domain verification, but in exchange it's
 * sandboxed: it can only deliver to the email address the Resend *account*
 * is registered under, not an arbitrary recipient. That's almost never the
 * same as the public-facing contact email shown on the site, so the
 * delivery target is RESEND_TO_EMAIL, separate from profile.public_email —
 * set it to your Resend account's own email for now. Once a custom domain
 * is verified (resend.com/domains), set RESEND_FROM_EMAIL to an address on
 * it and RESEND_TO_EMAIL can become any inbox you want, uvic.ca included.
 */
export async function sendContactMessage(_prev: ContactState, formData: FormData): Promise<ContactState> {
  // Honeypot — real visitors never fill a field named "company" here (it's
  // visually hidden, see components/site/pane-contact.tsx); bots often do.
  if (String(formData.get("company") ?? "").trim()) {
    return { status: "sent", message: "Thanks — I'll get back to you soon." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email || !message) {
    return { status: "error", message: "Fill in every field." };
  }
  if (!EMAIL_RE.test(email)) {
    return { status: "error", message: "That email address doesn't look right." };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { status: "error", message: "Email isn't wired up yet — reach out directly instead." };
  }

  const profile = await getProfile();
  const to = process.env.RESEND_TO_EMAIL || profile.public_email;
  if (!to) {
    return { status: "error", message: "No recipient configured yet." };
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Portfolio Contact <onboarding@resend.dev>",
      to,
      replyTo: email,
      subject: `Portfolio contact — ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    });
    if (error) throw new Error(error.message);
    return { status: "sent", message: "Thanks — I'll get back to you soon." };
  } catch {
    return { status: "error", message: "Something went wrong sending that. Try emailing directly instead." };
  }
}
