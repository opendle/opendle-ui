import {
  useCallback,
  useEffectEvent,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { Button, IconButton } from "./Button.js";
import { classes } from "./classes.js";
import { InlineAlert } from "./Feedback.js";
import { Icon } from "./Icon.js";

export interface DialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly title: ReactNode;
  readonly children: ReactNode;
  /** Buttons in the footer. */
  readonly actions?: ReactNode;
  readonly size?: "default" | "wide";
  readonly closeLabel: string;
  /** Block Escape, the backdrop and the close button while work is pending. */
  readonly closeDisabled?: boolean;
  readonly className?: string;
}

/** A modal dialog on the native `dialog` element. */
export function Dialog({
  actions,
  children,
  className,
  closeDisabled = false,
  closeLabel,
  onClose,
  open,
  size = "default",
  title,
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null) return;
    if (open && !dialog.open) {
      dialog.showModal();
      dialog.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const requestClose = useEffectEvent(() => {
    if (!closeDisabled) onClose();
  });

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null) return;
    const cancel = (event: Event) => {
      event.preventDefault();
      requestClose();
    };
    let pressedBackdrop = false;
    const press = (event: MouseEvent) => {
      pressedBackdrop = event.target === dialog;
    };
    const release = (event: MouseEvent) => {
      if (pressedBackdrop && event.target === dialog) requestClose();
      pressedBackdrop = false;
    };
    dialog.addEventListener("cancel", cancel);
    dialog.addEventListener("mousedown", press);
    dialog.addEventListener("click", release);
    return () => {
      dialog.removeEventListener("cancel", cancel);
      dialog.removeEventListener("mousedown", press);
      dialog.removeEventListener("click", release);
    };
  }, []);

  return (
    <dialog
      aria-labelledby={titleId}
      className={classes("pp-dialog", className)}
      data-size={size}
      ref={dialogRef}
    >
      {open ? (
        <>
          <header className="pp-dialog-header">
            <h2 id={titleId}>{title}</h2>
            <IconButton
              disabled={closeDisabled}
              icon={<Icon name="close" />}
              label={closeLabel}
              onClick={onClose}
            />
          </header>
          <div className="pp-dialog-body">{children}</div>
          {actions ? (
            <footer className="pp-dialog-actions">{actions}</footer>
          ) : null}
        </>
      ) : null}
    </dialog>
  );
}

export interface ConfirmDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly title: ReactNode;
  readonly children?: ReactNode;
  readonly confirmLabel: string;
  readonly cancelLabel: string;
  readonly closeLabel: string;
  readonly tone?: "default" | "danger";
  /** The dialog stays open and shows the message when this rejects. */
  readonly onConfirm: () => Promise<void>;
  readonly errorMessage: (error: unknown) => string;
}

/** A dialog that asks before one action and shows its failure. */
export function ConfirmDialog({
  cancelLabel,
  children,
  closeLabel,
  confirmLabel,
  errorMessage,
  onClose,
  onConfirm,
  open,
  title,
  tone = "default",
}: ConfirmDialogProps) {
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const close = useCallback(() => {
    setFailure(null);
    onClose();
  }, [onClose]);

  const confirm = useCallback(async () => {
    setPending(true);
    setFailure(null);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      setFailure(errorMessage(error));
    } finally {
      setPending(false);
    }
  }, [errorMessage, onClose, onConfirm]);

  return (
    <Dialog
      actions={
        <>
          <Button disabled={pending} onClick={close}>
            {cancelLabel}
          </Button>
          <Button
            disabled={pending}
            onClick={() => void confirm()}
            variant={tone === "danger" ? "danger" : "primary"}
          >
            {confirmLabel}
          </Button>
        </>
      }
      closeDisabled={pending}
      closeLabel={closeLabel}
      onClose={close}
      open={open}
      title={title}
    >
      {children}
      {failure === null ? null : (
        <InlineAlert tone="error">{failure}</InlineAlert>
      )}
    </Dialog>
  );
}
