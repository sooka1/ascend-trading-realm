import { Component, type ErrorInfo, type ReactNode } from "react";
import { captureClientException } from "@/lib/sentry.client";
import { reportLovableError } from "@/lib/lovable-error-reporting";

interface Props {
  children: ReactNode;
  fallback: (args: { error: Error; reset: () => void }) => ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * App-level React error boundary. Reports to Sentry AND Lovable capture
 * exactly once per error object (dedupe via WeakSet inside each sink).
 * Renders the caller-supplied fallback so UX is unchanged.
 */
export class SentryErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    captureClientException(error, {
      boundary: "app_root",
      componentStack: info.componentStack,
    });
    reportLovableError(error, {
      boundary: "sentry_error_boundary",
      componentStack: info.componentStack,
    });
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return this.props.fallback({ error: this.state.error, reset: this.reset });
    }
    return this.props.children;
  }
}