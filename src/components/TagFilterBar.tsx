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
  readonly channelTags: readonly string[];
  readonly postTags: readonly string[];
  readonly value: TagFilterValue;
  readonly onChange: (value: TagFilterValue) => void;
  /** The colour key of each channel tag and of each post tag. */
  readonly channelTagColors?: TagColors;
  readonly postTagColors?: TagColors;
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
 * Filters for channels, channel tags and post tags, with the AND or OR logic
 * of the tags. A group with no entry does not show.
 */
export function TagFilterBar({
  channelTagColors = noColors,
  channelTags,
  channels,
  className,
  labels = tagFilterLabels,
  onChange,
  postTagColors = noColors,
  postTags,
  value,
}: TagFilterBarProps) {
  if (
    channels.length === 0 &&
    channelTags.length === 0 &&
    postTags.length === 0
  ) {
    return null;
  }
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
      {channelTags.length === 0 ? null : (
        <fieldset
          aria-label={labels.channelTags}
          className="od-tag-filter-group"
        >
          <span aria-hidden="true" className="od-tag-filter-label">
            {labels.channelTags}
          </span>
          {channelTags.map((tag) => (
            <TagChip
              color={channelTagColors[tag]}
              key={tag}
              onPressedChange={() => {
                onChange({
                  ...value,
                  channelTags: toggled(value.channelTags, tag),
                });
              }}
              pressed={value.channelTags.includes(tag)}
            >
              #{tag}
            </TagChip>
          ))}
        </fieldset>
      )}
      {postTags.length === 0 ? null : (
        <fieldset aria-label={labels.postTags} className="od-tag-filter-group">
          <span aria-hidden="true" className="od-tag-filter-label">
            {labels.postTags}
          </span>
          {postTags.map((tag) => (
            <TagChip
              color={postTagColors[tag]}
              key={tag}
              onPressedChange={() => {
                onChange({ ...value, postTags: toggled(value.postTags, tag) });
              }}
              pressed={value.postTags.includes(tag)}
            >
              #{tag}
            </TagChip>
          ))}
        </fieldset>
      )}
      {channelTags.length + postTags.length === 0 ? null : (
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
