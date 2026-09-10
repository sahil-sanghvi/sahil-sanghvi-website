const CHIPS = ["ls", "cd projects", "cat about.md", "git log", "help"];

export function MobileCommandBar({ onRun }: { onRun: (cmd: string) => void }) {
  return (
    <div className="border-border flex gap-2 overflow-x-auto border-t px-3 py-2 sm:hidden">
      {CHIPS.map((chip) => (
        <button
          key={chip}
          type="button"
          onClick={() => onRun(chip)}
          className="border-border text-flag text-muted-foreground hover:border-signal-500 hover:text-signal-500 shrink-0 border px-3 py-1 whitespace-nowrap"
        >
          {chip}
        </button>
      ))}
    </div>
  );
}
