export type OrderSide = "buy" | "sell";
export type OrderType = "market" | "limit" | "stop" | "stop_limit";

export type NewOrder = {
  symbol: string;
  side: OrderSide;
  order_type: OrderType;
  volume: number;
  price?: number | null;
  stop_price?: number | null;
  take_profit?: number | null;
  stop_loss?: number | null;
};

export type Position = {
  id: string;
  symbol: string;
  side: OrderSide;
  volume: number;
  entry_price: number;
  take_profit: number | null;
  stop_loss: number | null;
  swap: number;
  commission: number;
  opened_at: string;
};

export type PendingOrder = {
  id: string;
  symbol: string;
  side: OrderSide;
  order_type: OrderType;
  volume: number;
  price: number | null;
  stop_price: number | null;
  take_profit: number | null;
  stop_loss: number | null;
  status: string;
  created_at: string;
};

export type HistoryRow = {
  id: string;
  symbol: string;
  side: OrderSide;
  volume: number;
  entry_price: number;
  close_price: number;
  profit: number;
  swap: number;
  commission: number;
  opened_at: string;
  closed_at: string;
};

export type AccountSnapshot = {
  id: string;
  balance: number;
  currency: string;
  leverage: number;
};

export interface BrokerConnector {
  readonly name: string;
  ensureAccount(): Promise<AccountSnapshot>;
  placeOrder(order: NewOrder, marketPrice: number): Promise<{ ok: boolean; id?: string; error?: string }>;
  modifyPosition(id: string, patch: { take_profit?: number | null; stop_loss?: number | null }): Promise<void>;
  closePosition(id: string, marketPrice: number, volume?: number): Promise<void>;
  reversePosition(id: string, marketPrice: number): Promise<void>;
  cancelOrder(id: string): Promise<void>;
  closeAll(scope: "all" | "profit" | "loss", quotes: Record<string, number>): Promise<number>;
}