import { useId, type ReactNode, type SyntheticEvent } from "react";

import { Button } from "./Button.js";
import { Dialog } from "./Dialog.js";
import { InlineAlert } from "./InlineAlert.js";
import { useAsyncAction } from "./useAsyncAction.js";

export interface FormDialogProps {
  readonly open: boolean;
  readonly title: ReactNode;
  readonly description?: ReactNode;
  /** The fields of the form. Give the first one `data-dialog-initial-focus`. */
  readonly children: ReactNode;
  readonly submitLabel: ReactNode;
  readonly cancelLabel?: ReactNode;
  readonly submitDisabled?: boolean;
  readonly className?: string;
  /** The dialog closes when the work succeeds. */
  readonly onSubmit: () => Promise<void>;
  readonly onClose: () => void;
  /** The message of a failure. It shows in the dialog. */
  readonly errorMessage: (error: unknown) => string | null;
}

/**
 * A narrow modal with one small form: the fields, a failure message, Cancel
 * and a submit button with a pending state.
 */
export function FormDialog({
  cancelLabel = "Cancel",
  children,
  className,
  description,
  errorMessage,
  onClose,
  onSubmit,
  open,
  submitDisabled = false,
  submitLabel,
  title,
}: FormDialogProps) {
  const formId = useId();
  const action = useAsyncAction(errorMessage);
  const close = () => {
    if (action.pending) return;
    action.reset();
    onClose();
  };
  const submit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (action.pending || submitDisabled) return;
    void action.run(onSubmit).then((done) => {
      if (done) close();
    });
  };

  return (
    <Dialog
      actions={
        <>
          <Button disabled={action.pending} onClick={close} variant="secondary">
            {cancelLabel}
          </Button>
          <Button
            disabled={submitDisabled}
            form={formId}
            loading={action.pending}
            type="submit"
          >
            {submitLabel}
          </Button>
        </>
      }
      appearance="form"
      className={["od-form-dialog", className].filter(Boolean).join(" ")}
      closeDisabled={action.pending}
      {...(description === undefined ? {} : { description })}
      onClose={close}
      open={open}
      size="narrow"
      title={title}
    >
      <form className="od-form-dialog-form" id={formId} onSubmit={submit}>
        {children}
      </form>
      {action.failure === null ? null : (
        <InlineAlert tone="error">{action.failure}</InlineAlert>
      )}
    </Dialog>
  );
}
