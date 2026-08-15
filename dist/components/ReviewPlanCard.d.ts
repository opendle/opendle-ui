import { type ReactNode } from "react";
import type { ReactElement } from "react";
export type ReviewPlanState = "pending" | "approved" | "rejected";
export interface ReviewPlanDetail {
    readonly label: ReactNode;
    readonly value: ReactNode;
    readonly icon?: ReactNode;
}
export interface ReviewPlanCardProps {
    readonly state: ReviewPlanState;
    readonly text: string;
    readonly title: ReactNode;
    readonly ariaLabel: string;
    readonly meta: ReactNode;
    readonly age?: ReactNode;
    readonly channel?: ReactNode;
    readonly details?: readonly ReviewPlanDetail[];
    readonly rejectionMessage?: ReactNode;
    readonly approvedMessage?: ReactNode;
    readonly priority?: ReactNode;
    readonly compact?: boolean;
    readonly onApprove: () => void;
    readonly onEdit: (text: string) => void;
    readonly onRefuse: (feedback: string) => void;
    readonly onRestore: () => void;
    readonly renderIcon?: (state: ReviewPlanState) => ReactNode;
    readonly renderActions?: (actions: {
        approve: () => void;
        edit: () => void;
        refuse: () => void;
    }) => ReactElement;
    readonly className?: string;
    readonly editLabel?: string;
    readonly saveEditLabel?: string;
    readonly refuseSubmitLabel?: string;
    readonly refuseEmptyLabel?: string;
    readonly textMaxLength?: number;
}
export declare function ReviewPlanCard({ age, ariaLabel, approvedMessage, channel, compact, details, meta, onApprove, onEdit, onRefuse, onRestore, priority, rejectionMessage, renderActions, renderIcon, state, text, title, className, editLabel, refuseEmptyLabel, saveEditLabel, textMaxLength, refuseSubmitLabel, }: ReviewPlanCardProps): import("react").JSX.Element;
//# sourceMappingURL=ReviewPlanCard.d.ts.map