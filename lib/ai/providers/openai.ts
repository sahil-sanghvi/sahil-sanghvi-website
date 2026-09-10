import "server-only";
import { createOpenAI } from "@ai-sdk/openai";
import { makeProvider } from "./index";

// Not free — the paid backstop, correctly last. Most reliable structured
// output of the four, and the other PDF-native option in the scanned-resume
// fallback chain.
const MODEL = "gpt-4o-mini";

export const openaiProvider = makeProvider("openai", "OPENAI_API_KEY", MODEL, () => {
  const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return openai(MODEL);
});
