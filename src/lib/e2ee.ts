import nacl from "tweetnacl";
import naclUtil from "tweetnacl-util";
import { supabase } from "@/integrations/supabase/client";

// End-to-end encryption for chat messages between a client and the super admin.
// - Each user has an X25519 keypair. Public key lives in profiles.public_key;
//   the secret key never leaves the browser (localStorage per user id).
// - Every message is stored as TWO ciphertexts (one per recipient) so both
//   sides can decrypt their own copy. The server only sees ciphertext.

const LS_KEY = (uid: string) => `hk_e2ee_sk_${uid}`;

export type KeyPair = { publicKey: string; secretKey: string };

export async function ensureMyKeypair(userId: string): Promise<KeyPair> {
  let secretKey = localStorage.getItem(LS_KEY(userId));
  let publicKey: string;

  // Public key lives on `profiles` (readable by counterparties).
  // Private key lives on `profile_keys` (owner-only via RLS) so admins
  // and other users can never read it.
  const { data: profile } = await supabase
    .from("profiles")
    .select("public_key")
    .eq("id", userId)
    .maybeSingle();
  const { data: keyRow } = await supabase
    .from("profile_keys")
    .select("secret_key")
    .eq("user_id", userId)
    .maybeSingle();

  const serverSecret = keyRow?.secret_key ?? null;
  const serverPublic = profile?.public_key ?? null;

  if (serverSecret) {
    // Server copy wins — this is the source of truth across browsers.
    secretKey = serverSecret;
    publicKey =
      serverPublic ??
      naclUtil.encodeBase64(
        nacl.box.keyPair.fromSecretKey(naclUtil.decodeBase64(serverSecret)).publicKey,
      );
    localStorage.setItem(LS_KEY(userId), secretKey);
  } else if (secretKey) {
    // Local key exists but server doesn't have it yet — sync it up
    // ONLY if it matches the server's advertised public key (or none yet).
    publicKey = naclUtil.encodeBase64(
      nacl.box.keyPair.fromSecretKey(naclUtil.decodeBase64(secretKey)).publicKey,
    );
    if (serverPublic && serverPublic !== publicKey) {
      // A different device owns this account's real key. Do NOT overwrite
      // the server public_key — that would break the other browser.
      // Wait until the original device logs in and uploads its secret_key.
      return { publicKey: serverPublic, secretKey: "" };
    }
  } else {
    // No local key and no server secret. If the server already has a
    // public_key from a previous device, do NOT mint a new one — that would
    // silently rotate the account's key and break past messages. Wait for
    // the original device to sync its secret_key up.
    if (serverPublic) {
      return { publicKey: serverPublic, secretKey: "" };
    }
    // Brand new account — mint a keypair.
    const raw = nacl.box.keyPair();
    secretKey = naclUtil.encodeBase64(raw.secretKey);
    publicKey = naclUtil.encodeBase64(raw.publicKey);
    localStorage.setItem(LS_KEY(userId), secretKey);
  }

  // Publish/refresh keys so other devices can sync.
  if (serverPublic !== publicKey) {
    await supabase.from("profiles").update({ public_key: publicKey }).eq("id", userId);
  }
  if (serverSecret !== secretKey) {
    await supabase
      .from("profile_keys")
      .upsert({ user_id: userId, secret_key: secretKey }, { onConflict: "user_id" });
  }
  return { publicKey, secretKey };
}

export function encryptFor(recipientPubB64: string, plaintext: string): string {
  const eph = nacl.box.keyPair();
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const cipher = nacl.box(
    naclUtil.decodeUTF8(plaintext),
    nonce,
    naclUtil.decodeBase64(recipientPubB64),
    eph.secretKey,
  );
  return JSON.stringify({
    e: naclUtil.encodeBase64(eph.publicKey),
    n: naclUtil.encodeBase64(nonce),
    c: naclUtil.encodeBase64(cipher),
  });
}

export function tryDecrypt(cipherStr: string | null | undefined, secretKeyB64: string): string | null {
  if (!cipherStr) return null;
  try {
    const p = JSON.parse(cipherStr) as { e: string; n: string; c: string };
    if (!p.e || !p.n || !p.c) return null;
    const opened = nacl.box.open(
      naclUtil.decodeBase64(p.c),
      naclUtil.decodeBase64(p.n),
      naclUtil.decodeBase64(p.e),
      naclUtil.decodeBase64(secretKeyB64),
    );
    return opened ? naclUtil.encodeUTF8(opened) : null;
  } catch {
    return null;
  }
}

// Rich decryption result — lets the UI distinguish "still loading key",
// "not for this device", "malformed", vs a successful decrypt.
export type DecryptResult =
  | { status: "ok"; text: string }
  | { status: "loading" } // secret key not ready yet
  | { status: "not-for-me" } // valid ciphertext but our key doesn't open it
  | { status: "corrupt" } // unparseable / malformed
  | { status: "empty" }; // no ciphertext at all

