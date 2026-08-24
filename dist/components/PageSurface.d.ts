import type { HTMLAttributes, ReactNode } from "react";
export interface PageSurfaceProps extends HTMLAttributes<HTMLDivElement> {
    readonly children: ReactNode;
    readonly edgeToEdge?: boolean;
}
/** One full-width page boundary with a shared responsive gutter mode. */
export declare function PageSurface({ children, className, edgeToEdge, ...props }: PageSurfaceProps): import("react").JSX.Element;
//# sourceMappingURL=PageSurface.d.ts.map