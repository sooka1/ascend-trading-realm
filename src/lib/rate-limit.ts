/**
 * Client-side rate limiter for sensitive actions (login attempts,
 * form submissions, MFA verifications, etc.). Not a security boundary —
 * server-side RLS + Supabase auth throttling remain authoritative — but
 * it reduces accidental request floods and blocks trivial abuse.
 *
 * Usage:
 *   const limiter = rateLimit("auth:signin", { max: 5, windowMs: 60_000 });
 *   if (!limiter.tryConsume()) { toast.error("محاولات كثيرة، حاول لاحقًا"); return; }
 */

type Bucket = { count: number; resetAt: number };

export interface RateLimitOptions {
  max: number;
  windowMs: number;
}

export interface RateLimiter {
  tryConsume: () => boolean;
  remaining: () => number;
  resetIn: () => number;
  reset: () => void;
}

function storageKey(key: string) {
  return `hk.ratelimit.${key}`;
}

function read(key: string): Bucket | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey(key));
    if (!raw) return null;
    const b = JSON.parse(raw) as Bucket;
    if (Date.now() > b.resetAt) return null;
    return b;
  } catch {
    return null;
  }
}

function write(key: string, bucket: Bucket) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(key), JSON.stringify(bucket));
  } catch {
    /* storage full or blocked — ignore */
  }
}

function clear(key: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(storageKey(key));
  } catch {
    /* ignore */
  }
}

export function rateLimit(key: string, opts: RateLimitOptions): RateLimiter {
  return {
    tryConsume() {
      const now = Date.now();
      const bucket = read(key) ?? { count: 0, resetAt: now + opts.windowMs };
      if (bucket.count >= opts.max) return false;
      write(key, { count: bucket.count + 1, resetAt: bucket.resetAt });
      return true;
    },
    remaining() {
      const b = read(key);
      return b ? Math.max(0, opts.max - b.count) : opts.max;
    },
    resetIn() {
      const b = read(key);
      return b ? Math.max(0, b.resetAt - Date.now()) : 0;
    },
    reset() {
      clear(key);
    },
  };
}