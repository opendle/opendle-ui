import { type ApiTokenListLabels } from "./identityLabels.js";
export interface ApiTokenItem {
    readonly id: string;
    readonly name: string;
    readonly createdAt: string;
    readonly expiresAt?: string | null;
}
export interface ApiTokenListProps {
    readonly items: readonly ApiTokenItem[];
    /** Create a token and resolve with its secret. The secret shows one time. */
    readonly onCreate: (name: string) => Promise<string>;
    readonly onRevoke: (id: string) => Promise<void>;
    readonly errorMessage: (error: unknown) => string;
    /**
     * Show a failure outside the component, for example in a toast. With it,
     * the component shows no failure of its own.
     */
    readonly onError?: (message: string) => void;
    readonly labels?: ApiTokenListLabels;
}
/** The API tokens of one account, with create, reveal-once and revoke. */
export declare function ApiTokenList({ errorMessage, items, labels, onCreate, onError, onRevoke, }: ApiTokenListProps): import("react").JSX.Element;
//# sourceMappingURL=ApiTokenList.d.ts.map