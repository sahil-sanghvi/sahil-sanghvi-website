import raw from "./content/static/travel.json";

/**
 * Travel photos. The data lives in lib/content/static/travel.json and the
 * images in public/travel/ — both written by the local editor
 * (`npm run travel`, see scripts/travel-editor/). Static-only on purpose:
 * it's committed with the photos, so it deploys with a plain `git push` in
 * either content mode.
 */

export interface TravelPhoto {
  src: string; // "/travel/sahil-sanghvi-banff-1.jpg"
  width: number;
  height: number;
  alt?: string; // falls back to a generated description (see photoAlt)
  taken?: string; // ISO date-time from EXIF
}

export interface TravelStop {
  id: string;
  slug: string;
  name: string; // "Moraine Lake"
  region?: string; // "Banff, Alberta, Canada"
  title?: string; // the caption: one line, shown big
  note?: string; // the story underneath
  date?: string; // "2025-07" or "2025-07-14"
  lat: number;
  lng: number;
  photos: TravelPhoto[];
}

export const OWNER = "Sahil Sanghvi";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

type RawStop = Partial<TravelStop> & { photos?: Partial<TravelPhoto>[] };

/** Published stops, in the order set in the editor. Stops still missing a
 *  name, a pin or any photo are drafts and stay off the site. */
export function getTravelStops(): TravelStop[] {
  const seen = new Set<string>();
  const out: TravelStop[] = [];
  for (const s of raw as RawStop[]) {
    const photos = (s.photos ?? []).filter(
      (p): p is TravelPhoto => typeof p.src === "string" && Number(p.width) > 0 && Number(p.height) > 0
    );
    if (!s.name || !Number.isFinite(s.lat) || !Number.isFinite(s.lng) || photos.length === 0) continue;

    let slug = slugify(s.slug || s.name) || "place";
    for (let n = 2; seen.has(slug); n++) slug = `${slugify(s.slug || s.name)}-${n}`;
    seen.add(slug);

    out.push({
      id: s.id ?? slug,
      slug,
      name: s.name,
      region: s.region || undefined,
      title: s.title || undefined,
      note: s.note || undefined,
      date: s.date || photos.find((p) => p.taken)?.taken?.slice(0, 10) || undefined,
      lat: s.lat as number,
      lng: s.lng as number,
      photos,
    });
  }
  return out;
}

export function getTravelStop(slug: string): TravelStop | null {
  return getTravelStops().find((s) => s.slug === slug) ?? null;
}

/** "Moraine Lake, Banff, Alberta, Canada" */
export function placeLabel(stop: TravelStop): string {
  return stop.region ? `${stop.name}, ${stop.region}` : stop.name;
}

/** Alt text that says who, where and what — the words someone searching
 *  "Sahil Sanghvi" (or the place) would use. A hand-written alt wins. */
export function photoAlt(stop: TravelStop, photo: TravelPhoto, index: number): string {
  if (photo.alt?.trim()) {
    const alt = photo.alt.trim();
    return /sahil/i.test(alt) ? alt : `${OWNER}: ${alt}`;
  }
  const what = stop.title ? ` — ${stop.title}` : "";
  const nth = stop.photos.length > 1 ? ` (photo ${index + 1} of ${stop.photos.length})` : "";
  return `${OWNER} at ${placeLabel(stop)}${what}${nth}`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "Jul 2025" */
export function formatTravelDate(date?: string): string | null {
  const m = date?.match(/^(\d{4})-(\d{2})/);
  if (!m) return null;
  return `${MONTHS[Number(m[2]) - 1]} ${m[1]}`;
}

/** "48.43°N 123.37°W" */
export function formatCoords(lat: number, lng: number): string {
  const f = (v: number, pos: string, neg: string) => `${Math.abs(v).toFixed(2)}°${v >= 0 ? pos : neg}`;
  return `${f(lat, "N", "S")} ${f(lng, "E", "W")}`;
}

/** A responsive srcset whose `src` stays the clean original file URL (the
 *  one Google Images indexes), with Next's optimizer serving the small
 *  widths. 640/1080 are in Next's default deviceSizes, 75 is the default
 *  allowed quality. */
export function photoSrcSet(photo: TravelPhoto): string {
  const sizes = [640, 1080].filter((w) => w < photo.width);
  return [
    ...sizes.map((w) => `/_next/image?url=${encodeURIComponent(photo.src)}&w=${w}&q=75 ${w}w`),
    `${photo.src} ${photo.width}w`,
  ].join(", ");
}

/** Props for the client map (keeps the JSON itself out of the client bundle). */
export function toMapStops(stops: TravelStop[]) {
  return stops.map((s) => ({
    slug: s.slug,
    name: s.name,
    region: s.region,
    lat: s.lat,
    lng: s.lng,
    photos: s.photos.length,
    date: formatTravelDate(s.date),
  }));
}

export function toGallery(stop: TravelStop) {
  return stop.photos.map((p, i) => ({
    src: p.src,
    srcSet: photoSrcSet(p),
    width: p.width,
    height: p.height,
    alt: photoAlt(stop, p, i),
  }));
}

/**
 * schema.org ImageObject for one photo. `creator` points at the Person in
 * the root layout's JSON-LD (same @id), which is how search engines connect
 * these images to the name "Sahil Sanghvi".
 */
export function imageObjectLd(origin: string, stop: TravelStop, photo: TravelPhoto, index: number) {
  const year = (photo.taken ?? stop.date)?.slice(0, 4);
  return {
    "@type": "ImageObject",
    contentUrl: `${origin}${photo.src}`,
    url: `${origin}${photo.src}`,
    width: photo.width,
    height: photo.height,
    name: `${OWNER} — ${placeLabel(stop)}`,
    caption: photoAlt(stop, photo, index),
    description: [stop.title, stop.note].filter(Boolean).join(" — ") || undefined,
    ...(photo.taken || stop.date ? { dateCreated: photo.taken ?? stop.date } : {}),
    creator: { "@id": `${origin}/#person` },
    author: { "@id": `${origin}/#person` },
    creditText: OWNER,
    copyrightNotice: `© ${year ?? new Date().getFullYear()} ${OWNER}`,
    contentLocation: {
      "@type": "Place",
      name: placeLabel(stop),
      geo: { "@type": "GeoCoordinates", latitude: stop.lat, longitude: stop.lng },
    },
    representativeOfPage: index === 0,
  };
}
