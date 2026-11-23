import type { ReactNode } from "react";
export interface InheritedSwitchControlProps {
    readonly className?: string;
    readonly disabled?: boolean;
    /** The value that applies while `value` is null. */
    readonly inherited: boolean;
    /** The accessible name of the switch. */
    readonly label: ReactNode;
    /** The new value: a boolean to override, or null to inherit again. */
    readonly onChange: (value: boolean | null) => void;
    readonly overrideLabel?: string;
    readonly resetLabel?: string;
    /** The own value, or null when the inherited value applies. */
    readonly value: boolean | null;
}
/**
 * A switch that can inherit its value. While it inherits, it shows the
 * inherited value dimmed and an edit button that starts an override with
 * that value. An override shows a normal switch and a reset button.
 */
export declare function InheritedSwitchControl({ className, disabled, inherited, label, onChange, overrideLabel, resetLabel, value, }: InheritedSwitchControlProps): import("react").JSX.Element;
//# sourceMappingURL=InheritedSwitchControl.d.ts.map