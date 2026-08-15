import type { HTMLAttributes, ReactNode } from "react";
export interface PanelProps extends HTMLAttributes<HTMLElement> {
    readonly children?: ReactNode;
}
export declare function Panel({ children, className, ...props }: PanelProps): import("react").JSX.Element;
export interface PanelHeaderProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
    readonly title: ReactNode;
    readonly description?: ReactNode;
    readonly kicker?: ReactNode;
    readonly actions?: ReactNode;
}
export declare function PanelHeader({ actions, className, description, kicker, title, ...props }: PanelHeaderProps): import("react").JSX.Element;
//# sourceMappingURL=Panel.d.ts.map