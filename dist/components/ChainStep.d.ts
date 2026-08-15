import type { ReactNode } from "react";
export interface ChainStepProps {
    readonly number: ReactNode;
    readonly title: ReactNode;
    readonly detail: ReactNode;
    readonly tone: "lime" | "slate";
    readonly status: ReactNode;
    readonly className?: string;
}
export declare function ChainStep({ className, detail, number, status, title, tone, }: ChainStepProps): import("react").JSX.Element;
//# sourceMappingURL=ChainStep.d.ts.map