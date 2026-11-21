import type { ApiTokenListLabels } from "./identityLabels.js";
export interface CreateTokenDialogProps {
    readonly open: boolean;
    readonly onClose: () => void;
    readonly onCreate: (name: string) => Promise<string>;
    readonly errorMessage: (error: unknown) => string;
    /**
     * Show a failure outside the component, for example in a toast. With it,
     * the component shows no failure of its own.
     */
    readonly onError?: (message: string) => void;
    readonly labels: ApiTokenListLabels;
}
/** Ask for a token name, create the token, then show its secret one time. */
export declare function CreateTokenDialog({ errorMessage, labels, onClose, onCreate, onError, open, }: CreateTokenDialogProps): import("react").JSX.Element;
//# sourceMappingURL=CreateTokenDialog.d.ts.map