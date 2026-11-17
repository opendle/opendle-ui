import { classes } from "./classes.js";
import { Icon } from "./Icon.js";
import type { MediaAttachmentKind } from "./MediaAttachmentList.js";

export interface MediaGridItem {
  readonly id: string;
  readonly kind: MediaAttachmentKind;
  /** A same-origin or blob address of a small picture, or `null`. */
  readonly previewUrl: string | null;
  /** The accessible name, for example a title of the file. */
  readonly label: string;
  /** A short fact below the picture, for example a date. */
  readonly detail?: string;
  readonly duration?: number | null;
  /** The item cannot be selected. */
  readonly disabled?: boolean;
}

export interface MediaGridPickerProps {
  /** The accessible name of the group. */
  readonly label: string;
  readonly items: readonly MediaGridItem[];
  readonly selected: readonly string[];
  readonly onToggle: (id: string) => void;
  readonly className?: string;
}

const kindIcons = { image: "image", video: "play", file: "file" } as const;

function durationOf(seconds: number): string {
  const whole = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(whole / 60);
  return `${String(minutes)}:${String(whole % 60).padStart(2, "0")}`;
}

/**
 * A grid of square previews. Each one is a toggle button, so the user can
 * select several files with the pointer or the keyboard. A selected item shows
 * its place in the selection.
 */
export function MediaGridPicker({
  className,
  items,
  label,
  onToggle,
  selected,
}: MediaGridPickerProps) {
  return (
    <fieldset className={classes("od-media-grid-picker", className)}>
      <legend className="od-visually-hidden">{label}</legend>
      {items.map((item) => {
        const place = selected.indexOf(item.id);
        return (
          <button
            aria-pressed={place >= 0}
            className="od-media-grid-item"
            disabled={item.disabled}
            key={item.id}
            onClick={() => {
              onToggle(item.id);
            }}
            type="button"
          >
            <span className="od-media-grid-picture">
              {item.previewUrl === null ? (
                <Icon name={kindIcons[item.kind]} size={24} />
              ) : (
                <img alt="" src={item.previewUrl} />
              )}
              {item.kind === "video" ? (
                <span className="od-media-grid-kind">
                  <Icon name="play" size={12} />
                  {item.duration === undefined || item.duration === null
                    ? null
                    : durationOf(item.duration)}
                </span>
              ) : null}
              <span aria-hidden="true" className="od-media-grid-mark">
                {place >= 0 ? String(place + 1) : null}
              </span>
            </span>
            <span className="od-media-grid-label">{item.label}</span>
            {item.detail === undefined ? null : (
              <span className="od-media-grid-detail">{item.detail}</span>
            )}
          </button>
        );
      })}
    </fieldset>
  );
}
