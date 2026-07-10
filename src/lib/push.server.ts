import webpush from "web-push";

let configured = false;
function configure() {
  if (configured) return;
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subj = process.env.VAPID_SUBJECT || "mailto:admin@example.com";
  if (!pub || !priv) throw new Error("VAPID keys not configured");
  webpush.setVapidDetails(subj, pub, priv);
  configured = true;
}

export type PushRow = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

// Sends a payload to a list of subscriptions. Returns count of successes
// and a list of stale/invalid endpoints to delete.
export async function sendPushToRows(
  rows: PushRow[],
  payload: { title: string; body?: string; url?: string; tag?: string },
): Promise<{ sent: number; failed: number; staleIds: string[] }> {
  configure();
  const body = JSON.stringify(payload);
  const staleIds: string[] = [];
  let sent = 0;
  let failed = 0;
  await Promise.all(
    rows.map(async (r) => {
      try {
        await webpush.sendNotification(
          { endpoint: r.endpoint, keys: { p256dh: r.p256dh, auth: r.auth } },
          body,
          { TTL: 60 * 60 * 24 },
        );
        sent++;
      } catch (e: any) {
        failed++;
        const status = e?.statusCode;
        if (status === 404 || status === 410) staleIds.push(r.id);
      }
    }),
  );
  return { sent, failed, staleIds };
}