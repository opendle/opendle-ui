import {
  useCallback,
  useEffectEvent,
  useId,
  useLayoutEffect,
  useRef,
  type DialogHTMLAttributes,
  type ReactNode,
} from "react";

import { Icon } from "./Icon.js";
import { IconButton } from "./IconButton.js";

export type MediaLightboxKind = "image" | "pdf" | "video";

export interface MediaLightboxProps extends Omit<
  DialogHTMLAttributes<HTMLDialogElement>,
  "children" | "onCancel" | "onClick" | "onClose" | "open" | "title"
> {
  readonly open: boolean;
  readonly title: string;
  /** A host-owned blob URL or a same-origin path that starts with `/`. */
  readonly source: string;
  readonly kind: MediaLightboxKind;
  readonly onClose: () => void;
  readonly imageAlt?: string;
  /** A video picture to show before playback, with the same URL rules. */
  readonly poster?: string;
  /** Short facts below the title, for example the type and the date. */
  readonly details?: ReactNode;
  /** Show the previous item. The left arrow key does the same. */
  readonly onPrevious?: () => void;
  /** Show the next item. The right arrow key does the same. */
  readonly onNext?: () => void;
}

const kinds: readonly MediaLightboxKind[] = ["image", "pdf", "video"];

function isBackdropClick(dialog: HTMLDialogElement, event: MouseEvent) {
  if (event.target !== dialog) return false;
  const bounds = dialog.getBoundingClientRect();
  return (
    event.clientX < bounds.left ||
    event.clientX > bounds.right ||
    event.clientY < bounds.top ||
    event.clientY > bounds.bottom
  );
}

function restoreFocus(trigger: HTMLElement | null) {
  if (!trigger?.isConnected) return;
  const apply = () => {
    const active = document.activeElement;
    if (active instanceof HTMLElement && active.closest("dialog[open]")) return;
    if (trigger.isConnected) trigger.focus({ preventScroll: true });
  };
  if (typeof requestAnimationFrame === "function") requestAnimationFrame(apply);
  else apply();
}

function assertMediaKind(kind: unknown): asserts kind is MediaLightboxKind {
  if (!kinds.includes(kind as MediaLightboxKind)) {
    throw new TypeError(
      "MediaLightbox accepts only image, PDF or video media.",
    );
  }
}

/** A blob URL or a path on the host origin. Never a remote or script URL. */
function isHostSource(source: string) {
  if (source.startsWith("blob:")) return source.length > 5;
  return /^\/(?![/\\])/.test(source);
}

/** Inputs and media players use the arrow keys themselves. */
function ownsArrowKeys(target: EventTarget) {
  return (
    target instanceof HTMLElement &&
    target.closest(
      "input, textarea, select, video, audio, [contenteditable]",
    ) !== null
  );
}

/** A controlled modal preview of one host-owned image, video or PDF. */
export function MediaLightbox({
  className,
  details,
  imageAlt,
  kind,
  onClose,
  onNext,
  onPrevious,
  open,
  poster,
  source,
  title,
  ...props
}: MediaLightboxProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headingRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const wasOpenRef = useRef(false);
  const requestClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      if (!wasOpenRef.current) {
        const active = document.activeElement;
        triggerRef.current = active instanceof HTMLElement ? active : null;
      }
      if (!dialog.open) {
        if (typeof dialog.showModal === "function") dialog.showModal();
        else dialog.setAttribute("open", "");
      }
      if (!wasOpenRef.current)
        headingRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    } else if (wasOpenRef.current) {
      if (dialog.open) {
        if (typeof dialog.close === "function") dialog.close();
        else dialog.removeAttribute("open");
      }
      restoreFocus(triggerRef.current);
    }
    wasOpenRef.current = open;
  }, [open]);

  useLayoutEffect(
    () => () => {
      const dialog = dialogRef.current;
      if (dialog?.open) {
        if (typeof dialog.close === "function") dialog.close();
        else dialog.removeAttribute("open");
      }
      restoreFocus(triggerRef.current);
    },
    [],
  );

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClick = (event: MouseEvent) => {
      if (isBackdropClick(dialog, event)) requestClose();
    };
    dialog.addEventListener("click", handleClick);
    return () => {
      dialog.removeEventListener("click", handleClick);
    };
  }, [requestClose]);

  const moveWith = useEffectEvent((key: string) => {
    const move =
      key === "ArrowLeft" ? onPrevious : key === "ArrowRight" ? onNext : null;
    move?.();
    return move !== null && move !== undefined;
  });
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey) return;
      if (event.metaKey || event.target === null) return;
      if (ownsArrowKeys(event.target)) return;
      if (moveWith(event.key)) event.preventDefault();
    };
    dialog.addEventListener("keydown", handleKeyDown);
    return () => {
      dialog.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // The last item has no next button: keep the focus, and so the arrow keys,
  // in the preview when the focused button goes away.
  const canMoveBack = onPrevious !== undefined;
  const canMoveOn = onNext !== undefined;
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog?.open) return;
    if (dialog.contains(document.activeElement)) return;
    headingRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
  }, [open, source, canMoveBack, canMoveOn]);
  assertMediaKind(kind);
  if (!isHostSource(source)) {
    throw new TypeError(
      "MediaLightbox accepts only a host-owned blob URL or a same-origin path.",
    );
  }
  if (poster !== undefined && !isHostSource(poster)) {
    throw new TypeError(
      "A video poster must be a host-owned blob URL or a same-origin path.",
    );
  }
  if (title.trim() === "") {
    throw new TypeError("A media preview must have a name.");
  }
  if (kind === "image" && (!imageAlt || imageAlt.trim() === "")) {
    throw new TypeError("An image preview must have alternative text.");
  }
  return (
    <dialog
      {...props}
      aria-labelledby={titleId}
      className={["od-media-lightbox", className].filter(Boolean).join(" ")}
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
      ref={dialogRef}
    >
      {open ? (
        <>
          <header className="od-media-lightbox-heading" ref={headingRef}>
            <div className="od-media-lightbox-title">
              <strong id={titleId}>{title}</strong>
              {details === undefined ? null : (
                <div className="od-media-lightbox-details">{details}</div>
              )}
            </div>
            <IconButton
              className="od-media-lightbox-close"
              icon={<Icon name="close" size={18} />}
              label="Close preview"
              onClick={requestClose}
            />
          </header>
          <div className="od-media-lightbox-stage" data-kind={kind}>
            {kind === "image" ? (
              <img alt={imageAlt} key={source} src={source} />
            ) : kind === "video" ? (
              // react-doctor-disable-next-line react-doctor/media-has-caption -- The host gives no WebVTT caption track for its media.
              <video
                aria-label={title}
                autoPlay
                controls
                key={source}
                playsInline
                poster={poster}
                preload="metadata"
                src={source}
              />
            ) : (
              <iframe
                aria-label={`Preview ${title}`}
                key={source}
                referrerPolicy="no-referrer"
                sandbox=""
                src={source}
                title={title}
              />
            )}
            {onPrevious ? (
              <IconButton
                className="od-media-lightbox-move"
                data-direction="previous"
                icon={<Icon name="chevron-left" size={22} />}
                label="Previous"
                onClick={onPrevious}
              />
            ) : null}
            {onNext ? (
              <IconButton
                className="od-media-lightbox-move"
                data-direction="next"
                icon={<Icon name="chevron-right" size={22} />}
                label="Next"
                onClick={onNext}
              />
            ) : null}
          </div>
        </>
      ) : null}
    </dialog>
  );
}
