import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { initSentryClient, captureClientException } from "../lib/sentry-client";
import { I18nProvider } from "../lib/i18n";
import { Toaster } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { installTimezonePatch, loadUserTimezoneFromProfile, setUserTimezone, setUserLocale } from "@/lib/user-timezone";
import { ImpersonationBanner } from "@/components/impersonation-banner";
import { ThemeProvider } from "@/hooks/use-theme";
import { initNativeShell } from "@/lib/native-shell";
import { OfflineBanner } from "@/components/mobile/offline-banner";

function NotFoundComponent() {
  const suggestions: Array<{ to: string; label: string; hint: string }> = [
    { to: "/", label: "الرئيسية", hint: "الصفحة الرئيسية للمنصة" },
    { to: "/portal", label: "بوابة المستثمر", hint: "لوحة القيادة والمحفظة" },
    { to: "/copy-trading", label: "نسخ الصفقات", hint: "استكشاف المتداولين" },
    { to: "/competitions", label: "المسابقات", hint: "التسجيل والمشاركة" },
    { to: "/education", label: "الأكاديمية", hint: "الدورات والمواد" },
    { to: "/contact", label: "الدعم", hint: "تواصل مع الفريق" },
  ];
  return (
    <div
      dir="rtl"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-16"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,theme(colors.amber.500/0.12),transparent_60%)]"
      />
      <div className="relative z-10 mx-auto w-full max-w-2xl rounded-2xl border border-white/10 bg-card/60 p-8 text-center backdrop-blur-xl sm:p-12">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-gold/80">
          Error 404
        </p>
        <h1 className="mt-3 bg-gradient-to-b from-gold to-amber-200 bg-clip-text font-display text-6xl font-bold text-transparent sm:text-7xl">
          404
        </h1>
        <h2 className="mt-4 font-display text-2xl font-semibold text-foreground sm:text-3xl">
          الصفحة غير موجودة
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          الرابط الذي وصلت إليه غير صحيح أو تم نقل الصفحة. يمكنك المتابعة من أحد الروابط أدناه.
        </p>
        <div className="mt-8 grid gap-2 text-right sm:grid-cols-2">
          {suggestions.map((s) => (
            <Link
              key={s.to}
              to={s.to}
              className="group flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 transition hover:-translate-y-0.5 hover:border-gold/40 hover:bg-gold/[0.06]"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-foreground">
                  {s.label}
                </span>
                <span className="block truncate text-[11px] text-muted-foreground">
                  {s.hint}
                </span>
              </span>
              <span className="font-mono text-xs text-gold/70 transition group-hover:text-gold">
                ←
              </span>
            </Link>
          ))}
        </div>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md border border-gold/40 bg-gold/[0.10] px-5 py-2.5 text-sm font-medium text-gold transition hover:border-gold/60 hover:bg-gold/[0.16]"
          >
            العودة إلى الصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    // Report to Sentry AND Lovable capture — each sink dedupes by error
    // reference, so a single error object is never sent twice to either.
    captureClientException(error, { boundary: "tanstack_root_error_component" });
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "HK Investment Management — Professional Portfolio Management" },
      {
        name: "google-site-verification",
        content: "YVyWqXIuzwvX8za5RUQKDEnXp6kCUjSamY_YyOS5GIE",
      },
      {
        name: "description",
        content:
          "Professionally managed investment portfolios across Forex, Gold, Commodities, Indices and Stocks. Disciplined risk management, transparent reporting, secure client portal.",
      },
      { name: "theme-color", content: "#0B1220" },
      { property: "og:title", content: "HK Investment Management — Professional Portfolio Management" },
      {
        property: "og:description",
        content: "Professionally managed investment portfolios across Forex, Gold, Commodities, Indices and Stocks. Disciplined risk management, transparent reporting, secure client portal.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "HK Investment Management" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "HK Investment Management — Professional Portfolio Management" },
      { name: "twitter:description", content: "Professionally managed investment portfolios across Forex, Gold, Commodities, Indices and Stocks. Disciplined risk management, transparent reporting, secure client portal." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/3FIQZ9ScAmeywbcsB5A8g6IHRPQ2/social-images/social-1783688127961-d59af371-98db-4456-a427-ca87dcfbae10.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/3FIQZ9ScAmeywbcsB5A8g6IHRPQ2/social-images/social-1783688127961-d59af371-98db-4456-a427-ca87dcfbae10.webp" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon.png?v=3" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png?v=3" },
      { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png?v=3" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png?v=3" },
      { rel: "manifest", href: "/site.webmanifest?v=3" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&family=IBM+Plex+Mono:wght@400;500;600&display=swap",
      },
    ],
    scripts: [
      {
        async: true,
        src: "https://www.googletagmanager.com/gtag/js?id=G-CDJ9CTFNFL",
      },
      {
        children:
          "window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','G-CDJ9CTFNFL',{send_page_view:false});",
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FinancialService",
          name: "HK Investment Management",
          description:
            "Professionally managed multi-asset portfolios across Forex, Gold, Commodities, Indices and Stocks with disciplined risk controls and transparent reporting.",
          areaServed: "Global",
          serviceType: [
            "Portfolio Management",
            "Investment Management",
            "Wealth Management",
          ],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <HeadContent />
        <script
          // Set the theme class before hydration so light mode doesn't flash.
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('hkex-theme');if(t==='light'){document.documentElement.classList.add('light');document.documentElement.style.colorScheme='light';}else{document.documentElement.classList.add('dark');}}catch(e){}})();",
          }}
        />
      </head>
      <body suppressHydrationWarning>
        {/* I18nProvider wraps the shell so RootComponent, ErrorComponent,
            and NotFoundComponent (all rendered as `children` here) share
            a single, always-mounted i18n context — including during SSR
            and route error/fallback rendering. */}
        <I18nProvider>{children}</I18nProvider>
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    // Initialize Sentry on the client as early as safely possible after mount.
    initSentryClient();
    installTimezonePatch();
    void loadUserTimezoneFromProfile().then(() => {
      // Re-render everything so freshly-loaded locale/timezone reach existing
      // dates rendered during first paint.
      router.invalidate();
      queryClient.invalidateQueries();
    });
    // GA4 SPA page_view tracking — fire on initial load and every route change.
    const sendPageView = () => {
      const g = (window as any).gtag;
      if (typeof g !== "function") return;
      g("event", "page_view", {
        page_path: window.location.pathname + window.location.search,
        page_location: window.location.href,
        page_title: document.title,
      });
    };
    sendPageView();
    const unsubGa = router.subscribe("onResolved", sendPageView);
    // Native mobile shell (Capacitor). No-ops on web.
    void initNativeShell({
      onBack: () => {
        if (window.history.length > 1) {
          window.history.back();
          return true;
        }
        return false;
      },
    });
    // Deep-link / push navigation bridge.
    const onNavigate = (e: Event) => {
      const path = (e as CustomEvent<string>).detail;
      if (typeof path === "string" && path.startsWith("/")) {
        router.navigate({ to: path });
      }
    };
    window.addEventListener("app:navigate", onNavigate);
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      if (event !== "SIGNED_OUT") {
        void loadUserTimezoneFromProfile().then(() => {
          router.invalidate();
          queryClient.invalidateQueries();
        });
      } else {
        setUserTimezone(null);
        setUserLocale(null);
        router.invalidate();
      }
    });
    return () => {
      sub.subscription.unsubscribe();
      unsubGa();
      window.removeEventListener("app:navigate", onNavigate);
    };
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[9999] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none"
          suppressHydrationWarning
        >
          Skip to main content
        </a>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
        <Toaster theme="dark" position="top-right" richColors />
        <ImpersonationBanner />
        <OfflineBanner />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
