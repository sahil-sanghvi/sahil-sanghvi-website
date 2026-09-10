import "server-only";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { makeProvider } from "./index";

// :free models get queued/deprioritized upstream — the highest-variance
// link in the chain, which is why it sits third rather than first.
const MODEL = "meta-llama/llama-3.3-70b-instruct:free";

export const openrouterProvider = makeProvider(
  "openrouter",
  "OPENROUTER_API_KEY",
  MODEL,
  () => {
    const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY });
    return openrouter(MODEL);
  }
);
