import { type HTMLAttributes, type ReactNode } from "react";
import { type OntologyMetadataBag, type OntologyRecordSummary } from "../OntologyExplorerContract.js";
export type OntologyChangeItem = {
    readonly kind: "object" | "link";
    readonly record: OntologyRecordSummary;
} | {
    readonly kind: "metadata_bag";
    readonly bag: OntologyMetadataBag;
};
export interface ChangeTimelineProps extends Omit<HTMLAttributes<HTMLElement>, "children" | "onSelect" | "title"> {
    readonly title: ReactNode;
    readonly description?: ReactNode;
    readonly items: readonly OntologyChangeItem[];
    readonly onSelect?: (item: OntologyChangeItem) => void;
    readonly empty?: ReactNode;
    readonly nextPage?: ReactNode;
}
/** A bounded current-state change list. It does not represent a durable history. */
export declare function ChangeTimeline({ className, description, empty, items, nextPage, onSelect, title, ...props }: ChangeTimelineProps): import("react").JSX.Element;
//# sourceMappingURL=ChangeTimeline.d.ts.map