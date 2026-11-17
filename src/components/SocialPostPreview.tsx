import { Fragment } from "react";

import { Avatar } from "./Avatar.js";
import { classes } from "./classes.js";
import { Icon, NetworkIcon } from "./Icon.js";
import { networkLabel, type NetworkName } from "./networks.js";
import {
  socialPreviewLabels,
  type SocialPreviewLabels,
} from "./socialPreviewLabels.js";

/** How a network shows a post. */
export type SocialPreviewLayout =
  "feed" | "photo" | "pin" | "video" | "vertical";

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

const layouts: Partial<Record<NetworkName, SocialPreviewLayout>> = {
  instagram: "photo",
  pinterest: "pin",
  youtube: "video",
  tiktok: "vertical",
};

const entity = /(https?:\/\/[^\s]+|[#@][\p{L}\p{N}_.]*[\p{L}\p{N}_])/u;

/** The text with links, hashtags and mentions marked. */
function RichText({ text }: { readonly text: string }) {
  const parts = text.split(entity);
  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <span className="od-social-entity" key={`${String(index)}:${part}`}>
            {part}
          </span>
        ) : (
          <Fragment key={`${String(index)}:${part}`}>{part}</Fragment>
        ),
      )}
    </>
  );
}

function Picture({
  item,
  labels,
}: {
  readonly item: SocialPreviewMedia | undefined;
  readonly labels: SocialPreviewLabels;
}) {
  if (item === undefined)
    return (
      <span className="od-social-media-empty">
        <Icon name="image" size={22} />
        {labels.noMedia}
      </span>
    );
  return (
    <>
      {item.src === null ? (
        <span className="od-social-media-empty">
          <Icon name={item.kind === "video" ? "play" : "image"} size={22} />
        </span>
      ) : (
        <img alt="" src={item.src} />
      )}
      {item.kind === "video" ? (
        <span className="od-social-play">
          <Icon name="play" size={18} />
        </span>
      ) : null}
    </>
  );
}

function MediaGrid({
  labels,
  media,
}: {
  readonly media: readonly SocialPreviewMedia[];
  readonly labels: SocialPreviewLabels;
}) {
  if (media.length === 0) return null;
  const shown = media.slice(0, 4);
  return (
    <div className="od-social-grid" data-count={shown.length}>
      {shown.map((item, index) => (
        <span className="od-social-media" key={item.id}>
          <Picture item={item} labels={labels} />
          {index === 3 && media.length > 4 ? (
            <span className="od-social-more">{`+${String(media.length - 4)}`}</span>
          ) : null}
        </span>
      ))}
    </div>
  );
}

/**
 * An approximate view of a post as a network shows it: the account, the text
 * and the media in the layout of that network. It is a preview, not a copy.
 */
export function SocialPostPreview({
  avatarUrl,
  className,
  handle,
  labels = socialPreviewLabels,
  layout,
  media,
  name,
  network,
  text,
  time,
  title = "",
  vertical = false,
}: SocialPostPreviewProps) {
  const shape = layout ?? layouts[network] ?? "feed";
  const shownHandle = handle === undefined || handle === "" ? name : handle;
  const account = (
    <span className="od-social-account">
      <Avatar name={name} shape="circle" src={avatarUrl} />
      <span className="od-social-names">
        <strong>{name}</strong>
        {handle === undefined || handle === "" ? null : (
          <span>{`@${handle}`}</span>
        )}
        {time === undefined ? null : <span>{time}</span>}
      </span>
      <NetworkIcon className="od-social-network" network={network} />
    </span>
  );
  const body =
    text.trim() === "" ? null : (
      <p className="od-social-text">
        <RichText text={text} />
      </p>
    );
  const first = media[0];
  return (
    <article
      aria-label={`${labels.preview}: ${networkLabel(network)} · ${name}`}
      className={classes("od-social-preview", className)}
      data-layout={shape}
      data-network={network}
      data-vertical={vertical || undefined}
    >
      {shape === "feed" ? (
        <>
          {account}
          {title === "" ? null : <p className="od-social-title">{title}</p>}
          {body}
          <MediaGrid labels={labels} media={media} />
        </>
      ) : shape === "photo" ? (
        <>
          {account}
          <span className="od-social-media od-social-hero">
            <Picture item={first} labels={labels} />
            {media.length > 1 ? (
              <span className="od-social-dots" aria-hidden="true">
                {media.slice(0, 10).map((item, index) => (
                  <span data-current={index === 0 || undefined} key={item.id} />
                ))}
              </span>
            ) : null}
          </span>
          <p className="od-social-caption">
            <strong>{shownHandle}</strong>{" "}
            {text.trim() === "" ? null : <RichText text={text} />}
          </p>
        </>
      ) : shape === "pin" ? (
        <>
          <span className="od-social-media od-social-hero">
            <Picture item={first} labels={labels} />
          </span>
          {title === "" ? null : <p className="od-social-title">{title}</p>}
          {body}
          {account}
        </>
      ) : shape === "video" && !vertical ? (
        <>
          <span className="od-social-media od-social-hero">
            <Picture item={first} labels={labels} />
          </span>
          <p className="od-social-title">
            {title === "" ? text.split("\n")[0] : title}
          </p>
          {account}
          {body}
        </>
      ) : (
        <span className="od-social-media od-social-hero">
          <Picture item={first} labels={labels} />
          <span className="od-social-overlay">
            <strong>{`@${shownHandle}`}</strong>
            {title === "" ? null : (
              <span className="od-social-title">{title}</span>
            )}
            {text.trim() === "" ? null : (
              <span className="od-social-text">
                <RichText text={text} />
              </span>
            )}
          </span>
        </span>
      )}
    </article>
  );
}
