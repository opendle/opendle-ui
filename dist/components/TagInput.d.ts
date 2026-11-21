export interface TagInputProps {
    readonly value: readonly string[];
    readonly onChange: (value: readonly string[]) => void;
    /** The accessible name of the text input. */
    readonly label: string;
    /** The accessible name of a remove button. It gets the tag after it. */
    readonly removeLabel: string;
    /** The colour key, from 1 to 12, of each tag name. */
    readonly colors?: Readonly<Record<string, number>>;
    /** Known tags. The list under the input shows the tags that match the text. */
    readonly suggestions?: readonly string[];
    /** The text after the fixed `#` in the empty input. */
    readonly addLabel?: string;
    /** The accessible name of the option that adds a new tag, before the tag. */
    readonly createLabel?: string;
    readonly disabled?: boolean;
    readonly className?: string;
}
/**
 * A list of tags that the user edits in place. A fixed `#` comes before the
 * text. While the user types, a list shows the known tags that match. The
 * arrow keys move in the list, Enter adds the active tag or else the typed
 * tag, and a comma adds the typed tag. A typed tag that is a known tag adds
 * the known tag. Backspace in the empty input removes the last tag.
 */
export declare function TagInput({ addLabel, className, colors, createLabel, disabled, label, onChange, removeLabel, suggestions, value, }: TagInputProps): import("react").JSX.Element;
//# sourceMappingURL=TagInput.d.ts.map