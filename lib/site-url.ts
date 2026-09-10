/**
 * Canonical site origin. Prefers an explicit NEXT_PUBLIC_SITE_URL, then
 * Vercel's production URL (set automatically on Vercel), then localhost.
 * No trailing slash.
 */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;

  return "http://localhost:3000";
}
