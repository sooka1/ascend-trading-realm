import { supabase } from "@/integrations/supabase/client";
import type { AccountSnapshot, BrokerConnector, NewOrder } from "./types";

async function currentUserId(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Not authenticated");
  return data.user.id;
}

function pnl(side: "buy" | "sell", entry: number, exit: number, volume: number, contractSize = 1) {
  const dir = side === "buy" ? 1 : -1;
  return (exit - entry) * dir * volume * contractSize;
}

async function audit(user_id: string, event: string, payload: Record<string, unknown>) {
  try { await supabase.from("trading_audit_log").insert({ user_id, event, payload }); } catch { /* non-fatal */ }
}

export function createPaperBroker(): BrokerConnector {
  return {
    name: "paper",
    async ensureAccount(): Promise<AccountSnapshot> {
      const user_id = await currentUserId();
      const { data: existing } = await supabase.from("trading_accounts").select("id,balance,currency,leverage").eq("user_id", user_id).maybeSingle();
      if (existing) return existing as AccountSnapshot;
      const { data, error } = await supabase.from("trading_accounts").insert({ user_id }).select("id,balance,currency,leverage").single();
      if (error) throw error;
      return data as AccountSnapshot;
    },
    async placeOrder(order: NewOrder, marketPrice: number) {
      const user_id = await currentUserId();
      const acct = await this.ensureAccount();
      if (order.volume <= 0) return { ok: false, error: "Volume must be > 0" };
      if (order.order_type === "market") {
        const price = marketPrice;
        const { data, error } = await supabase.from("trading_positions").insert({
          user_id, account_id: acct.id, symbol: order.symbol, side: order.side,
          volume: order.volume, entry_price: price,
          take_profit: order.take_profit ?? null, stop_loss: order.stop_loss ?? null,
        }).select("id").single();
        if (error) return { ok: false, error: error.message };
        await supabase.from("trading_orders").insert({
          user_id, account_id: acct.id, symbol: order.symbol, side: order.side,
          order_type: "market", volume: order.volume, price, status: "filled",
          filled_price: price, filled_at: new Date().toISOString(),
          take_profit: order.take_profit ?? null, stop_loss: order.stop_loss ?? null,
        });
        await audit(user_id, "position_open", { id: data.id, ...order, price });
        return { ok: true, id: data.id };
      }
      // pending order
      const { data, error } = await supabase.from("trading_orders").insert({
        user_id, account_id: acct.id, symbol: order.symbol, side: order.side,
        order_type: order.order_type, volume: order.volume,
        price: order.price ?? null, stop_price: order.stop_price ?? null,
        take_profit: order.take_profit ?? null, stop_loss: order.stop_loss ?? null,
        status: "pending",
      }).select("id").single();
      if (error) return { ok: false, error: error.message };
      await audit(user_id, "order_pending", { id: data.id, ...order });
      return { ok: true, id: data.id };
    },
    async modifyPosition(id, patch) {
      const user_id = await currentUserId();
      const { error } = await supabase.from("trading_positions").update(patch).eq("id", id);
      if (error) throw error;
      await audit(user_id, "position_modify", { id, ...patch });
    },
    async closePosition(id, marketPrice, volume) {
      const user_id = await currentUserId();
      const { data: pos, error } = await supabase.from("trading_positions").select("*").eq("id", id).single();
      if (error || !pos) throw error ?? new Error("Position not found");
      const closeVol = Math.min(volume ?? pos.volume, pos.volume);
      const profit = pnl(pos.side as "buy" | "sell", Number(pos.entry_price), marketPrice, closeVol);
      const { data: acct } = await supabase.from("trading_accounts").select("id,balance").eq("user_id", user_id).single();
      if (acct) await supabase.from("trading_accounts").update({ balance: Number(acct.balance) + profit }).eq("id", acct.id);
      await supabase.from("trading_history").insert({
        user_id, account_id: pos.account_id, symbol: pos.symbol, side: pos.side,
        volume: closeVol, entry_price: pos.entry_price, close_price: marketPrice,
        profit, swap: pos.swap ?? 0, commission: pos.commission ?? 0,
        opened_at: pos.opened_at,
      });
      if (closeVol >= Number(pos.volume)) {
        await supabase.from("trading_positions").delete().eq("id", id);
      } else {
        await supabase.from("trading_positions").update({ volume: Number(pos.volume) - closeVol }).eq("id", id);
      }
      await audit(user_id, "position_close", { id, closeVol, marketPrice, profit });
    },
    async reversePosition(id, marketPrice) {
      const { data: pos } = await supabase.from("trading_positions").select("*").eq("id", id).single();
      if (!pos) return;
      await this.closePosition(id, marketPrice);
      await this.placeOrder({
        symbol: pos.symbol, side: pos.side === "buy" ? "sell" : "buy",
        order_type: "market", volume: Number(pos.volume),
      }, marketPrice);
    },
    async cancelOrder(id) {
      const user_id = await currentUserId();
      await supabase.from("trading_orders").update({ status: "cancelled" }).eq("id", id);
      await audit(user_id, "order_cancel", { id });
    },
    async closeAll(scope, quotes) {
      const user_id = await currentUserId();
      const { data: positions } = await supabase.from("trading_positions").select("*").eq("user_id", user_id);
      if (!positions) return 0;
      let count = 0;
      for (const p of positions) {
        const mp = quotes[p.symbol];
        if (!mp) continue;
        const profit = pnl(p.side as "buy" | "sell", Number(p.entry_price), mp, Number(p.volume));
        if (scope === "profit" && profit <= 0) continue;
        if (scope === "loss" && profit >= 0) continue;
        await this.closePosition(p.id, mp);
        count++;
      }
      return count;
    },
  };
}