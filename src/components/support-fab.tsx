import { Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";

/** Floating support chat button — links to the authenticated support inbox. */
export function SupportFab() {
  return (
    <Link
      to="/portal/support"
      aria-label="فتح شات الاستفسارات"
      className="group fixed bottom-6 left-6 z-50 flex items-center gap-2 rounded-full border border-primary/30 bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition hover:scale-[1.03] hover:bg-primary/90 active:scale-95"
    >
      <MessageCircle className="h-4 w-4" />
      <span className="hidden sm:inline">استفسارات</span>
      <span className="absolute -top-1 -right-1 flex h-3 w-3">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold/70 opacity-70" />
        <span className="relative inline-flex h-3 w-3 rounded-full bg-gold" />
      </span>
    </Link>
  );
}