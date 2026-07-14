import { useCallback, useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Fingerprint, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { biometricAuthenticate, isBiometricAvailable, markActivity, shouldAutoLock } from "@/lib/native/biometric";
import { biometricPrefs } from "@/lib/native/biometric-prefs";

// Renders a full-screen biometric lock over the authenticated app when:
//   1. Running inside the Capacitor native shell.
//   2. The user enabled "app-open lock" in settings.
//   3. Either the app just started or auto-lock inactivity elapsed while
//      the app was backgrounded.
// On web/preview it is inert — biometrics are hardware-bound and never fire.
export function AppLockGate({ children }: { children: React.ReactNode }) {
  const [locked, setLocked] = useState<boolean>(() => Capacitor.isNativePlatform());
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  const attemptUnlock = useCallback(async () => {
    setBusy(true);
    const ok = await biometricAuthenticate("افتح HKEX");
    if (ok) {
      await markActivity();
      setLocked(false);
    }
    setBusy(false);
  }, []);

  // Decide on mount whether we need to lock at all.
  useEffect(() => {
    (async () => {
      if (!Capacitor.isNativePlatform() || !biometricPrefs.appLockEnabled()) {
        setLocked(false);
        setReady(true);
        return;
      }
      const { available } = await isBiometricAvailable();
      if (!available) {
        // Hardware unavailable → don't strand the user; treat as unlocked.
        setLocked(false);
        setReady(true);
        return;
      }
      setReady(true);
      void attemptUnlock();
    })();
  }, [attemptUnlock]);

  // Re-lock on resume after the configured inactivity window.
  useEffect(() => {
    if (!Capacitor.isNativePlatform() || !biometricPrefs.appLockEnabled()) return;
    const onVis = async () => {
      if (document.visibilityState !== "visible") return;
      if (await shouldAutoLock()) {
        setLocked(true);
        void attemptUnlock();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [attemptUnlock]);

  if (!ready) return <>{children}</>;
  if (!locked) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-background/95 backdrop-blur-lg text-center">
      <div className="grid h-20 w-20 place-items-center rounded-full bg-[var(--gradient-brand)] shadow-[var(--shadow-glow)]">
        <Fingerprint className="h-10 w-10 text-white" />
      </div>
      <div className="max-w-xs px-4">
        <h1 className="font-display text-xl font-semibold">التطبيق مقفل</h1>
        <p className="mt-2 text-sm text-muted-foreground">استخدم البصمة أو Face ID لفتح HKEX.</p>
      </div>
      <Button onClick={() => void attemptUnlock()} disabled={busy} className="min-w-40">
        {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Fingerprint className="mr-2 h-4 w-4" />}
        فتح
      </Button>
    </div>
  );
}