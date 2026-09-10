export type ProviderId = "groq" | "gemini" | "openrouter" | "openai";

export type ProviderErrorKind =
  | "rate_limit"
  | "quota_exhausted"
  | "auth"
  | "context_length"
  | "unsupported_input"
  | "invalid_output"
  | "content_filter"
  | "server"
  | "timeout"
  | "network";

export class ProviderError extends Error {
  kind: ProviderErrorKind;
  retryable: boolean;
  fatal: boolean;
  status?: number;

  constructor(message: string, kind: ProviderErrorKind, opts?: { retryable?: boolean; fatal?: boolean; status?: number }) {
    super(message);
    this.kind = kind;
    this.retryable = opts?.retryable ?? false;
    this.fatal = opts?.fatal ?? false;
    this.status = opts?.status;
  }
}

export interface AttemptLog {
  provider: ProviderId;
  model: string;
  ok: boolean;
  errorKind?: ProviderErrorKind;
  status?: "success" | "skipped" | "failed";
  latencyMs: number;
  at: string;
  detail?: string;
}

export interface ChainResult<T> {
  data: T;
  provider: ProviderId;
  model: string;
  attempts: AttemptLog[];
  totalMs: number;
}

export class ChainExhaustedError extends Error {
  attempts: AttemptLog[];
  constructor(attempts: AttemptLog[]) {
    super("All providers in the chain failed or were unavailable.");
    this.attempts = attempts;
  }
}
