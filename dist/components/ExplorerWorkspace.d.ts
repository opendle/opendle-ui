import { type HTMLAttributes, type ReactNode } from "react";
export interface ExplorerNavigationItem {
    readonly id: string;
    readonly label: ReactNode;
    readonly count?: number;
    readonly disabled?: boolean;
}
export interface ExplorerWorkspaceProps extends Omit<HTMLAttributes<HTMLElement>, "children" | "onSelect" | "title"> {
    readonly title: ReactNode;
    readonly description?: ReactNode;
    readonly actions?: ReactNode;
    readonly navigationLabel: string;
    readonly navigationItems: readonly ExplorerNavigationItem[];
    readonly activeItem: string;
    readonly onSelect: (id: string) => void;
    readonly children: ReactNode;
    readonly inspector?: ReactNode;
}
/** A reusable explorer shell. Hosts own route changes, data, and copy. */
export declare function ExplorerWorkspace({ actions, activeItem, children, className, description, inspector, navigationItems, navigationLabel, onSelect, title, ...props }: ExplorerWorkspaceProps): import("react").JSX.Element;
export type ExplorerResourceState = "loading" | "empty" | "error" | "stale" | "offline" | "recovering";
export interface ExplorerStateProps extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "title"> {
    readonly state: ExplorerResourceState;
    readonly title: ReactNode;
    readonly description: ReactNode;
    readonly action?: ReactNode;
}
/** A live state message for bounded resource loading and recovery. */
export declare function ExplorerState({ action, className, description, state, title, ...props }: ExplorerStateProps): import("react").JSX.Element;
//# sourceMappingURL=ExplorerWorkspace.d.ts.map