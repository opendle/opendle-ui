export interface AsyncAction {
    readonly pending: boolean;
    readonly failure: string | null;
    /** Run the work. It resolves `true` when the work succeeds. */
    readonly run: (work: () => Promise<void>) => Promise<boolean>;
    readonly reset: () => void;
}
/**
 * Track one asynchronous action: pending state and the failure message. With
 * `onError`, the host gets the message and `failure` stays `null`.
 */
export declare function useAsyncAction(errorMessage: (error: unknown) => string | null, onError?: (message: string) => void): AsyncAction;
//# sourceMappingURL=useAsyncAction.d.ts.map