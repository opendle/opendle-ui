import type { ReactNode } from "react";
export interface ItemRowProps {
    readonly icon?: ReactNode;
    readonly title: ReactNode;
    readonly meta?: ReactNode;
    readonly actions?: ReactNode;
}
export declare function ItemRow({ actions, icon, meta, title }: ItemRowProps): import("react").JSX.Element;
//# sourceMappingURL=ItemRow.d.ts.map