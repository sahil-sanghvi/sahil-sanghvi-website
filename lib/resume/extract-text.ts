import "server-only";
import { extractText, getDocumentProxy } from "unpdf";

const MIN_TEXT_CHARS = 400;

export interface ExtractedText {
  text: string;
  pageCount: number;
  looksScanned: boolean;
}

/**
 * unpdf over pdf-parse: the latter is effectively unmaintained and reads a
 * bundled test file at import time, which breaks in bundled/serverless
 * environments. mergePages: false preserves page boundaries so the model
 * can reconstruct chronology from dates rather than reading order, which
 * recovers most of what layout-awareness would buy on a two-column resume,
 * for zero extra cost.
 */
export async function extractResumeText(bytes: Uint8Array): Promise<ExtractedText> {
  const pdf = await getDocumentProxy(bytes);
  const { text, totalPages } = await extractText(pdf, { mergePages: false });

  const pageDelimited = Array.isArray(text)
    ? text.map((page, i) => `--- page ${i + 1} ---\n${page}`).join("\n\n")
    : text;

  return {
    text: pageDelimited,
    pageCount: totalPages,
    looksScanned: pageDelimited.trim().length < MIN_TEXT_CHARS,
  };
}
