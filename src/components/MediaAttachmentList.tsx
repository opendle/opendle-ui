import { useState, type DragEvent, type ReactNode } from "react";

import { classes } from "./classes.js";
import { Icon } from "./Icon.js";
import {
  mediaAttachmentListLabels,
  type MediaAttachmentListLabels,
} from "./mediaAttachmentLabels.js";

export type MediaAttachmentKind = "image" | "video" | "file";

export interface MediaAttachment {
  readonly id: string;
  readonly kind: MediaAttachmentKind;
  /** A same-origin or blob address of a small picture, or `null`. */
  readonly previewUrl: string | null;
  /** The accessible name of the item, for example `Image 2`. */
  readonly label: string;
  /** Seconds of a video. */
  readonly duration?: number | null;
  /** The part of an upload that is done, from 0 to 1. */
  readonly progress?: number | null;
  /** Why the item cannot be used. */
  readonly error?: string | null;
  /** A short mark on the picture, for example `ALT`. */
  readonly badge?: string | null;
}

export interface MediaAttachmentListProps {
  readonly items: readonly MediaAttachment[];
  /** Put the item at `from` at the position `to`. Without it, no reorder. */
  readonly onMove?: (from: number, to: number) => void;
  /** Remove the item. Without it, the items have no remove button. */
  readonly onRemove?: (id: string) => void;
  /** Open a large preview of the item. */
  readonly onOpen?: (id: string) => void;
  /** More actions of one item, for example a button for its alternative text. */
  readonly actions?: (item: MediaAttachment, index: number) => ReactNode;
  /** The last tile, for example a button that adds a file. */
  readonly children?: ReactNode;
  readonly disabled?: boolean;
  readonly labels?: MediaAttachmentListLabels;
  readonly className?: string;
}

const dragType = "application/x-opendle-attachment";

function durationOf(seconds: number): string {
  const whole = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(whole / 60);
  return `${String(minutes)}:${String(whole % 60).padStart(2, "0")}`;
}

const kindIcons = { image: "image", video: "play", file: "file" } as const;

/**
 * The ordered files of a post: square previews that move by drag and drop or
 * with the move buttons, and a remove button on each. Without `onMove` and
 * `onRemove`, the list only shows the files.
 */
export function MediaAttachmentList({
  actions,
  children,
  className,
  disabled = false,
  items,
  labels = mediaAttachmentListLabels,
  onMove,
  onOpen,
  onRemove,
}: MediaAttachmentListProps) {
  const [dragged, setDragged] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);
  const movable = onMove !== undefined && !disabled && items.length > 1;
  const end = () => {
    setDragged(null);
    setOver(null);
  };
  const drop = (event: DragEvent<HTMLLIElement>, index: number) => {
    if (dragged === null || !event.dataTransfer.types.includes(dragType))
      return;
    event.preventDefault();
    if (dragged !== index) onMove?.(dragged, index);
    end();
  };
  return (
    <ul
      aria-label={labels.list}
      className={classes("od-attachments", className)}
    >
      {items.map((item, index) => {
        const uploading = item.progress !== undefined && item.progress !== null;
        return (
          <li
            className="od-attachment"
            data-dragging={dragged === index || undefined}
            data-drop-target={
              dragged !== null && over === index && dragged !== index
                ? true
                : undefined
            }
            data-invalid={item.error ? true : undefined}
            draggable={movable && !uploading}
            key={item.id}
            onDragEnd={end}
            onDragOver={(event) => {
              if (dragged === null) return;
              event.preventDefault();
              event.dataTransfer.dropEffect = "move";
              setOver(index);
            }}
            onDragStart={(event) => {
              event.dataTransfer.effectAllowed = "move";
              event.dataTransfer.setData(dragType, item.id);
              setDragged(index);
            }}
            onDrop={(event) => {
              drop(event, index);
            }}
            title={item.error ?? undefined}
          >
            {onOpen === undefined || uploading ? (
              <span className="od-attachment-preview">
                <AttachmentPicture item={item} />
              </span>
            ) : (
              <button
                aria-label={`${labels.open}: ${item.label}`}
                className="od-attachment-preview"
                onClick={() => {
                  onOpen(item.id);
                }}
                type="button"
              >
                <AttachmentPicture item={item} />
              </button>
            )}
            {item.kind === "video" &&
            item.duration !== undefined &&
            item.duration !== null ? (
              <span className="od-attachment-duration">
                {durationOf(item.duration)}
              </span>
            ) : null}
            {item.badge ? (
              <span className="od-attachment-badge">{item.badge}</span>
            ) : null}
            {uploading ? (
              <progress
                aria-label={`${labels.uploading}: ${item.label}`}
                className="od-attachment-progress"
                max={100}
                value={Math.round((item.progress ?? 0) * 100)}
              />
            ) : null}
            <span className="od-attachment-actions">
              {movable && !uploading ? (
                <>
                  <button
                    aria-label={`${labels.moveEarlier}: ${item.label}`}
                    className="od-attachment-action"
                    disabled={index === 0}
                    onClick={() => {
                      onMove(index, index - 1);
                    }}
                    title={labels.moveEarlier}
                    type="button"
                  >
                    <Icon name="chevron-left" size={14} />
                  </button>
                  <button
                    aria-label={`${labels.moveLater}: ${item.label}`}
                    className="od-attachment-action"
                    disabled={index === items.length - 1}
                    onClick={() => {
                      onMove(index, index + 1);
                    }}
                    title={labels.moveLater}
                    type="button"
                  >
                    <Icon name="chevron-right" size={14} />
                  </button>
                </>
              ) : null}
              {uploading ? null : actions?.(item, index)}
              {onRemove === undefined ? null : (
                <button
                  aria-label={`${labels.remove}: ${item.label}`}
                  className="od-attachment-action"
                  disabled={disabled}
                  onClick={() => {
                    onRemove(item.id);
                  }}
                  title={labels.remove}
                  type="button"
                >
                  <Icon name="close" size={14} />
                </button>
              )}
            </span>
          </li>
        );
      })}
      {children === undefined || children === null ? null : (
        <li className="od-attachment od-attachment-extra">{children}</li>
      )}
    </ul>
  );
}

function AttachmentPicture({ item }: { readonly item: MediaAttachment }) {
  return item.previewUrl === null ? (
    <span className="od-attachment-placeholder">
      <Icon name={kindIcons[item.kind]} size={22} />
    </span>
  ) : (
    <img alt="" draggable={false} src={item.previewUrl} />
  );
}
