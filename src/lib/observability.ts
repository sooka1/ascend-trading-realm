/**
 * Lightweight observability shim — structured logging + timing.
 *
 * Isomorphic (safe on both server and browser). Server-side entries land
 * in the Worker log stream and are queryable via `server-function-logs`.
 * Browser entries surface in the console and can be forwarded to a
 * telemetry sink if one is wired later.
 *
 * Additive: existing `console.log` call sites are untouched.
 */

import { toAppError } from "./errors";

type Level = "debug" | "info" | "warn" | "error";

function emit(level: Level, event: string, fields: Record<string, unknown> = {}): void {
  const line = {
    ts: new Date().toISOString(),
    level,
    event,
    ...fields,
  };
  // Structured single-line JSON is easy to grep in Worker logs.
  const payload = JSON.stringify(line);
  const fn = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
  fn(payload);
}

export const log = {
  debug: (event: string, fields?: Record<string, unknown>) => emit("debug", event, fields),
  info: (event: string, fields?: Record<string, unknown>) => emit("info", event, fields),
  warn: (event: string, fields?: Record<string, unknown>) => emit("warn", event, fields),
  error: (event: string, err: unknown, fields?: Record<string, unknown>) => {
    const app = toAppError(err);
    emit("error", event, {
      ...fields,
      error_code: app.code,
      error_message: app.message,
      retryable: app.retryable,
    });
  },
};

/**
 * Time an async operation and emit a metric line. Never swallows the
 * original error — it's rethrown after logging.
 */
export async function timed<T>(
  event: string,
  fn: () => Promise<T>,
  fields: Record<string, unknown> = {},
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    log.info(event, { ...fields, duration_ms: Math.round(performance.now() - start), ok: true });
    return result;
  } catch (e) {
    log.error(event, e, { ...fields, duration_ms: Math.round(performance.now() - start), ok: false });
    throw e;
  }
}

/** Warn threshold (ms) for flagging slow server calls in logs. */
export const SLOW_CALL_MS = 500;

export function checkSlow(event: string, durationMs: number, fields?: Record<string, unknown>): void {
  if (durationMs > SLOW_CALL_MS) {
    log.warn(`${event}.slow`, { ...fields, duration_ms: Math.round(durationMs) });
  }
}