import type { Metadata } from "next";
import { getCourses } from "@/lib/content";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Active Coursework — sahil-sanghvi(1)",
  description: "Courses currently being worked on, each shipped to its own subdomain as the work happens.",
  alternates: { canonical: "/active-coursework" },
};

function subdomain(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export default async function ActiveCourseworkPage() {
  const courses = await getCourses();
  const active = courses.filter((c) => c.external_url);

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <p className="text-section-head text-muted-foreground uppercase">Active Coursework</p>
      <p className="text-body text-muted-foreground mt-4 max-w-[68ch]">
        Courses currently in progress. Each one that&rsquo;s far enough along gets its own subdomain, shipped and
        updated as the work happens — not a writeup after the fact.
      </p>
      <div className="mt-10 pl-6">
        {active.length > 0 ? (
          <div className="flex flex-col gap-6">
            {active.map((c) => (
              <div key={c.id}>
                <a href={c.external_url} target="_blank" rel="noreferrer" className="group block">
                  <p className="text-body text-foreground group-hover:text-signal-500">
                    {c.code} — {c.title}
                  </p>
                  <p className="text-body text-muted-foreground mt-1">{c.summary}</p>
                  <p className="text-flag text-signal-500 group-hover:text-signal-600 mt-2">
                    → {subdomain(c.external_url!)}
                  </p>
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-body text-muted-foreground max-w-[68ch]">Nothing active right now.</p>
        )}
      </div>
    </main>
  );
}
