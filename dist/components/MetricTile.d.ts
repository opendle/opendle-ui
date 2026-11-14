import type { ReactNode } from "react";
export interface MetricTileProps {
    readonly label: ReactNode;
    /** The value, already formatted. */
    readonly value: ReactNode;
    /** The change from the period before, already formatted, for example "+12%". */
    readonly change?: string | null;
    /** The direction of the change. It sets the colour. */
    readonly trend?: "up" | "down" | "flat";
    readonly className?: string;
}
/** One key number with its change from the period before. */
export declare function MetricTile({ change, className, label, trend, value, }: MetricTileProps): import("react").JSX.Element;
//# sourceMappingURL=MetricTile.d.ts.map