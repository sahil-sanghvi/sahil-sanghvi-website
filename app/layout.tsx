import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter_Tight, JetBrains_Mono } from "next/font/google";
import { MotionProvider } from "@/components/motion/motion-provider";
import { siteUrl } from "@/lib/site-url";
import { getProfile, getExperience, getEducation } from "@/lib/content";
import "./globals.css";

// The whole system is set in one monospace family (DESIGN.md: The One-Family Rule).
// IBM Plex was designed for IBM's own technical documentation — an authentic
// parallel to this surface's "manual page" conceit, not a generic mono default.
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

// Used only within the "/" OS-shell surface (see .theme-shell in globals.css) —
// the man-page world above stays on IBM Plex Mono untouched.
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});
const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  weight: ["600", "800"],
  display: "swap",
});

const origin = siteUrl();
const description =
  "CS student building full end-to-end software products, agentic automation pipelines, and ML-based data analysis.";

export const metadata: Metadata = {
  metadataBase: new URL(origin),
  title: {
    default: "sahil-sanghvi(1)",
    template: "%s",
  },
  description,
  alternates: { canonical: "/" },
  openGraph: {
    title: "sahil-sanghvi(1)",
    description,
    url: origin,
    siteName: "sahil-sanghvi(1)",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "sahil-sanghvi(1)",
    description,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [profile, experience, education] = await Promise.all([getProfile(), getExperience(), getEducation()]);
  const current = experience.find((e) => e.is_current);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.full_name,
    url: origin,
    description: profile.headline,
    sameAs: Object.values(profile.socials),
    ...(profile.public_email ? { email: profile.public_email } : {}),
    ...(profile.location ? { address: { "@type": "PostalAddress", addressLocality: profile.location } } : {}),
    ...(current
      ? {
          jobTitle: current.role,
          worksFor: { "@type": "Organization", name: current.org },
        }
      : {}),
    ...(education.length > 0
      ? {
          alumniOf: education.map((e) => ({ "@type": "CollegeOrUniversity", name: e.institution })),
        }
      : {}),
  };

  return (
    <html
      lang="en"
      className={`${plexMono.variable} ${jetbrainsMono.variable} ${interTight.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
        {/* content-hidden-at-rest backstop: if JS never runs, [data-reveal]
            elements must still be visible. See globals.css for the paired
            prefers-reduced-motion rule. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1 !important;transform:none !important}`}</style>
        </noscript>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
