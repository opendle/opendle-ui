import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

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
  /** The button that shows all of a long text, and the one that shortens it. */
  readonly moreLabel?: string;
  readonly lessLabel?: string;
  readonly className?: string;
}

/** The text of the post: the first lines, and all lines on request. */
function PostText({
  lessLabel,
  moreLabel,
  text,
}: {
  readonly text: string;
  readonly moreLabel: string;
  readonly lessLabel: string;
}) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [long, setLong] = useState(false);
  // Measure again when the size changes: the styles or the width can come
  // after the first layout.
  useLayoutEffect(() => {
    const element = textRef.current;
    if (element === null || expanded) return undefined;
    const measure = () => {
      setLong(element.scrollHeight > element.clientHeight + 1);
    };
    measure();
    if (typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [expanded, text]);
  return (
    <>
      <p
        className="od-conversation-post-text"
        data-expanded={expanded}
        ref={textRef}
      >
        {text}
      </p>
      {long ? (
        <button
          aria-expanded={expanded}
          className="od-conversation-post-more"
          onClick={() => {
            setExpanded((value) => !value);
          }}
          type="button"
        >
          {expanded ? lessLabel : moreLabel}
        </button>
      ) : null}
    </>
  );
}

const noStats: readonly string[] = [];

/** The post at the top of a conversation. */
export function ConversationPost({
  className,
  lessLabel = "Less",
  moreLabel = "More",
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
          <NetworkIcon network={network} />
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
        {text === "" ? null : (
          <PostText
            key={text}
            lessLabel={lessLabel}
            moreLabel={moreLabel}
            text={text}
          />
        )}
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
