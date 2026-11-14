export interface SecretRevealProps {
    readonly value: string;
    /** The accessible name of the secret value. */
    readonly label: string;
    readonly copyLabel: string;
    readonly copiedLabel: string;
    readonly className?: string;
}
/** A secret that shows one time, with a copy button. */
export declare function SecretReveal({ className, copiedLabel, copyLabel, label, value, }: SecretRevealProps): import("react").JSX.Element;
//# sourceMappingURL=SecretReveal.d.ts.map