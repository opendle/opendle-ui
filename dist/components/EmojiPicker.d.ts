export interface EmojiPickerProps {
    /** The accessible name of the button. */
    readonly label: string;
    readonly onSelect: (emoji: string) => void;
    readonly emoji?: readonly string[];
    readonly disabled?: boolean;
}
/** A button that opens a small grid of emoji. */
export declare function EmojiPicker({ disabled, emoji, label, onSelect, }: EmojiPickerProps): import("react").JSX.Element;
//# sourceMappingURL=EmojiPicker.d.ts.map