import { type ButtonHTMLAttributes, type ReactNode } from "react";
export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
    readonly icon: ReactNode;
    /** The accessible name. It is also the tooltip. */
    readonly label?: string;
    /**
     * Why the action is not available. The button is disabled, the reason is
     * its tooltip and its accessible description, and the pointer can show it.
     */
    readonly disabledReason?: string;
    readonly tone?: "default" | "danger";
}
export declare function IconButton({ className, disabled, disabledReason, icon, label, tone, type, ...props }: IconButtonProps): import("react").JSX.Element;
//# sourceMappingURL=IconButton.d.ts.map