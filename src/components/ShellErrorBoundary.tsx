import { Component, type ErrorInfo, type ReactNode } from "react";

export interface ShellErrorBoundaryProps {
  readonly children: ReactNode;
  readonly resetKey: unknown;
  readonly fallbackTitle?: ReactNode;
  readonly fallbackMessage?: ReactNode;
  readonly fallbackClassName?: string;
}

interface ShellErrorBoundaryState {
  readonly failed: boolean;
  readonly resetKey: unknown;
}

export class ShellErrorBoundary extends Component<ShellErrorBoundaryProps, ShellErrorBoundaryState> {
  override state: ShellErrorBoundaryState = { failed: false, resetKey: this.props.resetKey };

  static getDerivedStateFromError(_error: unknown): Partial<ShellErrorBoundaryState> {
    return { failed: true };
  }

  static getDerivedStateFromProps(
    props: ShellErrorBoundaryProps,
    state: ShellErrorBoundaryState,
  ): Partial<ShellErrorBoundaryState> | null {
    return props.resetKey === state.resetKey ? null : { failed: false, resetKey: props.resetKey };
  }

  override componentDidCatch(_error: unknown, _errorInfo: ErrorInfo): void {
    // A host telemetry adapter can record a value-free failure class here.
  }

  override render() {
    if (this.state.failed) {
      return (
        <main className={this.props.fallbackClassName ?? "od-error-shell"} role="alert">
          <h1>{this.props.fallbackTitle ?? "This interface is not available"}</h1>
          <p>{this.props.fallbackMessage ?? "Reload the page. No change was sent."}</p>
        </main>
      );
    }
    return this.props.children;
  }
}
