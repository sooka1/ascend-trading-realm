import { PortalCard } from "@/components/portal-shell";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";

export function PortalEmpty({
  icon: Icon = Sparkles,
  title,
  description,
  bullets,
  children,
}: {
  icon?: LucideIcon;
  title: string;
  description: string;
  bullets?: string[];
  children?: ReactNode;
}) {
  return (
    <PortalCard title={title} icon={Icon}>
      <p className="text-sm text-muted-foreground">{description}</p>
      {bullets && (
        <ul className="mt-4 grid gap-2 md:grid-cols-2">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-2 rounded-md border border-white/5 bg-white/[0.02] p-3 text-sm">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
      {children && <div className="mt-4">{children}</div>}
      <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/[0.06] px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-gold">
        <span className="h-1.5 w-1.5 rounded-full bg-gold" /> قيد الإطلاق قريبًا
      </div>
    </PortalCard>
  );
}