import type { Metadata } from "next";
import { OWNER, formatTravelDate, getTravelStops, toGallery } from "@/lib/travel";
import { TrailGame } from "@/components/travel/trail-game";

// The game is a second way into the same photos /travel already shows, so
// /travel stays the page search engines index.
export const metadata: Metadata = {
  title: `${OWNER} — Travel Trail`,
  description: `Follow ${OWNER}'s travels place by place on an interactive map.`,
  alternates: { canonical: "/travel" },
  robots: { index: false, follow: true },
};

export default function TrailPage() {
  const stops = getTravelStops().map((s) => ({
    slug: s.slug,
    name: s.name,
    region: s.region,
    title: s.title,
    note: s.note,
    date: formatTravelDate(s.date),
    lat: s.lat,
    lng: s.lng,
    photos: toGallery(s),
  }));
  if (stops.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <p className="text-body text-muted-foreground">No places on the trail yet.</p>
      </div>
    );
  }
  return <TrailGame stops={stops} />;
}
