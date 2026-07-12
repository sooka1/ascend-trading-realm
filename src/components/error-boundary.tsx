import { Component, type ReactNode } from "react";
import { reportLovableError } from "@/lib/lovable-error-reporting";

// Lightweight route-scoped error boundary. Use inside a route's component
// tree to isolate widget failures from the surrounding page.
// Route-level fatal errors are already caught by TanStack Router's
// errorComponent in __root.tsx.
interface Props {
  fallback?: ReactNode;
  name?: string;
  children: ReactNode;
}
interface State {
  error: Error | null;
}
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };
  static getDerivedStateFromError(error: Error): State {
    return { error };
  }
  componentDidCatch(error: Error) {
    reportLovableError(error, { boundary: this.props.name ?? "widget_error_boundary" });
  }
  reset = () => this.setState({ error: null });
  render() {
    if (this.state.error) {
      return (
        this.props.fallback ?? (
          <div
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
          >
            <p className="font-medium">Something went wrong.</p>
            <button
              type="button"
              onClick={this.reset}
              className="mt-2 rounded-md border border-destructive/40 px-3 py-1 text-xs hover:bg-destructive/10"
            >
              Retry
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}