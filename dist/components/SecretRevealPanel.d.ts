import { type ReactNode } from "react";
export interface SecretRevealPanelProps {
    readonly actions?: ReactNode;
    readonly children?: ReactNode;
    readonly className?: string;
    readonly copiedLabel?: ReactNode;
    readonly copyLabel?: ReactNode;
    readonly copySecret?: (secret: string) => Promise<void>;
    readonly description?: ReactNode;
    readonly dismissLabel?: ReactNode;
    readonly headingLevel?: "h2" | "h3";
    readonly onCopyError?: (error: unknown) => void;
    readonly onDismiss?: () => void;
    readonly secret: string;
    readonly secretLabel?: string;
    readonly title?: ReactNode;
}
export declare function SecretRevealPanel({ secret, ...props }: SecretRevealPanelProps): import("react").JSX.Element;
//# sourceMappingURL=SecretRevealPanel.d.ts.map