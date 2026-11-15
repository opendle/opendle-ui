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
  labels = tagFilterLabels,
  onChange,
  tagColors = noColors,
  tags,
  value,
}: TagFilterBarProps) {
  if (channels.length === 0 && tags.length === 0) return null;
  return (
    <fieldset
      aria-label={labels.filters}
      className={classes("od-tag-filter", className)}
    >
      {channels.length === 0 ? null : (
        <fieldset aria-label={labels.channels} className="od-tag-filter-group">
          <span aria-hidden="true" className="od-tag-filter-label">
            {labels.channels}
          </span>
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
          <span aria-hidden="true" className="od-tag-filter-label">
            {labels.tags}
          </span>
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
    </fieldset>
  );
}
