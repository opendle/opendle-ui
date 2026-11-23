import {
  useId,
  useRef,
  useState,
  type DialogHTMLAttributes,
  type ReactNode,
  type RefObject,
  type SyntheticEvent,
} from "react";

import { Button } from "./Button.js";
import { CopyButton } from "./CopyButton.js";
import { InlineAlert } from "./InlineAlert.js";
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
  /** A failure of the last attempt. It shows in the dialog body. */
  readonly error?: ReactNode;
  readonly tone?: "default" | "danger";
  /**
   * Put the first focus on the confirm button, so Enter confirms. Use it only
   * for an action that is safe to do by accident. Without it, the first focus
   * is on Cancel. With an impact statement, Enter confirms when the typed
   * text agrees.
   */
  readonly confirmOnEnter?: boolean;
  /** The user must type this text. Enter confirms when the text agrees. */
  readonly impactStatement?: string;
  /** The prompt around the statement box, for example `Type {box} to confirm.` */
  readonly impactLabel?: (statement: ReactNode) => ReactNode;
  /** The accessible name of the input. */
  readonly impactInputLabel?: string;
  readonly copyLabel?: string;
  readonly copiedLabel?: string;
  /** Shows the irreversible warning in the danger color. */
  readonly irreversible?: boolean;
  readonly irreversibleLabel?: ReactNode;
  readonly pending?: boolean;
  readonly pendingLabel?: ReactNode;
  readonly returnFocusRef?: RefObject<HTMLElement | null>;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
}

// The confirm button is the submitter of the impact form: Enter in the input
// clicks it only while it is enabled. The click does the work.
const keepPage = (event: SyntheticEvent<HTMLFormElement>) => {
  event.preventDefault();
};

const typeToConfirm = (statement: ReactNode) => (
  <>Type {statement} to confirm.</>
);

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
  confirmOnEnter = false,
  confirmLabel,
  description,
  error,
  tone = "default",
  copiedLabel = "Copied",
  copyLabel = "Copy",
  impactInputLabel = "Confirmation text",
  impactLabel = typeToConfirm,
  impactStatement,
  irreversible = false,
  irreversibleLabel = "This cannot be undone.",
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
  const formId = useId();
  const [impact, setImpact] = useState("");
  const impactMatches =
    impactStatement === undefined || impact === impactStatement;
  const confirmFocus = impactStatement === undefined && confirmOnEnter;

  return (
    <Dialog
      {...props}
      actions={
        <>
          <Button
            {...(confirmFocus || impactStatement !== undefined
              ? {}
              : { "data-dialog-initial-focus": "true" })}
            disabled={pending}
            onClick={onCancel}
            type="button"
            variant="quiet"
          >
            {cancelLabel}
          </Button>
          <ConfirmationButton
            confirmLabel={confirmLabel}
            focus={confirmFocus}
            form={impactStatement === undefined ? undefined : formId}
            impactMatches={impactMatches}
            key={pending ? "pending" : "ready"}
            onConfirm={onConfirm}
            pending={pending}
            pendingLabel={pendingLabel}
            tone={tone}
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
      {error === undefined || error === null ? null : (
        <InlineAlert tone="error">{error}</InlineAlert>
      )}
      {irreversible ? (
        <p className="od-confirmation-dialog-irreversible">
          {irreversibleLabel}
        </p>
      ) : null}
      {impactStatement === undefined ? null : (
        <form
          className="od-confirmation-dialog-impact"
          id={formId}
          onSubmit={keepPage}
        >
          <p>
            {impactLabel(
              <span className="od-confirmation-dialog-statement">
                <code id={impactId}>{impactStatement}</code>
                <CopyButton
                  copiedLabel={copiedLabel}
                  copyLabel={copyLabel}
                  value={impactStatement}
                />
              </span>,
            )}
          </p>
          <input
            aria-describedby={impactId}
            aria-label={impactInputLabel}
            autoCapitalize="none"
            autoComplete="off"
            data-dialog-initial-focus="true"
            disabled={pending}
            onChange={(event) => {
              setImpact(event.target.value);
            }}
            placeholder={impactStatement}
            spellCheck={false}
            value={impact}
          />
        </form>
      )}
    </Dialog>
  );
}

interface ConfirmationButtonProps {
  readonly confirmLabel: ReactNode;
  readonly focus: boolean;
  /** The impact form. Enter in its input clicks this button. */
  readonly form: string | undefined;
  readonly impactMatches: boolean;
  readonly onConfirm: () => void;
  readonly pending: boolean;
  readonly pendingLabel: ReactNode;
  readonly tone: "default" | "danger";
}

function ConfirmationButton({
  confirmLabel,
  focus,
  form,
  impactMatches,
  onConfirm,
  pending,
  pendingLabel,
  tone,
}: ConfirmationButtonProps) {
  const submittedRef = useRef(false);
  return (
    <Button
      {...(focus ? { "data-dialog-initial-focus": "true" } : {})}
      {...(form === undefined ? {} : { form })}
      disabled={!impactMatches}
      loading={pending}
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
      type={form === undefined ? "button" : "submit"}
      variant={tone === "danger" ? "danger" : "primary"}
    >
      {pending ? pendingLabel : confirmLabel}
    </Button>
  );
}
