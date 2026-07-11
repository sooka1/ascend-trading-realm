// Currency + precision formatting keyed off the trading symbol.
// Quote currency = last 3 chars of a 6-char FX pair; otherwise mapped explicitly.
const QUOTE_SYMBOL: Record<string, string> = {
  USD: "$", EUR: "€", GBP: "£", JPY: "¥", CHF: "₣", CAD: "C$", AUD: "A$",
};

// Overrides / non-FX assets.
const SYMBOL_OVERRIDES: Record<string, { currency: string; precision?: number }> = {
  XAUUSD: { currency: "USD", precision: 2 },
  XAGUSD: { currency: "USD", precision: 3 },
  BTCUSD: { currency: "USD", precision: 2 },
  ETHUSD: { currency: "USD", precision: 2 },
  US500:  { currency: "USD", precision: 2 },
  NAS100: { currency: "USD", precision: 2 },
  WTI:    { currency: "USD", precision: 2 },
};

export function assetCurrency(symbol: string): { code: string; sign: string } {
  const o = SYMBOL_OVERRIDES[symbol];
  if (o) return { code: o.currency, sign: QUOTE_SYMBOL[o.currency] ?? "$" };
  // FX: EURUSD → quote = USD
  if (/^[A-Z]{6}$/.test(symbol)) {
    const code = symbol.slice(3);
    return { code, sign: QUOTE_SYMBOL[code] ?? code };
  }
  return { code: "USD", sign: "$" };
}

export function assetPrecision(symbol: string, fallback: number): number {
  return SYMBOL_OVERRIDES[symbol]?.precision ?? fallback;
}

// Formats a price with the asset's natural precision and currency symbol.
export function formatAssetPrice(symbol: string, value: number, fallbackPrecision = 4): string {
  if (!isFinite(value)) return "—";
  const { sign } = assetCurrency(symbol);
  const p = assetPrecision(symbol, fallbackPrecision);
  const formatted = value.toLocaleString("en-US", { minimumFractionDigits: p, maximumFractionDigits: p });
  return `${sign}${formatted}`;
}

// P/L in account currency (USD by convention here).
export function formatUsd(value: number): string {
  if (!isFinite(value)) return "—";
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${sign}$${abs}`;
}