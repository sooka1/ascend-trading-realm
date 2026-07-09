import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { LogOut, Trophy, Wallet, TrendingUp, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard | HK Global Trading" },
      { name: "description", content: "Your HK Global Trading dashboard: portfolio, competitions, wallet and account." },
    ],
  }),
  component: Dashboard,
});

type Profile = { display_name: string | null; email: string | null; avatar_url: string | null };

function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    (async () => {
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes.user?.id;
      if (!uid) return;
      const { data } = await supabase
        .from("profiles")
        .select("display_name, email, avatar_url")
        .eq("id", uid)
        .maybeSingle();
      setProfile(data);
    })();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  }

  const name = profile?.display_name ?? profile?.email?.split("@")[0] ?? "Trader";

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Welcome back</p>
            <h1 className="font-display text-3xl font-bold md:text-4xl">
              Hello, <span className="text-gradient">{name}</span>
            </h1>
          </div>
          <Button variant="outline" onClick={signOut} className="border-white/15">
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Wallet, label: "Portfolio value", value: "$0.00", hint: "Fund your account to start" },
            { icon: TrendingUp, label: "Open P&L", value: "$0.00", hint: "No open positions" },
            { icon: Trophy, label: "Active competitions", value: "0", hint: "Browse live events" },
            { icon: ShieldCheck, label: "KYC status", value: "Pending", hint: "Complete verification" },
          ].map((s) => (
            <div key={s.label} className="glass rounded-2xl p-5">
              <s.icon className="h-5 w-5 text-gold" />
              <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">{s.label}</p>
              <p className="mt-1 font-display text-2xl font-semibold">{s.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.hint}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="glass-strong rounded-2xl p-6 lg:col-span-2">
            <h2 className="font-display text-xl font-semibold">Next steps</h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-center justify-between rounded-lg bg-white/[0.03] p-3">
                <span>Complete your identity verification (KYC)</span>
                <Button size="sm" variant="ghost">Start</Button>
              </li>
              <li className="flex items-center justify-between rounded-lg bg-white/[0.03] p-3">
                <span>Deposit funds to activate live trading</span>
                <Button size="sm" variant="ghost">Deposit</Button>
              </li>
              <li className="flex items-center justify-between rounded-lg bg-white/[0.03] p-3">
                <span>Register for the next weekly competition</span>
                <Button size="sm" variant="ghost" asChild>
                  <Link to="/competitions">View</Link>
                </Button>
              </li>
            </ul>
          </div>
          <div className="glass rounded-2xl p-6">
            <h2 className="font-display text-xl font-semibold">Account</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Email</dt><dd>{profile?.email ?? "—"}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Name</dt><dd>{profile?.display_name ?? "—"}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Role</dt><dd>Trader</dd></div>
            </dl>
          </div>
        </div>
      </section>
    </PageShell>
  );
}