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
  /** A short state label, for example `Replied`, next to the time. */
  readonly status?: string;
  readonly href: string;
}

interface InboxGroup {
  readonly id: string;
  readonly title: string;
  readonly thumbnailUrl?: string | null;
  readonly items: readonly InboxEntry[];
}

export interface InboxListProps {
  readonly items: readonly InboxEntry[];
  /** Complete groups in host order. Their items replace the flat list. */
  readonly groups?: readonly InboxGroup[];
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

interface InboxRowProps {
  readonly item: InboxEntry;
  readonly selectedId: string | null;
  readonly onOpen: InboxListProps["onOpen"];
  readonly grouped?: boolean;
}

function InboxRow({
  grouped = false,
  item,
  onOpen,
  selectedId,
}: InboxRowProps) {
  return (
    <a
      aria-current={item.id === selectedId ? "true" : undefined}
      className="od-inbox-row"
      href={item.href}
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
          {item.status ? (
            <span className="od-inbox-status">{item.status}</span>
          ) : null}
          <time dateTime={item.createdAt}>{item.when}</time>
        </span>
        <span className="od-inbox-text">{item.text}</span>
        {!grouped && item.context ? (
          <span className="od-inbox-context">{item.context}</span>
        ) : null}
      </span>
    </a>
  );
}

/** The messages of an inbox. Optional post cards keep related rows together. */
export function InboxList({
  className,
  empty,
  groups,
  items,
  label,
  moreLabel = "Older",
  onLoadMore,
  onOpen,
  selectedId = null,
}: InboxListProps) {
  if (groups === undefined ? items.length === 0 : groups.length === 0) {
    return <p className="od-inbox-empty">{empty}</p>;
  }
  return (
    <nav aria-label={label} className={classes("od-inbox", className)}>
      {groups === undefined
        ? items.map((item) => (
            <InboxRow
              item={item}
              key={item.id}
              onOpen={onOpen}
              selectedId={selectedId}
            />
          ))
        : groups.map((group) => {
            const first = group.items[0];
            if (first === undefined) return null;
            const networks = [
              ...new Set(group.items.map((item) => item.network)),
            ];
            return (
              <section
                aria-label={group.title}
                className="od-inbox-group"
                key={group.id}
              >
                <a
                  className="od-inbox-group-post"
                  href={first.href}
                  onClick={(event) => {
                    onOpen?.(first, event);
                  }}
                >
                  {group.thumbnailUrl ? (
                    <img alt="" loading="lazy" src={group.thumbnailUrl} />
                  ) : null}
                  <span className="od-inbox-group-title">{group.title}</span>
                  <span className="od-inbox-group-networks">
                    {networks.map((network) => (
                      <NetworkIcon key={network} network={network} />
                    ))}
                  </span>
                </a>
                <div className="od-inbox-group-comments">
                  {group.items.map((item) => (
                    <InboxRow
                      grouped
                      item={item}
                      key={item.id}
                      onOpen={onOpen}
                      selectedId={selectedId}
                    />
                  ))}
                </div>
              </section>
            );
          })}
      {onLoadMore === undefined ? null : (
        <button className="od-calendar-more" onClick={onLoadMore} type="button">
          {moreLabel}
        </button>
      )}
    </nav>
  );
}
