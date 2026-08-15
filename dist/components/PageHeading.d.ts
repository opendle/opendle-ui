import type { ReactNode } from "react";
export interface PageHeadingProps {
    readonly eyebrow: ReactNode;
    readonly title: ReactNode;
    readonly description?: ReactNode;
    readonly actions?: ReactNode;
    readonly className?: string;
}
export declare function PageHeading({ actions, className, description, eyebrow, title, }: PageHeadingProps): import("react").JSX.Element;
//# sourceMappingURL=PageHeading.d.ts.map