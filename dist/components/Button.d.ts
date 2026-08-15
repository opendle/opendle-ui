import type { ButtonHTMLAttributes, ReactNode } from "react";
export type ButtonVariant = "primary" | "secondary" | "quiet" | "icon";
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    readonly icon?: ReactNode;
    readonly variant?: ButtonVariant;
}
export declare function Button({ children, className, icon, type, variant, ...props }: ButtonProps): import("react").JSX.Element;
//# sourceMappingURL=Button.d.ts.map