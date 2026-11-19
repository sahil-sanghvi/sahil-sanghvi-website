import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { siteUrl } from "@/lib/site-url";
import { noDash } from "@/lib/no-dash";
import {
  OWNER,
  formatCoords,
  formatTravelDate,
  getTravelStop,
  getTravelStops,
  imageObjectLd,
  photoAlt,
  placeLabel,
  storyText,
  toGallery,
  toMapStops,
} from "@/lib/travel";
import { TravelMap } from "@/components/travel/travel-map";
import { PhotoGallery } from "@/components/travel/photo-gallery";

// Only places in travel.json exist; anything else 404s instead of rendering on demand.
export const dynamicParams = false;

export function generateStaticParams() {
  return getTravelStops().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const stop = getTravelStop(slug);
  if (!stop) return {};
  const title = noDash(`${OWNER} at ${placeLabel(stop)}`);
  const description =
    storyText(stop)?.slice(0, 155) ||
    `${stop.photos.length} travel photo${stop.photos.length === 1 ? "" : "s"} of ${OWNER} in ${placeLabel(stop)}.`;
  const images = stop.photos.slice(0, 4).map((p, i) => ({
    url: p.src,
    width: p.width,
    height: p.height,
    alt: photoAlt(stop, p, i),
  }));
  return {
    title: `${noDash(placeLabel(stop))} | ${OWNER} Travel Photos`,
    description,
    alternates: { canonical: `/travel/${slug}` },
    openGraph: { title, description, url: `/travel/${slug}`, type: "article", images },
    twitter: { card: "summary_large_image", title, description, images: images.map((i) => i.url) },
  };
}

export default async function TravelStopPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const stops = getTravelStops();
  const index = stops.findIndex((s) => s.slug === slug);
  if (index < 0) notFound();
  const stop = stops[index];
  const prev = stops[index - 1];
  const next = stops[index + 1];
  const origin = siteUrl();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ImageGallery",
        "@id": `${origin}/travel/${slug}`,
        url: `${origin}/travel/${slug}`,
        name: noDash(`${OWNER} at ${placeLabel(stop)}`),
        description: storyText(stop),
        author: { "@id": `${origin}/#person` },
        about: { "@id": `${origin}/#person` },
        contentLocation: {
          "@type": "Place",
          name: placeLabel(stop),
          geo: { "@type": "GeoCoordinates", latitude: stop.lat, longitude: stop.lng },
        },
        primaryImageOfPage: { "@id": `${origin}${stop.photos[0].src}` },
        image: stop.photos.map((p, i) => ({ "@id": `${origin}${p.src}`, ...imageObjectLd(origin, stop, p, i) })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: OWNER, item: origin },
          { "@type": "ListItem", position: 2, name: "Travel", item: `${origin}/travel` },
          { "@type": "ListItem", position: 3, name: stop.name, item: `${origin}/travel/${slug}` },
        ],
      },
    ],
  };

  const date = formatTravelDate(stop.date);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <nav aria-label="Breadcrumb" className="text-section-head text-muted-foreground uppercase">
        <Link href="/travel" className="hover:text-signal-500">
          Travel
        </Link>
        <span aria-hidden="true"> / </span>
        <span className="tabular-nums">
          {String(index + 1).padStart(2, "0")} of {String(stops.length).padStart(2, "0")}
        </span>
      </nav>

      <h1 className="text-display text-foreground mt-3">
        <span className="text-muted-foreground">{OWNER} ·</span> {noDash(stop.name)}
      </h1>
      <p className="text-flag text-muted-foreground mt-3">
        {[stop.region, date, formatCoords(stop.lat, stop.lng)].filter(Boolean).join(" · ")}
      </p>

      {stop.title || stop.note ? (
        <div className="mt-8 max-w-[68ch]">
          {stop.title ? <p className="text-foreground text-xl leading-snug font-bold">{stop.title}</p> : null}
          {stop.note ? <p className="text-body text-muted-foreground mt-3 whitespace-pre-line">{stop.note}</p> : null}
        </div>
      ) : null}

      <div className="mt-10">
        <PhotoGallery photos={toGallery(stop)} layout="column" eagerFirst caption={placeLabel(stop)} />
      </div>

      <div className="mt-16">
        <p className="text-section-head text-muted-foreground mb-3 uppercase">On the map</p>
        <TravelMap
          stops={toMapStops(stops)}
          focus={stop.slug}
          className="h-72 w-full"
          label={`Map showing ${placeLabel(stop)} among the places Sahil Sanghvi has travelled to`}
        />
      </div>

      <nav aria-label="More places" className="border-border text-flag mt-12 flex justify-between gap-6 border-t pt-6">
        {prev ? (
          <Link href={`/travel/${prev.slug}`} className="text-signal-500 hover:text-signal-600 min-w-0 truncate">
            ← {prev.name}
          </Link>
        ) : (
          <span />
        )}
        <Link href="/travel" className="text-muted-foreground hover:text-foreground shrink-0">
          all places
        </Link>
        {next ? (
          <Link href={`/travel/${next.slug}`} className="text-signal-500 hover:text-signal-600 min-w-0 truncate text-right">
            {next.name} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
