import type { ButtonHTMLAttributes, ReactNode } from "react";
export type ButtonVariant = "primary" | "secondary" | "quiet" | "danger";
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    readonly icon?: ReactNode;
    readonly size?: "default" | "small";
    readonly variant?: ButtonVariant;
}
export declare function Button({ children, className, icon, size, type, variant, ...props }: ButtonProps): import("react").JSX.Element;
export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label" | "children"> {
    readonly icon: ReactNode;
    /** The accessible name. It is also the tooltip. */
    readonly label: string;
    readonly tone?: "default" | "danger";
}
export declare function IconButton({ className, icon, label, tone, type, ...props }: IconButtonProps): import("react").JSX.Element;
//# sourceMappingURL=Button.d.ts.map