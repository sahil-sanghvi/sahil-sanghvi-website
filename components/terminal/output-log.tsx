import type { CommandOutput, Segment } from "@/lib/terminal/types";

function SegmentSpan({ segment }: { segment: Segment }) {
  const toneClass =
    segment.tone === "signal"
      ? "text-signal-500"
      : segment.tone === "error"
        ? "text-destructive"
        : segment.tone === "muted"
          ? "text-muted-foreground"
          : "text-foreground";

  if (segment.href) {
    return (
      <a href={segment.href} className={`${toneClass} underline`}>
        {segment.text}
      </a>
    );
  }
  return <span className={toneClass}>{segment.text}</span>;
}

/**
 * Renders one command's output. The `long` case is the important one:
 * cat'ing a 300-line README into a live region would read it all aloud with
 * no way to stop — the single worst a11y failure mode here. Only a summary
 * is inside the live region; full text sits in a non-live, keyboard-reachable
 * <details> the user opens at their own pace.
 */
export function OutputLog({ output }: { output: CommandOutput }) {
  if (output.kind === "none") return null;

  if (output.kind === "error") {
    return <p className="text-destructive">{output.message}</p>;
  }

  if (output.kind === "long") {
    return (
      <details className="group">
        <summary className="text-muted-foreground cursor-pointer list-none">
          <span aria-hidden="true">▸ </span>
          {output.title} — {output.lineCount} lines. Press Enter to expand.
        </summary>
        <pre
          tabIndex={0}
          className="text-body mt-2 max-w-full overflow-x-auto whitespace-pre-wrap focus:outline-none"
        >
          {output.body}
        </pre>
      </details>
    );
  }

  if (output.kind === "table") {
    return (
      <div className="flex flex-col gap-0.5">
        {output.rows.map((row, i) => (
          <div key={i} className="flex gap-4">
            {row.map((seg, j) => (
              <SegmentSpan key={j} segment={seg} />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      {output.lines.map((line, i) => (
        <div key={i}>
          {line.length === 0 ? (
            <>&nbsp;</>
          ) : (
            line.map((seg, j) => <SegmentSpan key={j} segment={seg} />)
          )}
        </div>
      ))}
    </div>
  );
}
