"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import type { GalleryPhoto } from "./photo-gallery";

export interface TrailStop {
  slug: string;
  name: string;
  region?: string;
  title?: string;
  note?: string;
  date: string | null;
  lat: number;
  lng: number;
  photos: GalleryPhoto[];
}

const KEY = "sahil-travel-trail-progress";
const LOCKED = [
  "Not yet. Stop {n} first.",
  "Locked. Follow the dashed line.",
  "Nope, stop {n} is calling.",
  "No skipping ahead.",
];
const pad = (n: number) => String(n).padStart(2, "0");

type L = typeof import("leaflet");

/**
 * Trail mode: the birthday-map game, re-set for /travel. Places unlock in
 * order; "Next stop" flies the map to the next place while the route draws
 * itself behind a moving marker, then opens that place's card. Progress is
 * remembered in this browser. `?reset` starts over, `?unlock` opens all.
 */
export function TrailGame({ stops }: { stops: TrailStop[] }) {
  const n = stops.length;
  const mapEl = useRef<HTMLDivElement>(null);
  const lib = useRef<L | null>(null);
  const map = useRef<import("leaflet").Map | null>(null);
  const markers = useRef<import("leaflet").Marker[]>([]);
  const trail = useRef<import("leaflet").Polyline | null>(null);
  const flying = useRef(false);

  const [found, setFound] = useState(0);
  const [started, setStarted] = useState(false);
  const [card, setCard] = useState<number | null>(null);
  const [finale, setFinale] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [moving, setMoving] = useState(false);

  const foundRef = useRef(found);
  useEffect(() => {
    foundRef.current = found;
  }, [found]);

  const reduceMotion = () =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Restore progress (and the ?reset / ?unlock switches) once on load.
  useEffect(() => {
    let saved = 0;
    try {
      saved = Math.min(Number(localStorage.getItem(KEY)) || 0, n);
    } catch {
      // storage blocked (private mode): start fresh every time
    }
    const qs = new URLSearchParams(window.location.search);
    if (qs.has("reset")) saved = 0;
    if (qs.has("unlock")) saved = n;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading browser-only state after hydration
    setFound(saved);
  }, [n]);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, String(found));
    } catch {
      // ignore
    }
  }, [found]);

  // Lock page scroll while the full-screen trail is open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const say = useCallback((msg: string) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1800);
  }, []);

  const stateOf = (i: number, f: number) => (i < f ? "done" : i === f ? "cur" : "locked");

  const iconFor = useCallback(
    (i: number, f: number) => {
      const Lf = lib.current!;
      const st = stateOf(i, f);
      return Lf.divIcon({
        className: "",
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        html: `<span class="trail-pin is-${st}">${st === "cur" ? '<i class="trail-ring"></i>' : ""}<b>${
          st === "done" ? "✓" : pad(i + 1)
        }</b></span>`,
      });
    },
    []
  );

  // Redraw pins + the walked part of the route whenever progress changes.
  const paint = useCallback(
    (f: number) => {
      markers.current.forEach((m, i) => {
        m.setIcon(iconFor(i, f));
        m.setZIndexOffset(stateOf(i, f) === "cur" ? 1000 : 0);
      });
      trail.current?.setLatLngs(stops.slice(0, Math.min(f, n)).map((s) => [s.lat, s.lng] as [number, number]));
    },
    [iconFor, n, stops]
  );

  const openCard = useCallback(
    (i: number) => {
      setCard(i);
      if (i === foundRef.current) {
        const f = i + 1;
        setFound(f);
        paint(f);
      }
    },
    [paint]
  );

  /**
   * The move between places: the map flies (zooming out for long hops), a
   * marker travels the straight line while the dashed route grows behind it,
   * and the destination's card opens on arrival.
   */
  const travelTo = useCallback(
    (i: number) => {
      const Lf = lib.current;
      const m = map.current;
      if (!Lf || !m || flying.current) return;
      const to = stops[i];
      const from = i > 0 ? stops[i - 1] : null;

      if (reduceMotion() || !from) {
        if (reduceMotion()) m.setView([to.lat, to.lng], 12);
        else m.flyTo([to.lat, to.lng], 12, { duration: 1.4 });
        setTimeout(() => openCard(i), reduceMotion() ? 0 : 1500);
        return;
      }

      const km = m.distance([from.lat, from.lng], [to.lat, to.lng]) / 1000;
      const duration = Math.min(3.6, Math.max(1.4, 1.1 + Math.log10(km + 1) * 0.7));
      flying.current = true;
      setMoving(true);

      const seg = Lf.polyline([[from.lat, from.lng]], {
        className: "trail-route is-live",
        weight: 3,
        dashArray: "2 9",
        lineCap: "round",
      }).addTo(m);
      const traveller = Lf.marker([from.lat, from.lng], {
        interactive: false,
        zIndexOffset: 2000,
        icon: Lf.divIcon({ className: "", iconSize: [14, 14], iconAnchor: [7, 7], html: '<span class="trail-traveller"></span>' }),
      }).addTo(m);

      m.flyTo([to.lat, to.lng], 12, { duration, easeLinearity: 0.2 });
      const t0 = performance.now();
      const ms = duration * 1000;
      const step = (now: number) => {
        const t = Math.min(1, (now - t0) / ms);
        const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // easeInOutQuad
        const p: [number, number] = [from.lat + (to.lat - from.lat) * e, from.lng + (to.lng - from.lng) * e];
        seg.setLatLngs([[from.lat, from.lng], p]);
        traveller.setLatLng(p);
        if (t < 1) {
          requestAnimationFrame(step);
          return;
        }
        seg.remove();
        traveller.remove();
        flying.current = false;
        setMoving(false);
        setTimeout(() => openCard(i), 250);
      };
      requestAnimationFrame(step);
    },
    [openCard, stops]
  );

  const tap = useCallback(
    (i: number) => {
      if (flying.current) return;
      const f = foundRef.current;
      if (i > f) {
        say(LOCKED[Math.floor(Math.random() * LOCKED.length)].replace("{n}", String(f + 1)));
        map.current?.flyTo([stops[f].lat, stops[f].lng], 12, { duration: reduceMotion() ? 0 : 1.1 });
        return;
      }
      openCard(i);
    },
    [openCard, say, stops]
  );
  const tapRef = useRef(tap);
  useEffect(() => {
    tapRef.current = tap;
  }, [tap]);

  // Build the map once.
  useEffect(() => {
    if (!mapEl.current || n === 0) return;
    let disposed = false;
    void import("leaflet").then((Lf) => {
      if (disposed || !mapEl.current) return;
      lib.current = Lf;
      const m = Lf.map(mapEl.current, { zoomControl: false, worldCopyJump: true });
      map.current = m;
      Lf.control.zoom({ position: "bottomright" }).addTo(m);
      // Same tiles as the birthday map (warm, faded OSM, filtered in globals.css).
      Lf.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(m);
      trail.current = Lf.polyline([], { className: "trail-route", weight: 3, dashArray: "2 9", lineCap: "round" }).addTo(m);
      markers.current = stops.map((s, i) => {
        const mk = Lf.marker([s.lat, s.lng], { icon: iconFor(i, foundRef.current), title: s.name, keyboard: true }).addTo(m);
        mk.on("click", () => tapRef.current(i));
        return mk;
      });
      m.fitBounds(Lf.latLngBounds(stops.map((s) => [s.lat, s.lng] as [number, number])).pad(0.2));
      paint(foundRef.current);
    });
    return () => {
      disposed = true;
      map.current?.remove();
      map.current = null;
    };
  }, [iconFor, n, paint, stops]);

  useEffect(() => {
    paint(found);
  }, [found, paint]);

  const start = () => {
    setStarted(true);
    setTimeout(() => {
      map.current?.invalidateSize();
      const f = foundRef.current;
      if (f < n) travelTo(f);
    }, 650);
  };

  const next = (i: number) => {
    setCard(null);
    if (i >= n - 1) {
      setFinale(true);
      const Lf = lib.current;
      if (Lf) map.current?.flyToBounds(Lf.latLngBounds(stops.map((s) => [s.lat, s.lng] as [number, number])).pad(0.2), { duration: reduceMotion() ? 0 : 1.6 });
      return;
    }
    setTimeout(() => travelTo(i + 1), 150);
  };

  const replay = () => {
    setFinale(false);
    setFound(0);
    paint(0);
    setTimeout(() => travelTo(0), 200);
  };

  // Keyboard: → / Enter = next, Esc = close.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setCard(null);
        setFinale(false);
      }
      if ((e.key === "ArrowRight" || e.key === "Enter") && card !== null && !(e.target instanceof HTMLButtonElement)) {
        e.preventDefault();
        next(card);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const done = found >= n;
  const current = stops[Math.min(found, n - 1)];

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden bg-ink-950 text-foreground">
      <div ref={mapEl} className="trail-map absolute inset-0 z-0" role="region" aria-label="Trail map" />

      {/* Top bar */}
      <div className="border-border bg-ink-950/95 absolute top-3 right-3 left-3 z-[500] flex items-center gap-4 border px-4 py-3 sm:right-auto sm:w-[26rem]">
        <div className="min-w-0 flex-1">
          <p className="text-furniture text-muted-foreground tracking-wide uppercase">Sahil&rsquo;s travel trail</p>
          <p className="text-foreground text-lg leading-tight font-bold tabular-nums">
            {done ? `All ${n} visited` : `${found} of ${n} visited`}
          </p>
        </div>
        <div className="flex max-w-[45%] flex-wrap justify-end gap-1" aria-hidden="true">
          {n <= 14 ? (
            stops.map((s, i) => (
              <span
                key={s.slug}
                className={`size-2.5 border ${
                  i < found ? "border-signal-500 bg-signal-500" : i === found ? "border-signal-500 animate-pulse" : "border-ink-400"
                }`}
              />
            ))
          ) : (
            <span className="border-ink-400 block h-2.5 w-24 border">
              <span className="bg-signal-500 block h-full transition-[width] duration-500" style={{ width: `${(found / n) * 100}%` }} />
            </span>
          )}
        </div>
        <Link href="/travel" className="text-furniture text-muted-foreground hover:text-signal-500 shrink-0" aria-label="Leave trail mode">
          ✕
        </Link>
      </div>

      {/* Toast */}
      <div
        role="status"
        className={`bg-signal-500 text-ink-950 pointer-events-none absolute top-24 left-1/2 z-[700] -translate-x-1/2 px-4 py-2 text-sm font-bold whitespace-nowrap transition-all duration-200 ${
          toast ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
        }`}
      >
        {toast}
      </div>

      {/* Hint pill */}
      {started && card === null && !finale ? (
        <div className="border-border bg-ink-950/95 absolute bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-1/2 z-[500] flex max-w-[calc(100%-1.5rem)] -translate-x-1/2 items-center gap-3 border py-2 pr-2 pl-4">
          <span className="text-flag truncate">
            {moving ? "Travelling…" : done ? "You've seen them all" : <>Next: <b>{current.name}</b></>}
          </span>
          <button
            type="button"
            disabled={moving}
            onClick={() => (done ? setFinale(true) : travelTo(found))}
            className="bg-signal-500 text-ink-950 hover:bg-signal-600 shrink-0 px-3 py-1.5 text-xs font-bold tracking-widest uppercase disabled:opacity-40"
          >
            {done ? "Finale" : found === 0 ? "Go" : "Take me"}
          </button>
        </div>
      ) : null}

      {/* Place card */}
      {card !== null ? (
        <div
          className="absolute inset-0 z-[800] flex items-end justify-center bg-black/50 p-3 sm:items-center sm:p-6"
          onClick={(e) => e.target === e.currentTarget && setCard(null)}
        >
          <PlaceCard
            stop={stops[card]}
            index={card}
            total={n}
            onClose={() => setCard(null)}
            onNext={() => next(card)}
          />
        </div>
      ) : null}

      {/* Finale */}
      {finale ? (
        <div
          className="absolute inset-0 z-[800] flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => e.target === e.currentTarget && setFinale(false)}
        >
          <div className="trail-pop border-signal-500 bg-ink-950 w-full max-w-md border p-6" role="dialog" aria-label="Trail complete">
            <p className="text-section-head text-signal-500 uppercase">exit 0</p>
            <h2 className="text-display text-foreground mt-2">
              All {n}.<br />
              <span className="text-muted-foreground">For now.</span>
            </h2>
            <p className="text-body text-muted-foreground mt-4">
              That&rsquo;s every place so far. The list only gets longer from here.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <button type="button" onClick={replay} className="bg-signal-500 text-ink-950 hover:bg-signal-600 px-4 py-2 text-xs font-bold tracking-widest uppercase">
                Replay trail
              </button>
              <button type="button" onClick={() => setFinale(false)} className="border-border hover:border-signal-500 hover:text-signal-500 border px-4 py-2 text-xs font-bold tracking-widest uppercase">
                Back to map
              </button>
              <Link href="/travel" className="border-border hover:border-signal-500 hover:text-signal-500 border px-4 py-2 text-xs font-bold tracking-widest uppercase">
                All photos
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      {/* Intro */}
      <section
        aria-hidden={started}
        className={`bg-ink-950 absolute inset-0 z-[1000] flex flex-col justify-between px-6 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))] transition-transform duration-700 ease-[cubic-bezier(.7,0,.3,1)] sm:px-12 ${
          started ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="flex items-center justify-between">
          <p className="text-section-head text-muted-foreground uppercase">Travel(7) · trail mode</p>
          <Link href="/travel" className="text-furniture text-muted-foreground hover:text-signal-500">
            ← skip to photos
          </Link>
        </div>
        <div className="mx-auto w-full max-w-3xl">
          <p className="text-flag text-signal-500">$ ./trail --follow</p>
          <h1 className="text-foreground mt-4 text-[clamp(3rem,12vw,7rem)] leading-[0.9] font-bold tracking-tight">
            Follow
            <br />
            the <span className="text-signal-500">trail.</span>
          </h1>
          <p className="text-body text-muted-foreground mt-6 max-w-[48ch]">
            {n} places, in the order I got to them. Open one and the next unlocks. No skipping ahead.
            {found > 0 && found < n ? ` You're ${found} in. Picking up where you left off.` : ""}
          </p>
        </div>
        <div className="mx-auto w-full max-w-3xl">
          <button
            type="button"
            onClick={start}
            disabled={started}
            className="bg-signal-500 text-ink-950 hover:bg-signal-600 w-full px-6 py-4 text-left text-lg font-bold sm:w-auto"
          >
            {found > 0 && found < n ? "Continue the trail →" : found >= n ? "Wander the map →" : "Start the trail →"}
          </button>
        </div>
      </section>
    </div>
  );
}

function PlaceCard({
  stop,
  index,
  total,
  onClose,
  onNext,
}: {
  stop: TrailStop;
  index: number;
  total: number;
  onClose: () => void;
  onNext: () => void;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [at, setAt] = useState(0);
  const n = stop.photos.length;
  const last = index === total - 1;
  const go = (k: number) => {
    const t = track.current;
    if (t) t.scrollTo({ left: Math.max(0, Math.min(n - 1, k)) * t.clientWidth, behavior: "smooth" });
  };

  return (
    <div
      className="trail-pop border-border bg-ink-950 relative w-full max-w-md border"
      role="dialog"
      aria-label={`${stop.name}, stop ${index + 1} of ${total}`}
    >
      <div className="relative aspect-[4/3] bg-ink-900">
        <div
          ref={track}
          onScroll={(e) => setAt(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
          className="flex h-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {stop.photos.map((p, k) => (
            <div key={p.src} className="h-full w-full flex-none snap-start snap-always">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.src}
                srcSet={p.srcSet}
                sizes="448px"
                alt={p.alt}
                width={p.width}
                height={p.height}
                loading={k < 2 ? "eager" : "lazy"}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
        {n > 1 ? (
          <>
            <span className="bg-ink-950/80 text-foreground absolute top-2 left-2 px-2 py-0.5 text-[11px] font-bold tabular-nums">
              {at + 1} / {n} · swipe
            </span>
            {at > 0 ? (
              <button type="button" onClick={() => go(at - 1)} aria-label="Previous photo" className="bg-ink-950/80 hover:text-signal-500 absolute top-1/2 left-2 -translate-y-1/2 px-2.5 py-1.5">
                ←
              </button>
            ) : null}
            {at < n - 1 ? (
              <button type="button" onClick={() => go(at + 1)} aria-label="Next photo" className="bg-ink-950/80 hover:text-signal-500 absolute top-1/2 right-2 -translate-y-1/2 px-2.5 py-1.5">
                →
              </button>
            ) : null}
            <div className="pointer-events-none absolute right-0 bottom-2 left-0 flex justify-center gap-1.5" aria-hidden="true">
              {stop.photos.map((p, k) => (
                <span key={p.src} className={`h-1 transition-all ${k === at ? "bg-signal-500 w-5" : "w-1.5 bg-white/60"}`} />
              ))}
            </div>
          </>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="bg-ink-950 border-border hover:text-signal-500 absolute -top-3 -right-3 size-9 border text-lg"
      >
        ×
      </button>
      <div className="p-5">
        <p className="text-furniture text-muted-foreground tracking-wide uppercase">
          <span className="text-signal-500 tabular-nums">
            {pad(index + 1)} / {pad(total)}
          </span>{" "}
          · {stop.name}
          {stop.date ? ` · ${stop.date}` : ""}
        </p>
        {stop.title ? <p className="text-foreground mt-2 text-xl leading-snug font-bold">{stop.title}</p> : null}
        {stop.note ? <p className="text-body text-muted-foreground mt-2">{stop.note}</p> : null}
        <div className="mt-5 flex items-center justify-between gap-3">
          <Link href={`/travel/${stop.slug}`} className="text-flag text-muted-foreground hover:text-signal-500">
            all photos →
          </Link>
          <button
            type="button"
            autoFocus
            onClick={onNext}
            className="bg-signal-500 text-ink-950 hover:bg-signal-600 px-4 py-2.5 text-sm font-bold"
          >
            {last ? "Finish ★" : "Next stop →"}
          </button>
        </div>
      </div>
    </div>
  );
}
