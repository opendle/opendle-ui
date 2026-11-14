/** One comment, mention or message of a conversation. */
export interface ConversationMessage {
    readonly id: string;
    /** The nesting level below the post. Zero is a top comment. */
    readonly depth: number;
    readonly authorName: string;
    readonly authorHandle: string;
    readonly avatarUrl: string | null;
    readonly text: string;
    /** The time, already formatted. */
    readonly when: string;
    /** The ISO 8601 instant. */
    readonly createdAt: string;
    /** The account of the channel wrote it. */
    readonly own: boolean;
    readonly liked: boolean;
    readonly likeCount: number | null;
    readonly state: "new" | "replied" | "ignored";
    readonly canReply: boolean;
    readonly canLike: boolean;
}
export interface ConversationLabels {
    readonly reply: string;
    readonly send: string;
    readonly like: string;
    readonly ignore: string;
    readonly restore: string;
    readonly emoji: string;
    readonly suggestions: string;
    readonly replyTo: string;
    readonly open: string;
}
export declare const conversationLabels: ConversationLabels;
/** The emoji of the picker, most used first. */
export declare const conversationEmoji: readonly string[];
//# sourceMappingURL=conversationLabels.d.ts.map