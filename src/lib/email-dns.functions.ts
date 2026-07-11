import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SENDER_DOMAIN = "notify.hkexinvest.com";
const ROOT_DOMAIN = "hkexinvest.com";
// Common DKIM selectors used by Lovable-managed sending — we probe each.
const DKIM_SELECTORS = ["lovable", "lovable1", "lovable2", "mail", "default", "s1", "s2"];

type DohAnswer = { name: string; type: number; TTL: number; data: string };
type DohResp = { Status: number; Answer?: DohAnswer[] };

async function dohQuery(name: string, type: "TXT" | "MX" | "NS"): Promise<string[]> {
  const url = `https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${type}`;
  try {
    const res = await fetch(url, { headers: { accept: "application/dns-json" } });
    if (!res.ok) return [];
    const json = (await res.json()) as DohResp;
    if (!json.Answer) return [];
    return json.Answer
      .filter((a) => (type === "TXT" ? a.type === 16 : type === "MX" ? a.type === 15 : a.type === 2))
      .map((a) => a.data.replace(/^"|"$/g, "").replace(/"\s*"/g, ""));
  } catch {
    return [];
  }
}

export const checkEmailDns = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isSuper } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "super_admin",
    });
    if (!isSuper) throw new Error("Forbidden");

    const [senderTxt, senderMx, senderNs, rootDmarc, senderDmarc] = await Promise.all([
      dohQuery(SENDER_DOMAIN, "TXT"),
      dohQuery(SENDER_DOMAIN, "MX"),
      dohQuery(SENDER_DOMAIN, "NS"),
      dohQuery(`_dmarc.${ROOT_DOMAIN}`, "TXT"),
      dohQuery(`_dmarc.${SENDER_DOMAIN}`, "TXT"),
    ]);

    const spf = senderTxt.find((r) => r.toLowerCase().startsWith("v=spf1")) || null;
    const dmarc =
      senderDmarc.find((r) => r.toLowerCase().startsWith("v=dmarc1")) ||
      rootDmarc.find((r) => r.toLowerCase().startsWith("v=dmarc1")) ||
      null;

    // Probe DKIM selectors in parallel.
    const dkimResults = await Promise.all(
      DKIM_SELECTORS.map(async (sel) => {
        const txt = await dohQuery(`${sel}._domainkey.${SENDER_DOMAIN}`, "TXT");
        const rec = txt.find((r) => r.toLowerCase().includes("v=dkim1"));
        return rec ? { selector: sel, record: rec } : null;
      }),
    );
    const dkim = dkimResults.filter((x): x is { selector: string; record: string } => !!x);

    return {
      senderDomain: SENDER_DOMAIN,
      rootDomain: ROOT_DOMAIN,
      ns: senderNs,
      mx: senderMx,
      spf,
      dmarc,
      dkim,
      checkedAt: new Date().toISOString(),
    };
  });