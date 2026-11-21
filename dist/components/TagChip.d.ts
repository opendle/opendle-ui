import type { ReactNode } from "react";
export interface TagChipProps {
    readonly children: ReactNode;
    /** With `onPressedChange`, the chip is a toggle button. */
    readonly pressed?: boolean;
    readonly onPressedChange?: (pressed: boolean) => void;
    /** The colour key of the tag, from 1 to 12. */
    readonly color?: number | undefined;
    readonly className?: string;
    readonly disabled?: boolean;
    /**
     * The function of the toggle is not available, for example on a network
     * that does not support it. The chip is disabled and shows a blocked mark.
     * Give the reason in `title`.
     */
    readonly unavailable?: boolean;
    readonly title?: string | undefined;
}
/**
 * A tag label. It is a toggle when the host gives `onPressedChange`: on is
 * filled, off has an outline, and an unavailable function has a flat muted
 * fill and a blocked mark.
 */
export declare function TagChip({ children, className, color, disabled, title, onPressedChange, pressed, unavailable, }: TagChipProps): import("react").JSX.Element;
//# sourceMappingURL=TagChip.d.ts.map