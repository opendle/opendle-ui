export interface SavedReply {
    readonly id: string;
    readonly name: string;
    readonly text: string;
}
export interface SavedReplyPickerProps {
    /** The accessible name of the button and of the list. */
    readonly label: string;
    readonly replies: readonly SavedReply[];
    readonly onSelect: (reply: SavedReply) => void;
    readonly disabled?: boolean;
}
/** A button that opens the list of saved replies, next to the emoji button. */
export declare function SavedReplyPicker({ disabled, label, onSelect, replies, }: SavedReplyPickerProps): import("react").JSX.Element;
//# sourceMappingURL=SavedReplyPicker.d.ts.map