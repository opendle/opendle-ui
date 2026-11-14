import { type PasskeyListLabels } from "./identityLabels.js";
export interface PasskeyItem {
    readonly id: string;
    readonly label: string;
    readonly createdAt: string;
    readonly lastUsedAt?: string | null;
}
export interface PasskeyListProps {
    readonly items: readonly PasskeyItem[];
    /** Run the passkey ceremony and store the result. */
    readonly onAdd: () => Promise<void>;
    readonly onRemove: (id: string) => Promise<void>;
    /** Store a new name. Without it, the names are not editable. */
    readonly onRename?: (id: string, label: string) => Promise<void>;
    /** Return `null` to show nothing, for example after the user cancels. */
    readonly errorMessage: (error: unknown) => string | null;
    readonly labels?: PasskeyListLabels;
}
/**
 * The passkeys of one account. The last passkey has no remove button, because
 * the account must keep one.
 */
export declare function PasskeyList({ errorMessage, items, labels, onAdd, onRemove, onRename, }: PasskeyListProps): import("react").JSX.Element;
//# sourceMappingURL=PasskeyList.d.ts.map