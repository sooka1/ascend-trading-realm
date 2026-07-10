import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRouter } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Snapshot = { access_token: string; refresh_token: string; email: string };
const KEY = "hk_impersonation_original";

export function ImpersonationBanner() {
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const qc = useQueryClient();

  useEffect(() => {
    const read = () => {
      try {
        const raw = localStorage.getItem(KEY);
        setSnap(raw ? (JSON.parse(raw) as Snapshot) : null);
      } catch {
        setSnap(null);
      }
    };
    read();
    void supabase.auth.getUser().then(({ data }) => setCurrentEmail(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setCurrentEmail(s?.user?.email ?? null);
      read();
    });
    const onStorage = (e: StorageEvent) => { if (e.key === KEY) read(); };
    window.addEventListener("storage", onStorage);
    return () => {
      sub.subscription.unsubscribe();
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  if (!snap) return null;

  async function restore() {
    if (!snap) return;
    setBusy(true);
    try {
      const { error } = await supabase.auth.setSession({
        access_token: snap.access_token,
        refresh_token: snap.refresh_token,
      });
      if (error) throw error;
      localStorage.removeItem(KEY);
      qc.clear();
      toast.success("عدت إلى حسابك");
      await router.navigate({ to: "/admin/users" });
      router.invalidate();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-x-0 top-0 z-[9998] flex items-center justify-center gap-3 bg-amber-500/95 px-4 py-2 text-sm text-black shadow-lg">
      <span>
        وضع الانتحال: أنت متصل كـ <b>{currentEmail ?? "..."}</b> — حسابك الأصلي: <b>{snap.email}</b>
      </span>
      <button
        onClick={restore}
        disabled={busy}
        className="rounded-md bg-black/90 px-3 py-1 text-xs font-semibold text-amber-200 hover:bg-black disabled:opacity-50"
      >
        {busy ? "..." : "العودة إلى حسابي"}
      </button>
    </div>
  );
}
