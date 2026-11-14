export interface TagInputProps {
    readonly value: readonly string[];
    readonly onChange: (value: readonly string[]) => void;
    /** The accessible name of the text input. */
    readonly label: string;
    /** The accessible name of a remove button. It gets the tag after it. */
    readonly removeLabel: string;
    readonly placeholder?: string;
    readonly disabled?: boolean;
    readonly className?: string;
}
/**
 * A list of tags that the user edits in place. Enter or a comma adds the
 * typed tag. Backspace in the empty input removes the last tag.
 */
export declare function TagInput({ className, disabled, label, onChange, placeholder, removeLabel, value, }: TagInputProps): import("react").JSX.Element;
//# sourceMappingURL=TagInput.d.ts.map