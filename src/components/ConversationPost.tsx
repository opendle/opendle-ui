import type { ReactNode } from "react";

import { classes } from "./classes.js";
import { Icon, NetworkIcon } from "./Icon.js";
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
  readonly className?: string;
}

const noStats: readonly string[] = [];

/** The post at the top of a conversation. */
export function ConversationPost({
  className,
  network,
  openLabel = "Open",
  stats = noStats,
  text = "",
  thumbnail = null,
  title,
  url = null,
  when,
}: ConversationPostProps) {
  return (
    <article className={classes("od-conversation-post", className)}>
      {thumbnail === null ? null : (
        <img alt="" className="od-conversation-post-media" src={thumbnail} />
      )}
      <div className="od-conversation-post-body">
        <div className="od-conversation-post-head">
          <NetworkIcon labelled network={network} />
          <strong>{title}</strong>
          {when === undefined ? null : <time>{when}</time>}
          {url === null ? null : (
            <a
              aria-label={openLabel}
              className="od-conversation-post-link"
              href={url}
              rel="noreferrer"
              target="_blank"
              title={openLabel}
            >
              <Icon name="external-link" size={14} />
            </a>
          )}
        </div>
        {text === "" ? null : <p>{text}</p>}
        {stats.length === 0 ? null : (
          <p className="od-conversation-post-stats">
            {stats.map((stat) => (
              <span key={stat}>{stat}</span>
            ))}
          </p>
        )}
      </div>
    </article>
  );
}
