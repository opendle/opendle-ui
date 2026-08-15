import type { ButtonHTMLAttributes, ReactNode } from "react";
export interface WorkspaceSelectorProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "name"> {
    readonly name: ReactNode;
    readonly detail?: ReactNode;
    readonly avatar: ReactNode;
    readonly end?: ReactNode;
}
export declare function WorkspaceSelector({ avatar, className, detail, end, name, type, ...props }: WorkspaceSelectorProps): import("react").JSX.Element;
//# sourceMappingURL=WorkspaceSelector.d.ts.map