import { type HTMLAttributes, type ReactNode } from "react";
import { type OntologyCanvasPosition, type OntologyGraphLink, type OntologyGraphObject } from "../OntologyExplorerContract.js";
export interface SavedViewCanvasProps extends Omit<HTMLAttributes<HTMLElement>, "children" | "onSelect"> {
    readonly objects: readonly OntologyGraphObject[];
    readonly links: readonly OntologyGraphLink[];
    readonly positions: readonly OntologyCanvasPosition[];
    readonly canvasWidth: number;
    readonly canvasHeight: number;
    readonly selectedKey?: string;
    readonly toolbar?: ReactNode;
    readonly inspector?: ReactNode;
    readonly onSelect?: (record: OntologyGraphObject | OntologyGraphLink) => void;
    readonly onPositionChange?: (position: OntologyCanvasPosition) => void;
    readonly empty?: ReactNode;
}
/** A controlled graph for current records and saved-view canvas positions. */
export declare function SavedViewCanvas(props: SavedViewCanvasProps): import("react").JSX.Element;
//# sourceMappingURL=SavedViewCanvas.d.ts.map