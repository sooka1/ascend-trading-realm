import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { hasAnyRole } from "@/lib/rbac.functions";
import { PageShell } from "@/components/page-shell";
import { ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/_authenticated/_admin")({
  component: AdminGate,
});

function AdminGate() {
  const check = useServerFn(hasAnyRole);
  const [state, setState] = useState<"loading" | "ok" | "denied">("loading");

  useEffect(() => {
    let cancelled = false;
    check({ data: { roles: ["super_admin", "admin"] } })
      .then((r) => {
        if (!cancelled) setState(r.authorized ? "ok" : "denied");
      })
      .catch(() => !cancelled && setState("denied"));
    return () => {
      cancelled = true;
    };
  }, [check]);

  if (state === "loading") {
    return (
      <PageShell bare>
        <div className="mx-auto max-w-md px-6 py-24 text-center text-sm text-muted-foreground">
          جارٍ التحقق من الصلاحيات…
        </div>
      </PageShell>
    );
  }

  if (state === "denied") {
    return (
      <PageShell bare>
        <div className="mx-auto max-w-md px-6 py-24 text-center">
          <ShieldAlert className="mx-auto h-10 w-10 text-red-400" />
          <h1 className="mt-4 font-display text-2xl font-semibold">وصول مرفوض</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            هذه الصفحة مخصصة للإدارة فقط. لا تملك الصلاحيات الكافية.
          </p>
          <Link
            to="/dashboard"
            className="mt-6 inline-flex rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm hover:border-gold/30"
          >
            العودة إلى لوحة المستثمر
          </Link>
        </div>
      </PageShell>
    );
  }

  return <Outlet />;
}