function attemptOne(
  s: string | null | undefined,
  secretKeyB64: string,
): { ok: true; text: string } | { ok: false; corrupt: boolean } {
  if (!s) return { ok: false, corrupt: false };
  // Plaintext fallback: if the body isn't a JSON ciphertext envelope,
  // treat it as plain text so admins/users can read messages without a key.
  const trimmed = s.trim();
  if (!trimmed.startsWith("{")) {
    return { ok: true, text: s };
  }
  let parsed: { e?: string; n?: string; c?: string };
  try {
    parsed = JSON.parse(s);
  } catch {
    return { ok: true, text: s };
  }
  if (!parsed.e || !parsed.n || !parsed.c) {
    return { ok: true, text: s };
  }
  if (!secretKeyB64) return { ok: false, corrupt: false };
  try {
    const opened = nacl.box.open(
      naclUtil.decodeBase64(parsed.c),
      naclUtil.decodeBase64(parsed.n),
      naclUtil.decodeBase64(parsed.e),
      naclUtil.decodeBase64(secretKeyB64),
    );
    if (!opened) return { ok: false, corrupt: false };
    return { ok: true, text: naclUtil.encodeUTF8(opened) };
  } catch {
    return { ok: false, corrupt: true };
  }
}

export function decryptChatBody(
  primary: string | null | undefined,
  secondary: string | null | undefined,
  secretKeyB64: string | null,
): DecryptResult {
  if (!primary && !secondary) return { status: "empty" };
  const key = secretKeyB64 ?? "";
  const a = attemptOne(primary, key);
  if (a.ok) return { status: "ok", text: a.text };
  const b = attemptOne(secondary, key);
  if (b.ok) return { status: "ok", text: b.text };
  if (!secretKeyB64) return { status: "loading" };
  const anyValid = (primary && !a.corrupt) || (secondary && !b.corrupt);
  return anyValid ? { status: "not-for-me" } : { status: "corrupt" };
}

export async function getSuperAdminPublicKey(): Promise<string | null> {
  const { data, error } = await supabase.rpc("get_super_admin_public_key");
  if (error) return null;
  return (data as string | null) ?? null;
}

export async function getTicketOwnerPublicKey(ticketId: string): Promise<string | null> {
  const { data, error } = await supabase.rpc("get_ticket_owner_public_key", {
    _ticket_id: ticketId,
  });
  if (error) return null;
  return (data as string | null) ?? null;
}

// Convenience: prepare the two ciphertext copies for a chat message.
// - mine    → stored in body       (the sender/owner reads this back)
// - theirs  → stored in body_admin (the counterparty reads this)
// The caller picks which key goes where based on the ticket owner.
export function encryptForBoth(
  ownerPubB64: string,
  adminPubB64: string,
  plaintext: string,
): { body: string; body_admin: string } {
  return {
    body: encryptFor(ownerPubB64, plaintext),
    body_admin: encryptFor(adminPubB64, plaintext),
  };
}

// Self-test: try to decrypt the user's most recent chat messages to confirm
// the current device's secret key is the right one for this account.
export type DecryptCheck =
  | { status: "no-messages" }
  | { status: "no-key" }
  | { status: "ok"; total: number }
  | { status: "partial"; ok: number; total: number }
  | { status: "failed"; total: number };

export async function verifyDecryption(
  userId: string,
  secretKeyB64: string | null,
  limit = 200,
): Promise<DecryptCheck> {
  const { data: tickets } = await supabase
    .from("support_tickets")
    .select("id")
    .eq("user_id", userId);
  const ids = (tickets ?? []).map((t) => t.id);
  if (ids.length === 0) return { status: "no-messages" };
  const { data: msgs } = await supabase
    .from("ticket_messages")
    .select("body, body_admin")
    .in("ticket_id", ids)
    .order("created_at", { ascending: false })
    .limit(limit);
  const rows = (msgs ?? []).filter((m) => m.body || m.body_admin);
  if (rows.length === 0) return { status: "no-messages" };
  if (!secretKeyB64) return { status: "no-key" };
  let ok = 0;
  for (const m of rows) {
    const r = decryptChatBody(m.body, m.body_admin, secretKeyB64);
    if (r.status === "ok") ok++;
  }
  if (ok === rows.length) return { status: "ok", total: rows.length };
  if (ok === 0) return { status: "failed", total: rows.length };
  return { status: "partial", ok, total: rows.length };
}

// Admin variant: verify decryption across ALL ticket messages visible to
// the admin (RLS allows super_admin to read every ticket_messages row).
// For each message we try body first, then body_admin — one of them must
// open with the admin's secret key.
export async function verifyAdminDecryption(
  secretKeyB64: string | null,
  limit = 200,
): Promise<DecryptCheck> {
  const { data: msgs } = await supabase
    .from("ticket_messages")
    .select("body, body_admin")
    .order("created_at", { ascending: false })
    .limit(limit);
  const rows = (msgs ?? []).filter((m) => m.body || m.body_admin);
  if (rows.length === 0) return { status: "no-messages" };
  if (!secretKeyB64) return { status: "no-key" };
  let ok = 0;
  for (const m of rows) {
    const r = decryptChatBody(m.body, m.body_admin, secretKeyB64);
    if (r.status === "ok") ok++;
  }
  if (ok === rows.length) return { status: "ok", total: rows.length };
  if (ok === 0) return { status: "failed", total: rows.length };
  return { status: "partial", ok, total: rows.length };
}