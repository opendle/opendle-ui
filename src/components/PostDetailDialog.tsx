import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type SyntheticEvent,
} from "react";

import { Button } from "./Button.js";
import type { CalendarItemState } from "./calendarItems.js";
import { postDetailLabels, type PostDetailLabels } from "./calendarLabels.js";
import { classes } from "./classes.js";
import { Dialog } from "./Dialog.js";
import { Icon, NetworkIcon } from "./Icon.js";
import { IconButton } from "./IconButton.js";
import { InlineAlert } from "./InlineAlert.js";
import { LinkedText } from "./LinkedText.js";
import type { NetworkName } from "./networks.js";
import { placePanel } from "./placePanel.js";
import { TabPanel, Tabs } from "./Tabs.js";
import { TagChip } from "./TagChip.js";
import { TagInput } from "./TagInput.js";
import { useAsyncAction } from "./useAsyncAction.js";

export interface PostDetailMedia {
  readonly type: "image" | "video";
  readonly src: string;
  readonly alt?: string;
  /** A still picture for a video. */
  readonly poster?: string | null;
  /** The length of a video, for example "0:38". */
  readonly duration?: string | null;
}

export interface PostDetailMetric {
  readonly label: string;
  readonly value: string;
}

/** One network that the post goes to. */
export interface PostDetailTarget {
  readonly id: string;
  readonly network: NetworkName;
  /** The name of the channel, for example the network or the account. */
  readonly name: string;
  readonly state: CalendarItemState;
  /** The address of the published post. */
  readonly url?: string | null;
  /** The reason of a failure. */
  readonly error?: string | null;
  readonly text: string;
  /** The time of this network, already formatted. */
  readonly when: string;
  readonly media?: readonly PostDetailMedia[];
  /** The channel has a button that changes its time. */
  readonly canReschedule?: boolean;
  /** Not shown: a channel that cannot change its time has no button. */
  readonly scheduleDisabledReason?: string;
}

export interface PostDetailDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly title: ReactNode;
  readonly media?: PostDetailMedia | null;
  /** Internal tags of the post. */
  readonly tags?: readonly string[];
  /** The colour key, from 1 to 12, of each tag name. */
  readonly tagColors?: Readonly<Record<string, number>>;
  /**
   * Change the tags in place. The host saves them and gives the new `tags`.
   * Without it, the tags are read-only.
   */
  readonly onTagsChange?: (tags: readonly string[]) => void;
  /** Known tags that the tag input suggests. */
  readonly tagSuggestions?: readonly string[];
  readonly targets: readonly PostDetailTarget[];
  /** Send a failed network again. Without it, there is no retry button. */
  readonly onRetry?: (targetId: string) => Promise<void>;
  readonly onReschedule?: (targetId: string | null) => void;
  readonly rescheduleLabel?: string;
  /**
   * The form that changes a time. Without `scheduleTargetId`, it shows above
   * the content and changes the time of all channels.
   */
  readonly scheduleEditor?: ReactNode;
  /**
   * The channel of `scheduleEditor`. The editor then opens in a small panel
   * next to the calendar button of that channel.
   */
  readonly scheduleTargetId?: string | null;
  /** Close the panel of `scheduleEditor` after Escape or a press outside. */
  readonly onScheduleDismiss?: () => void;
  /**
   * Give a channel with its own time the time of the post again. Without it,
   * there is no reset button.
   */
  readonly onResetSchedule?: (targetId: string) => void;
  readonly resetScheduleLabel?: string;
  readonly errorMessage: (error: unknown) => string | null;
  /**
   * Show a failure outside the component, for example in a toast. With it,
   * the component shows no failure of its own.
   */
  readonly onError?: (message: string) => void;
  /** Key numbers of the post, already formatted. */
  readonly metrics?: readonly PostDetailMetric[];
  /**
   * More content at the end, for example the comments of the post. Use
   * `PostDetailSection` for each part so that all parts look the same.
   */
  readonly children?: ReactNode;
  /** Actions next to the close button, for example an edit button. */
  readonly actions?: ReactNode;
  readonly labels?: PostDetailLabels;
}

const noTags: readonly string[] = [];
const noMetrics: readonly PostDetailMetric[] = [];

const stateOrder: readonly CalendarItemState[] = [
  "published",
  "publishing",
  "scheduled",
  "failed",
  "cancelled",
  "draft",
];

