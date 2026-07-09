import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/page-shell";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — HK Investment Management" },
      { name: "description", content: "Terms of service governing use of HK Investment Management's website and platform." },
      { property: "og:title", content: "Terms of Service" },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Terms of Service"
        title={<>Terms of service</>}
        subtitle="Sample terms — please review with qualified counsel before publication."
      />
      <article className="mx-auto max-w-3xl space-y-8 px-4 py-16 text-sm leading-relaxed text-muted-foreground sm:px-6 lg:px-8">
        <Section title="Acceptance of terms">
          By accessing this website or opening an account you agree to these Terms of Service and any additional
          agreements applicable to specific services.
        </Section>
        <Section title="Eligibility & account opening">
          Services are offered subject to eligibility, jurisdictional restrictions and successful KYC/AML verification.
          HK Investment Management may decline or terminate services at its discretion in accordance with law.
        </Section>
        <Section title="No investment advice">
          Content on this website is provided for general information and does not constitute investment, tax or legal
          advice. You should consult qualified professionals before making investment decisions.
        </Section>
        <Section title="Risk">
          Investing involves risk. There is no guarantee that any strategy will achieve its objective. You may lose some
          or all of your invested capital. Past performance is not indicative of future results.
        </Section>
        <Section title="Intellectual property">
          All content on this site is the property of HK Investment Management or its licensors and is protected by
          intellectual property law.
        </Section>
        <Section title="Limitation of liability">
          To the maximum extent permitted by law, HK Investment Management is not liable for indirect, incidental or
          consequential damages arising from use of this site.
        </Section>
        <Section title="Governing law">
          These terms are governed by the laws applicable in the jurisdiction of the service agreement between you and
          HK Investment Management.
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