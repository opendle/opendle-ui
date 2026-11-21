import type { CSSProperties, ReactNode } from "react";

import { classes } from "./classes.js";
import { NetworkIcon } from "./Icon.js";
import type { NetworkName } from "./networks.js";
import { RelativeTime } from "./RelativeTime.js";

export interface RankedPostMetric {
  readonly id: string;
  readonly label: string;
  /** The value, already formatted. */
  readonly value: string;
}

export interface RankedPost {
  readonly id: string;
  readonly title: string;
  readonly network: NetworkName;
  /** The name of the channel that published the post. */
  readonly channel: string;
  /** The ISO instant of the publication. */
  readonly at: string;
  /** A still picture of the media, or `null` for a post without one. */
  readonly previewUrl: string | null;
  readonly video?: boolean;
  /** The same metrics, in the same order, for each post. */
  readonly metrics: readonly RankedPostMetric[];
}

export interface RankedPostListProps {
  /** The accessible name of the list. */
  readonly label: string;
  /** The posts, in rank order. */
  readonly items: readonly RankedPost[];
  /** The ID of the metric that gives the order. Each row marks its value. */
  readonly activeMetric?: string;
  readonly onOpen: (id: string) => void;
  /** The text of an empty list. */
  readonly empty: ReactNode;
  readonly className?: string;
}

/**
 * Posts in rank order. Each row is one button that opens the post: the rank,
 * the media, the title, the network, the channel, the publication time, and
 * the metrics in columns that align from row to row.
 */
export function RankedPostList({
  activeMetric,
  className,
  empty,
  items,
  label,
  onOpen,
}: RankedPostListProps) {
  if (items.length === 0) {
    return (
      <div className={classes("od-ranked-posts", className)}>
        <p className="od-list-empty">{empty}</p>
      </div>
    );
  }
  const columns = Math.max(1, ...items.map((item) => item.metrics.length));
  return (
    <div className={classes("od-ranked-posts", className)}>
      <ol
        aria-label={label}
        className="od-ranked-post-list"
        style={{ "--od-ranked-metrics": columns } as CSSProperties}
      >
        {items.map((item, index) => (
          <li key={item.id}>
            <button
              className="od-ranked-post"
              onClick={() => {
                onOpen(item.id);
              }}
              type="button"
            >
              <span aria-hidden="true" className="od-ranked-post-rank">
                {index + 1}
              </span>
              <span
                className="od-ranked-post-media"
                data-video={item.video === true}
              >
                {item.previewUrl === null ? (
                  <NetworkIcon aria-hidden="true" network={item.network} />
                ) : (
                  <img alt="" loading="lazy" src={item.previewUrl} />
                )}
              </span>
              <span className="od-ranked-post-text">
                <span className="od-ranked-post-title">{item.title}</span>
                <span className="od-ranked-post-meta">
                  <NetworkIcon network={item.network} />
                  <span className="od-ranked-post-channel">{item.channel}</span>
                  <span aria-hidden="true">·</span>
                  <RelativeTime unitStyle="narrow" value={item.at} />
                </span>
              </span>
              <span className="od-ranked-post-metrics">
                {item.metrics.map((metric) => (
                  <span
                    className="od-ranked-post-metric"
                    data-active={metric.id === activeMetric}
                    key={metric.id}
                  >
                    <b>{metric.value}</b>
                    <span>{metric.label}</span>
                  </span>
                ))}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
