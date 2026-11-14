import type { ReactNode } from "react";
export interface TagChipProps {
    readonly children: ReactNode;
    /** With `onPressedChange`, the chip is a toggle button. */
    readonly pressed?: boolean;
    readonly onPressedChange?: (pressed: boolean) => void;
    readonly className?: string;
}
/** A tag label. It is a toggle when the host gives `onPressedChange`. */
export declare function TagChip({ children, className, onPressedChange, pressed, }: TagChipProps): import("react").JSX.Element;
//# sourceMappingURL=TagChip.d.ts.map