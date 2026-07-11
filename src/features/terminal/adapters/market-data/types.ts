// Provider-agnostic market data interface.
export type Timeframe = "1m" | "5m" | "15m" | "30m" | "1h" | "4h" | "1d" | "1w" | "1M";

export type Quote = {
  symbol: string;
  bid: number;
  ask: number;
  last: number;
  time: number; // epoch ms
  changePct24h?: number;
  volume24h?: number;
};

export type Candle = {
  time: number; // epoch seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
};

export type ConnectionStatus = "idle" | "connecting" | "open" | "closed" | "error";

export interface MarketDataProvider {
  readonly name: string;
  subscribe(symbols: string[], onQuote: (q: Quote) => void): () => void;
  getCandles(symbol: string, tf: Timeframe, count?: number): Promise<Candle[]>;
  onCandle(symbol: string, tf: Timeframe, onCandle: (c: Candle) => void): () => void;
  status(): ConnectionStatus;
  onStatus(cb: (s: ConnectionStatus) => void): () => void;
}