import { type HTMLAttributes, type ReactNode } from "react";
export interface SessionPageProps extends HTMLAttributes<HTMLElement> {
    readonly children?: ReactNode;
}
/** A centered page boundary for sign-in, session, and bootstrap states. */
export declare function SessionPage({ children, className, ...props }: SessionPageProps): import("react").JSX.Element;
export interface SessionCardProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
    readonly title: ReactNode;
    readonly description?: ReactNode;
    readonly eyebrow?: ReactNode;
    readonly icon?: ReactNode;
    readonly actions?: ReactNode;
    readonly feedback?: ReactNode;
    readonly footer?: ReactNode;
    readonly headingLevel?: "h1" | "h2" | "h3";
}
/** A product-neutral card for one bounded session action. */
export declare function SessionCard({ actions, className, description, eyebrow, feedback, footer, headingLevel, icon, title, "aria-labelledby": labelledBy, ...props }: SessionCardProps): import("react").JSX.Element;
//# sourceMappingURL=SessionPage.d.ts.map