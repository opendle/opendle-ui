import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";
export type ButtonVariant = "primary" | "secondary" | "quiet" | "danger" | "icon";
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    readonly icon?: ReactNode;
    /** Show the loading sign in place of the icon. The button does not act. */
    readonly loading?: boolean;
    readonly ref?: Ref<HTMLButtonElement>;
    readonly size?: "default" | "small";
    readonly variant?: ButtonVariant;
}
export declare function Button({ children, className, disabled, icon, loading, size, type, variant, ...props }: ButtonProps): import("react").JSX.Element;
//# sourceMappingURL=Button.d.ts.map