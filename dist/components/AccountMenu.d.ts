import type { ButtonHTMLAttributes, ReactNode } from "react";
export interface AccountMenuProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "name"> {
    readonly avatar: ReactNode;
    readonly name: ReactNode;
    readonly detail?: ReactNode;
    readonly end?: ReactNode;
    readonly compact?: boolean;
}
export declare function AccountMenu({ avatar, className, detail, end, name, compact, type, ...props }: AccountMenuProps): import("react").JSX.Element;
//# sourceMappingURL=AccountMenu.d.ts.map