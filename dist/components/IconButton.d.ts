import type { ButtonHTMLAttributes, ReactNode } from "react";
export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
    readonly icon: ReactNode;
}
export declare function IconButton({ className, icon, type, ...props }: IconButtonProps): import("react").JSX.Element;
//# sourceMappingURL=IconButton.d.ts.map