import "server-only";
import type { z } from "zod";
import type { Provider } from "./providers";
import { ProviderError, ChainExhaustedError, type AttemptLog, type ChainResult } from "./types";

const PER_PROVIDER_MS = 20_000;
const CHAIN_BUDGET_MS = 50_000;

/**
 * Runs providers in order, each with its own timeout, honoring an overall
 * chain budget (Vercel Hobby caps function duration at 60s). Behavioral
 * decisions here matter more than they look:
 *
 * - rate_limit/quota_exhausted: move on immediately. On a free tier this
 *   means the cap is gone for the day/minute — retrying wastes the chain's
 *   time budget. (A paid-tier posture honoring retry-after would be wrong
 *   here; we don't have that luxury.)
 * - auth: skip silently, never abort the chain. A missing/bad key must
 *   degrade to the next provider, not fail the whole upload.
 * - invalid_output: exactly one repair retry with the schema violation
 *   appended to the prompt, then move on. Free models emit near-miss JSON
 *   constantly; one repair recovers most of it cheaply.
 * - server/timeout/network: one retry with backoff, then move on.
 * - content_filter or a malformed schema: fatal, abort the whole chain.
 */
export async function runChain<T extends z.ZodTypeAny>(
  providers: Provider[],
  prompt: string,
  schema: T
): Promise<ChainResult<z.infer<T>>> {
  const attempts: AttemptLog[] = [];
  const chainStart = Date.now();

  for (const provider of providers) {
    if (Date.now() - chainStart > CHAIN_BUDGET_MS) {
      attempts.push(logAttempt(provider, "skipped", Date.now(), "chain budget exhausted"));
      continue;
    }

    if (!provider.isConfigured()) {
      attempts.push(logAttempt(provider, "skipped", Date.now(), "no API key configured"));
      continue;
    }

    let currentPrompt = prompt;
    let lastError: ProviderError | undefined;

    // Up to 2 tries per provider: the original attempt, plus one retry
    // (either a schema-repair retry or a transient-error retry).
    for (let attempt = 0; attempt < 2; attempt++) {
      const attemptStart = Date.now();
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), PER_PROVIDER_MS);

      try {
        const result = await provider.extract(currentPrompt, schema, controller.signal);
        clearTimeout(timeout);
        attempts.push(logAttempt(provider, "success", attemptStart));
        return {
          data: result.data,
          provider: provider.id,
          model: provider.model,
          attempts,
          totalMs: Date.now() - chainStart,
        };
      } catch (err) {
        clearTimeout(timeout);
        const error = err instanceof ProviderError ? err : new ProviderError(String(err), "network");
        lastError = error;
        attempts.push(logAttempt(provider, "failed", attemptStart, error.message, error.kind));

        if (error.fatal) {
          throw new ChainExhaustedError(attempts);
        }
        if (error.kind === "rate_limit" || error.kind === "quota_exhausted" || error.kind === "auth") {
          break; // no retry, straight to next provider
        }
        if (error.kind === "invalid_output" && attempt === 0) {
          currentPrompt = `${prompt}\n\nYour previous response did not match the required schema (${error.message}). Respond again with valid JSON matching the schema exactly.`;
          continue; // one repair retry
        }
        if (error.retryable && attempt === 0) {
          await sleep(800 * 2 ** attempt + Math.random() * 200);
          continue; // one retry with backoff
        }
        break;
      }
    }
    void lastError;
  }

  throw new ChainExhaustedError(attempts);
}

function logAttempt(
  provider: Provider,
  status: "success" | "skipped" | "failed",
  startedAt: number,
  detail?: string,
  errorKind?: AttemptLog["errorKind"]
): AttemptLog {
  return {
    provider: provider.id,
    model: provider.model,
    ok: status === "success",
    status,
    errorKind,
    latencyMs: Date.now() - startedAt,
    at: new Date().toISOString(),
    detail,
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
