import {
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";

import type { AvatarShape } from "./Avatar.js";
import { Button } from "./Button.js";
import { Dialog } from "./Dialog.js";
import { Icon } from "./Icon.js";
import type { AvatarUploadLabels } from "./identityLabels.js";
import { InlineAlert } from "./InlineAlert.js";
import {
  maximumPictureZoom,
  movePictureCrop,
  pictureArea,
  zoomPictureCrop,
  type PictureCrop,
  type PictureSize,
} from "./pictureCrop.js";

/** A picture that the browser decoded, with a URL for its preview. */
export interface LoadedPicture extends PictureSize {
  readonly url: string;
}

export interface PictureCropDialogProps {
  readonly picture: LoadedPicture | null;
  readonly crop: PictureCrop;
  readonly onCropChange: (crop: PictureCrop) => void;
  readonly aspectRatio: number;
  readonly shape: AvatarShape;
  readonly labels: AvatarUploadLabels;
  readonly pending: boolean;
  readonly failure: string | null;
  readonly onCancel: () => void;
  readonly onSave: () => void;
}

interface Drag {
  readonly crop: PictureCrop;
  readonly x: number;
  readonly y: number;
  readonly distance: number;
}

const zoomStep = 0.1;
const smallIcon = <Icon name="image" size={14} />;
const largeIcon = <Icon name="image" size={20} />;

function percent(value: number): string {
  return `${String(value * 100)}%`;
}

/** The centre and the spread of the active pointers. */
function pointerSpread(points: ReadonlyMap<number, { x: number; y: number }>) {
  const list = [...points.values()];
  const x = list.reduce((sum, point) => sum + point.x, 0) / list.length;
  const y = list.reduce((sum, point) => sum + point.y, 0) / list.length;
  const [first, second] = list;
  const distance =
    first === undefined || second === undefined
      ? 0
      : Math.hypot(first.x - second.x, first.y - second.y);
  return { x, y, distance };
}

/**
 * Move and zoom a picture in a frame of a fixed aspect ratio. A drag, the
 * arrow keys, the zoom slider, the wheel, a pinch and the + and - keys change
 * the visible part.
 */
export function PictureCropDialog({
  aspectRatio,
  crop,
  failure,
  labels,
  onCancel,
  onCropChange,
  onSave,
  pending,
  picture,
  shape,
}: PictureCropDialogProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const pointsRef = useRef(new Map<number, { x: number; y: number }>());
  const dragRef = useRef<Drag | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const size: PictureSize = picture ?? { width: 1, height: 1 };
  const area = pictureArea(size, aspectRatio, crop);

  const change = useCallback(
    (next: PictureCrop) => {
      if (!pending) onCropChange(next);
    },
    [onCropChange, pending],
  );

  const startGesture = () => {
    const spread = pointerSpread(pointsRef.current);
    dragRef.current = { crop, ...spread };
  };

  const pointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (pending || (event.pointerType === "mouse" && event.button !== 0)) {
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    pointsRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });
    frameRef.current?.focus({ preventScroll: true });
    startGesture();
  };

  const pointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const points = pointsRef.current;
    const drag = dragRef.current;
    const frame = frameRef.current;
    if (!points.has(event.pointerId) || drag === null || frame === null) {
      return;
    }
    points.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const spread = pointerSpread(points);
    const zoomed =
      drag.distance > 0 && spread.distance > 0
        ? zoomPictureCrop(
            size,
            aspectRatio,
            drag.crop,
            (drag.crop.zoom * spread.distance) / drag.distance,
          )
        : drag.crop;
    const bounds = frame.getBoundingClientRect();
    change(
      movePictureCrop(
        size,
        aspectRatio,
        zoomed,
        -(spread.x - drag.x) / bounds.width,
        -(spread.y - drag.y) / bounds.height,
      ),
    );
  };

  const pointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    if (!pointsRef.current.delete(event.pointerId)) return;
    if (pointsRef.current.size === 0) dragRef.current = null;
    else startGesture();
  };

  const wheelZoom = useEffectEvent((event: WheelEvent) => {
    event.preventDefault();
    change(
      zoomPictureCrop(
        size,
        aspectRatio,
        crop,
        crop.zoom * Math.exp(-event.deltaY / 400),
      ),
    );
  });

  // A wheel listener must not be passive to keep the page still.
  const open = picture !== null;
  useEffect(() => {
    const stage = stageRef.current;
    if (!open || stage === null) return undefined;
    const wheel = (event: WheelEvent) => {
      wheelZoom(event);
    };
    // react-doctor-disable-next-line react-doctor/client-passive-event-listeners -- The wheel zooms the picture; the page must not scroll.
    stage.addEventListener("wheel", wheel, { passive: false });
    return () => {
      stage.removeEventListener("wheel", wheel);
    };
  }, [open]);

  const keyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 0.1 : 0.02;
    const moves: Record<string, readonly [number, number]> = {
      ArrowLeft: [step, 0],
      ArrowRight: [-step, 0],
      ArrowUp: [0, step],
      ArrowDown: [0, -step],
    };
    const move = moves[event.key];
    if (move !== undefined) {
      event.preventDefault();
      change(movePictureCrop(size, aspectRatio, crop, move[0], move[1]));
      return;
    }
    const zoom =
      event.key === "+" || event.key === "="
        ? zoomStep
        : event.key === "-" || event.key === "_"
          ? -zoomStep
          : 0;
    if (zoom === 0) return;
    event.preventDefault();
    const next = Math.round((crop.zoom + zoom) * 100) / 100;
    change(zoomPictureCrop(size, aspectRatio, crop, next));
  };

  const imageStyle: CSSProperties = {
    left: percent(-area.x / area.width),
    top: percent(-area.y / area.height),
    width: percent(size.width / area.width),
    height: percent(size.height / area.height),
  };
  const stageStyle = {
    "--od-picture-ratio": String(aspectRatio),
  } as CSSProperties;

  return (
    <Dialog
      actions={
        <>
          <Button disabled={pending} onClick={onCancel} variant="secondary">
            {labels.cancel}
          </Button>
          <Button loading={pending} onClick={onSave}>
            {labels.save}
          </Button>
        </>
      }
      bodyClassName="od-picture-crop"
      closeDisabled={pending}
      closeLabel={labels.close}
      onClose={onCancel}
      open={open}
      size="narrow"
      title={labels.cropTitle}
    >
      <div
        className="od-picture-crop-stage"
        data-pending={pending || undefined}
        onLostPointerCapture={pointerEnd}
        onPointerCancel={pointerEnd}
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerEnd}
        ref={stageRef}
        style={stageStyle}
      >
        {/* react-doctor-disable-next-line react-doctor/no-noninteractive-element-interactions, react-doctor/no-noninteractive-tabindex, react-doctor/prefer-tag-over-role -- The frame is one keyboard stop of a two-axis position control. The arrow keys move the picture; the + and - keys zoom. */}
        <div
          aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight + -"
          aria-label={labels.position}
          className="od-picture-crop-frame"
          data-shape={shape}
          onKeyDown={keyDown}
          ref={frameRef}
          role="group"
          tabIndex={0}
        >
          {picture === null ? null : (
            <img
              alt=""
              draggable={false}
              src={picture.url}
              style={imageStyle}
            />
          )}
        </div>
      </div>
      <div className="od-picture-crop-zoom">
        {smallIcon}
        <input
          aria-label={labels.zoom}
          disabled={pending}
          max={maximumPictureZoom}
          min={1}
          onChange={(event) => {
            change(
              zoomPictureCrop(
                size,
                aspectRatio,
                crop,
                event.currentTarget.valueAsNumber,
              ),
            );
          }}
          step={0.01}
          type="range"
          value={crop.zoom}
        />
        {largeIcon}
      </div>
      {failure === null ? null : (
        <InlineAlert tone="error">{failure}</InlineAlert>
      )}
    </Dialog>
  );
}