const stateTones: Record<CalendarItemState, "ok" | "bad" | "neutral"> = {
  draft: "neutral",
  published: "ok",
  publishing: "neutral",
  scheduled: "neutral",
  failed: "bad",
  cancelled: "neutral",
};

export interface PostDetailSectionProps {
  readonly title: ReactNode;
  /** Controls at the end of the heading, for example a small button. */
  readonly actions?: ReactNode;
  readonly children: ReactNode;
  readonly className?: string;
}

/** One part of the post details below the content, with a small heading. */
export function PostDetailSection({
  actions,
  children,
  className,
  title,
}: PostDetailSectionProps) {
  const id = useId();
  return (
    <section
      aria-labelledby={id}
      className={classes("od-post-detail-section", className)}
    >
      <div className="od-post-detail-section-heading">
        <h3 id={id}>{title}</h3>
        {actions}
      </div>
      {children}
    </section>
  );
}

function MediaGallery({
  media,
  playLabel,
}: {
  readonly media: readonly PostDetailMedia[];
  readonly playLabel: string;
}) {
  const [index, setIndex] = useState(0);
  const shown = media[index] ?? media[0];
  if (shown === undefined) return null;
  return (
    <div className="od-post-detail-gallery">
      <MediaTile key={shown.src} media={shown} playLabel={playLabel} />
      {media.length < 2 ? null : (
        <div className="od-post-detail-gallery-controls" aria-label="Media">
          <Button
            variant="quiet"
            aria-label="Previous image"
            disabled={index === 0}
            onClick={() => {
              setIndex((current) => Math.max(0, current - 1));
            }}
          >
            <Icon name="chevron-left" size={16} />
          </Button>
          <output>
            {index + 1} / {media.length}
          </output>
          <Button
            variant="quiet"
            aria-label="Next image"
            disabled={index >= media.length - 1}
            onClick={() => {
              setIndex((current) => Math.min(media.length - 1, current + 1));
            }}
          >
            <Icon name="chevron-right" size={16} />
          </Button>
        </div>
      )}
    </div>
  );
}

interface MediaTileProps {
  readonly media: PostDetailMedia;
  readonly playLabel: string;
}

function MediaTile({ media, playLabel }: MediaTileProps) {
  const [playing, setPlaying] = useState(false);
  // A wide picture or video gets a wider column than a tall one.
  const [wide, setWide] = useState(false);
  const measureImage = (event: SyntheticEvent<HTMLImageElement>) => {
    const { naturalHeight, naturalWidth } = event.currentTarget;
    setWide(naturalWidth > naturalHeight);
  };
  const measureVideo = (event: SyntheticEvent<HTMLVideoElement>) => {
    const { videoHeight, videoWidth } = event.currentTarget;
    if (videoWidth > 0 && videoHeight > 0) setWide(videoWidth > videoHeight);
  };
  if (media.type === "image") {
    return (
      <div className="od-post-detail-media" data-wide={wide}>
        <img alt={media.alt ?? ""} onLoad={measureImage} src={media.src} />
      </div>
    );
  }
  if (playing) {
    return (
      <div
        className="od-post-detail-media"
        data-playing="true"
        data-wide={wide}
      >
        {/* react-doctor-disable-next-line react-doctor/media-has-caption -- The host has no caption track for a social video. */}
        <video
          aria-label={playLabel}
          autoPlay
          controls
          onLoadedMetadata={measureVideo}
          playsInline
          {...(media.poster ? { poster: media.poster } : {})}
          src={media.src}
        />
      </div>
    );
  }
  return (
    <div className="od-post-detail-media" data-wide={wide}>
      {media.poster ? (
        <img alt="" onLoad={measureImage} src={media.poster} />
      ) : (
        // react-doctor-disable-next-line react-doctor/media-has-caption -- This muted video supplies a still preview only.
        <video
          aria-label={playLabel}
          muted
          onLoadedMetadata={measureVideo}
          playsInline
          preload="metadata"
          src={media.src}
        />
      )}
      <button
        aria-label={playLabel}
        className="od-post-detail-play"
        onClick={() => {
          setPlaying(true);
        }}
        title={playLabel}
        type="button"
      >
        <Icon name="play" />
      </button>
      {media.duration ? (
        <span className="od-post-detail-duration">{media.duration}</span>
      ) : null}
    </div>
  );
}

