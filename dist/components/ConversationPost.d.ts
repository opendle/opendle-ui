import { type ReactNode } from "react";
import type { NetworkName } from "./networks.js";
export interface ConversationPostProps {
    readonly network: NetworkName;
    readonly title: ReactNode;
    /** The time, already formatted. */
    readonly when?: string;
    readonly text?: string;
    /** A picture of the post. */
    readonly thumbnail?: string | null;
    /** Short facts, for example "18.4K views". */
    readonly stats?: readonly string[];
    /** The address of the post on the network. */
    readonly url?: string | null;
    readonly openLabel?: string;
    /** The button that shows all of a long text, and the one that shortens it. */
    readonly moreLabel?: string;
    readonly lessLabel?: string;
    readonly className?: string;
}
/** The post at the top of a conversation. */
export declare function ConversationPost({ className, lessLabel, moreLabel, network, openLabel, stats, text, thumbnail, title, url, when, }: ConversationPostProps): import("react").JSX.Element;
//# sourceMappingURL=ConversationPost.d.ts.map