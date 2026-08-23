import type { HTMLAttributes, ReactNode } from "react";
export type ServiceAssignmentSourceKind = "direct" | "inherited" | "implicit";
export interface ServiceAssignmentSource {
    readonly kind: ServiceAssignmentSourceKind;
    /** A host-owned service or scope label. */
    readonly label: string;
}
export interface ServiceAssignmentCandidate {
    /** A stable identifier within this assignment. */
    readonly id: string;
    readonly label: string;
    readonly detail?: string;
}
export interface ServiceAssignmentLastUse {
    /** Host-formatted visible text. */
    readonly label: string;
    /** An optional machine-readable date or time. */
    readonly dateTime?: string;
}
export interface ServiceAssignmentItem {
    /** A stable identifier within the graph. */
    readonly id: string;
    readonly name: string;
    /** The effective definition source, or null when no definition exists. */
    readonly source: ServiceAssignmentSource | null;
    /** The effective candidate chain in its complete order. */
    readonly candidates: readonly ServiceAssignmentCandidate[];
    /** The assignment that this definition resolves through, when applicable. */
    readonly inheritsFrom?: string;
    readonly isDefault?: boolean;
    readonly lastUsed: ServiceAssignmentLastUse | null;
    readonly observedRequirements: readonly string[];
}
export interface ServiceAssignmentGraphProps extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "id"> {
    /** A page-unique prefix for labels and controls. */
    readonly id: string;
    readonly assignments: readonly ServiceAssignmentItem[];
    readonly selectedAssignmentId?: string | null;
    readonly onSelectionChange: (assignmentId: string | null) => void;
    /** Return host-owned mutation or routing controls for one assignment. */
    readonly actionsForAssignment?: (assignment: ServiceAssignmentItem) => ReactNode;
    readonly "aria-label": string;
}
/**
 * A controlled assignment graph, detail inspector, and accessible list.
 * Hosts own data access, formatting, routes, and mutations.
 */
export declare function ServiceAssignmentGraph({ actionsForAssignment, assignments, className, id, onSelectionChange, selectedAssignmentId, "aria-label": ariaLabel, ...props }: ServiceAssignmentGraphProps): import("react").JSX.Element;
//# sourceMappingURL=ServiceAssignmentGraph.d.ts.map