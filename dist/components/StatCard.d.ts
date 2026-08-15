import type { ReactNode } from "react";
export interface StatCardProps {
    readonly icon: ReactNode;
    readonly label: ReactNode;
    readonly value: ReactNode;
    readonly unit?: ReactNode;
    readonly trend?: ReactNode;
    readonly note?: ReactNode;
    readonly visual?: ReactNode;
    readonly tone?: string;
    readonly className?: string;
}
export declare function StatCard({ className, icon, label, note, tone, trend, unit, value, visual, }: StatCardProps): import("react").JSX.Element;
//# sourceMappingURL=StatCard.d.ts.map