/**
 * The closing furniture bar from a real man page — e.g. the
 * "GNU coreutils 9.4   January 2026   LS(1)" line at the bottom of every
 * page. No column-of-links marketing footer; contact and social links
 * already live in SEE ALSO / AUTHOR above.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-6 py-4">
        <span className="text-furniture text-muted-foreground tracking-wide">
          SAHIL-SANGHVI(1)
        </span>
        <span className="text-furniture text-muted-foreground tracking-wide">
          General Commands Manual
        </span>
        <span className="text-furniture text-muted-foreground tracking-wide">
          {year}
        </span>
      </div>
    </footer>
  );
}
