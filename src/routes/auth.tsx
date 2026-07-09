import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { HKLogo } from "@/components/hk-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ShieldCheck, Trophy, Zap, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in");
        navigate({ to: "/dashboard", replace: true });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { display_name: fullName },
          },
        });
        if (error) throw error;
        toast.success("Account created — check your email to confirm, then sign in.");
        setMode("login");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error(result.error.message ?? "Google sign-in failed");
        return;
      }
      if (result.redirected) return; // browser navigates away
      // Popup / web_message flow: session is set — go to dashboard
      navigate({ to: "/dashboard", replace: true });
    } finally {
      setLoading(false);
    }
  }

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
              onSubmit={handleSubmit}
            >
              {mode === "register" && (
                <div>
                  <Label htmlFor="fullname">Full name</Label>
                  <Input
                    id="fullname"
                    placeholder="Alex Rivera"
                    className="mt-1.5 bg-white/5"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              )}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="mt-1.5 bg-white/5"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <Label htmlFor="pw">Password</Label>
                <Input
                  id="pw"
                  type="password"
                  placeholder="••••••••"
                  className="mt-1.5 bg-white/5"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[var(--gradient-brand)] text-white shadow-[var(--shadow-glow)]"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === "login" ? "Log in" : "Create account"}
              </Button>

              <div className="relative py-2 text-center text-xs text-muted-foreground">
                <span className="relative z-10 bg-transparent px-2">or continue with</span>
                <div className="absolute inset-x-0 top-1/2 h-px bg-white/10" aria-hidden />
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleGoogle}
                disabled={loading}
                className="w-full border-white/15 bg-white/5"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden>
                  <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.24 1.4-1.66 4.1-5.4 4.1-3.25 0-5.9-2.7-5.9-6s2.65-6 5.9-6c1.85 0 3.09.79 3.8 1.47l2.6-2.5C16.83 3.7 14.7 2.7 12 2.7 6.9 2.7 2.8 6.8 2.8 12s4.1 9.3 9.2 9.3c5.31 0 8.83-3.73 8.83-8.99 0-.6-.07-1.06-.15-1.51H12z"/>
                </svg>
                Continue with Google
              </Button>

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