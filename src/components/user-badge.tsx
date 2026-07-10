import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { BadgeCheck, User as UserIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type ProfileRow = {
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  verification_status: "unverified" | "pending" | "approved" | "rejected" | null;
};

export function useCurrentProfile() {
  return useQuery({
    queryKey: ["current-profile"],
    queryFn: async (): Promise<ProfileRow | null> => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      const { data } = await supabase
        .from("profiles")
        .select("display_name,email,avatar_url,verification_status")
        .eq("id", u.user.id)
        .maybeSingle();
      return (data as ProfileRow) ?? {
        display_name: null,
        email: u.user.email ?? null,
        avatar_url: null,
        verification_status: "unverified",
      };
    },
    staleTime: 30_000,
  });
}

export function UserBadge({ to = "/portal/profile" }: { to?: string }) {
  const { data } = useCurrentProfile();
  const name = data?.display_name || (data?.email ? data.email.split("@")[0] : "المستخدم");
  const verified = data?.verification_status === "approved";
  const initial = (name || "?").trim().charAt(0).toUpperCase();
  return (
    <Link
      to={to}
      aria-label="الملف الشخصي"
      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-2 py-1 text-xs transition hover:border-gold/40"
    >
      <span className="relative inline-flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border border-gold/30 bg-gold/[0.08] text-[11px] font-semibold text-gold">
        {data?.avatar_url ? (
          // eslint-disable-next-line jsx-a11y/alt-text
          <img src={data.avatar_url} className="h-full w-full object-cover" />
        ) : (
          <UserIcon className="h-3.5 w-3.5" />
        )}
        <span className="sr-only">{initial}</span>
      </span>
      <span className="max-w-[8rem] truncate font-medium text-foreground">{name}</span>
      {verified && (
        <span title="حساب موثّق" className="inline-flex items-center">
          <BadgeCheck className="h-4 w-4 text-gold" />
          <span className="sr-only">موثّق</span>
        </span>
      )}
    </Link>
  );
}