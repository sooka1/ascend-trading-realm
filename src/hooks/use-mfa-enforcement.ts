import { useEffect } from "react";
import { useRouter, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Enforces mandatory MFA enrollment for every authenticated user.
// If the signed-in user has no verified TOTP factor, redirect to /portal/mfa.
export function useMfaEnforcement() {
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    let cancelled = false;
    if (pathname === "/portal/mfa") return;
    (async () => {
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user || cancelled) return;
      const { data } = await supabase.auth.mfa.listFactors();
      const verified = (data?.totp ?? []).some((f) => f.status === "verified");
      if (!verified && !cancelled) {
        toast.warning("المصادقة الثنائية إلزامية — يرجى تفعيلها للمتابعة");
        router.navigate({ to: "/portal/mfa", replace: true });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);
}