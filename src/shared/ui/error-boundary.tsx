import { Button, Typography } from "@heroui/react";
import { Component, useState } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  onReset: () => void;
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
    if (import.meta.env.DEV) {
      console.error("[ErrorBoundary]", error, info.componentStack, this.state);
    }
  }

  render() {
    const { children, onReset: handleReset } = this.props;

    if (this.state.hasError) {
      return (
        <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
          <Typography.Heading level={1} className="text-2xl">
            Something went wrong
          </Typography.Heading>
          <Typography.Paragraph color="muted" size="sm" className="max-w-xs">
            An unexpected error occurred.
          </Typography.Paragraph>
          <div className="flex gap-2">
            <Button variant="primary" onPress={handleReset}>
              Try Again
            </Button>
            <Button variant="tertiary" onPress={() => window.location.reload()}>
              Reload
            </Button>
          </div>
        </main>
      );
    }

    return children;
  }
}

const ErrorBoundaryWithReset = ({ children }: { children: ReactNode }) => {
  const [resetKey, setResetKey] = useState(0);

  return (
    <ErrorBoundary
      key={resetKey}
      onReset={() => setResetKey((current) => current + 1)}
    >
      {children}
    </ErrorBoundary>
  );
};

export default ErrorBoundaryWithReset;
