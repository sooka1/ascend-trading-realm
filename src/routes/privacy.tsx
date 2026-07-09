import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/page-shell";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — HK Investment Management" },
      { name: "description", content: "How HK Investment Management collects, uses and protects your personal information." },
      { property: "og:title", content: "Privacy Policy" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Privacy Policy"
        title={<>Your data, protected.</>}
        subtitle="Sample privacy policy — please review with qualified counsel before publication."
      />
      <article className="mx-auto max-w-3xl space-y-8 px-4 py-16 text-sm leading-relaxed text-muted-foreground sm:px-6 lg:px-8">
        <Section title="Information we collect">
          We collect information you provide when opening an account (identity verification, contact details, financial
          information) and information generated through your use of our services (account activity, portfolio
          transactions, communications).
        </Section>
        <Section title="How we use your information">
          To provide investment services, comply with legal and regulatory obligations (KYC, AML, tax reporting),
          operate and secure our platform, and communicate with you about your account.
        </Section>
        <Section title="How we protect your information">
          Data is encrypted in transit (TLS 1.3) and at rest (AES-256). Access is limited on a least-privilege basis and
          all sensitive operations are logged.
        </Section>
        <Section title="Sharing">
          We share data only with vetted service providers (custodians, brokers, cloud infrastructure, compliance
          vendors) under contract, or where legally required.
        </Section>
        <Section title="Your rights">
          Subject to applicable law you may request access, correction or deletion of your personal information. Please
          contact us via the client portal or the Contact page.
        </Section>
        <Section title="Contact">
          Questions about this policy can be sent through the Contact page.
        </Section>
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