export interface CharacterCountProps {
    /** The text, or a count that the host made. */
    readonly value: string | number;
    /** The limit, or `null` for none. A count above it is invalid. */
    readonly limit: number | null;
    /** A short name for screen readers, for example the network. */
    readonly label?: string;
    readonly className?: string;
}
/** A count of characters against an optional limit. */
export declare function CharacterCount({ className, label, limit, value, }: CharacterCountProps): import("react").JSX.Element;
//# sourceMappingURL=CharacterCount.d.ts.map