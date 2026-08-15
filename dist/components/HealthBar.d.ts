import { type HTMLAttributes, type ReactNode } from "react";
export interface HealthBarProps extends HTMLAttributes<HTMLDivElement> {
    readonly label: ReactNode;
    readonly value: number;
    readonly valueLabel?: ReactNode;
    readonly tone?: "lime" | "blue" | "amber" | "red";
}
export declare function HealthBar({ className, label, tone, value, valueLabel, ...props }: HealthBarProps): import("react").JSX.Element;
//# sourceMappingURL=HealthBar.d.ts.map