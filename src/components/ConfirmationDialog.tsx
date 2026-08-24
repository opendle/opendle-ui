import {
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type DialogHTMLAttributes,
  type ReactNode,
} from "react";

import { Button } from "./Button.js";

export interface ConfirmationDialogProps extends Omit<
  DialogHTMLAttributes<HTMLDialogElement>,
  "children" | "onCancel" | "onClick" | "onClose" | "open" | "title"
> {
  readonly open: boolean;
  readonly title: ReactNode;
  readonly description: ReactNode;
  readonly confirmLabel: ReactNode;
  readonly cancelLabel?: ReactNode;
  readonly impactStatement?: string;
  readonly impactLabel?: ReactNode;
  readonly pending?: boolean;
  readonly pendingLabel?: ReactNode;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
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

function openModal(dialog: HTMLDialogElement) {
  if (dialog.open) return;
  if (typeof dialog.showModal === "function") {
    dialog.showModal();
    return;
  }
  dialog.setAttribute("open", "");
}

function closeModal(dialog: HTMLDialogElement | null) {
  if (!dialog?.open) return;
  if (typeof dialog.close === "function") {
    dialog.close();
    return;
  }
  dialog.removeAttribute("open");
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

/** A modal confirmation with an optional exact impact-statement check. */
export function ConfirmationDialog({
  cancelLabel = "Cancel",
  className,
  confirmLabel,
  description,
  impactLabel = "Enter the impact statement to continue",
  impactStatement,
  onCancel,
  onConfirm,
  open,
  pending = false,
  pendingLabel = "Working…",
  title,
  ...props
}: ConfirmationDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const impactId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const actionsRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const wasOpenRef = useRef(false);
  const requestCancel = useCallback(() => {
    if (!pending) onCancel();
  }, [onCancel, pending]);
  if (impactStatement?.trim() === "") {
    throw new TypeError("A confirmation impact statement must not be empty.");
  }

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      if (!wasOpenRef.current) {
        const active = document.activeElement;
        triggerRef.current = active instanceof HTMLElement ? active : null;
      }
      openModal(dialog);
      if (!wasOpenRef.current)
        actionsRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    } else if (wasOpenRef.current) {
      closeModal(dialog);
      restoreFocus(triggerRef.current);
    }
    wasOpenRef.current = open;
  }, [open]);

  useLayoutEffect(
    () => () => {
      closeModal(dialogRef.current);
      restoreFocus(triggerRef.current);
    },
    [],
  );

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClick = (event: MouseEvent) => {
      if (isBackdropClick(dialog, event)) requestCancel();
    };
    dialog.addEventListener("click", handleClick);
    return () => {
      dialog.removeEventListener("click", handleClick);
    };
  }, [requestCancel]);

  return (
    <dialog
      {...props}
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className={["od-confirmation-dialog", className]
        .filter(Boolean)
        .join(" ")}
      onCancel={(event) => {
        event.preventDefault();
        requestCancel();
      }}
      ref={dialogRef}
    >
      {open ? (
        <ConfirmationContent
          cancelLabel={cancelLabel}
          actionsRef={actionsRef}
          confirmLabel={confirmLabel}
          description={description}
          descriptionId={descriptionId}
          impactId={impactId}
          impactLabel={impactLabel}
          {...(impactStatement === undefined ? {} : { impactStatement })}
          onCancel={requestCancel}
          onConfirm={onConfirm}
          pending={pending}
          pendingLabel={pendingLabel}
          title={title}
          titleId={titleId}
        />
      ) : null}
    </dialog>
  );
}

interface ConfirmationContentProps {
  readonly cancelLabel: ReactNode;
  readonly actionsRef: React.RefObject<HTMLElement | null>;
  readonly confirmLabel: ReactNode;
  readonly description: ReactNode;
  readonly descriptionId: string;
  readonly impactLabel: ReactNode;
  readonly impactId: string;
  readonly impactStatement?: string;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
  readonly pending: boolean;
  readonly pendingLabel: ReactNode;
  readonly title: ReactNode;
  readonly titleId: string;
}

function ConfirmationContent({
  cancelLabel,
  actionsRef,
  confirmLabel,
  description,
  descriptionId,
  impactLabel,
  impactId,
  impactStatement,
  onCancel,
  onConfirm,
  pending,
  pendingLabel,
  title,
  titleId,
}: ConfirmationContentProps) {
  const [impact, setImpact] = useState("");

  const impactMatches =
    impactStatement === undefined || impact === impactStatement;
  return (
    <>
      <header className="od-confirmation-dialog-heading">
        <h2 id={titleId}>{title}</h2>
        <div id={descriptionId}>{description}</div>
      </header>
      {impactStatement === undefined ? null : (
        <label className="od-confirmation-dialog-impact">
          <span>{impactLabel}</span>
          <strong id={impactId}>{impactStatement}</strong>
          <input
            aria-describedby={impactId}
            aria-label={
              typeof impactLabel === "string"
                ? impactLabel
                : "Confirmation impact statement"
            }
            autoComplete="off"
            disabled={pending}
            onChange={(event) => {
              setImpact(event.target.value);
            }}
            value={impact}
          />
        </label>
      )}
      <footer className="od-confirmation-dialog-actions" ref={actionsRef}>
        <Button
          disabled={pending}
          onClick={onCancel}
          type="button"
          variant="quiet"
        >
          {cancelLabel}
        </Button>
        <ConfirmationButton
          confirmLabel={confirmLabel}
          impactMatches={impactMatches}
          key={pending ? "pending" : "ready"}
          onConfirm={onConfirm}
          pending={pending}
          pendingLabel={pendingLabel}
        />
      </footer>
    </>
  );
}

interface ConfirmationButtonProps {
  readonly confirmLabel: ReactNode;
  readonly impactMatches: boolean;
  readonly onConfirm: () => void;
  readonly pending: boolean;
  readonly pendingLabel: ReactNode;
}

function ConfirmationButton({
  confirmLabel,
  impactMatches,
  onConfirm,
  pending,
  pendingLabel,
}: ConfirmationButtonProps) {
  const submittedRef = useRef(false);
  return (
    <Button
      disabled={pending || !impactMatches}
      onClick={() => {
        if (pending || submittedRef.current || !impactMatches) return;
        submittedRef.current = true;
        try {
          onConfirm();
        } catch (error) {
          submittedRef.current = false;
          throw error;
        }
      }}
      type="button"
    >
      {pending ? pendingLabel : confirmLabel}
    </Button>
  );
}
