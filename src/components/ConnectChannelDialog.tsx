import { useId, useState, type SyntheticEvent } from "react";

import { Button } from "./Button.js";
import type { ChannelListLabels, ChannelNetwork } from "./channelLabels.js";
import { Dialog } from "./Dialog.js";
import { TextControl } from "./FormControls.js";
import { Icon, NetworkIcon } from "./Icon.js";
import { InlineAlert } from "./InlineAlert.js";
import type { NetworkName } from "./networks.js";
import { useAsyncAction } from "./useAsyncAction.js";

export interface ConnectChannelDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly networks: readonly ChannelNetwork[];
  /** Open the form of this network at once, for a new connection of it. */
  readonly network?: NetworkName | null;
  /** Connect a network that has no authorization address. */
  readonly onPasswordConnect: (
    network: NetworkName,
    handle: string,
    password: string,
  ) => Promise<void>;
  readonly errorMessage: (error: unknown) => string | null;
  readonly labels: ChannelListLabels;
}

/** Select a network, then go to its authorization or give an app password. */
export function ConnectChannelDialog({
  errorMessage,
  labels,
  network = null,
  networks,
  onClose,
  onPasswordConnect,
  open,
}: ConnectChannelDialogProps) {
  const formId = useId();
  const [selected, setSelected] = useState<NetworkName | null>(null);
  const [handle, setHandle] = useState("");
  const [password, setPassword] = useState("");
  const connect = useAsyncAction(errorMessage);
  const current = selected ?? network;
  const form = networks.find((entry) => entry.network === current) ?? null;

  const close = () => {
    setSelected(null);
    setHandle("");
    setPassword("");
    connect.reset();
    onClose();
  };

  const submit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (form === null || connect.pending) return;
    void connect
      .run(() => onPasswordConnect(form.network, handle.trim(), password))
      .then((done) => {
        if (done) close();
      });
  };

  return (
    <Dialog
      actions={
        form === null ? undefined : (
          <>
            {network === null ? (
              <Button
                disabled={connect.pending}
                onClick={() => {
                  setSelected(null);
                  connect.reset();
                }}
                variant="quiet"
              >
                {labels.back}
              </Button>
            ) : null}
            <Button
              disabled={handle.trim() === "" || password === ""}
              loading={connect.pending}
              form={formId}
              type="submit"
            >
              {labels.submit}
            </Button>
          </>
        )
      }
      className="od-connect-dialog"
      closeDisabled={connect.pending}
      closeLabel={labels.close}
      onClose={close}
      open={open}
      size="narrow"
      title={form === null ? labels.connectTitle : form.label}
    >
      {form === null ? (
        <ul className="od-connect-options">
          {networks.map((entry) => (
            <li key={entry.network}>
              {entry.href === undefined ? (
                <button
                  className="od-connect-option"
                  onClick={() => {
                    setSelected(entry.network);
                  }}
                  type="button"
                >
                  <NetworkIcon badge network={entry.network} />
                  <span>{entry.label}</span>
                  <Icon name="chevron-right" size={15} />
                </button>
              ) : (
                <a className="od-connect-option" href={entry.href}>
                  <NetworkIcon badge network={entry.network} />
                  <span>{entry.label}</span>
                  <Icon name="external-link" size={15} />
                </a>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <form className="od-connect-form" id={formId} onSubmit={submit}>
          <TextControl
            autoCapitalize="none"
            autoComplete="username"
            data-dialog-initial-focus="true"
            label={labels.handle}
            onChange={(event) => {
              setHandle(event.currentTarget.value);
            }}
            spellCheck={false}
            value={handle}
          />
          <TextControl
            autoComplete="off"
            label={labels.password}
            onChange={(event) => {
              setPassword(event.currentTarget.value);
            }}
            spellCheck={false}
            value={password}
          />
        </form>
      )}
      {connect.failure === null ? null : (
        <InlineAlert tone="error">{connect.failure}</InlineAlert>
      )}
    </Dialog>
  );
}
