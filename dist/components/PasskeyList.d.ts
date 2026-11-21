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
    /**
     * Show a failure outside the component, for example in a toast. With it,
     * the component shows no failure of its own.
     */
    readonly onError?: (message: string) => void;
    readonly labels?: PasskeyListLabels;
}
/**
 * The passkeys of one account. The last passkey has no remove button, because
 * the account must keep one.
 */
export declare function PasskeyList({ errorMessage, items, labels, onAdd, onError, onRemove, onRename, }: PasskeyListProps): import("react").JSX.Element;
//# sourceMappingURL=PasskeyList.d.ts.map