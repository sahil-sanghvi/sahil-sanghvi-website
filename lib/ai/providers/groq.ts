import "server-only";
import { createGroq } from "@ai-sdk/groq";
import { makeProvider } from "./index";

// Text-only; free tier has hard daily token caps -> 429s. First in the
// chain because it's fastest and free.
const MODEL = "llama-3.3-70b-versatile";

export const groqProvider = makeProvider("groq", "GROQ_API_KEY", MODEL, () => {
  const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });
  return groq(MODEL);
});
