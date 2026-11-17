import { type ReactNode } from "react";
export interface SectionProps {
    readonly title: ReactNode;
    readonly actions?: ReactNode;
    readonly children: ReactNode;
    readonly className?: string;
    /** A fragment target, for example `notifications` for `#notifications`. */
    readonly id?: string;
}
/** A titled part of a page. */
export declare function Section({ actions, children, className, id, title, }: SectionProps): import("react").JSX.Element;
//# sourceMappingURL=Section.d.ts.map