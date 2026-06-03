import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-dvh flex flex-col items-center justify-center gap-4 px-4 text-center">
          <h1 className="font-black text-2xl">Something went wrong</h1>
          <p className="text-muted text-sm max-w-xs">
            An unexpected error occurred.
          </p>
          <div className="flex gap-2">
            <button
              className="px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm"
              type="button"
              onClick={() => this.setState({ hasError: false })}
            >
              Try Again
            </button>
            <button
              className="px-4 py-2 rounded-lg bg-default text-default-foreground text-sm"
              type="button"
              onClick={() => window.location.reload()}
            >
              Reload
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
