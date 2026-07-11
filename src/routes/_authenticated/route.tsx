import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { NotificationsListener } from "@/components/notifications-listener";

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

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  pendingComponent: AuthPending,
  pendingMs: 0,
  errorComponent: AuthPending,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: () => (
    <>
      <NotificationsListener />
      <Outlet />
    </>
  ),
});