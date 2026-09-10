import "server-only";
import { generateObject } from "ai";
import type { z } from "zod";
import type { ProviderId } from "../types";
import { classifyError } from "../classify-error";

export interface Provider {
  id: ProviderId;
  model: string;
  isConfigured(): boolean;
  extract<T extends z.ZodTypeAny>(
    prompt: string,
    schema: T,
    signal: AbortSignal
  ): Promise<{ data: z.infer<T> }>;
}

/**
 * generateObject already picks the strongest structured-output mode each
 * provider supports and converts the Zod schema per-provider internally
 * (including Gemini's stricter OpenAPI-subset schema) — that's exactly the
 * piece not worth re-implementing. Each provider file just supplies its
 * model reference and an isConfigured() check; this factory does the rest.
 */
export function makeProvider(
  id: ProviderId,
  envKey: string,
  modelName: string,
  getModel: () => Parameters<typeof generateObject>[0]["model"]
): Provider {
  return {
    id,
    model: modelName,
    isConfigured() {
      return Boolean(process.env[envKey]);
    },
    async extract<T extends z.ZodTypeAny>(prompt: string, schema: T, signal: AbortSignal) {
      try {
        const result = await generateObject({
          model: getModel(),
          schema,
          prompt,
          abortSignal: signal,
        });
        // The AI SDK's own conditional typing for object/array/enum schema
        // variants doesn't unify cleanly with a plain z.infer<T> generic
        // here; Zod already validated this at runtime inside generateObject.
        return { data: result.object as z.infer<T> };
      } catch (err) {
        throw classifyError(err);
      }
    },
  };
}
