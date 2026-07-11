import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { getMarketDataProvider } from "../adapters/market-data";
import type { Quote } from "../adapters/market-data/types";
import type { Instrument } from "../services/risk-engine";
import type { HistoryRow, PendingOrder, Position } from "../adapters/broker/types";

export function useInstruments() {
  return useQuery({
    queryKey: ["instruments"],
    queryFn: async (): Promise<Instrument[]> => {
      const { data, error } = await supabase.from("instruments").select("*").eq("is_active", true).order("symbol");
      if (error) throw error;
      return (data ?? []).map((r) => ({
        symbol: r.symbol, category: r.category,
        contract_size: Number(r.contract_size), min_lot: Number(r.min_lot),
        max_lot: Number(r.max_lot), lot_step: Number(r.lot_step),
        price_precision: r.price_precision, pip_size: Number(r.pip_size),
        margin_rate: Number(r.margin_rate),
      }));
    },
    staleTime: 5 * 60_000,
  });
}

export function useQuotes(symbols: string[]) {
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const keyRef = useRef("");
  useEffect(() => {
    const key = [...symbols].sort().join(",");
    if (!key || key === keyRef.current) { keyRef.current = key; return; }
    keyRef.current = key;
    const p = getMarketDataProvider();
    const unsub = p.subscribe(symbols, (q) => setQuotes((prev) => ({ ...prev, [q.symbol]: q })));
    return () => unsub();
  }, [symbols]);
  return quotes;
}

export function useAccount() {
  return useQuery({
    queryKey: ["trading-account"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      let { data } = await supabase.from("trading_accounts").select("*").eq("user_id", u.user.id).maybeSingle();
      if (!data) {
        const ins = await supabase.from("trading_accounts").insert({ user_id: u.user.id }).select("*").single();
        data = ins.data;
      }
      return data;
    },
  });
}

export function usePositions() {
  return useQuery({
    queryKey: ["trading-positions"],
    queryFn: async (): Promise<Position[]> => {
      const { data, error } = await supabase.from("trading_positions").select("*").order("opened_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Position[];
    },
    refetchInterval: 4000,
  });
}

export function usePendingOrders() {
  return useQuery({
    queryKey: ["trading-pending"],
    queryFn: async (): Promise<PendingOrder[]> => {
      const { data, error } = await supabase.from("trading_orders").select("*").eq("status", "pending").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as PendingOrder[];
    },
    refetchInterval: 5000,
  });
}

export function useHistory() {
  return useQuery({
    queryKey: ["trading-history"],
    queryFn: async (): Promise<HistoryRow[]> => {
      const { data, error } = await supabase.from("trading_history").select("*").order("closed_at", { ascending: false }).limit(200);
      if (error) throw error;
      return (data ?? []) as unknown as HistoryRow[];
    },
  });
}

export function useWatchlist() {
  return useQuery({
    queryKey: ["watchlist"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return [] as string[];
      let { data: wl } = await supabase.from("watchlists").select("id").eq("user_id", u.user.id).maybeSingle();
      if (!wl) {
        const ins = await supabase.from("watchlists").insert({ user_id: u.user.id }).select("id").single();
        wl = ins.data;
        if (wl) {
          const seeds = ["XAUUSD","EURUSD","GBPUSD","BTCUSD","US500"];
          await supabase.from("watchlist_items").insert(seeds.map((s, i) => ({
            watchlist_id: wl!.id, user_id: u.user!.id, symbol: s, sort_order: i,
          })));
        }
      }
      if (!wl) return [];
      const { data: items } = await supabase.from("watchlist_items").select("symbol,sort_order").eq("watchlist_id", wl.id).order("sort_order");
      return (items ?? []).map((r) => r.symbol);
    },
  });
}