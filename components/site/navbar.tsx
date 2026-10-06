"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * The running header bar from a real `man`/`less` pager, repurposed as the
 * site's actual navigation — not a second nav layered on top of it.
 *
 * Shows a "← BACK" control when there's actual browser history to return to
 * (e.g. arriving here from the /projects list in the same tab). Project
 * links elsewhere on the site open this page in a new tab, so a fresh tab
 * has no history to go back to — in that case there's no back control, but
 * the brand link below still gets you back to the portfolio.
 */
export function Navbar() {
  const router = useRouter();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    setCanGoBack(window.history.length > 1);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-ink-950">
      <div className="mx-auto flex max-w-4xl items-center gap-6 overflow-x-auto px-6 py-3 whitespace-nowrap">
        {canGoBack ? (
          <button
            type="button"
            onClick={() => router.back()}
            className="text-furniture text-muted-foreground hover:text-foreground shrink-0 tracking-wide transition-colors"
          >
            ← BACK
          </button>
        ) : null}
        <Link href="/" className="text-furniture text-foreground shrink-0 tracking-wide">
          SAHIL-SANGHVI(1)
        </Link>
        <Link
          href="/terminal"
          className="text-furniture text-signal-500 hover:text-signal-600 ml-auto shrink-0 tracking-wide transition-colors"
        >
          → TERMINAL(1)
        </Link>
      </div>
    </header>
  );
}
