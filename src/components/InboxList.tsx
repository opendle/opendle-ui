import type { MouseEvent } from "react";

import { Avatar } from "./Avatar.js";
import { classes } from "./classes.js";
import { NetworkIcon } from "./Icon.js";
import type { NetworkName } from "./networks.js";

export interface InboxEntry {
  readonly id: string;
  readonly network: NetworkName;
  readonly authorName: string;
  readonly avatarUrl: string | null;
  readonly text: string;
  /** The time, already formatted. */
  readonly when: string;
  readonly createdAt: string;
  /** The post that the message is about. */
  readonly context?: string;
  readonly href: string;
}

export interface InboxListProps {
  readonly items: readonly InboxEntry[];
  readonly selectedId?: string | null;
  /** Called for an unmodified click, with the event to prevent. */
  readonly onOpen?: (
    item: InboxEntry,
    event: MouseEvent<HTMLAnchorElement>,
  ) => void;
  readonly empty: string;
  /** With it, a button at the end asks for older messages. */
  readonly onLoadMore?: () => void;
  readonly moreLabel?: string;
  /** The accessible name of the list. */
  readonly label: string;
  readonly className?: string;
}

/** The messages of an inbox, newest first. Each row is a link. */
export function InboxList({
  className,
  empty,
  items,
  label,
  moreLabel = "Older",
  onLoadMore,
  onOpen,
  selectedId = null,
}: InboxListProps) {
  if (items.length === 0) {
    return <p className="od-inbox-empty">{empty}</p>;
  }
  return (
    <nav aria-label={label} className={classes("od-inbox", className)}>
      {items.map((item) => (
        <a
          aria-current={item.id === selectedId ? "true" : undefined}
          className="od-inbox-row"
          href={item.href}
          key={item.id}
          onClick={(event) => {
            onOpen?.(item, event);
          }}
        >
          <span className="od-inbox-avatar">
            <Avatar name={item.authorName} src={item.avatarUrl} />
            <NetworkIcon badge network={item.network} />
          </span>
          <span className="od-inbox-copy">
            <span className="od-inbox-head">
              <strong>{item.authorName}</strong>
              <time dateTime={item.createdAt}>{item.when}</time>
            </span>
            <span className="od-inbox-text">{item.text}</span>
            {item.context ? (
              <span className="od-inbox-context">{item.context}</span>
            ) : null}
          </span>
        </a>
      ))}
      {onLoadMore === undefined ? null : (
        <button className="od-calendar-more" onClick={onLoadMore} type="button">
          {moreLabel}
        </button>
      )}
    </nav>
  );
}
