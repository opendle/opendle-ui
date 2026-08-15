import type { ReactNode } from "react";
export interface PlanCardShellProps {
    readonly ariaLabel: string;
    readonly children: ReactNode;
    readonly className?: string;
    readonly compact?: boolean;
    readonly icon: ReactNode;
    readonly meta: ReactNode;
    readonly state: string;
    readonly title: ReactNode;
    readonly age: ReactNode;
}
export declare function PlanCardShell({ age, ariaLabel, children, className, compact, icon, meta, state, title, }: PlanCardShellProps): import("react").JSX.Element;
//# sourceMappingURL=PlanCardShell.d.ts.map