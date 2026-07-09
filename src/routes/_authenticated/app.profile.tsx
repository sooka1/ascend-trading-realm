import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ChevronRight, FileText, LayoutDashboard, LogOut, Mail, MessageSquare, ShieldCheck, User as UserIcon } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/profile")({
  head: () => ({ meta: [{ title: "الملف الشخصي — HK Invest" }] }),
  component: ProfileMobile,
});

function ProfileMobile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ display_name: string | null; email: string | null } | null>(null);
  useEffect(() => {
    (async () => {
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes.user?.id;
      if (!uid) return;
      const { data } = await supabase.from("profiles").select("display_name, email").eq("id", uid).maybeSingle();
      setProfile(data);
    })();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    toast.success("تم تسجيل الخروج");
    navigate({ to: "/auth", replace: true });
  }

  const name = profile?.display_name ?? profile?.email?.split("@")[0] ?? "مستثمر";
  const rows = [
    { icon: LayoutDashboard, label: "لوحة التحكم الكاملة", to: "/dashboard" as const },
    { icon: FileText, label: "الكشوف والتقارير", to: "/portal" as const },
    { icon: MessageSquare, label: "الرسائل الآمنة", to: "/portal" as const },
    { icon: ShieldCheck, label: "الأمان والخصوصية", to: "/privacy" as const },
  ];
  return (
    <div className="px-4 pt-6">
      <div className="flex items-center gap-4 rounded-3xl border border-white/10 bg-[color:var(--surface)] p-5">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-[var(--gradient-brand)] text-lg font-semibold text-white">
          {name.slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-lg font-semibold">{name}</p>
          <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
            <Mail className="h-3 w-3" /> {profile?.email ?? "—"}
          </p>
        </div>
      </div>

      <ul className="mt-5 divide-y divide-white/5 rounded-2xl border border-white/10 bg-[color:var(--surface)]">
        {rows.map((r) => (
          <li key={r.label}>
            <Link to={r.to} className="flex items-center gap-3 p-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gold/10 text-gold">
                <r.icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1 text-sm font-medium">{r.label}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </li>
        ))}
      </ul>

      <Button onClick={signOut} variant="outline" className="mt-5 w-full border-white/15">
        <LogOut className="mr-2 h-4 w-4" /> تسجيل الخروج
      </Button>

      <p className="mt-6 flex items-center justify-center gap-1 text-[10px] uppercase tracking-widest text-muted-foreground">
        <UserIcon className="h-3 w-3" /> HK Investment Management · v1.0
      </p>
    </div>
  );
}