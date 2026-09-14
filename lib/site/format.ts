const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** "YYYY-MM-DD" -> "Mon YYYY". Uses UTC getters since these are date-only
 *  strings (no time component) — plain getMonth()/getFullYear() can roll a
 *  day into the wrong month in negative-UTC-offset timezones. */
function monthYear(dateStr: string): string {
  const d = new Date(dateStr);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** "May 2026 — PRESENT" / "Mar 2018 — Jun 2022" / "Feb 2026", from raw date-string columns. */
export function formatPeriod(
  startDate: string | null,
  endDate: string | null,
  isCurrent: boolean | null
): string {
  if (!startDate) return "";
  const start = monthYear(startDate);
  if (isCurrent || !endDate) return `${start} — PRESENT`;
  const end = monthYear(endDate);
  return start === end ? start : `${start} — ${end}`;
}

/** "-fs, --full-stack" -> "Full stack" — derives a heading from a flag-style skill name. */
export function titleFromFlag(flag: string): string {
  const long = flag.split(",").pop()?.trim() ?? flag;
  const stripped = long.replace(/^--?/, "").replace(/-/g, " ").trim();
  if (!stripped) return flag;
  return stripped.charAt(0).toUpperCase() + stripped.slice(1);
}

/**
 * Byte-weighted language breakdown across every project's GitHub `languages`
 * map (same shape GitHub's own language bar uses), collapsed to top N. Real
 * data synced at ingest time — never invented (see PRODUCT.md).
 */
export function aggregateLanguages(
  rows: Array<{ languages: unknown }>,
  limit = 4
): { name: string; value: number }[] {
  const totals = new Map<string, number>();
  for (const row of rows) {
    const langs = row.languages;
    if (langs && typeof langs === "object" && !Array.isArray(langs)) {
      for (const [lang, bytes] of Object.entries(langs as Record<string, unknown>)) {
        if (typeof bytes !== "number") continue;
        totals.set(lang, (totals.get(lang) ?? 0) + bytes);
      }
    }
  }
  const totalBytes = [...totals.values()].reduce((a, b) => a + b, 0);
  if (totalBytes === 0) return [];
  return [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, bytes]) => ({ name, value: Math.round((bytes / totalBytes) * 100) }));
}
