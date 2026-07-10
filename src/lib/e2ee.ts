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

  // Fetch the account-wide keypair from the server so any browser/device for
  // the same account can decrypt past messages.
  const { data: profile } = await supabase
    .from("profiles")
    .select("public_key, secret_key")
    .eq("id", userId)
    .maybeSingle();

  const serverSecret = (profile as { secret_key?: string | null } | null)?.secret_key ?? null;
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
    // Local key exists but server doesn't have it yet — sync it up.
    publicKey = naclUtil.encodeBase64(
      nacl.box.keyPair.fromSecretKey(naclUtil.decodeBase64(secretKey)).publicKey,
    );
  } else {
    // Brand new account — mint a keypair.
    const raw = nacl.box.keyPair();
    secretKey = naclUtil.encodeBase64(raw.secretKey);
    publicKey = naclUtil.encodeBase64(raw.publicKey);
    localStorage.setItem(LS_KEY(userId), secretKey);
  }

  // Publish/refresh both keys on the profile so other devices can sync.
  if (serverPublic !== publicKey || serverSecret !== secretKey) {
    await supabase
      .from("profiles")
      .update({ public_key: publicKey, secret_key: secretKey } as never)
      .eq("id", userId);
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
  let parsed: { e?: string; n?: string; c?: string };
  try {
    parsed = JSON.parse(s);
  } catch {
    return { ok: false, corrupt: true };
  }
  if (!parsed.e || !parsed.n || !parsed.c) return { ok: false, corrupt: true };
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
  if (!secretKeyB64) return { status: "loading" };
  const a = attemptOne(primary, secretKeyB64);
  if (a.ok) return { status: "ok", text: a.text };
  const b = attemptOne(secondary, secretKeyB64);
  if (b.ok) return { status: "ok", text: b.text };
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