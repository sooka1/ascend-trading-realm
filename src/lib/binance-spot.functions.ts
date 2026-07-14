import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Binance Spot API deposit auto-detection via unique fractional amount matching.
// User is asked to send an amount like 100.4728 USDT (with random 4-decimal
// fraction). A cron job polls /sapi/v1/capital/deposit/hisrec and matches
// the incoming deposit by exact amount → auto-approves the pending row.

const DEPOSIT_TTL_MINUTES = 30;

/**
 * Creates a pending deposit with a unique fractional amount that the user
 * must send to the platform's Binance wallet. Returns the exact amount,
 * deposit address, and expiry so the UI can render a QR + instructions.
 */
export const createBinanceDeposit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { amount: number; network?: string }) => {
    const amount = Number(data?.amount);
    if (!Number.isFinite(amount) || amount <= 0) throw new Error("قيمة غير صالحة");
    if (amount < 10) throw new Error("الحد الأدنى للإيداع 10 USDT");
    if (amount > 1_000_000) throw new Error("المبلغ يتجاوز الحد المسموح");
    const network = (data?.network ?? "TRC20").toUpperCase();
    if (network !== "TRC20") throw new Error("الشبكة غير مدعومة حالياً — استخدم TRC20");
    return { amount: Math.round(amount * 100) / 100, network };
  })
  .handler(async ({ data, context }) => {
    const address =
      data.network === "TRC20"
        ? process.env.BINANCE_USDT_TRC20_ADDRESS
        : undefined;
    if (!address) {
      throw new Error("عنوان محفظة الاستقبال غير مُهيّأ — يرجى مراجعة الإدارة");
    }

    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    // Try up to 6 times to find a unique fractional amount that is not
    // already reserved by another pending deposit on the same network.
    let uniqueAmount: number | null = null;
    for (let i = 0; i < 6; i++) {
      // Random 4-decimal fraction between 0.0001 and 0.9999
      const fraction = (Math.floor(Math.random() * 9999) + 1) / 10000;
      const candidate = Math.round((data.amount + fraction) * 10000) / 10000;

      const { data: clash } = await supabaseAdmin
        .from("deposits")
        .select("id")
        .eq("status", "pending")
        .eq("network", data.network)
        .eq("unique_amount", candidate)
        .maybeSingle();
      if (!clash) {
        uniqueAmount = candidate;
        break;
      }
    }
    if (uniqueAmount === null) {
      throw new Error("تعذّر توليد مبلغ فريد — يرجى المحاولة بعد لحظات");
    }

    const expiresAt = new Date(Date.now() + DEPOSIT_TTL_MINUTES * 60_000);

    const { data: deposit, error: depErr } = await supabaseAdmin
      .from("deposits")
      .insert({
        user_id: context.userId,
        amount: data.amount,
        unique_amount: uniqueAmount,
        currency: "USDT",
        method: "binance_spot",
        network: data.network,
        deposit_address: address,
        expires_at: expiresAt.toISOString(),
        status: "pending",
        notes: `Auto-created via Binance Spot (${data.network})`,
      })
      .select("id")
      .single();
    if (depErr || !deposit) throw new Error(depErr?.message ?? "فشل إنشاء الطلب");

    return {
      depositId: deposit.id as string,
      uniqueAmount,
      baseAmount: data.amount,
      network: data.network,
      address,
      expiresAt: expiresAt.toISOString(),
      ttlMinutes: DEPOSIT_TTL_MINUTES,
    };
  });