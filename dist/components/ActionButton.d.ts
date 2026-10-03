import { type ButtonHTMLAttributes, type FieldsetHTMLAttributes, type ReactElement, type Ref } from "react";
import type { ButtonVariant } from "./Button.js";
export interface ActionButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
    readonly label: string;
    readonly icon: ReactElement;
    readonly variant?: Exclude<ButtonVariant, "icon">;
    readonly ref?: Ref<HTMLButtonElement>;
}
/** An action with a stable name and content that fits its allocated width. */
export declare function ActionButton({ label, icon, variant, className, type, ref, ...props }: ActionButtonProps): import("react").JSX.Element;
export type ActionButtonGroupProps = FieldsetHTMLAttributes<HTMLFieldSetElement>;
/** One full-width row with equal space and a minimum touch target per action. */
export declare function ActionButtonGroup({ className, ...props }: ActionButtonGroupProps): import("react").JSX.Element;
//# sourceMappingURL=ActionButton.d.ts.map