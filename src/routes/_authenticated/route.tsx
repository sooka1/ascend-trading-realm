import { createFileRoute, Outlet, redirect, useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { NotificationsListener } from "@/components/notifications-listener";
import { OfflineBanner } from "@/components/mobile/offline-banner";

function AuthPending() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-screen items-center justify-center bg-background text-muted-foreground"
    >
      <div className="flex flex-col items-center gap-3">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-gold/30 border-t-gold" aria-hidden />
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold/80">
          جارٍ التحميل…
        </span>
      </div>
    </div>
  );
}

function AuthErrorScreen({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  const offline = typeof navigator !== "undefined" && navigator.onLine === false;
  return (
    <div
      role="alert"
      className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground"
    >
      <div className="max-w-md text-center">
        <h1 className="text-lg font-semibold">
          {offline ? "أنت غير متصل بالإنترنت" : "تعذّر التحقق من الجلسة"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {offline
            ? "أعد الاتصال بالإنترنت للمتابعة."
            : error?.message || "حدث خطأ في المصادقة. حاول مرة أخرى."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            إعادة المحاولة
          </button>
          <a
            href="/auth"
            className="inline-flex items-center justify-center rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            تسجيل الدخول
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  pendingComponent: AuthPending,
  pendingMs: 0,
  errorComponent: AuthErrorScreen,
  beforeLoad: async () => {
    // 15s timeout so a hung network never yields an infinite spinner.
    const timeout = new Promise<never>((_, rej) =>
      setTimeout(() => rej(new Error("انتهت مهلة التحقق من الجلسة")), 15000),
    );
    const { data, error } = await Promise.race([
      supabase.auth.getUser(),
      timeout,
    ]);
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: () => (
    <>
      <NotificationsListener />
      <OfflineBanner />
      <Outlet />
    </>
  ),
});