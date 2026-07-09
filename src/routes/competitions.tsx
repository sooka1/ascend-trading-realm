import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, Calendar, Trophy, Users } from "lucide-react";
import { PageShell, PageHero } from "@/components/page-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/competitions")({
  head: () => ({
    meta: [
      { title: "Trading Competitions — Compete for real prizes | HK Global" },
      { name: "description", content: "Live trading tournaments with six-figure prize pools. Register, climb the leaderboard, earn badges and win real prizes." },
      { property: "og:title", content: "HK Trading Competitions" },
      { property: "og:description", content: "Compete against the world's best traders. Real prizes. Live leaderboards." },
    ],
  }),
  component: Competitions,
});

function Competitions() {
  const live = [
    { title: "King of Wall Street", pool: "$100,000", entries: "1,842", ends: "12d 4h", type: "Monthly" },
    { title: "Crypto Gladiator", pool: "$50,000", entries: "612", ends: "3d 8h", type: "Weekly" },
  ];
  const upcoming = [
    { title: "Forex Masters Cup", pool: "$25,000", starts: "Fri, 9:00 UTC", type: "Bi-weekly" },
    { title: "Rookie Rumble", pool: "$5,000", starts: "Mon, 12:00 UTC", type: "Beginner" },
    { title: "Gold Sprint", pool: "$15,000", starts: "Wed, 14:00 UTC", type: "24h" },
  ];
  const finished = [
    { title: "Q1 Global Championship", pool: "$500,000", winner: "Alexei V. · 🇦🇪" },
    { title: "Nasdaq Showdown", pool: "$75,000", winner: "Priya M. · 🇸🇬" },
  ];
  return (
    <PageShell>
      <PageHero
        eyebrow="Competitions"
        title={<>Live tournaments. <span className="text-gradient">Real prizes.</span></>}
        subtitle="Enter free and paid competitions across forex, crypto, indices and stocks. Climb the live leaderboard and win six-figure prize pools."
      />

      <section className="mx-auto max-w-7xl space-y-16 px-4 py-16 sm:px-6 lg:px-8">
        <Group icon={Trophy} title="Live now" tint="gold">
          <div className="grid gap-4 md:grid-cols-2">
            {live.map((c) => (
              <div key={c.title} className="glass-strong relative overflow-hidden rounded-2xl p-6">
                <div className="absolute inset-x-0 top-0 h-px bg-[var(--gradient-brand)]" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 uppercase tracking-widest">{c.type}</span>
                  <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" />{c.entries} traders</span>
                </div>
                <h3 className="mt-4 font-display text-2xl font-bold">{c.title}</h3>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">Prize pool</div>
                    <div className="mt-1 font-display text-2xl font-bold text-gradient">{c.pool}</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">Ends in</div>
                    <div className="mt-1 font-display text-2xl font-bold tabular-nums">{c.ends}</div>
                  </div>
                </div>
                <Button asChild className="mt-6 w-full bg-[var(--gradient-brand)] text-white"><Link to="/auth">Enter competition</Link></Button>
              </div>
            ))}
          </div>
        </Group>

        <Group icon={Calendar} title="Upcoming" tint="blue">
          <div className="grid gap-4 md:grid-cols-3">
            {upcoming.map((c) => (
              <div key={c.title} className="glass rounded-2xl p-6">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">{c.type}</div>
                <h3 className="mt-2 font-display text-xl font-semibold">{c.title}</h3>
                <div className="mt-4 font-display text-2xl font-bold text-gradient">{c.pool}</div>
                <div className="mt-1 text-sm text-muted-foreground">Starts {c.starts}</div>
                <Button asChild variant="outline" className="mt-5 w-full border-white/15 bg-white/5"><Link to="/auth">Register</Link></Button>
              </div>
            ))}
          </div>
        </Group>

        <Group icon={Award} title="Recent winners" tint="gold">
          <div className="glass-strong overflow-hidden rounded-2xl">
            {finished.map((f, i) => (
              <div key={f.title} className={`flex items-center justify-between p-5 ${i > 0 ? "border-t border-white/5" : ""}`}>
                <div>
                  <div className="font-display text-lg font-semibold">{f.title}</div>
                  <div className="text-sm text-muted-foreground">Winner: {f.winner}</div>
                </div>
                <div className="font-display text-xl text-gold">{f.pool}</div>
              </div>
            ))}
          </div>
        </Group>
      </section>
    </PageShell>
  );
}

function Group({ icon: Icon, title, tint, children }: { icon: typeof Trophy; title: string; tint: "gold" | "blue"; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className={`grid h-10 w-10 place-items-center rounded-xl ${tint === "gold" ? "bg-gold/15" : "bg-brand-blue/15"}`}>
          <Icon className={`h-5 w-5 ${tint === "gold" ? "text-gold" : "text-brand-blue"}`} />
        </div>
        <h2 className="font-display text-2xl font-bold sm:text-3xl">{title}</h2>
      </div>
      {children}
    </div>
  );
}