interface SchedulePanelProps {
  readonly anchor: HTMLElement | null;
  readonly label: string;
  readonly onDismiss: (() => void) | undefined;
  readonly children: ReactNode;
}

/**
 * The time form of one channel, next to its calendar button. The panel is
 * fixed to the window, so the scroll area of the dialog does not cut it.
 * Escape or a press outside closes it.
 */
function SchedulePanel({
  anchor,
  children,
  label,
  onDismiss,
}: SchedulePanelProps) {
  const panelRef = useRef<HTMLDialogElement>(null);
  const dismissRef = useRef(onDismiss);
  useEffect(() => {
    dismissRef.current = onDismiss;
  }, [onDismiss]);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (anchor === null || panel === null) return undefined;
    const update = () => {
      placePanel(anchor, panel, "end");
    };
    update();
    panel
      .querySelector<HTMLElement>("input, select, textarea, button")
      ?.focus({ preventScroll: true });
    const resize = new ResizeObserver(update);
    resize.observe(panel);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      resize.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [anchor]);

  useEffect(() => {
    const outside = (event: PointerEvent) => {
      const node = event.target;
      if (
        node instanceof Node &&
        panelRef.current?.contains(node) !== true &&
        anchor?.contains(node) !== true
      ) {
        dismissRef.current?.();
      }
    };
    document.addEventListener("pointerdown", outside);
    return () => {
      document.removeEventListener("pointerdown", outside);
    };
  }, [anchor]);

  const keyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key !== "Escape") return;
    // A prevented Escape does not close the dialog of the post.
    event.preventDefault();
    event.stopPropagation();
    dismissRef.current?.();
    anchor?.querySelector("button")?.focus();
  };

  return (
    // react-doctor-disable-next-line react-doctor/no-noninteractive-element-interactions -- The panel contains Escape so that it closes before the dialog of the post.
    <dialog
      aria-label={label}
      className="od-post-detail-schedule-panel"
      onKeyDown={keyDown}
      open
      ref={panelRef}
    >
      {children}
    </dialog>
  );
}

interface TargetRowProps {
  readonly target: PostDetailTarget;
  /** The time of the dialog heading. A different time shows in the row. */
  readonly when: string | undefined;
  readonly labels: PostDetailLabels;
  readonly pending: boolean;
  readonly onRetry: ((targetId: string) => void) | null;
  readonly onReschedule: ((targetId: string | null) => void) | undefined;
  readonly rescheduleLabel: string;
  readonly onResetSchedule: ((targetId: string) => void) | undefined;
  readonly resetScheduleLabel: string;
  /** The time form of this channel, when it is open. */
  readonly scheduleEditor: ReactNode;
  readonly onScheduleDismiss: (() => void) | undefined;
}

function TargetRow({
  labels,
  onResetSchedule,
  onRetry,
  onReschedule,
  onScheduleDismiss,
  pending,
  rescheduleLabel,
  resetScheduleLabel,
  scheduleEditor,
  target,
  when,
}: TargetRowProps) {
  const [anchor, setAnchor] = useState<HTMLSpanElement | null>(null);
  const failed = target.state === "failed";
  const ownTime = target.when !== when;
  const meta = [labels.states[target.state], ownTime ? target.when : null]
    .filter((part) => part !== null)
    .join(" · ");
  const reschedule =
    onReschedule !== undefined &&
    target.canReschedule === true &&
    (target.state === "scheduled" || failed);
  const editing = scheduleEditor !== null && scheduleEditor !== undefined;
  return (
    <li className="od-post-detail-target" data-state={target.state}>
      <NetworkIcon badge network={target.network} />
      <div className="od-post-detail-target-copy">
        <span className="od-post-detail-target-name">{target.name}</span>
        <span className="od-post-detail-target-meta">{meta}</span>
        {failed && target.error ? (
          <p className="od-post-detail-target-error">{target.error}</p>
        ) : null}
      </div>
      <div className="od-post-detail-target-actions">
        {failed && onRetry !== null ? (
          <Button
            icon={<Icon name="retry" size={14} />}
            loading={pending}
            onClick={() => {
              onRetry(target.id);
            }}
            size="small"
            variant="secondary"
          >
            {labels.retry}
          </Button>
        ) : null}
        {reschedule && ownTime && onResetSchedule !== undefined ? (
          <IconButton
            className="od-post-detail-target-schedule"
            icon={<Icon name="undo" size={15} />}
            label={`${resetScheduleLabel} · ${target.name}`}
            onClick={() => {
              onResetSchedule(target.id);
            }}
          />
        ) : null}
        {reschedule ? (
          <span className="od-post-detail-target-anchor" ref={setAnchor}>
            <IconButton
              aria-expanded={editing}
              aria-haspopup="dialog"
              className="od-post-detail-target-schedule"
              icon={<Icon name="calendar" size={15} />}
              label={`${rescheduleLabel} · ${target.name}`}
              onClick={() => {
                if (editing) onScheduleDismiss?.();
                else onReschedule(target.id);
              }}
            />
          </span>
        ) : null}
        {target.url ? (
          <a
            className="od-button od-button-quiet od-post-detail-target-link"
            data-size="small"
            href={target.url}
            rel="noreferrer"
            target="_blank"
          >
            {labels.open}
            <Icon name="external-link" size={13} />
          </a>
        ) : null}
      </div>
      {editing ? (
        <SchedulePanel
          anchor={anchor}
          label={`${rescheduleLabel} · ${target.name}`}
          onDismiss={onScheduleDismiss}
        >
          {scheduleEditor}
        </SchedulePanel>
      ) : null}
    </li>
  );
}

