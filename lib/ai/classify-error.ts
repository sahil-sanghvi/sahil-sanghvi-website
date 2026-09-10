import { APICallError, NoObjectGeneratedError } from "ai";
import { ProviderError, type ProviderErrorKind } from "./types";

/**
 * Normalizes whatever generateObject throws into one of our error kinds, so
 * the chain runner in run-chain.ts can make provider-agnostic decisions
 * (skip vs retry vs abort) regardless of which SDK error shape produced it.
 */
export function classifyError(err: unknown): ProviderError {
  if (err instanceof ProviderError) return err;

  if (NoObjectGeneratedError.isInstance(err)) {
    return new ProviderError("Model output didn't match the expected schema.", "invalid_output", {
      retryable: true,
    });
  }

  if (APICallError.isInstance(err)) {
    const status = err.statusCode;
    if (status === 401 || status === 403) {
      return new ProviderError("Auth failed — check the API key.", "auth", { status });
    }
    if (status === 429) {
      return new ProviderError("Rate limit or quota exceeded.", "rate_limit", { status });
    }
    if (status === 400 && /context|token/i.test(err.message)) {
      return new ProviderError("Input too long for this model's context window.", "context_length", {
        status,
      });
    }
    if (status && status >= 500) {
      return new ProviderError("Provider server error.", "server", { retryable: true, status });
    }
    return new ProviderError(err.message, "server", { retryable: true, status });
  }

  if (err instanceof Error && /timeout|aborted/i.test(err.message)) {
    return new ProviderError("Request timed out.", "timeout", { retryable: true });
  }

  if (err instanceof Error && /content.?filter|safety/i.test(err.message)) {
    return new ProviderError(err.message, "content_filter", { fatal: true });
  }

  return new ProviderError(err instanceof Error ? err.message : "Unknown error.", "network", {
    retryable: true,
  });
}
