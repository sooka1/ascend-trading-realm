// Server-only typed environment configuration.
// Filename ends in .server.ts so the client bundle can never import it.
// Use this in server functions / server routes to read secrets safely.

type EnvSpec = {
  name: string;
  required: boolean;
  description: string;
};

// Public (client-visible) vars are read via import.meta.env.VITE_* in client code.
// Everything below is server-side only.
const SERVER_ENV_SPEC: EnvSpec[] = [
  { name: "SUPABASE_URL", required: true, description: "Supabase project URL" },
  { name: "SUPABASE_PUBLISHABLE_KEY", required: true, description: "Supabase publishable/anon key" },
  { name: "SUPABASE_SERVICE_ROLE_KEY", required: false, description: "Service role key — server admin only" },
  { name: "LOVABLE_API_KEY", required: false, description: "Lovable AI Gateway key" },
  { name: "LOVABLE_SEND_URL", required: false, description: "Lovable email send URL override" },
  { name: "VAPID_PUBLIC_KEY", required: false, description: "Web push VAPID public key" },
  { name: "VAPID_PRIVATE_KEY", required: false, description: "Web push VAPID private key" },
  { name: "VAPID_SUBJECT", required: false, description: "Web push VAPID subject (mailto:)" },
  { name: "TWELVE_DATA_API_KEY", required: false, description: "TwelveData market data API key" },
  { name: "BINANCE_PAY_API_SECRET", required: false, description: "Binance Pay webhook signature secret" },
  { name: "SUPPORT_INBOX_EMAIL", required: false, description: "Support inbox recipient" },
];

export type ServerEnv = Record<string, string | undefined>;

function read(name: string): string | undefined {
  const v = process.env[name];
  return v && v.length > 0 ? v : undefined;
}

/**
 * Validate required server env vars. Call inside server handlers, not at module scope
 * (process.env in Workers/edge is only populated at request time).
 * Returns { ok, missing } instead of throwing so callers can fail gracefully.
 */
export function validateServerEnv(): { ok: boolean; missing: string[] } {
  const missing = SERVER_ENV_SPEC.filter((s) => s.required && !read(s.name)).map((s) => s.name);
  return { ok: missing.length === 0, missing };
}

export function requireEnv(name: string): string {
  const v = read(name);
  if (!v) {
    throw new Error(
      `Missing required environment variable: ${name}. Configure it in Lovable Cloud project secrets.`,
    );
  }
  return v;
}

export function optionalEnv(name: string, fallback?: string): string | undefined {
  return read(name) ?? fallback;
}

export const serverEnv = {
  get SUPABASE_URL() { return requireEnv("SUPABASE_URL"); },
  get SUPABASE_PUBLISHABLE_KEY() { return requireEnv("SUPABASE_PUBLISHABLE_KEY"); },
  get SUPABASE_SERVICE_ROLE_KEY() { return requireEnv("SUPABASE_SERVICE_ROLE_KEY"); },
  get LOVABLE_API_KEY() { return optionalEnv("LOVABLE_API_KEY"); },
  get NODE_ENV() { return (optionalEnv("NODE_ENV") ?? "development") as "development" | "staging" | "production"; },
};

/** Public, client-safe env — read from Vite at build time. */
export const publicEnv = {
  SUPABASE_URL: (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_SUPABASE_URL) || "",
  SUPABASE_PUBLISHABLE_KEY:
    (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY) || "",
};