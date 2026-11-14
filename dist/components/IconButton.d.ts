import type { ButtonHTMLAttributes, ReactNode } from "react";
export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
    readonly icon: ReactNode;
    /** The accessible name. It is also the tooltip. */
    readonly label?: string;
    readonly tone?: "default" | "danger";
}
export declare function IconButton({ className, icon, label, tone, type, ...props }: IconButtonProps): import("react").JSX.Element;
//# sourceMappingURL=IconButton.d.ts.map