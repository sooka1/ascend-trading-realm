import { describe, expect, test } from "bun:test";
import { parseVerificationError, isKnownVerifyErrorCode } from "./auth-hash-errors";

describe("parseVerificationError", () => {
  test("returns null for empty input", () => {
    expect(parseVerificationError("", "")).toBeNull();
    expect(parseVerificationError(null, null)).toBeNull();
  });

  test("maps otp_expired to expired", () => {
    expect(
      parseVerificationError(
        "#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired",
      ),
    ).toBe("expired");
  });

  test("maps email_link_expired to expired", () => {
    expect(parseVerificationError("#error_code=email_link_expired")).toBe("expired");
  });

  test("maps otp_used to used", () => {
    expect(parseVerificationError("#error_code=otp_used")).toBe("used");
  });

  test("maps invalid_request to invalid", () => {
    expect(parseVerificationError("#error_code=invalid_request")).toBe("invalid");
  });

  test("maps access_denied without a known code", () => {
    expect(parseVerificationError("#error=access_denied")).toBe("access_denied");
  });

  test("falls back to generic for unknown codes", () => {
    expect(parseVerificationError("#error=server_error&error_code=weird_thing")).toBe("generic");
  });

  test("reads from query search when hash is empty", () => {
    expect(parseVerificationError("", "?error_code=otp_expired")).toBe("expired");
  });

  test("returns null when no error field is present", () => {
    expect(parseVerificationError("#access_token=abc&token_type=bearer")).toBeNull();
  });
});

describe("isKnownVerifyErrorCode", () => {
  test("accepts known codes", () => {
    expect(isKnownVerifyErrorCode("expired")).toBe(true);
    expect(isKnownVerifyErrorCode("used")).toBe(true);
    expect(isKnownVerifyErrorCode("invalid")).toBe(true);
    expect(isKnownVerifyErrorCode("generic")).toBe(true);
    expect(isKnownVerifyErrorCode("access_denied")).toBe(true);
  });
  test("rejects unknown values", () => {
    expect(isKnownVerifyErrorCode("foo")).toBe(false);
    expect(isKnownVerifyErrorCode(null)).toBe(false);
    expect(isKnownVerifyErrorCode(undefined)).toBe(false);
    expect(isKnownVerifyErrorCode(123)).toBe(false);
  });
});