import { reportLovableError } from "@/lib/lovable-error-reporting";

// Global mobile-safe error trap. Prevents an unhandled error in a
// non-critical listener from tearing the app down or clearing the
// Supabase session. React error boundaries still catch render errors
// separately — this catches the async / event-handler tail.

let installed = false;

export function initCrashHandler() {
  if (installed || typeof window === "undefined") return;
  installed = true;

  window.addEventListener("error", (ev) => {
    try { reportLovableError(ev.error ?? ev.message, { source: "window.error" }); } catch {}
  });

  window.addEventListener("unhandledrejection", (ev) => {
    // Swallow so runtime doesn't abort; log for observability.
    try { reportLovableError(ev.reason, { source: "unhandledrejection" }); } catch {}
    ev.preventDefault?.();
  });
}