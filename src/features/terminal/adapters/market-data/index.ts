import type { MarketDataProvider } from "./types";
import { createMockProvider } from "./mock.provider";
import { createLiveProvider } from "./live.provider";

// Provider factory. Live provider uses Twelve Data (FX/metals/indices via
// server function) and Binance WebSocket (crypto). Falls back to mock only
// when explicitly forced via ?mockPrices=1 for local testing.
let cached: MarketDataProvider | null = null;
export function getMarketDataProvider(): MarketDataProvider {
  if (cached) return cached;
  const forceMock = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("mockPrices") === "1";
  cached = forceMock ? createMockProvider() : createLiveProvider();
  return cached;
}

export type * from "./types";