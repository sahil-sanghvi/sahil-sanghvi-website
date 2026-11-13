/**
 * Where a terminal link should go and how to get there.
 *
 * - App routes ("/projects/x", "/travel") go through the Next router.
 * - Anything else — another site, or a static file like /resume.pdf that the
 *   router can't render as a page — opens in a new tab. If the browser blocks
 *   the popup, the current tab goes there instead, so the visitor always
 *   lands somewhere.
 */
export function isExternal(href: string): boolean {
  return /^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith("//");
}

/** Static files in public/ (anything with an extension) aren't app routes. */
export function isStaticFile(href: string): boolean {
  return /\.[a-z0-9]{2,5}($|[?#])/i.test(href.split("/").pop() ?? "");
}

export function opensInNewTab(href: string): boolean {
  return isExternal(href) || isStaticFile(href);
}

export function openHref(href: string, push: (href: string) => void): void {
  if (!opensInNewTab(href)) {
    push(href);
    return;
  }
  // No "noopener" feature string: with it, window.open always returns null and
  // a blocked popup can't be told apart from a successful one. Cut the opener
  // link by hand instead.
  const win = window.open(href, "_blank");
  if (win) win.opener = null;
  else window.location.assign(href);
}
