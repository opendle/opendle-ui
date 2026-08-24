import { type HTMLAttributes, type ReactNode } from "react";
import { type OntologyFileMetadata } from "../OntologyExplorerContract.js";
export type FileTransferState = "ready" | "uploading" | "downloading" | "failed";
export interface ManagedFileItem {
    readonly metadata: OntologyFileMetadata;
    readonly state?: FileTransferState;
    readonly progress?: number;
    readonly message?: string;
}
export interface ManagedFileListProps extends Omit<HTMLAttributes<HTMLElement>, "children" | "onSelect" | "title"> {
    readonly title: ReactNode;
    readonly description?: ReactNode;
    readonly items: readonly ManagedFileItem[];
    readonly selectedId?: string;
    readonly onSelect?: (file: OntologyFileMetadata) => void;
    readonly empty?: ReactNode;
    readonly nextPage?: ReactNode;
}
/** A bounded file metadata and transfer-state list. Hosts own byte transfer. */
export declare function ManagedFileList({ className, description, empty, items, nextPage, onSelect, selectedId, title, ...props }: ManagedFileListProps): import("react").JSX.Element;
//# sourceMappingURL=ManagedFileList.d.ts.map