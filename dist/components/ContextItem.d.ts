import type { ReactNode } from "react";
export interface ContextItemProps {
    readonly icon: ReactNode;
    readonly label: ReactNode;
    readonly value: ReactNode;
    readonly className?: string;
    readonly iconClassName?: string;
}
export declare function ContextItem({ icon, iconClassName, label, value, className, }: ContextItemProps): import("react").JSX.Element;
//# sourceMappingURL=ContextItem.d.ts.map