import { type ReactNode } from "react";
import { type ConversationLabels, type ConversationMessage } from "./conversationLabels.js";
import { type ReplyComposerProps } from "./ReplyComposer.js";
export interface ConversationProps {
    readonly messages: readonly ConversationMessage[];
    /** The message that the view opens at, with its reply box open. */
    readonly selectedId?: string | null;
    /** The post that the comments are under. */
    readonly post?: ReactNode;
    /** The text that a reply starts with on this network. */
    readonly mention?: (message: ConversationMessage) => string;
    readonly limit?: number | null;
    /** The suggestions for a reply to the selected message. */
    readonly suggestions?: readonly string[];
    readonly savedReplies?: ReplyComposerProps["savedReplies"];
    readonly savedRepliesLabel?: string;
    readonly messageActions?: (message: ConversationMessage) => ReactNode;
    /** Without it, the messages have no reply box. */
    readonly onReply?: (id: string, text: string) => Promise<void>;
    /** With it, the reply link calls the host and no reply box opens. */
    readonly onReplyRequest?: (id: string) => void;
    readonly onLike?: (id: string, liked: boolean) => void;
    readonly onIgnore?: (id: string) => void;
    readonly onRestore?: (id: string) => void;
    readonly errorMessage?: (error: unknown) => string | null;
    readonly labels?: ConversationLabels;
    readonly className?: string;
}
/**
 * The comments of one post, or the messages of one thread, in order. One
 * message at a time has an open reply box.
 */
export declare function Conversation({ className, errorMessage, labels, limit, mention, messages, onIgnore, onLike, onReply, onReplyRequest, onRestore, post, selectedId, suggestions, savedReplies, savedRepliesLabel, messageActions, }: ConversationProps): import("react").JSX.Element;
//# sourceMappingURL=Conversation.d.ts.map