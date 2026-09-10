"use client";

import Link from "next/link";
import { Dialog } from "@base-ui/react/dialog";
import type { TimelineItem } from "@/lib/site/timeline";
import { timelineLabel } from "@/lib/site/timeline";
import { formatPeriod } from "@/lib/site/format";

/**
 * Click-to-expand detail view for a Timeline entry — the compact card only
 * shows a handful of tags and no highlights; this shows everything real
 * that exists for the entry (full tag list, highlights if any, else a
 * summary paragraph, else nothing — no fabricated detail per PRODUCT.md).
 * Built on @base-ui/react/dialog, the same primitives family as
 * components/ui/button.tsx, rather than introducing a second UI library.
 */
export function TimelineEntryDialog({ item, children }: { item: TimelineItem; children: React.ReactNode }) {
  const metaLine = [item.start ? formatPeriod(item.start, item.end, item.isCurrent) : null, item.location]
    .filter(Boolean)
    .join(" · ");

  return (
    <Dialog.Root>
      <Dialog.Trigger className="block w-full text-left">{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 transition-opacity" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 border border-border bg-panel p-6 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 transition-all max-h-[85vh] overflow-y-auto">
          <div className="flex items-start justify-between gap-4 mb-1">
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground">
              {timelineLabel(item.kind)}
            </span>
            <Dialog.Close className="text-muted-foreground hover:text-primary text-xs" aria-label="Close">
              close ✕
            </Dialog.Close>
          </div>

          <Dialog.Title className="font-display text-xl font-extrabold uppercase tracking-tight">
            {item.title}
          </Dialog.Title>
          {item.subtitle ? (
            <Dialog.Description className="text-sm text-primary mt-1">{item.subtitle}</Dialog.Description>
          ) : null}
          {metaLine ? <p className="text-[11px] text-muted-foreground mt-2">{metaLine}</p> : null}

          {item.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2 mt-4">
              {item.tags.map((t) => (
                <span
                  key={t}
                  className="text-[9px] uppercase tracking-widest text-muted-foreground border border-border px-2 py-0.5"
                >
                  {t}
                </span>
              ))}
            </div>
          ) : null}

          {item.highlights.length > 0 ? (
            <ul className="mt-5 space-y-2 list-disc pl-4">
              {item.highlights.map((h, i) => (
                <li key={i} className="text-[13px] text-foreground leading-relaxed">
                  {h}
                </li>
              ))}
            </ul>
          ) : item.summary ? (
            <p className="mt-5 text-[13px] text-foreground leading-relaxed">{item.summary}</p>
          ) : null}

          {item.href ? (
            <Link href={item.href} className="inline-block mt-6 text-xs text-primary hover:opacity-80">
              view project →
            </Link>
          ) : null}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
