import "server-only";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { makeProvider } from "./index";

// Free tier, and one of the two providers in the PDF-native fallback chain
// (accepts PDFs directly) if text extraction ever comes back too short.
const MODEL = "gemini-2.0-flash";

export const geminiProvider = makeProvider(
  "gemini",
  "GOOGLE_GENERATIVE_AI_API_KEY",
  MODEL,
  () => {
    const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });
    return google(MODEL);
  }
);
