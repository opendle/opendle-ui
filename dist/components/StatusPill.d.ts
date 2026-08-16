import type { ReactNode } from "react";
import { type StatusTone } from "./StatusDot.js";
export interface StatusPillProps {
    readonly tone: StatusTone;
    readonly children: ReactNode;
    readonly className?: string;
}
export declare function StatusPill({ tone, children, className }: StatusPillProps): import("react").JSX.Element;
//# sourceMappingURL=StatusPill.d.ts.map