import {
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
  type DialogHTMLAttributes,
} from "react";

import { Button } from "./Button.js";

export interface MediaLightboxProps extends Omit<
  DialogHTMLAttributes<HTMLDialogElement>,
  "children" | "onCancel" | "onClick" | "onClose" | "open" | "title"
> {
  readonly open: boolean;
  readonly title: string;
  readonly source: string;
  readonly kind: "image" | "pdf";
  readonly onClose: () => void;
  readonly imageAlt?: string;
}

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

/** A controlled modal preview for one host-owned image or PDF blob URL. */
export function MediaLightbox({
  className,
  imageAlt,
  kind,
  onClose,
  open,
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
  if (!source.startsWith("blob:") || source.length === 5) {
    throw new TypeError("MediaLightbox accepts only a host-owned blob URL.");
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
            <strong id={titleId}>{title}</strong>
            <Button onClick={requestClose} variant="quiet">
              Close preview
            </Button>
          </header>
          {kind === "image" ? (
            <img alt={imageAlt} key={source} src={source} />
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
        </>
      ) : null}
    </dialog>
  );
}
