import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { HKLogo } from "@/components/hk-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ShieldCheck, Trophy, Zap } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Log in or open an account | HK Global Trading" },
      { name: "description", content: "Log in to your HK Global Trading account or open a new one in under 5 minutes." },
      { property: "og:title", content: "HK Global Trading — Sign in" },
      { property: "og:description", content: "Access your trading terminal and competitions dashboard." },
    ],
  }),
  component: Auth,
});

function Auth() {
  const [mode, setMode] = useState<"login" | "register">("login");
  return (
    <PageShell>
      <section className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="hidden flex-col justify-between lg:flex">
          <Link to="/"><HKLogo size="lg" /></Link>
          <div>
            <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl">
              Welcome to the <span className="text-gradient">global trading floor.</span>
            </h1>
            <p className="mt-4 max-w-md text-muted-foreground">
              One account. Every market. Real prize pools. Join more than 2 million traders competing on HK.
            </p>
            <div className="mt-8 grid gap-3">
              {[
                { icon: Zap, label: "Sub-20ms execution across 10,000+ instruments" },
                { icon: Trophy, label: "Enter live competitions from your dashboard" },
                { icon: ShieldCheck, label: "Segregated funds, multi-jurisdiction regulation" },
              ].map((f) => (
                <div key={f.label} className="glass flex items-center gap-3 rounded-xl p-3 text-sm">
                  <f.icon className="h-4 w-4 text-gold" />
                  {f.label}
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} HK Global Trading</p>
        </div>

        <div className="mx-auto flex w-full max-w-md items-center">
          <div className="glass-strong w-full rounded-3xl p-8">
            <div className="mb-6 flex lg:hidden"><Link to="/"><HKLogo /></Link></div>
            <div className="grid grid-cols-2 gap-1 rounded-lg bg-white/[0.03] p-1">
              {(["login", "register"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={cn(
                    "rounded-md py-2 text-sm font-medium capitalize transition",
                    mode === m ? "bg-[var(--gradient-brand)] text-white" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {m === "login" ? "Log in" : "Open account"}
                </button>
              ))}
            </div>

            <form
              className="mt-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                alert("Authentication comes online in the next phase.");
              }}
            >
              {mode === "register" && (
                <div>
                  <Label htmlFor="fullname">Full name</Label>
                  <Input id="fullname" placeholder="Alex Rivera" className="mt-1.5 bg-white/5" required />
                </div>
              )}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" className="mt-1.5 bg-white/5" required />
              </div>
              <div>
                <Label htmlFor="pw">Password</Label>
                <Input id="pw" type="password" placeholder="••••••••" className="mt-1.5 bg-white/5" required />
              </div>
              <Button type="submit" className="w-full bg-[var(--gradient-brand)] text-white shadow-[var(--shadow-glow)]">
                {mode === "login" ? "Log in" : "Create account"}
              </Button>

              <div className="relative py-2 text-center text-xs text-muted-foreground">
                <span className="relative z-10 bg-transparent px-2">or continue with</span>
                <div className="absolute inset-x-0 top-1/2 h-px bg-white/10" aria-hidden />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button type="button" variant="outline" className="border-white/15 bg-white/5">Google</Button>
                <Button type="button" variant="outline" className="border-white/15 bg-white/5">Apple</Button>
              </div>

              <p className="pt-2 text-center text-xs text-muted-foreground">
                By continuing you agree to our Terms and Privacy Policy.
              </p>
            </form>
          </div>
        </div>
      </section>
    </PageShell>
  );
}