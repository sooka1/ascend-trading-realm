import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getMyRoles, type AppRole } from "@/lib/rbac.functions";

export function useRoles() {
  const fetchRoles = useServerFn(getMyRoles);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchRoles()
      .then((r) => {
        if (!cancelled) setRoles(r.roles);
      })
      .catch(() => !cancelled && setRoles([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [fetchRoles]);

  const has = (role: AppRole) => roles.includes(role);
  const hasAny = (list: AppRole[]) => list.some((r) => roles.includes(r));
  const isAdmin = hasAny(["admin", "super_admin"]);
  const isStaff = hasAny([
    "admin",
    "super_admin",
    "portfolio_manager",
    "compliance_officer",
    "finance",
    "support",
  ]);

  return { roles, loading, has, hasAny, isAdmin, isStaff };
}