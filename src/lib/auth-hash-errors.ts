// Parse Supabase auth error fragments (or query params) present after a
// verification-link click, map to a stable UI code, and scrub them from
// the browser URL. Client-only helpers — never call from SSR.
//
// PII rules:
// - Never log the raw error_description; it may contain email addresses
//   or other PII embedded by Supabase.
// - Only the mapped code leaves this module.

export type VerifyErrorCode =
  | "expired"
  | "used"
  | "invalid"
  | "access_denied"
  | "generic";

const KNOWN_CODES = new Set<VerifyErrorCode>([
  "expired",
  "used",
  "invalid",
  "access_denied",
  "generic",
]);

function paramsFromHashOrQuery(input: string): URLSearchParams | null {
  const idx = input.indexOf("?");
  const searchLike = idx >= 0 ? input.slice(idx + 1) : input;
  const hashLike = input.startsWith("#") ? input.slice(1) : searchLike;
  const candidate = hashLike.includes("=") ? hashLike : searchLike;
  if (!candidate || !candidate.includes("=")) return null;
  try {
    return new URLSearchParams(candidate);
  } catch {
    return null;
  }
}

/**
 * Given a `location.hash` and/or `location.search` string, return a mapped
 * verification error code if one is present. Returns `null` when no error
 * is encoded.
 */
export function parseVerificationError(
  hash: string | null | undefined,
  search?: string | null | undefined,
): VerifyErrorCode | null {
  const sources = [hash ?? "", search ?? ""].filter(Boolean);
  for (const src of sources) {
    const params = paramsFromHashOrQuery(src);
    if (!params) continue;
    const error = params.get("error");
    const errorCode = params.get("error_code");
    if (!error && !errorCode) continue;

    const code = (errorCode || "").toLowerCase();
    const err = (error || "").toLowerCase();

    if (code === "otp_expired" || code === "email_link_expired") return "expired";
    if (code === "otp_used" || code === "already_used") return "used";
    if (
      code === "invalid_request" ||
      code === "bad_oauth_state" ||
      code === "validation_failed"
    )
      return "invalid";
    if (err === "access_denied") return "access_denied";
    return "generic";
  }
  return null;
}

/**
 * Remove Supabase error fragments (and matching query params) from the
 * current browser URL. No-op during SSR.
 */
export function scrubVerificationErrorFromUrl(): void {
  if (typeof window === "undefined") return;
  try {
    const url = new URL(window.location.href);
    let changed = false;
    for (const key of [
      "error",
      "error_code",
      "error_description",
      "access_token",
      "refresh_token",
      "token_type",
      "expires_in",
      "expires_at",
      "provider_token",
    ]) {
      if (url.searchParams.has(key)) {
        url.searchParams.delete(key);
        changed = true;
      }
    }
    if (window.location.hash && window.location.hash.length > 1) {
      const hashParams = paramsFromHashOrQuery(window.location.hash);
      if (
        hashParams &&
        (hashParams.has("error") ||
          hashParams.has("error_code") ||
          hashParams.has("access_token"))
      ) {
        url.hash = "";
        changed = true;
      }
    }
    if (changed) {
      window.history.replaceState(null, "", url.toString());
    }
  } catch {
    // never break the render path
  }
}

export function isKnownVerifyErrorCode(v: unknown): v is VerifyErrorCode {
  return typeof v === "string" && KNOWN_CODES.has(v as VerifyErrorCode);
}