/** Run one session action at a time and keep the message of its failure. */
export declare function useSessionAction<Args extends unknown[]>(action: (...args: Args) => Promise<void>, errorMessage: (error: unknown) => string | null): {
    feedback: import("react").JSX.Element | null;
    pending: boolean;
    run: (...args: Args) => Promise<void>;
};
//# sourceMappingURL=useSessionAction.d.ts.map