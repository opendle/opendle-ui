import type { ConversationLabels } from "./conversationLabels.js";
export interface ReplyComposerProps {
    /** The accessible name of the textarea. */
    readonly label: string;
    /** The text that the reply starts with, for example the `@` mention. */
    readonly mention?: string;
    /** The character limit of the network, or `null` for none. */
    readonly limit?: number | null;
    readonly suggestions?: readonly string[];
    readonly savedReplies?: readonly {
        readonly id: string;
        readonly name: string;
        readonly text: string;
    }[];
    readonly savedRepliesLabel?: string;
    /** Send the text. A rejection keeps the text and shows the message. */
    readonly onSend: (text: string) => Promise<void>;
    readonly errorMessage: (error: unknown) => string | null;
    readonly labels: ConversationLabels;
}
/**
 * A reply box: suggestions, a textarea that grows, an emoji button, a
 * character counter and the send button. Enter sends. Shift+Enter adds a line.
 */
export declare function ReplyComposer({ errorMessage, label, labels, limit, mention, onSend, suggestions, savedReplies, savedRepliesLabel, }: ReplyComposerProps): import("react").JSX.Element;
//# sourceMappingURL=ReplyComposer.d.ts.map