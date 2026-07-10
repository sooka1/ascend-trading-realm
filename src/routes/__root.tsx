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
import { I18nProvider } from "../lib/i18n";
import { Toaster } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { installTimezonePatch, loadUserTimezoneFromProfile, setUserTimezone, setUserLocale } from "@/lib/user-timezone";
import { PublicPackagesAside } from "@/components/public-packages-aside";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
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
      { rel: "icon", type: "image/png", href: "/favicon.png?v=2" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon.png?v=2" },
      { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon.png?v=2" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png?v=2" },
      { rel: "manifest", href: "/site.webmanifest?v=2" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&family=IBM+Plex+Mono:wght@400;500;600&display=swap",
      },
    ],
    scripts: [
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
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    installTimezonePatch();
    void loadUserTimezoneFromProfile().then(() => {
      // Re-render everything so freshly-loaded locale/timezone reach existing
      // dates rendered during first paint.
      router.invalidate();
      queryClient.invalidateQueries();
    });
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
    return () => sub.subscription.unsubscribe();
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[9999] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none"
        >
          Skip to main content
        </a>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
        <PublicPackagesAside />
        <Toaster theme="dark" position="top-right" richColors />
      </I18nProvider>
    </QueryClientProvider>
  );
}
