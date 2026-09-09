import type { ComponentPropsWithRef } from "react";
export type PanelContentProps = Omit<ComponentPropsWithRef<"section">, "role" | "aria-label" | "aria-labelledby"> & ({
    readonly "aria-label": string;
    readonly "aria-labelledby"?: string;
} | {
    readonly "aria-label"?: string;
    readonly "aria-labelledby": string;
});
/** A labelled, bounded body. Keep the panel heading and close action outside. */
export declare function PanelContent({ children, className, tabIndex, ...props }: PanelContentProps): import("react").JSX.Element;
//# sourceMappingURL=PanelContent.d.ts.map