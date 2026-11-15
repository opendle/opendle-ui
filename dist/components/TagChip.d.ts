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
    readonly title?: string | undefined;
}
/** A tag label. It is a toggle when the host gives `onPressedChange`. */
export declare function TagChip({ children, className, color, disabled, title, onPressedChange, pressed, }: TagChipProps): import("react").JSX.Element;
//# sourceMappingURL=TagChip.d.ts.map