import type { ReactNode } from "react";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { SupportFab } from "./support-fab";

export function PageShell({ children, bare = false }: { children: ReactNode; bare?: boolean }) {
  return (
    <div className="flex min-h-screen flex-col">
      {!bare && <SiteHeader />}
      <main className="flex-1">{children}</main>
      {!bare && <SiteFooter />}
      <SupportFab />
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-white/5">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[var(--gradient-radial)]" aria-hidden />
      <div className="relative mx-auto max-w-5xl px-4 pt-24 pb-16 text-center sm:px-6 lg:px-8">
        {eyebrow && (
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            {eyebrow}
          </span>
        )}
        <h1 className="mt-6 font-display text-4xl font-bold sm:text-5xl md:text-6xl">{title}</h1>
        {subtitle && (
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </section>
  );
}