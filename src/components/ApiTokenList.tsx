import { useMemo, useState } from "react";

import { DateTime } from "./DateTime.js";
import { Button } from "./Button.js";
import { Card } from "./Card.js";
import { ConfirmationDialog } from "./ConfirmationDialog.js";
import { CreateTokenDialog } from "./CreateTokenDialog.js";
import { Icon } from "./Icon.js";
import { IconButton } from "./IconButton.js";
import {
  apiTokenListLabels,
  type ApiTokenListLabels,
} from "./identityLabels.js";
import { ItemList } from "./ItemList.js";
import { ItemRow } from "./ItemRow.js";
import { Section } from "./Section.js";
import { useAsyncAction } from "./useAsyncAction.js";

export interface ApiTokenItem {
  readonly id: string;
  readonly name: string;
  readonly createdAt: string;
  readonly expiresAt?: string | null;
}

export interface ApiTokenListProps {
  readonly items: readonly ApiTokenItem[];
  /** Create a token and resolve with its secret. The secret shows one time. */
  readonly onCreate: (name: string) => Promise<string>;
  readonly onRevoke: (id: string) => Promise<void>;
  readonly errorMessage: (error: unknown) => string;
  /**
   * Show a failure outside the component, for example in a toast. With it,
   * the component shows no failure of its own.
   */
  readonly onError?: (message: string) => void;
  readonly labels?: ApiTokenListLabels;
}

const dateFormat: Intl.DateTimeFormatOptions = { dateStyle: "medium" };
const keyIcon = <Icon name="key" />;

interface TokenRowProps {
  readonly item: ApiTokenItem;
  readonly labels: ApiTokenListLabels;
  readonly onRevoke: (item: ApiTokenItem) => void;
}

function TokenRow({ item, labels, onRevoke }: TokenRowProps) {
  const meta = useMemo(
    () => (
      <>
        {labels.created} <DateTime format={dateFormat} value={item.createdAt} />
        {item.expiresAt ? (
          <>
            {" · "}
            {labels.expires}{" "}
            <DateTime format={dateFormat} value={item.expiresAt} />
          </>
        ) : null}
      </>
    ),
    [item, labels],
  );
  const actions = useMemo(
    () => (
      <IconButton
        icon={<Icon name="trash" />}
        label={`${labels.revoke}: ${item.name}`}
        onClick={() => {
          onRevoke(item);
        }}
        tone="danger"
      />
    ),
    [item, labels, onRevoke],
  );
  return (
    <ItemRow actions={actions} icon={keyIcon} meta={meta} title={item.name} />
  );
}

/** The API tokens of one account, with create, reveal-once and revoke. */
export function ApiTokenList({
  errorMessage,
  items,
  labels = apiTokenListLabels,
  onCreate,
  onError,
  onRevoke,
}: ApiTokenListProps) {
  const [creating, setCreating] = useState(false);
  const [revoking, setRevoking] = useState<ApiTokenItem | null>(null);
  const revoke = useAsyncAction(errorMessage, onError);
  const closeRevoke = () => {
    revoke.reset();
    setRevoking(null);
  };

  const create = (
    <Button
      icon={<Icon name="plus" size={15} />}
      onClick={() => {
        setCreating(true);
      }}
      variant="secondary"
    >
      {labels.create}
    </Button>
  );

  return (
    <Section actions={create} title={labels.title}>
      <Card>
        <ItemList empty={labels.empty}>
          {items.map((item) => (
            <TokenRow
              item={item}
              key={item.id}
              labels={labels}
              onRevoke={setRevoking}
            />
          ))}
        </ItemList>
      </Card>
      <CreateTokenDialog
        errorMessage={errorMessage}
        {...(onError === undefined ? {} : { onError })}
        labels={labels}
        onClose={() => {
          setCreating(false);
        }}
        onCreate={onCreate}
        open={creating}
      />
      <ConfirmationDialog
        cancelLabel={labels.cancel}
        confirmLabel={labels.revoke}
        description={revoking?.name ?? ""}
        error={revoke.failure}
        onCancel={closeRevoke}
        onConfirm={() => {
          if (revoking === null) return;
          void revoke
            .run(() => onRevoke(revoking.id))
            .then((done) => {
              if (done) setRevoking(null);
            });
        }}
        open={revoking !== null}
        pending={revoke.pending}
        pendingLabel={labels.revoke}
        title={labels.revokeTitle}
        tone="danger"
      />
    </Section>
  );
}
