import {
  useId,
  useRef,
  useState,
  type DialogHTMLAttributes,
  type ReactNode,
  type RefObject,
} from "react";

import { Button } from "./Button.js";
import { Dialog } from "./Dialog.js";

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
  readonly returnFocusRef?: RefObject<HTMLElement | null>;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
}

/** A modal confirmation with an optional exact impact-statement check. */
export function ConfirmationDialog(props: ConfirmationDialogProps) {
  if (props.impactStatement?.trim() === "") {
    throw new TypeError("A confirmation impact statement must not be empty.");
  }
  return <ConfirmationState key={props.open ? "open" : "closed"} {...props} />;
}

function ConfirmationState({
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
  returnFocusRef,
  title,
  ...props
}: ConfirmationDialogProps) {
  const impactId = useId();
  const [impact, setImpact] = useState("");
  const impactMatches =
    impactStatement === undefined || impact === impactStatement;

  return (
    <Dialog
      {...props}
      actions={
        <>
          <Button
            data-dialog-initial-focus="true"
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
        </>
      }
      actionsClassName="od-confirmation-dialog-actions"
      bodyClassName="od-confirmation-dialog-body"
      className={["od-confirmation-dialog", className]
        .filter(Boolean)
        .join(" ")}
      closeDisabled={pending}
      description={description}
      headerClassName="od-confirmation-dialog-heading"
      onClose={onCancel}
      open={open}
      {...(returnFocusRef === undefined ? {} : { returnFocusRef })}
      showCloseButton={false}
      size="narrow"
      title={title}
    >
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
    </Dialog>
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
