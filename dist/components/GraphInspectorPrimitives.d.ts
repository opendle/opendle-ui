import type { HTMLAttributes, ReactNode } from "react";
export type GraphInspectorFactsProps = HTMLAttributes<HTMLDListElement>;
export declare function GraphInspectorFacts({ className, ...props }: GraphInspectorFactsProps): import("react").JSX.Element;
export interface GraphInspectorFactProps extends HTMLAttributes<HTMLDivElement> {
    readonly label: ReactNode;
    readonly value: ReactNode;
}
export declare function GraphInspectorFact({ label, value, className, ...props }: GraphInspectorFactProps): import("react").JSX.Element;
export interface GraphInspectorSectionProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
    readonly title: ReactNode;
    readonly count?: ReactNode;
}
export declare function GraphInspectorSection({ title, count, children, className, ...props }: GraphInspectorSectionProps): import("react").JSX.Element;
export type GraphInspectorRowsProps = HTMLAttributes<HTMLUListElement>;
export declare function GraphInspectorRows({ className, ...props }: GraphInspectorRowsProps): import("react").JSX.Element;
export interface GraphInspectorRowProps extends HTMLAttributes<HTMLLIElement> {
    readonly label: ReactNode;
    readonly value?: ReactNode;
    readonly actions?: ReactNode;
}
export declare function GraphInspectorRow({ label, value, actions, className, ...props }: GraphInspectorRowProps): import("react").JSX.Element;
export type GraphInspectorNoticeTone = "neutral" | "warning" | "error";
export interface GraphInspectorNoticeProps extends HTMLAttributes<HTMLDivElement> {
    readonly tone?: GraphInspectorNoticeTone;
    readonly dynamic?: boolean;
}
export declare function GraphInspectorNotice({ tone, dynamic, children, className, ...props }: GraphInspectorNoticeProps): import("react").JSX.Element;
//# sourceMappingURL=GraphInspectorPrimitives.d.ts.map