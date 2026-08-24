import { type HTMLAttributes, type ReactNode } from "react";
import { type OntologyTypeDefinition } from "../OntologyExplorerContract.js";
export interface OntologyInheritanceTreeProps extends Omit<HTMLAttributes<HTMLElement>, "children" | "onSelect" | "title"> {
    readonly title: ReactNode;
    readonly description?: ReactNode;
    readonly definitions: readonly OntologyTypeDefinition[];
    readonly selectedApiName?: string;
    readonly onSelect?: (definition: OntologyTypeDefinition) => void;
    readonly empty?: ReactNode;
}
/** A top-to-bottom view of additive object-type inheritance. */
export declare function OntologyInheritanceTree({ className, definitions, description, empty, onSelect, selectedApiName, title, ...props }: OntologyInheritanceTreeProps): import("react").JSX.Element;
//# sourceMappingURL=OntologyInheritanceTree.d.ts.map