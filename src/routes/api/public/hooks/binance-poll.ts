import { createFileRoute } from "@tanstack/react-router";
import { createHmac } from "crypto";
import { captureServerException } from "@/lib/sentry.server";

// Polls Binance Spot API for recent USDT deposits and matches them against
// pending `deposits` rows by exact unique_amount + network. Auto-approves on
// match. Called by pg_cron every minute.
//
// Docs: https://developers.binance.com/docs/wallet/capital/deposite-history
// GET /sapi/v1/capital/deposit/hisrec — signed (HMAC-SHA256), API-key header

const BINANCE_HOST = "https://api.binance.com";

function sign(query: string, secret: string) {
  return createHmac("sha256", secret).update(query).digest("hex");
}

type BinanceDepositRow = {
  amount: string;
  coin: string;
  network: string;
  status: number; // 6 = credited but cannot withdraw, 1 = success, 0 = pending
  address: string;
  txId: string;
  insertTime: number;
  transferType: number;
  confirmTimes: string;
};

export const Route = createFileRoute("/api/public/hooks/binance-poll")({
  server: {
    handlers: {
      POST: async () => {
        try {
          const apiKey = process.env.BINANCE_API_KEY;
          const apiSecret = process.env.BINANCE_API_SECRET;
          if (!apiKey || !apiSecret) {
            return Response.json(
              { ok: false, error: "Binance API keys not configured" },
              { status: 503 },
            );
          }

          const { supabaseAdmin } = await import(
            "@/integrations/supabase/client.server"
          );

          // First: expire pending deposits past their TTL
          const nowIso = new Date().toISOString();
          await supabaseAdmin
            .from("deposits")
            .update({ status: "expired" })
            .eq("status", "pending")
            .not("expires_at", "is", null)
            .lt("expires_at", nowIso);

          // Ask Binance for deposits in the last 2 hours (covers TTL + buffer)
          const endTime = Date.now();
          const startTime = endTime - 2 * 60 * 60 * 1000;
          const timestamp = Date.now();
          const query = `coin=USDT&status=1&startTime=${startTime}&endTime=${endTime}&timestamp=${timestamp}&recvWindow=10000`;
          const signature = sign(query, apiSecret);
          const url = `${BINANCE_HOST}/sapi/v1/capital/deposit/hisrec?${query}&signature=${signature}`;

          const res = await fetch(url, {
            method: "GET",
            headers: { "X-MBX-APIKEY": apiKey },
          });
          if (!res.ok) {
            const bodyText = await res.text().catch(() => "");
            console.error("[binance-poll] Binance error", res.status, bodyText);
            return Response.json(
              { ok: false, error: `Binance ${res.status}`, body: bodyText.slice(0, 500) },
              { status: 502 },
            );
          }
          const rows = (await res.json()) as BinanceDepositRow[];

          const matched: string[] = [];
          const skipped: string[] = [];

          for (const row of rows) {
            if (row.status !== 1) continue; // only fully credited
            const paidAmount = Number(row.amount);
            if (!Number.isFinite(paidAmount)) continue;
            // Binance returns amounts like "100.47281000" — round to 5 decimals for lookup
            const roundedAmount = Math.round(paidAmount * 100000) / 100000;
            const network = String(row.network || "").toUpperCase();

            // Find matching pending deposit
            const { data: dep } = await supabaseAdmin
              .from("deposits")
              .select("id, user_id, amount, unique_amount, currency, status, network")
              .eq("status", "pending")
              .eq("network", network)
              .eq("unique_amount", roundedAmount)
              .maybeSingle();

            if (!dep) {
              skipped.push(`${roundedAmount}@${network}`);
              continue;
            }

            // Idempotent guard by tx_hash: if this txId is already applied, skip
            if (row.txId) {
              const { data: prior } = await supabaseAdmin
                .from("deposits")
                .select("id")
                .eq("tx_hash", row.txId)
                .maybeSingle();
              if (prior) {
                skipped.push(`dup:${row.txId.slice(0, 10)}`);
                continue;
              }
            }

            const { error: updErr } = await supabaseAdmin
              .from("deposits")
              .update({
                status: "approved",
                tx_hash: row.txId || null,
                reference: row.txId || null,
              })
              .eq("id", dep.id);
            if (updErr) {
              console.error("[binance-poll] update failed", dep.id, updErr);
              continue;
            }

            await supabaseAdmin.from("finance_audit_log").insert({
              action: "binance_spot_auto_approved",
              admin_id: "00000000-0000-0000-0000-000000000000",
              request_id: dep.id,
              request_kind: "deposits",
              target_user_id: dep.user_id,
              from_status: "pending",
              to_status: "approved",
              reason: `Binance Spot txId ${row.txId} · ${paidAmount} ${row.coin} on ${network}`,
            });
            await supabaseAdmin.from("notifications").insert({
              user_id: dep.user_id,
              title: "تم اعتماد الإيداع",
              body: `تم استلام ${paidAmount} USDT (${network}) وإضافة ${dep.amount} USD إلى رصيدك.`,
            });

            matched.push(dep.id);
          }

          return Response.json({
            ok: true,
            checked: rows.length,
            matched: matched.length,
            skipped: skipped.length,
            matchedIds: matched,
          });
        } catch (e) {
          captureServerException(e, { route: "/api/public/hooks/binance-poll" });
          console.error("[binance-poll] fatal", e);
          return Response.json(
            { ok: false, error: (e as Error).message },
            { status: 500 },
          );
        }
      },
    },
  },
});