import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button, Typography } from "@heroui/react";

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
          <Typography.Heading level={1} className="text-2xl">Something went wrong</Typography.Heading>
          <Typography.Paragraph color="muted" size="sm" className="max-w-xs">
            An unexpected error occurred.
          </Typography.Paragraph>
          <div className="flex gap-2">
            <Button variant="primary" onPress={() => this.setState({ hasError: false })}>
              Try Again
            </Button>
            <Button variant="tertiary" onPress={() => window.location.reload()}>
              Reload
            </Button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
