import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/page-shell";

export const Route = createFileRoute("/legal")({
  head: () => ({
    meta: [
      { title: "Legal & Compliance — HK Investment Management" },
      { name: "description", content: "Legal and compliance information for HK Investment Management, including risk disclosures and regulatory approach." },
      { property: "og:title", content: "Legal & Compliance" },
    ],
  }),
  component: LegalPage,
});

function LegalPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Legal & Compliance"
        title={<>Legal & compliance overview</>}
        subtitle="Sample legal content — please review with qualified counsel before publication."
      />
      <article className="prose-invert mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <Section title="Regulatory approach">
            HK Investment Management operates under applicable regulatory frameworks in the jurisdictions in which it
            provides services. Client onboarding is subject to KYC (Know Your Customer) and AML (Anti-Money Laundering)
            verification. This page is a summary and does not constitute the complete regulatory disclosures for any
            specific jurisdiction.
          </Section>
          <Section title="Risk disclosure">
            Investing involves risk, including the possible loss of principal. Any target returns discussed on this site
            are illustrative and are not guaranteed. Past performance is not indicative of, and does not guarantee,
            future results. Investors should carefully consider their financial objectives, risk tolerance and time
            horizon before making any investment decision.
          </Section>
          <Section title="Client funds & custody">
            Client funds are held in segregated accounts with regulated banking and prime brokerage partners. Assets
            are not commingled with the firm's operational balances.
          </Section>
          <Section title="Conflicts of interest">
            HK Investment Management maintains policies designed to identify, mitigate and disclose conflicts of
            interest. Any material conflict is disclosed to affected clients in accordance with applicable rules.
          </Section>
          <Section title="Complaints & contact">
            Clients may raise concerns via the client portal secure messaging channel or by contacting our compliance
            team through the Contact page. We aim to acknowledge complaints promptly and provide a substantive response
            within regulatory timeframes.
          </Section>
          <p className="text-xs">
            This content is provided for general information only and does not constitute investment, legal or tax
            advice.
          </p>
        </div>
      </article>
    </PageShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-2xl font-semibold text-foreground">{title}</h2>
      <p className="mt-3">{children}</p>
    </section>
  );
}