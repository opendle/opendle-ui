import type { ReactNode } from "react";
export interface PageHeadingProps {
    readonly eyebrow: ReactNode;
    readonly title: ReactNode;
    readonly description?: ReactNode;
    readonly actions?: ReactNode;
    readonly className?: string;
    readonly headingLevel?: "h1" | "h2" | "h3";
}
export declare function PageHeading({ actions, className, description, eyebrow, headingLevel, title, }: PageHeadingProps): import("react").JSX.Element;
//# sourceMappingURL=PageHeading.d.ts.map