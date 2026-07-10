import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";

// Binance Pay webhook: verifies the merchant signature over
// `${timestamp}\n${nonce}\n${body}\n` with HMAC-SHA512(API_SECRET),
// then links the payment back to the investor via the merchant trade
// number we set on order creation — which is the `deposits.id` (UUID).
export const Route = createFileRoute("/api/public/webhooks/binance-pay")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiSecret = process.env.BINANCE_PAY_API_SECRET;
        if (!apiSecret) return new Response("Not configured", { status: 503 });

        const timestamp = request.headers.get("binancepay-timestamp") ?? "";
        const nonce = request.headers.get("binancepay-nonce") ?? "";
        const signature = request.headers.get("binancepay-signature") ?? "";
        const body = await request.text();
        if (!timestamp || !nonce || !signature || !body) {
          return new Response("Missing signature headers", { status: 400 });
        }

        // Signature is uppercase hex of HMAC-SHA512
        const payload = `${timestamp}\n${nonce}\n${body}\n`;
        const expected = createHmac("sha512", apiSecret).update(payload).digest("hex").toUpperCase();
        const a = Buffer.from(signature.toUpperCase());
        const b = Buffer.from(expected);
        if (a.length !== b.length || !timingSafeEqual(a, b)) {
          return new Response("Invalid signature", { status: 401 });
        }

        let event: {
          bizType?: string;
          bizStatus?: string;
          data?: string;
          bizId?: string | number;
        };
        try {
          event = JSON.parse(body);
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        // We only act on pay success notifications
        if (event.bizType !== "PAY" || event.bizStatus !== "PAY_SUCCESS") {
          return Response.json({ returnCode: "SUCCESS", returnMessage: null });
        }

        // The `data` field is a JSON string carrying the merchant order
        let orderData: { merchantTradeNo?: string; totalFee?: string | number; currency?: string; transactionId?: string } = {};
        try {
          orderData = typeof event.data === "string" ? JSON.parse(event.data) : (event.data ?? {});
        } catch {
          return new Response("Invalid data payload", { status: 400 });
        }
        const merchantTradeNo = orderData.merchantTradeNo;
        if (!merchantTradeNo) return new Response("Missing merchantTradeNo", { status: 400 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // Link back to the investor: merchantTradeNo === deposits.id (set on order creation)
        const { data: deposit, error: fetchErr } = await supabaseAdmin
          .from("deposits")
          .select("id, user_id, amount, currency, status")
          .eq("id", merchantTradeNo)
          .maybeSingle();
        if (fetchErr) return new Response("DB error", { status: 500 });
        if (!deposit) return new Response("Order not found", { status: 404 });

        // Idempotent: skip if already approved
        if (deposit.status === "approved") {
          return Response.json({ returnCode: "SUCCESS", returnMessage: null });
        }

        // Amount / currency guard against tampering
        const paidAmount = Number(orderData.totalFee ?? 0);
        if (!Number.isFinite(paidAmount) || Math.abs(paidAmount - Number(deposit.amount)) > 0.01) {
          await supabaseAdmin.from("finance_audit_log").insert({
            action: "binance_webhook_amount_mismatch",
            admin_id: "00000000-0000-0000-0000-000000000000",
            request_id: deposit.id,
            request_kind: "deposit",
            target_user_id: deposit.user_id,
            from_status: deposit.status,
            to_status: deposit.status,
            reason: `Expected ${deposit.amount}, got ${paidAmount}`,
          });
          return new Response("Amount mismatch", { status: 409 });
        }

        const { error: updErr } = await supabaseAdmin
          .from("deposits")
          .update({
            status: "approved",
            method: "binance_pay",
            reference: orderData.transactionId ?? String(event.bizId ?? merchantTradeNo),
          })
          .eq("id", deposit.id);
        if (updErr) return new Response("DB update error", { status: 500 });

        await supabaseAdmin.from("finance_audit_log").insert({
          action: "binance_pay_auto_approved",
          admin_id: "00000000-0000-0000-0000-000000000000",
          request_id: deposit.id,
          request_kind: "deposit",
          target_user_id: deposit.user_id,
          from_status: deposit.status,
          to_status: "approved",
          reason: `Binance txId ${orderData.transactionId ?? event.bizId}`,
        });
        await supabaseAdmin.from("notifications").insert({
          user_id: deposit.user_id,
          title: "تم اعتماد الإيداع",
          body: `تم استلام دفعتك عبر Binance Pay (${paidAmount} ${orderData.currency ?? deposit.currency}) وإضافتها إلى رصيدك.`,
        });

        // Binance Pay expects this ACK shape
        return Response.json({ returnCode: "SUCCESS", returnMessage: null });
      },
    },
  },
});