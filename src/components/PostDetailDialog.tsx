import { useState, type ReactNode } from "react";

import { Button } from "./Button.js";
import type { CalendarItemState } from "./calendarItems.js";
import { postDetailLabels, type PostDetailLabels } from "./calendarLabels.js";
import { Dialog } from "./Dialog.js";
import { Icon, NetworkIcon } from "./Icon.js";
import { InlineAlert } from "./InlineAlert.js";
import type { NetworkName } from "./networks.js";
import { TabPanel, Tabs } from "./Tabs.js";
import { TagChip } from "./TagChip.js";
import { useAsyncAction } from "./useAsyncAction.js";

export interface PostDetailMedia {
  readonly type: "image" | "video";
  readonly src: string;
  /** A still picture for a video. */
  readonly poster?: string | null;
  /** The length of a video, for example "0:38". */
  readonly duration?: string | null;
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
}

export interface PostDetailDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly title: ReactNode;
  readonly media?: PostDetailMedia | null;
  /** Internal tags of the post. */
  readonly tags?: readonly string[];
  readonly targets: readonly PostDetailTarget[];
  /** Send a failed network again. Without it, there is no retry button. */
  readonly onRetry?: (targetId: string) => Promise<void>;
  readonly errorMessage: (error: unknown) => string | null;
  readonly labels?: PostDetailLabels;
}

const noTags: readonly string[] = [];

const stateOrder: readonly CalendarItemState[] = [
  "published",
  "publishing",
  "scheduled",
  "failed",
  "cancelled",
];

const stateTones: Record<CalendarItemState, "ok" | "bad" | "neutral"> = {
  published: "ok",
  publishing: "neutral",
  scheduled: "neutral",
  failed: "bad",
  cancelled: "neutral",
};

interface MediaTileProps {
  readonly media: PostDetailMedia;
  readonly playLabel: string;
}

function MediaTile({ media, playLabel }: MediaTileProps) {
  const [playing, setPlaying] = useState(false);
  if (media.type === "image") {
    return (
      <div className="od-post-detail-media">
        <img alt="" src={media.src} />
      </div>
    );
  }
  if (playing) {
    return (
      <div className="od-post-detail-media" data-playing="true">
        {/* react-doctor-disable-next-line react-doctor/media-has-caption -- The host has no caption track for a social video. */}
        <video
          aria-label={playLabel}
          autoPlay
          controls
          playsInline
          src={media.src}
        />
      </div>
    );
  }
  return (
    <div className="od-post-detail-media">
      {media.poster ? <img alt="" src={media.poster} /> : null}
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

interface TargetRowProps {
  readonly target: PostDetailTarget;
  readonly labels: PostDetailLabels;
  readonly pending: boolean;
  readonly onRetry: ((targetId: string) => void) | null;
}

function TargetRow({ labels, onRetry, pending, target }: TargetRowProps) {
  return (
    <li className="od-post-detail-target" data-state={target.state}>
      <NetworkIcon badge network={target.network} />
      <span className="od-post-detail-target-name">{target.name}</span>
      {target.state === "failed" ? (
        <>
          <span className="od-post-detail-target-note">
            {target.error ?? labels.states.failed}
          </span>
          {onRetry === null ? null : (
            <Button
              disabled={pending}
              icon={<Icon name="retry" size={15} />}
              onClick={() => {
                onRetry(target.id);
              }}
              size="small"
              variant="secondary"
            >
              {labels.retry}
            </Button>
          )}
        </>
      ) : target.url ? (
        <a
          className="od-post-detail-target-link"
          href={target.url}
          rel="noreferrer"
          target="_blank"
        >
          {labels.open}
          <Icon name="external-link" size={13} />
        </a>
      ) : (
        <span className="od-post-detail-target-state">
          {labels.states[target.state]}
        </span>
      )}
    </li>
  );
}

/**
 * The details of one post: media, text, time, tags, the state of each
 * network and a link to each published post. When the text or the time
 * differs between networks, each network has a tab.
 */
export function PostDetailDialog({
  errorMessage,
  labels = postDetailLabels,
  media = null,
  onClose,
  onRetry,
  open,
  tags = noTags,
  targets,
  title,
}: PostDetailDialogProps) {
  const retry = useAsyncAction(errorMessage);
  const [selected, setSelected] = useState<string | null>(null);
  const first = targets[0];
  const differs = targets.some(
    (target) => target.text !== first?.text || target.when !== first.when,
  );
  const shown =
    (differs ? targets.find((target) => target.id === selected) : undefined) ??
    first;
  const counts = stateOrder.flatMap((state) => {
    const count = targets.filter((target) => target.state === state).length;
    return count > 0 ? [{ state, count }] : [];
  });

  const close = () => {
    retry.reset();
    setSelected(null);
    onClose();
  };

  const body = (
    <div className="od-post-detail-main" data-media={media !== null}>
      {media === null ? null : (
        <MediaTile key={media.src} media={media} playLabel={labels.play} />
      )}
      <div className="od-post-detail-text">
        {(shown?.text ?? "")
          .split(/\n+/)
          .filter((line) => line.trim() !== "")
          .map((line, index) => (
            // react-doctor-disable-next-line react-doctor/no-array-index-key -- The lines of one text have no identity and no state.
            <p key={`${String(index)}:${line}`}>{line}</p>
          ))}
        {tags.length === 0 ? null : (
          <div className="od-post-detail-tags">
            {tags.map((tag) => (
              <TagChip key={tag}>#{tag}</TagChip>
            ))}
          </div>
        )}
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
      </div>
    </div>
  );

  return (
    <Dialog
      bodyClassName="od-post-detail-body"
      className="od-post-detail"
      closeLabel={labels.close}
      description={shown?.when}
      onClose={close}
      open={open}
      title={title}
    >
      {differs && shown !== undefined ? (
        <>
          <Tabs
            className="od-post-detail-tabs"
            idBase="od-post-detail"
            items={targets.map((target) => ({
              id: target.id,
              label: (
                <>
                  <NetworkIcon network={target.network} />
                  {target.name}
                </>
              ),
            }))}
            label={labels.variants}
            onChange={setSelected}
            value={shown.id}
          />
          <TabPanel id={shown.id} idBase="od-post-detail">
            {body}
          </TabPanel>
        </>
      ) : (
        body
      )}
      {retry.failure === null ? null : (
        <InlineAlert className="od-post-detail-alert" tone="error">
          {retry.failure}
        </InlineAlert>
      )}
      <ul aria-label={labels.channels} className="od-post-detail-targets">
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
            pending={retry.pending}
            target={target}
          />
        ))}
      </ul>
    </Dialog>
  );
}
