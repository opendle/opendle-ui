import { useCallback, useId, useState, type SyntheticEvent } from "react";

import { Button } from "./Button.js";
import { Dialog } from "./Dialog.js";
import { InlineAlert } from "./Feedback.js";
import { TextField } from "./Fields.js";
import type { ApiTokenListLabels } from "./labels.js";
import { SecretReveal } from "./SecretReveal.js";

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
  readonly labels: ApiTokenListLabels;
}

/** Ask for a token name, create the token, then show its secret one time. */
export function CreateTokenDialog({
  errorMessage,
  labels,
  onClose,
  onCreate,
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
        setState((current) => ({
          ...current,
          pending: false,
          failure: errorMessage(error),
        }));
      }
    },
    [errorMessage, name, onCreate, pending],
  );

  const actions =
    secret === null ? (
      <>
        <Button disabled={pending} onClick={close}>
          {labels.cancel}
        </Button>
        <Button
          disabled={pending || name.trim() === ""}
          form={formId}
          type="submit"
          variant="primary"
        >
          {labels.submit}
        </Button>
      </>
    ) : (
      <Button onClick={close} variant="primary">
        {labels.done}
      </Button>
    );

  return (
    <Dialog
      actions={actions}
      closeDisabled={pending}
      closeLabel={labels.close}
      onClose={close}
      open={open}
      title={secret === null ? labels.createTitle : labels.createdTitle}
    >
      {secret === null ? (
        <form id={formId} onSubmit={(event) => void submit(event)}>
          <TextField
            autoComplete="off"
            data-autofocus
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
        <SecretReveal
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