/**
 * The time of the post: the time of most channels. On a tie, the first
 * channel wins.
 */
function commonWhen(targets: readonly PostDetailTarget[]): string | undefined {
  const counts = new Map<string, number>();
  for (const target of targets)
    counts.set(target.when, (counts.get(target.when) ?? 0) + 1);
  let best: string | undefined;
  let most = 0;
  for (const [when, count] of counts) {
    if (count > most) {
      best = when;
      most = count;
    }
  }
  return best;
}

/** Channels with the same text and media share one version of the post. */
interface Version {
  readonly id: string;
  readonly targets: readonly PostDetailTarget[];
}

function versionsOf(targets: readonly PostDetailTarget[]): readonly Version[] {
  const versions = new Map<string, PostDetailTarget[]>();
  for (const target of targets) {
    const key = JSON.stringify([target.text, target.media ?? null]);
    const list = versions.get(key);
    if (list === undefined) versions.set(key, [target]);
    else list.push(target);
  }
  return [...versions.values()].map((list) => ({
    id: list[0]?.id ?? "",
    targets: list,
  }));
}

function VersionLabel({ version }: { readonly version: Version }) {
  const only = version.targets.length === 1 ? version.targets[0] : undefined;
  return (
    <span className="od-post-detail-version">
      <span className="od-post-detail-version-networks">
        {version.targets.map((target) => (
          <NetworkIcon
            aria-hidden={only === undefined ? undefined : true}
            key={target.id}
            network={target.network}
          />
        ))}
      </span>
      {only === undefined ? null : only.name}
    </span>
  );
}

/**
 * The details of one post: media, text, time, tags, its numbers, and one row
 * per channel with its state, its link, its error and its actions. When the
 * text or the media differs between channels, a tab shows each version.
 */
