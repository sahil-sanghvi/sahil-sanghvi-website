import type { TimelineItem } from "@/lib/site/timeline";
import { timelineLabel } from "@/lib/site/timeline";
import { formatPeriod } from "@/lib/site/format";
import { TimelineEntryDialog } from "./timeline-entry-dialog";

const TAG_LIMIT = 3;

function EntryCard({ item, dotSide }: { item: TimelineItem; dotSide: "left" | "right" | "rail" }) {
  const tags = item.tags.slice(0, TAG_LIMIT);
  const overflow = item.tags.length - tags.length;

  const dotClass =
    dotSide === "left"
      ? "-left-[25px]"
      : dotSide === "right"
        ? "-right-[25px]"
        : "-left-[29px]";

  return (
    <div className="relative border border-border bg-panel/40 p-4 hover:border-primary/50 transition-colors">
      <div
        className={`absolute ${dotClass} top-5 size-2 rounded-full ring-4 ring-background ${
          item.isCurrent ? "bg-primary" : "bg-border"
        }`}
      />
      <div className="flex items-center gap-3 mb-1">
        <span className="text-[9px] uppercase tracking-widest text-muted-foreground shrink-0">
          {timelineLabel(item.kind)}
        </span>
        <span className="text-[11px] text-muted-foreground tabular-nums truncate">
          {item.start ? formatPeriod(item.start, item.end, item.isCurrent) : "—"}
        </span>
      </div>
      <p className="text-sm text-foreground">
        <span className="font-medium">{item.title}</span>
        {item.subtitle ? <span className="text-muted-foreground"> — {item.subtitle}</span> : null}
      </p>
      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-2 mt-3">
          {tags.map((t) => (
            <span
              key={t}
              className="text-[9px] uppercase tracking-widest text-muted-foreground border border-border px-2 py-0.5"
            >
              {t}
            </span>
          ))}
          {overflow > 0 ? (
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground self-center">
              +{overflow}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function Timeline({ items }: { items: TimelineItem[] }) {
  if (items.length === 0) {
    return (
      <p className="text-[13px] text-muted-foreground leading-relaxed">
        Nothing on the timeline yet — work, volunteering, education, and projects will appear here as
        they&apos;re added.
      </p>
    );
  }

  const left = items.filter((_, i) => i % 2 === 0);
  const right = items.filter((_, i) => i % 2 === 1);

  return (
    <>
      {/* Mobile: single rail, same treatment as the old single-column layout. */}
      <div className="md:hidden space-y-6 border-l border-border pl-6">
        {items.map((item) => (
          <TimelineEntryDialog key={`${item.kind}-${item.id}`} item={item}>
            <EntryCard item={item} dotSide="rail" />
          </TimelineEntryDialog>
        ))}
      </div>

      {/* Desktop: two staggered columns sharing a center rail, matching the
          reference layout — item 0 goes left, item 1 goes right, and so on,
          which produces the staggered look naturally since card heights vary. */}
      <div className="hidden md:grid md:grid-cols-[1fr_1px_1fr] md:gap-x-8">
        <div className="flex flex-col gap-8">
          {left.map((item) => (
            <TimelineEntryDialog key={`${item.kind}-${item.id}`} item={item}>
              <EntryCard item={item} dotSide="right" />
            </TimelineEntryDialog>
          ))}
        </div>
        <div className="bg-border" />
        <div className="flex flex-col gap-8 pt-20">
          {right.map((item) => (
            <TimelineEntryDialog key={`${item.kind}-${item.id}`} item={item}>
              <EntryCard item={item} dotSide="left" />
            </TimelineEntryDialog>
          ))}
        </div>
      </div>
    </>
  );
}
