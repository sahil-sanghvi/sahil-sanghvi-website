import type { MetadataRoute } from "next";
import { getProjects } from "@/lib/content";
import { siteUrl } from "@/lib/site-url";
import { getTravelStops } from "@/lib/travel";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const projects = await getProjects();
  const travel = getTravelStops();
  const photoUrls = (stops: typeof travel) => stops.flatMap((s) => s.photos.map((p) => `${base}${p.src}`));

  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/projects`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/terminal`, changeFrequency: "monthly", priority: 0.5 },
    // Image sitemap entries: how Google Images finds the travel photos.
    ...(travel.length
      ? [{ url: `${base}/travel`, changeFrequency: "monthly" as const, priority: 0.7, images: photoUrls(travel) }]
      : []),
    ...travel.map((s) => ({
      url: `${base}/travel/${s.slug}`,
      changeFrequency: "yearly" as const,
      priority: 0.6,
      images: photoUrls([s]),
    })),
    ...projects.map((p) => ({
      url: `${base}/projects/${p.slug}`,
      lastModified: p.project_github?.pushed_at ?? undefined,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