export function PostDetailDialog({
  actions,
  children,
  errorMessage,
  labels = postDetailLabels,
  media = null,
  metrics = noMetrics,
  onClose,
  onError,
  onResetSchedule,
  onRetry,
  onReschedule,
  onScheduleDismiss,
  onTagsChange,
  rescheduleLabel = "Change date and time",
  resetScheduleLabel = "Use the time of the post",
  scheduleEditor,
  scheduleTargetId = null,
  open,
  tagColors,
  tagSuggestions,
  tags = noTags,
  targets,
  title,
}: PostDetailDialogProps) {
  const retry = useAsyncAction(errorMessage, onError);
  const [selected, setSelected] = useState<string | null>(null);
  const versions = versionsOf(targets);
  const version =
    versions.find((entry) => entry.id === selected) ?? versions[0];
  const shown = version?.targets[0];
  const when = commonWhen(targets);
  const editedTarget =
    scheduleTargetId === null
      ? undefined
      : targets.find((target) => target.id === scheduleTargetId);
  const counts = stateOrder.flatMap((state) => {
    const count = targets.filter((target) => target.state === state).length;
    return count > 0 ? [{ state, count }] : [];
  });

  const close = () => {
    retry.reset();
    setSelected(null);
    onClose();
  };

  const shownMedia = shown?.media ?? (media === null ? [] : [media]);
  const body = (
    <div className="od-post-detail-main" data-media={shownMedia.length > 0}>
      <MediaGallery
        key={shown?.id ?? "media"}
        media={shownMedia}
        playLabel={labels.play}
      />
      <div className="od-post-detail-text">
        {(shown?.text ?? "")
          .split(/\n+/)
          .filter((line) => line.trim() !== "")
          .map((line, index) => (
            // react-doctor-disable-next-line react-doctor/no-array-index-key -- The lines of one text have no identity and no state.
            <p key={`${String(index)}:${line}`}>
              <LinkedText className="od-post-detail-link" text={line} />
            </p>
          ))}
        <div className="od-post-detail-metadata">
          <p className="od-post-detail-states">
            {counts.map(({ count, state }) => (
              <span
                className="od-post-detail-pill"
                data-tone={stateTones[state]}
                key={state}
              >
                {state === "published" ? <Icon name="check" size={13} /> : null}
                {state === "failed" ? <Icon name="alert" size={13} /> : null}
                {state === "scheduled" ? <Icon name="clock" size={13} /> : null}
                {count} {labels.states[state]}
              </span>
            ))}
          </p>
          {onTagsChange === undefined ? null : (
            <TagInput
              className="od-post-detail-tag-input"
              label={labels.tags}
              onChange={onTagsChange}
              removeLabel={labels.removeTag}
              value={tags}
              {...(tagColors === undefined ? {} : { colors: tagColors })}
              {...(tagSuggestions === undefined
                ? {}
                : { suggestions: tagSuggestions })}
            />
          )}
          {onTagsChange !== undefined || tags.length === 0 ? null : (
            <div className="od-post-detail-tags">
              {tags.map((tag) => (
                <TagChip color={tagColors?.[tag]} key={tag}>
                  #{tag}
                </TagChip>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Dialog
      bodyClassName="od-post-detail-body"
      className="od-post-detail"
      closeLabel={labels.close}
      description={
        onReschedule === undefined ? (
          when
        ) : (
          <button
            className="od-post-detail-date"
            disabled={!targets.some((target) => target.canReschedule)}
            onClick={() => {
              onReschedule(null);
            }}
            title={rescheduleLabel}
            type="button"
          >
            {when}
            <Icon name="calendar" size={14} />
          </button>
        )
      }
      headerActions={actions}
      onClose={close}
      open={open}
      title={title}
    >
      {editedTarget === undefined ? scheduleEditor : null}
      <div className="od-post-detail-content">
        {versions.length > 1 && version !== undefined ? (
          <>
            <Tabs
              className="od-post-detail-versions"
              idBase="od-post-detail"
              items={versions.map((entry) => ({
                id: entry.id,
                label: <VersionLabel version={entry} />,
              }))}
              label={labels.variants}
              onChange={setSelected}
              value={version.id}
            />
            <TabPanel id={version.id} idBase="od-post-detail">
              {body}
            </TabPanel>
          </>
        ) : (
          body
        )}
        {metrics.length === 0 ? null : (
          <dl className="od-post-detail-metrics">
            {metrics.map((metric) => (
              <div key={metric.label}>
                <dt>{metric.label}</dt>
                <dd>{metric.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
      <PostDetailSection
        className="od-post-detail-channels"
        title={labels.channels}
      >
        {retry.failure === null ? null : (
          <InlineAlert className="od-post-detail-alert" tone="error">
            {retry.failure}
          </InlineAlert>
        )}
        <ul className="od-post-detail-targets">
          {targets.map((target) => (
            <TargetRow
              key={target.id}
              labels={labels}
              onRetry={
                onRetry === undefined
                  ? null
                  : (targetId) => {
                      void retry.run(() => onRetry(targetId));
                    }
              }
              onReschedule={onReschedule}
              onResetSchedule={onResetSchedule}
              onScheduleDismiss={onScheduleDismiss}
              rescheduleLabel={rescheduleLabel}
              resetScheduleLabel={resetScheduleLabel}
              scheduleEditor={
                editedTarget?.id === target.id ? scheduleEditor : null
              }
              pending={retry.pending}
              target={target}
              when={when}
            />
          ))}
        </ul>
      </PostDetailSection>
      {children}
    </Dialog>
  );
}
