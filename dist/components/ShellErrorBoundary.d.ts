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
export declare class ShellErrorBoundary extends Component<ShellErrorBoundaryProps, ShellErrorBoundaryState> {
    state: ShellErrorBoundaryState;
    static getDerivedStateFromError(_error: unknown): Partial<ShellErrorBoundaryState>;
    static getDerivedStateFromProps(props: ShellErrorBoundaryProps, state: ShellErrorBoundaryState): Partial<ShellErrorBoundaryState> | null;
    componentDidCatch(_error: unknown, _errorInfo: ErrorInfo): void;
    render(): string | number | bigint | boolean | Iterable<ReactNode> | Promise<string | number | bigint | boolean | import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>> | import("react").ReactPortal | Iterable<ReactNode> | null | undefined> | import("react").JSX.Element | null | undefined;
}
export {};
//# sourceMappingURL=ShellErrorBoundary.d.ts.map