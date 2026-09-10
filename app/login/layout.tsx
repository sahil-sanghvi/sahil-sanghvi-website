import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CONTENT_SOURCE } from "@/lib/content";

export const metadata: Metadata = {
  title: "Login — sahil-sanghvi(1)",
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  // No admin login in static content mode.
  if (CONTENT_SOURCE !== "supabase") redirect("/");
  return children;
}
