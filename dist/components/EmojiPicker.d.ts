export interface EmojiPickerProps {
    /** The accessible name of the button. */
    readonly label: string;
    readonly onSelect: (emoji: string) => void;
    /** The emoji that come first when the search field is empty. */
    readonly emoji?: readonly string[];
    readonly disabled?: boolean;
    /** The accessible name of the search field. */
    readonly searchLabel?: string;
    /** The text when no emoji has the words of the search. */
    readonly emptyLabel?: string;
}
/** A button that opens a grid of emoji with a search field. */
export declare function EmojiPicker({ disabled, emoji, emptyLabel, label, onSelect, searchLabel, }: EmojiPickerProps): import("react").JSX.Element;
//# sourceMappingURL=EmojiPicker.d.ts.map