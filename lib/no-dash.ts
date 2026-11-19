/**
 * Strips em/en dashes from text bound for search engines and headings
 * (titles, descriptions, alt text, JSON-LD, h1s). Content files keep their
 * own punctuation; this only changes what's emitted.
 * "I build the whole thing — the product" → "I build the whole thing, the product"
 */
export function noDash(text: string): string;
export function noDash(text: string | null | undefined): string | undefined;
export function noDash(text: string | null | undefined): string | undefined {
  if (text == null) return undefined;
  return text
    .replace(/(\d)\s*[–—]\s*(\d)/g, "$1 to $2") // year/number ranges
    .replace(/\s*[—–]\s*/g, ", ")
    .replace(/,\s*([,.;:!?])/g, "$1")
    .replace(/^,\s*|,\s*$/g, "")
    .trim();
}
