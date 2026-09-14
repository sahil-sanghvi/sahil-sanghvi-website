"use server";

import { Resend } from "resend";
import { getProfile } from "@/lib/content";

export type ContactState = { status: "idle" | "sent" | "error"; message: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Sends the contact form to the profile's public email via Resend.
 * `onboarding@resend.dev` (Resend's default sender) works with no domain
 * verification — set RESEND_FROM_EMAIL once a custom domain is verified.
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
  const to = profile.public_email;
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
