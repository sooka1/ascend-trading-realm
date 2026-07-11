import type { MarketDataProvider } from "./types";
import { createMockProvider } from "./mock.provider";

// Provider factory. Add new adapters (TwelveData/Polygon/DXfeed/IB...) here
// and switch by env or user preference — the UI depends only on the interface.
let cached: MarketDataProvider | null = null;
export function getMarketDataProvider(): MarketDataProvider {
  if (cached) return cached;
  cached = createMockProvider();
  return cached;
}

export type * from "./types";