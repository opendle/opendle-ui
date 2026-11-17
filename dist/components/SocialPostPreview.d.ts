import { type NetworkName } from "./networks.js";
import { type SocialPreviewLabels } from "./socialPreviewLabels.js";
/** How a network shows a post. */
export type SocialPreviewLayout = "feed" | "photo" | "pin" | "video" | "vertical";
export interface SocialPreviewMedia {
    /** A stable key of the item, for example the file ID. */
    readonly id: string;
    readonly kind: "image" | "video";
    /** A same-origin or blob address of the picture, or of the video frame. */
    readonly src: string | null;
}
export interface SocialPostPreviewProps {
    readonly network: NetworkName;
    /** The name of the account. */
    readonly name: string;
    /** The handle of the account, without `@`. */
    readonly handle?: string;
    readonly avatarUrl?: string | null;
    readonly title?: string;
    readonly text: string;
    readonly media: readonly SocialPreviewMedia[];
    /** A short vertical video: a Reel, a Short or a TikTok. */
    readonly vertical?: boolean;
    /** A short time text, for example `Tomorrow 09:00`. */
    readonly time?: string;
    /** Replace the layout of the network. */
    readonly layout?: SocialPreviewLayout;
    readonly labels?: SocialPreviewLabels;
    readonly className?: string;
}
/**
 * An approximate view of a post as a network shows it: the account, the text
 * and the media in the layout of that network. It is a preview, not a copy.
 */
export declare function SocialPostPreview({ avatarUrl, className, handle, labels, layout, media, name, network, text, time, title, vertical, }: SocialPostPreviewProps): import("react").JSX.Element;
//# sourceMappingURL=SocialPostPreview.d.ts.map