"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface GalleryPhoto {
  src: string;
  srcSet: string;
  width: number;
  height: number;
  alt: string;
}

/**
 * A place's photos. Every photo is a real <img> with descriptive alt text,
 * server-rendered and wrapped in a link to the full-size file, so crawlers
 * (and visitors without JS) get the images directly. With JS, a click opens
 * the swipeable viewer instead — the birthday map's polaroid carousel, made
 * flat and dark.
 */
export function PhotoGallery({
  photos,
  layout = "grid",
  eagerFirst = false,
  caption,
}: {
  photos: GalleryPhoto[];
  layout?: "grid" | "column";
  eagerFirst?: boolean;
  caption?: string;
}) {
  const [open, setOpen] = useState<number | null>(null);

  const sizes =
    layout === "column" ? "(min-width: 896px) 832px, 100vw" : "(min-width: 896px) 280px, 50vw";

  return (
    <>
      <ul
        className={
          layout === "column"
            ? "flex flex-col gap-6"
            : "grid grid-cols-2 gap-2 sm:grid-cols-3"
        }
      >
        {photos.map((p, i) => {
          const hero = layout === "grid" && i === 0 && photos.length > 2;
          return (
            <li key={p.src} className={hero ? "col-span-2 row-span-2" : undefined}>
              <figure className="m-0">
                <a
                  href={p.src}
                  onClick={(e) => {
                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                    e.preventDefault();
                    setOpen(i);
                  }}
                  className="group focus-visible:outline-signal-500 bg-ink-900 block overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2"
                  aria-label={`View photo ${i + 1} of ${photos.length}: ${p.alt}`}
                >
                  {/* Plain <img>, not next/image: `src` stays the clean
                      /travel/sahil-sanghvi-….jpg URL search engines index,
                      while srcSet still serves optimized small widths. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.src}
                    srcSet={p.srcSet}
                    sizes={hero ? "(min-width: 896px) 560px, 100vw" : sizes}
                    width={p.width}
                    height={p.height}
                    alt={p.alt}
                    loading={eagerFirst && i === 0 ? "eager" : "lazy"}
                    fetchPriority={eagerFirst && i === 0 ? "high" : undefined}
                    decoding="async"
                    className={
                      layout === "column"
                        ? "block h-auto w-full transition-opacity group-hover:opacity-90"
                        : "block aspect-square h-full w-full object-cover transition-[opacity,transform] duration-300 group-hover:scale-[1.02] group-hover:opacity-90"
                    }
                  />
                </a>
                {layout === "column" ? (
                  <figcaption className="text-flag text-muted-foreground mt-2">
                    {String(i + 1).padStart(2, "0")} — {p.alt}
                  </figcaption>
                ) : (
                  <figcaption className="sr-only">{p.alt}</figcaption>
                )}
              </figure>
            </li>
          );
        })}
      </ul>
      {open !== null ? (
        <Viewer photos={photos} start={open} caption={caption} onClose={() => setOpen(null)} />
      ) : null}
    </>
  );
}

function Viewer({
  photos,
  start,
  caption,
  onClose,
}: {
  photos: GalleryPhoto[];
  start: number;
  caption?: string;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [at, setAt] = useState(start);
  const n = photos.length;

  const go = useCallback((i: number) => {
    const t = track.current;
    if (!t) return;
    const k = Math.max(0, Math.min(n - 1, i));
    t.scrollTo({ left: k * t.clientWidth, behavior: "smooth" });
  }, [n]);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    d.showModal();
    const t = track.current;
    if (t) t.scrollLeft = start * t.clientWidth;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [start]);

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) dialog.current?.close();
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(at + 1);
        if (e.key === "ArrowLeft") go(at - 1);
      }}
      aria-label={caption ? `Photos: ${caption}` : "Photos"}
      className="bg-ink-950/95 text-foreground m-0 h-dvh max-h-none w-screen max-w-none p-0 backdrop:bg-black/70"
    >
      <div className="flex h-full flex-col">
        <div className="border-border flex items-center justify-between gap-4 border-b px-4 py-3">
          <span className="text-furniture text-muted-foreground truncate tracking-wide">
            <span className="text-signal-500 tabular-nums">
              {String(at + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
            </span>
            {caption ? <span className="ml-3">{caption}</span> : null}
          </span>
          <button
            type="button"
            autoFocus
            onClick={() => dialog.current?.close()}
            className="text-furniture text-signal-500 hover:text-signal-600 shrink-0 tracking-wide"
          >
            CLOSE [ESC]
          </button>
        </div>

        <div className="relative min-h-0 flex-1">
          <div
            ref={track}
            onScroll={(e) => {
              const t = e.currentTarget;
              setAt(Math.round(t.scrollLeft / t.clientWidth));
            }}
            className="flex h-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {photos.map((p, i) => (
              <div
                key={p.src}
                className="flex h-full w-full flex-none snap-start snap-always items-center justify-center p-4 sm:p-10"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.src}
                  width={p.width}
                  height={p.height}
                  alt={p.alt}
                  loading={Math.abs(i - start) <= 1 ? "eager" : "lazy"}
                  decoding="async"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            ))}
          </div>
          {n > 1 ? (
            <>
              <button
                type="button"
                onClick={() => go(at - 1)}
                disabled={at === 0}
                aria-label="Previous photo"
                className="border-border bg-ink-950/80 text-foreground hover:border-signal-500 hover:text-signal-500 absolute top-1/2 left-3 hidden -translate-y-1/2 border px-3 py-2 disabled:opacity-0 sm:block"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => go(at + 1)}
                disabled={at === n - 1}
                aria-label="Next photo"
                className="border-border bg-ink-950/80 text-foreground hover:border-signal-500 hover:text-signal-500 absolute top-1/2 right-3 hidden -translate-y-1/2 border px-3 py-2 disabled:opacity-0 sm:block"
              >
                →
              </button>
            </>
          ) : null}
        </div>

        <div className="border-border border-t px-4 py-3">
          <p className="text-flag text-muted-foreground mx-auto max-w-[68ch] text-center" aria-live="polite">
            {photos[at]?.alt}
          </p>
          {n > 1 ? (
            <div className="mt-2 flex justify-center gap-1.5" aria-hidden="true">
              {photos.map((p, i) => (
                <span
                  key={p.src}
                  className={`h-1 transition-all ${i === at ? "bg-signal-500 w-5" : "bg-ink-700 w-1.5"}`}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </dialog>
  );
}
