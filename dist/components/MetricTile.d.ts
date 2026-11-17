import { type ReactNode } from "react";
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
    /**
     * `line` suits a level that continues, for example followers. `bars` suits
     * a value of each day, for example views: a day without a value has no bar.
     */
    readonly chart?: "line" | "bars";
    readonly className?: string;
}
/** One key number with its change from the period before. */
export declare function MetricTile({ change, chart, className, label, points, trend, value, }: MetricTileProps): import("react").JSX.Element;
export interface MetricGridProps {
    /** The `MetricTile` items. */
    readonly children: ReactNode;
    readonly className?: string;
}
/**
 * The metric tiles in complete rows: the count of columns follows the width
 * and the count of tiles, and a shorter last row fills all of its width.
 */
export declare function MetricGrid({ children, className }: MetricGridProps): import("react").JSX.Element;
//# sourceMappingURL=MetricTile.d.ts.map