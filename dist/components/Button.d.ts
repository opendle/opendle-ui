import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";
export type ButtonVariant = "primary" | "secondary" | "quiet" | "danger" | "icon";
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    readonly icon?: ReactNode;
    readonly ref?: Ref<HTMLButtonElement>;
    readonly size?: "default" | "small";
    readonly variant?: ButtonVariant;
}
export declare function Button({ children, className, icon, size, type, variant, ...props }: ButtonProps): import("react").JSX.Element;
//# sourceMappingURL=Button.d.ts.map