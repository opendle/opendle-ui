export interface InlineEditableTextProps {
    readonly value: string;
    /** Store the new text. A rejection keeps the editor open. */
    readonly onSave: (value: string) => Promise<void>;
    /** The accessible name of the edit action and of the input. */
    readonly label: string;
    readonly maxLength?: number;
    readonly className?: string;
}
/**
 * Text that the user edits in place. A double click or the Enter key starts
 * the edit. Enter saves and Escape cancels.
 */
export declare function InlineEditableText({ className, label, maxLength, onSave, value, }: InlineEditableTextProps): import("react").JSX.Element;
//# sourceMappingURL=InlineEditableText.d.ts.map