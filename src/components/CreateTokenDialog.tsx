import { useCallback, useId, useState, type SyntheticEvent } from "react";

import { Button } from "./Button.js";
import { Dialog } from "./Dialog.js";
import { TextControl } from "./FormControls.js";
import type { ApiTokenListLabels } from "./identityLabels.js";
import { InlineAlert } from "./InlineAlert.js";
import { SecretValue } from "./SecretValue.js";

interface CreateState {
  readonly name: string;
  readonly pending: boolean;
  readonly failure: string | null;
  readonly secret: string | null;
}

const initialState: CreateState = {
  name: "",
  pending: false,
  failure: null,
  secret: null,
};

export interface CreateTokenDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onCreate: (name: string) => Promise<string>;
  readonly errorMessage: (error: unknown) => string;
  /**
   * Show a failure outside the component, for example in a toast. With it,
   * the component shows no failure of its own.
   */
  readonly onError?: (message: string) => void;
  readonly labels: ApiTokenListLabels;
}

function focusWhenShown(button: HTMLButtonElement | null) {
  button?.focus();
}

/** Ask for a token name, create the token, then show its secret one time. */
export function CreateTokenDialog({
  errorMessage,
  labels,
  onClose,
  onCreate,
  onError,
  open,
}: CreateTokenDialogProps) {
  const formId = useId();
  const [state, setState] = useState(initialState);
  const { failure, name, pending, secret } = state;

  const close = useCallback(() => {
    setState(initialState);
    onClose();
  }, [onClose]);

  const submit = useCallback(
    async (event: SyntheticEvent<HTMLFormElement>) => {
      event.preventDefault();
      const trimmed = name.trim();
      if (trimmed === "" || pending) return;
      setState((current) => ({ ...current, pending: true, failure: null }));
      try {
        const created = await onCreate(trimmed);
        setState((current) => ({
          ...current,
          pending: false,
          secret: created,
        }));
      } catch (error) {
        const message = errorMessage(error);
        onError?.(message);
        setState((current) => ({
          ...current,
          pending: false,
          failure: onError === undefined ? message : null,
        }));
      }
    },
    [errorMessage, name, onCreate, onError, pending],
  );

  const actions =
    secret === null ? (
      <>
        <Button disabled={pending} onClick={close} variant="secondary">
          {labels.cancel}
        </Button>
        <Button
          disabled={name.trim() === ""}
          loading={pending}
          form={formId}
          type="submit"
        >
          {labels.submit}
        </Button>
      </>
    ) : (
      <Button onClick={close} ref={focusWhenShown}>
        {labels.done}
      </Button>
    );

  return (
    <Dialog
      actions={actions}
      className="od-token-dialog"
      closeDisabled={pending}
      closeLabel={labels.close}
      onClose={close}
      open={open}
      size="narrow"
      title={secret === null ? labels.createTitle : labels.createdTitle}
    >
      {secret === null ? (
        <form id={formId} onSubmit={(event) => void submit(event)}>
          <TextControl
            autoComplete="off"
            data-dialog-initial-focus="true"
            label={labels.name}
            maxLength={80}
            onChange={(event) => {
              const next = event.currentTarget.value;
              setState((current) => ({ ...current, name: next }));
            }}
            value={name}
          />
        </form>
      ) : (
        <SecretValue
          copiedLabel={labels.copied}
          copyLabel={labels.copy}
          label={labels.secret}
          value={secret}
        />
      )}
      {failure === null ? null : (
        <InlineAlert tone="error">{failure}</InlineAlert>
      )}
    </Dialog>
  );
}
