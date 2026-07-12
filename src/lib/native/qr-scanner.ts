import { Capacitor } from "@capacitor/core";

// QR scanning via @capacitor-mlkit/barcode-scanning on native,
// BarcodeDetector API on web where available.
export type QRPayloadKind = "referral" | "deposit" | "wallet" | "competition" | "unknown";
export type ParsedQR = {
  raw: string;
  kind: QRPayloadKind;
  target?: string;
  path?: string; // in-app path, ready for router.navigate
};

// Parser is intentionally future-extensible: add new prefixes without touching callers.
// Supported formats:
//   hkex://referral/CODE
//   hkex://deposit/ORDER_ID?amount=100
//   hkex://wallet/ADDR
//   hkex://competition/ID
//   https://hkexinvest.com/... — trusted, path used directly
//   raw referral codes (8-16 alphanum) — treated as referral
export function parseQR(raw: string): ParsedQR {
  const trimmed = raw.trim();
  if (!trimmed) return { raw, kind: "unknown" };

  try {
    const url = new URL(trimmed);
    if (url.protocol === "hkex:") {
      const host = url.hostname || url.pathname.replace(/^\/+/, "").split("/")[0];
      const segs = url.pathname.replace(/^\/+/, "").split("/").filter(Boolean);
      const target = url.hostname ? segs[0] : segs[1];
      const q = url.search;
      switch (host) {
        case "referral": return { raw, kind: "referral", target,
          path: target ? `/portal/referrals?code=${encodeURIComponent(target)}` : undefined };
        case "deposit": return { raw, kind: "deposit", target,
          path: target ? `/portal/transactions?deposit=${encodeURIComponent(target)}${q ? "&" + q.slice(1) : ""}` : undefined };
        case "wallet": return { raw, kind: "wallet", target,
          path: `/portal/transactions${target ? `?address=${encodeURIComponent(target)}` : ""}` };
        case "competition": return { raw, kind: "competition", target,
          path: target ? `/competitions/${encodeURIComponent(target)}` : undefined };
      }
    }
    if (url.hostname.endsWith("hkexinvest.com")) {
      return { raw, kind: "unknown", path: url.pathname + url.search };
    }
  } catch { /* not a URL */ }

  // Bare referral code fallback
  if (/^[A-Z0-9]{6,16}$/i.test(trimmed)) {
    return { raw, kind: "referral", target: trimmed, path: `/portal/referrals?code=${encodeURIComponent(trimmed)}` };
  }
  return { raw, kind: "unknown" };
}

export async function isQRAvailable(): Promise<boolean> {
  if (Capacitor.isNativePlatform()) return true;
  return typeof window !== "undefined" && "BarcodeDetector" in window;
}

export async function scanQR(): Promise<ParsedQR | null> {
  if (Capacitor.isNativePlatform()) {
    try {
      const { BarcodeScanner } = await import("@capacitor-mlkit/barcode-scanning");
      const perm = await BarcodeScanner.checkPermissions();
      if (perm.camera !== "granted") await BarcodeScanner.requestPermissions();
      const { barcodes } = await BarcodeScanner.scan({ formats: ["QR_CODE" as any] });
      const raw = barcodes?.[0]?.rawValue;
      return raw ? parseQR(raw) : null;
    } catch { return null; }
  }
  // Web: leave UI-level scanner to callers; here just decode from a chosen image.
  return null;
}