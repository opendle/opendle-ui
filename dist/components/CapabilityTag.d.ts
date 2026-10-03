import type { MouseEventHandler } from "react";
export type CapabilityTagTone = "neutral" | "blue" | "teal" | "violet" | "amber" | "coral";
/** Hosts supply capability names, tones, and filter state. */
export interface CapabilityTagProps {
    readonly label: string;
    readonly direction?: "input" | "output";
    readonly tone?: CapabilityTagTone;
    readonly description?: string;
    readonly pressed?: boolean;
    readonly onClick?: MouseEventHandler<HTMLButtonElement>;
}
export declare function CapabilityTag({ label, direction, tone, description, pressed, onClick, }: CapabilityTagProps): import("react").JSX.Element;
//# sourceMappingURL=CapabilityTag.d.ts.map