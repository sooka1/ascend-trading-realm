import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createHmac, randomBytes } from "crypto";

// Binance Pay merchant openapi endpoint (production).
// Docs: https://developers.binance.com/docs/binance-pay/api-order-create-v3
const BINANCE_PAY_ORDER_URL =
  "https://bpay.binanceapi.com/binancepay/openapi/v3/order";

function signRequest(body: string, apiSecret: string) {
  const timestamp = Date.now().toString();
  const nonce = randomBytes(16).toString("hex").slice(0, 32);
  const payload = `${timestamp}\n${nonce}\n${body}\n`;
  const signature = createHmac("sha512", apiSecret)
    .update(payload)
    .digest("hex")
    .toUpperCase();
  return { timestamp, nonce, signature };
}

/**
 * Creates a Binance Pay order for the current user and returns the hosted
 * checkout URL / QR link. The pending `deposits.id` is used as the
 * `merchantTradeNo` so the webhook can auto-approve on PAY_SUCCESS.
 */
export const createBinancePayOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { amount: number }) => {
    const amount = Number(data?.amount);
    if (!Number.isFinite(amount) || amount <= 0) throw new Error("قيمة غير صالحة");
    if (amount < 10) throw new Error("الحد الأدنى للإيداع 10$");
    if (amount > 1_000_000) throw new Error("المبلغ يتجاوز الحد المسموح");
    return { amount: Math.round(amount * 100) / 100 };
  })
  .handler(async ({ data, context }) => {
    const apiKey = process.env.BINANCE_PAY_API_KEY;
    const apiSecret = process.env.BINANCE_PAY_API_SECRET;
    if (!apiKey || !apiSecret) {
      throw new Error("بوابة Binance Pay غير مهيأة — يرجى التواصل مع الدعم");
    }

    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    // 1) Create pending deposit row → its UUID is merchantTradeNo
    const { data: deposit, error: depErr } = await supabaseAdmin
      .from("deposits")
      .insert({
        user_id: context.userId,
        amount: data.amount,
        currency: "USDT",
        method: "binance_pay",
        status: "pending",
        notes: "Auto-created via Binance Pay gateway",
      })
      .select("id")
      .single();
    if (depErr || !deposit) throw new Error(depErr?.message ?? "فشل إنشاء الطلب");

    // Binance Pay merchantTradeNo must be alphanumeric only (letters+digits).
    // Deposit UUIDs contain dashes → strip them.
    const merchantTradeNo = String(deposit.id).replace(/-/g, "");

    // 2) Call Binance Pay openapi/v3/order
    const bodyObj = {
      env: { terminalType: "WEB" },
      merchantTradeNo,
      orderAmount: data.amount.toFixed(2),
      currency: "USDT",
      goods: {
        goodsType: "02",
        goodsCategory: "Z000",
        referenceGoodsId: "hkex-deposit",
        goodsName: "HKEX Wallet Deposit",
      },
    };
    const body = JSON.stringify(bodyObj);
    const { timestamp, nonce, signature } = signRequest(body, apiSecret);

    const res = await fetch(BINANCE_PAY_ORDER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "BinancePay-Timestamp": timestamp,
        "BinancePay-Nonce": nonce,
        "BinancePay-Certificate-SN": apiKey,
        "BinancePay-Signature": signature,
      },
      body,
    });
    const json = (await res.json().catch(() => ({}))) as {
      status?: string;
      code?: string;
      errorMessage?: string;
      data?: {
        prepayId?: string;
        checkoutUrl?: string;
        qrcodeLink?: string;
        universalUrl?: string;
        expireTime?: number;
      };
    };

    if (!res.ok || json.status !== "SUCCESS" || !json.data?.checkoutUrl) {
      // Roll back the pending deposit so the user's balance page stays clean
      await supabaseAdmin.from("deposits").delete().eq("id", deposit.id);
      throw new Error(
        json.errorMessage || `فشل إنشاء عملية الدفع (${json.code ?? res.status})`,
      );
    }

    return {
      depositId: deposit.id as string,
      checkoutUrl: json.data.checkoutUrl,
      qrcodeLink: json.data.qrcodeLink ?? null,
      universalUrl: json.data.universalUrl ?? null,
      expireTime: json.data.expireTime ?? null,
    };
  });