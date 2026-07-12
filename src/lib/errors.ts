/**
 * Structured application errors — enterprise-grade error taxonomy.
 *
 * Every thrown error in server functions / server routes SHOULD extend
 * `AppError` so the API layer can map to consistent HTTP status codes,
 * user-safe messages, and audit-log entries.
 *
 * Backward-compatible: existing `throw new Error(...)` call sites continue
 * to work — this is additive.
 */

export type ErrorCode =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INSUFFICIENT_BALANCE"
  | "DEPENDENCY_UNAVAILABLE"
  | "INTERNAL";

const HTTP_STATUS: Record<ErrorCode, number> = {
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION: 422,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  INSUFFICIENT_BALANCE: 422,
  DEPENDENCY_UNAVAILABLE: 503,
  INTERNAL: 500,
};

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly userMessage: string;
  readonly details?: Record<string, unknown>;
  readonly retryable: boolean;
  constructor(
    code: ErrorCode,
    message: string,
    opts: { userMessage?: string; details?: Record<string, unknown>; retryable?: boolean; cause?: unknown } = {},
  ) {
    super(message, opts.cause ? { cause: opts.cause } : undefined);
    this.name = "AppError";
    this.code = code;
    this.status = HTTP_STATUS[code];
    this.userMessage = opts.userMessage ?? message;
    this.details = opts.details;
    this.retryable = opts.retryable ?? (code === "DEPENDENCY_UNAVAILABLE" || code === "RATE_LIMITED");
  }
  toJSON() {
    return {
      error: this.code,
      message: this.userMessage,
      details: this.details,
      retryable: this.retryable,
    };
  }
}

export const Unauthenticated = (msg = "Not authenticated") => new AppError("UNAUTHENTICATED", msg);
export const Forbidden = (msg = "Forbidden") => new AppError("FORBIDDEN", msg);
export const NotFound = (msg = "Not found") => new AppError("NOT_FOUND", msg);
export const Validation = (msg: string, details?: Record<string, unknown>) =>
  new AppError("VALIDATION", msg, { details });
export const Conflict = (msg: string) => new AppError("CONFLICT", msg);
export const InsufficientBalance = (available: number, requested: number) =>
  new AppError("INSUFFICIENT_BALANCE", `available=${available} requested=${requested}`, {
    userMessage: "الرصيد المتاح غير كافٍ",
    details: { available, requested },
  });
export const DependencyUnavailable = (name: string, cause?: unknown) =>
  new AppError("DEPENDENCY_UNAVAILABLE", `${name} unavailable`, { retryable: true, cause });

/** Normalize an unknown thrown value to an AppError for logging / responses. */
export function toAppError(err: unknown): AppError {
  if (err instanceof AppError) return err;
  if (err instanceof Error) return new AppError("INTERNAL", err.message, { cause: err });
  return new AppError("INTERNAL", String(err));
}

/** Retry with exponential backoff for transient (retryable) failures. */
export async function withRetry<T>(fn: () => Promise<T>, opts: { attempts?: number; baseMs?: number } = {}): Promise<T> {
  const attempts = opts.attempts ?? 3;
  const base = opts.baseMs ?? 200;
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      const app = toAppError(e);
      if (!app.retryable || i === attempts - 1) throw app;
      await new Promise((r) => setTimeout(r, base * 2 ** i));
    }
  }
  throw toAppError(lastErr);
}