import type { BrokerConnector } from "./types";
import { createPaperBroker } from "./paper.broker";

let cached: BrokerConnector | null = null;
export function getBroker(): BrokerConnector {
  if (cached) return cached;
  cached = createPaperBroker();
  return cached;
}

export type * from "./types";