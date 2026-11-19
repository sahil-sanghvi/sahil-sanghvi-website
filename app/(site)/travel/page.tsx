import type { Metadata } from "next";
import Link from "next/link";
import { siteUrl } from "@/lib/site-url";
import {
  OWNER,
  formatCoords,
  formatTravelDate,
  getTravelStops,
  imageObjectLd,
  placeLabel,
  toGallery,
  toMapStops,
} from "@/lib/travel";
import { IndexMap } from "@/components/travel/index-map";
import { PhotoGallery } from "@/components/travel/photo-gallery";

const pad = (n: number) => String(n).padStart(2, "0");

function summary() {
  const stops = getTravelStops();
  const photos = stops.reduce((n, s) => n + s.photos.length, 0);
  const years = stops.map((s) => s.date?.slice(0, 4)).filter(Boolean).sort() as string[];
  const span = years.length ? (years[0] === years.at(-1) ? years[0] : `${years[0]} to ${years.at(-1)}`) : null;
  return { stops, photos, span };
}

export function generateMetadata(): Metadata {
  const { stops, photos } = summary();
  const places = stops.slice(0, 4).map((s) => s.name).join(", ");
  const description = stops.length
    ? `Travel photos by ${OWNER}: ${photos} photo${photos === 1 ? "" : "s"} from ${stops.length} place${stops.length === 1 ? "" : "s"}${places ? `, including ${places}` : ""}.`
    : `Travel photos by ${OWNER}.`;
  const cover = stops[0]?.photos[0];
  const images = cover
    ? [{ url: cover.src, width: cover.width, height: cover.height, alt: `${OWNER} at ${placeLabel(stops[0])}` }]
    : undefined;
  return {
    title: `${OWNER} | Travel Photos`,
    description,
    alternates: { canonical: "/travel" },
    // Until the first place is published there's nothing worth indexing.
    ...(stops.length === 0 ? { robots: { index: false, follow: true } } : {}),
    openGraph: { title: `${OWNER} | Travel Photos`, description, url: "/travel", type: "website", images },
    twitter: { card: "summary_large_image", title: `${OWNER} | Travel Photos`, description, images: images?.map((i) => i.url) },
  };
}

export default function TravelPage() {
  const { stops, photos, span } = summary();
  const origin = siteUrl();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${origin}/travel`,
    url: `${origin}/travel`,
    name: `${OWNER} | Travel Photos`,
    about: { "@id": `${origin}/#person` },
    author: { "@id": `${origin}/#person` },
    mainEntity: {
      "@type": "ImageGallery",
      name: `Travel photos by ${OWNER}`,
      image: stops.flatMap((s) => s.photos.map((p, i) => imageObjectLd(origin, s, p, i))),
    },
    hasPart: stops.map((s) => ({ "@type": "WebPage", url: `${origin}/travel/${s.slug}`, name: `${OWNER} at ${placeLabel(s)}` })),
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <header className="max-w-4xl">
        <p className="text-section-head text-muted-foreground uppercase">Travel</p>
        <h1 className="text-display text-foreground mt-3">
          {OWNER}, <span className="text-muted-foreground">away from the keyboard.</span>
        </h1>
        <p className="text-body text-muted-foreground mt-4 max-w-[68ch]">
          {stops.length > 0 ? (
            <>
              {stops.length} place{stops.length === 1 ? "" : "s"} · {photos} photo{photos === 1 ? "" : "s"}
              {span ? ` · ${span}` : ""}. Every pin is somewhere I&rsquo;ve actually stood, numbered in the order
              I got there. Click one to jump to it.
            </>
          ) : (
            <>Photos from the road are on their way. Check back soon.</>
          )}
        </p>
      </header>

      {stops.length > 0 ? (
        <>
          <Link
            href="/travel/trail"
            className="bg-signal-500 text-ink-950 hover:bg-signal-600 mt-8 inline-flex items-center gap-3 px-5 py-3 text-sm font-bold"
          >
            ▶ Play the trail
            <span className="text-ink-950/70 hidden font-normal sm:inline">place by place, with the map flying between them</span>
          </Link>
          <div className="mt-10">
            <IndexMap stops={toMapStops(stops)} />
          </div>

          {/* The route as a traceroute: one hop per place. */}
          <nav aria-label="Places" className="mt-10">
            <p className="text-flag text-muted-foreground">
              <span className="text-signal-500">$</span> traceroute sahil-sanghvi{" "}
              <span className="text-muted-foreground">
                ({stops.length} hop{stops.length === 1 ? "" : "s"})
              </span>
            </p>
            <ol className="mt-3 flex flex-col">
              {stops.map((s, i) => (
                <li key={s.slug} className="border-border border-b last:border-b-0">
                  <a
                    href={`#${s.slug}`}
                    className="group text-flag grid grid-cols-[2.5rem_minmax(0,1fr)_auto] gap-x-4 py-2 sm:grid-cols-[2.5rem_minmax(0,1fr)_6rem_10rem_5rem]"
                  >
                    <span className="text-signal-500 tabular-nums">{pad(i + 1)}</span>
                    <span className="text-foreground group-hover:text-signal-500 truncate">
                      {s.name}
                      {s.region ? <span className="text-muted-foreground">, {s.region}</span> : null}
                    </span>
                    <span className="text-muted-foreground tabular-nums">{formatTravelDate(s.date) ?? ""}</span>
                    <span className="text-muted-foreground hidden tabular-nums sm:inline">
                      {formatCoords(s.lat, s.lng)}
                    </span>
                    <span className="text-muted-foreground hidden text-right tabular-nums sm:inline">
                      {s.photos.length} img
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="mt-20 flex flex-col gap-24">
            {stops.map((s, i) => (
              <section key={s.slug} id={s.slug} aria-labelledby={`${s.slug}-h`} className="scroll-mt-20">
                <div className="border-border flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b pb-3">
                  <span className="text-section-head text-signal-500 tabular-nums">{pad(i + 1)}</span>
                  <h2 id={`${s.slug}-h`} className="text-section-head text-foreground uppercase">
                    {s.name}
                  </h2>
                  {s.region ? <span className="text-flag text-muted-foreground">{s.region}</span> : null}
                  <span className="text-flag text-muted-foreground ml-auto tabular-nums">
                    {formatTravelDate(s.date) ?? formatCoords(s.lat, s.lng)}
                  </span>
                </div>

                {s.title || s.note ? (
                  <div className="mt-5 max-w-[68ch]">
                    {s.title ? <p className="text-foreground text-xl leading-snug font-bold">{s.title}</p> : null}
                    {s.note ? <p className="text-body text-muted-foreground mt-2 whitespace-pre-line">{s.note}</p> : null}
                  </div>
                ) : null}

                <div className="mt-6">
                  <PhotoGallery photos={toGallery(s)} eagerFirst={i === 0} caption={placeLabel(s)} />
                </div>

                <Link
                  href={`/travel/${s.slug}`}
                  className="text-flag text-signal-500 hover:text-signal-600 mt-4 inline-block"
                >
                  → {s.name}: full page
                </Link>
              </section>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
