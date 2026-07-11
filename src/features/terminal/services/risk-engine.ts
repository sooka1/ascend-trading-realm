export type Instrument = {
  symbol: string;
  category: string;
  contract_size: number;
  min_lot: number;
  max_lot: number;
  lot_step: number;
  price_precision: number;
  pip_size: number;
  margin_rate: number;
};

export function estimateMargin(inst: Instrument, volume: number, price: number, leverage: number) {
  const notional = volume * inst.contract_size * price;
  return notional / Math.max(1, leverage);
}

export function pipValue(inst: Instrument, volume: number) {
  return inst.pip_size * inst.contract_size * volume;
}

export function riskReward(entry: number, sl: number | null, tp: number | null, side: "buy" | "sell") {
  if (!sl || !tp) return null;
  const risk = Math.abs(entry - sl);
  const reward = Math.abs(tp - entry);
  if (risk === 0) return null;
  const validSide = side === "buy" ? sl < entry && tp > entry : sl > entry && tp < entry;
  if (!validSide) return null;
  return reward / risk;
}

export function estimatedPnl(inst: Instrument, side: "buy" | "sell", entry: number, target: number, volume: number) {
  const dir = side === "buy" ? 1 : -1;
  return (target - entry) * dir * volume * inst.contract_size;
}

export function validateOrder(inst: Instrument, volume: number, freeMargin: number, requiredMargin: number): string | null {
  if (volume < inst.min_lot) return `الحد الأدنى للحجم ${inst.min_lot}`;
  if (volume > inst.max_lot) return `الحد الأقصى للحجم ${inst.max_lot}`;
  if (requiredMargin > freeMargin) return "الهامش المتاح غير كافٍ";
  return null;
}