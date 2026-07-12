import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Row = { amount: number | string; status: string };

/**
 * Shared available-balance hook.
 * available = approved deposits − approved withdrawals − committed (active/pending subs)
 * Used by every UI slot labelled "الرصيد المتاح" so all screens stay in sync.
 */
export function useAvailableBalance() {
  const [balance, setBalance] = useState(0);
  const [committed, setCommitted] = useState(0);
  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState<string | null>(null);

  async function load() {
    const { data: userRes } = await supabase.auth.getUser();
    const id = userRes.user?.id ?? null;
    setUid(id);
    if (!id) {
      setLoading(false);
      return;
    }
    const [{ data: dp }, { data: wd }, { data: sb }, { data: pr }, { data: ce }] = await Promise.all([
      supabase.from("deposits").select("amount,status").eq("user_id", id),
      supabase.from("withdrawals").select("amount,status").eq("user_id", id),
      supabase.from("subscriptions").select("amount,status").eq("user_id", id),
      supabase.from("profit_distributions").select("amount").eq("user_id", id),
      supabase.from("competition_entries").select("tier_fee,status").eq("user_id", id),
    ]);
    const inSum = ((dp ?? []) as Row[])
      .filter((r) => r.status === "approved")
      .reduce((s, r) => s + Number(r.amount), 0);
    const outSum = ((wd ?? []) as Row[])
      .filter((r) => r.status === "approved")
      .reduce((s, r) => s + Number(r.amount), 0);
    const com = ((sb ?? []) as Row[])
      .filter((r) => r.status === "active" || r.status === "pending")
      .reduce((s, r) => s + Number(r.amount), 0);
    const compFees = ((ce ?? []) as { tier_fee: number | string; status: string }[])
      .filter((r) => r.status === "active" || r.status === "pending")
      .reduce((s, r) => s + Number(r.tier_fee), 0);
    const profitSum = ((pr ?? []) as { amount: number | string }[])
      .reduce((s, r) => s + Number(r.amount), 0);
    setBalance(inSum + profitSum - outSum - compFees);
    setCommitted(com);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  // Realtime: refresh whenever the user's wallet-affecting rows change.
  useEffect(() => {
    if (!uid) return;
    const channel = supabase
      .channel(`wallet:${uid}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "deposits", filter: `user_id=eq.${uid}` }, () => void load())
      .on("postgres_changes", { event: "*", schema: "public", table: "withdrawals", filter: `user_id=eq.${uid}` }, () => void load())
      .on("postgres_changes", { event: "*", schema: "public", table: "subscriptions", filter: `user_id=eq.${uid}` }, () => void load())
      .on("postgres_changes", { event: "*", schema: "public", table: "profit_distributions", filter: `user_id=eq.${uid}` }, () => void load())
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [uid]);

  const available = useMemo(() => Math.max(0, balance - committed), [balance, committed]);
  return { available, balance, committed, loading, reload: load };
}