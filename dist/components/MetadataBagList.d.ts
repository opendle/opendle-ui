import { type HTMLAttributes, type ReactNode } from "react";
import { type OntologyMetadataBag } from "../OntologyExplorerContract.js";
export interface MetadataBagListProps extends Omit<HTMLAttributes<HTMLElement>, "children" | "onSelect" | "title"> {
    readonly title: ReactNode;
    readonly description?: ReactNode;
    readonly bags: readonly OntologyMetadataBag[];
    readonly selectedId?: string;
    readonly onSelect?: (bag: OntologyMetadataBag) => void;
    readonly empty?: ReactNode;
    readonly nextPage?: ReactNode;
}
/** A bounded list for shared current metadata contexts. */
export declare function MetadataBagList({ bags, className, description, empty, nextPage, onSelect, selectedId, title, ...props }: MetadataBagListProps): import("react").JSX.Element;
//# sourceMappingURL=MetadataBagList.d.ts.map