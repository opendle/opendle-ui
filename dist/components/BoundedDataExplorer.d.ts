import { type HTMLAttributes, type ReactNode } from "react";
import { type OntologyRecordSummary } from "../OntologyExplorerContract.js";
export interface BoundedDataExplorerProps extends Omit<HTMLAttributes<HTMLElement>, "children" | "onSelect" | "title"> {
    readonly title: ReactNode;
    readonly description?: ReactNode;
    readonly items: readonly OntologyRecordSummary[];
    readonly selectedKey?: string;
    readonly onSelect?: (item: OntologyRecordSummary) => void;
    readonly openLabel?: (item: OntologyRecordSummary) => string;
    readonly actions?: ReactNode;
    readonly empty?: ReactNode;
    readonly nextPage?: ReactNode;
}
/** A bounded current-record table. The host owns reads, paging, and actions. */
export declare function BoundedDataExplorer({ actions, className, description, empty, items, nextPage, onSelect, openLabel, selectedKey, title, ...props }: BoundedDataExplorerProps): import("react").JSX.Element;
export interface OntologyLabelListProps extends Omit<HTMLAttributes<HTMLUListElement>, "children"> {
    readonly labels: readonly string[];
    readonly emptyLabel?: ReactNode;
}
/** A bounded list for the plain string labels in the Ontology contract. */
export declare function OntologyLabelList({ className, emptyLabel, labels, ...props }: OntologyLabelListProps): import("react").JSX.Element;
//# sourceMappingURL=BoundedDataExplorer.d.ts.map