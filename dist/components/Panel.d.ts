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
/** A padded panel body with consistent spacing between its content. */
export declare function PanelBody({ children, className, ...props }: HTMLAttributes<HTMLDivElement>): import("react").JSX.Element;
export interface SummaryFactsProps extends HTMLAttributes<HTMLDListElement> {
    readonly items: readonly {
        readonly label: string;
        readonly value: ReactNode;
    }[];
}
/** Responsive metadata with an explicit label for each value. */
export declare function SummaryFacts({ items, className, ...props }: SummaryFactsProps): import("react").JSX.Element;
//# sourceMappingURL=Panel.d.ts.map