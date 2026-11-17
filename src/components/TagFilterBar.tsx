import type { ReactNode } from "react";

import { classes } from "./classes.js";
import { NetworkIcon } from "./Icon.js";
import {
  tagFilterLabels,
  type TagColors,
  type TagFilterChannel,
  type TagFilterLabels,
  type TagFilterValue,
} from "./calendarLabels.js";
import { SegmentedControl } from "./SegmentedControl.js";
import { TagChip } from "./TagChip.js";

export interface TagFilterBarProps {
  readonly channels: readonly TagFilterChannel[];
  readonly tags: readonly string[];
  /** The colour key, from 1 to 12, of each tag. */
  readonly tagColors?: TagColors;
  readonly value: TagFilterValue;
  readonly onChange: (value: TagFilterValue) => void;
  readonly labels?: TagFilterLabels;
  readonly className?: string;
  /**
   * Other filters of the view, for example a search field. They come first.
   * The channel and tag choices follow them, or wrap below them as one row.
   */
  readonly controls?: ReactNode;
}

const noColors: TagColors = {};

function toggled(list: readonly string[], item: string): readonly string[] {
  return list.includes(item)
    ? list.filter((entry) => entry !== item)
    : [...list, item];
}

/**
 * Filters for channels and tags, with the AND or OR logic of the tags. A
 * group with no entry does not show.
 */
export function TagFilterBar({
  channels,
  className,
  controls,
  labels = tagFilterLabels,
  onChange,
  tagColors = noColors,
  tags,
  value,
}: TagFilterBarProps) {
  const hasControls = controls !== undefined && controls !== null;
  const hasChoices = channels.length > 0 || tags.length > 0;
  if (!hasControls && !hasChoices) return null;
  const choices = (
    <>
      {channels.length === 0 ? null : (
        <fieldset aria-label={labels.channels} className="od-tag-filter-group">
          <span
            className="od-tag-filter-channels"
            data-filtered={value.channels.length > 0}
          >
            {channels.map((channel) => (
              <button
                aria-label={channel.label}
                aria-pressed={value.channels.includes(channel.id)}
                className="od-tag-filter-channel"
                key={channel.id}
                onClick={() => {
                  onChange({
                    ...value,
                    channels: toggled(value.channels, channel.id),
                  });
                }}
                title={channel.label}
                type="button"
              >
                <NetworkIcon badge network={channel.network} />
              </button>
            ))}
          </span>
        </fieldset>
      )}
      {tags.length === 0 ? null : (
        <fieldset aria-label={labels.tags} className="od-tag-filter-group">
          {tags.map((tag) => (
            <TagChip
              color={tagColors[tag]}
              key={tag}
              onPressedChange={() => {
                onChange({ ...value, tags: toggled(value.tags, tag) });
              }}
              pressed={value.tags.includes(tag)}
            >
              #{tag}
            </TagChip>
          ))}
        </fieldset>
      )}
      {tags.length === 0 ? null : (
        <SegmentedControl
          className="od-tag-filter-match"
          label={labels.match}
          onChange={(match) => {
            onChange({ ...value, match });
          }}
          options={[
            { value: "all", label: labels.matchAll },
            { value: "any", label: labels.matchAny },
          ]}
          size="small"
          value={value.match}
        />
      )}
    </>
  );
  if (!hasControls) {
    return (
      <fieldset
        aria-label={labels.filters}
        className={classes("od-tag-filter", className)}
      >
        {choices}
      </fieldset>
    );
  }
  return (
    <fieldset
      aria-label={labels.filters}
      className={classes("od-tag-filter", className)}
      data-controls="true"
    >
      <div className="od-tag-filter-controls">{controls}</div>
      {hasChoices ? (
        <div className="od-tag-filter-choices">{choices}</div>
      ) : null}
    </fieldset>
  );
}
