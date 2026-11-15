import type { ReactNode } from "react";
export interface MetricTileProps {
    readonly label: ReactNode;
    /** The value, already formatted. */
    readonly value: ReactNode;
    /** The change from the period before, already formatted, for example "+12%". */
    readonly change?: string | null;
    /** The direction of the change. It sets the colour. */
    readonly trend?: "up" | "down" | "flat";
    /**
     * One value per day of the period, for a small line under the value.
     * `null` is a day without a value. Fewer than two values give no line.
     */
    readonly points?: readonly (number | null)[];
    readonly className?: string;
}
/** One key number with its change from the period before. */
export declare function MetricTile({ change, className, label, points, trend, value, }: MetricTileProps): import("react").JSX.Element;
//# sourceMappingURL=MetricTile.d.ts.map