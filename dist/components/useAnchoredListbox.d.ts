import { type RefObject } from "react";
/**
 * Show a list of options in the browser top layer next to its field. The list
 * opens below the field, or above it when the space below is too small. A
 * dialog or a container that hides its overflow does not cut it. With
 * `matchWidth`, the list has the width of the field; otherwise its style sheet
 * gives the width. The list must have `popover="manual"`.
 */
export declare function useAnchoredListbox(open: boolean, expectedHeight: number, anchorRef: RefObject<HTMLElement | null>, listboxRef: RefObject<HTMLElement | null>, matchWidth?: boolean): void;
//# sourceMappingURL=useAnchoredListbox.d.ts.map