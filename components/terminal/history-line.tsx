import { memo } from "react";
import type { CommandOutput } from "@/lib/terminal/types";
import { OutputLog } from "./output-log";

export interface Entry {
  id: string;
  cwd: string;
  input: string;
  output: CommandOutput | "pending";
}

function HistoryLineInner({ entry }: { entry: Entry }) {
  return (
    <div>
      {/* aria-hidden: the user just typed this and heard it via their own
          input; re-announcing it in the live region would double every
          interaction. */}
      <p aria-hidden="true" className="text-muted-foreground">
        <span className="text-signal-500">visitor@web</span>:{entry.cwd}$ {entry.input}
      </p>
      {entry.output === "pending" ? (
        <p className="text-muted-foreground">…</p>
      ) : (
        <OutputLog output={entry.output} />
      )}
    </div>
  );
}

export const HistoryLine = memo(HistoryLineInner, (prev, next) => prev.entry.id === next.entry.id && prev.entry.output === next.entry.output);
