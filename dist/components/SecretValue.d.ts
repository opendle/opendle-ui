export interface SecretValueProps {
    readonly value: string;
    /** The accessible name of the secret value. */
    readonly label: string;
    readonly copyLabel: string;
    readonly copiedLabel: string;
    readonly className?: string;
}
/** A secret that shows one time, with a copy button. */
export declare function SecretValue({ className, copiedLabel, copyLabel, label, value, }: SecretValueProps): import("react").JSX.Element;
//# sourceMappingURL=SecretValue.d.ts.map