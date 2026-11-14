import { useMemo, useState } from "react";

import { DateTime } from "../components/DateTime.js";
import { Button, IconButton } from "./Button.js";
import { CreateTokenDialog } from "./CreateTokenDialog.js";
import { ConfirmDialog } from "./Dialog.js";
import { Icon } from "./Icon.js";
import { apiTokenListLabels, type ApiTokenListLabels } from "./labels.js";
import { Card, ItemList, ItemRow, Section } from "./Page.js";

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
  onRevoke,
}: ApiTokenListProps) {
  const [creating, setCreating] = useState(false);
  const [revoking, setRevoking] = useState<ApiTokenItem | null>(null);

  const create = (
    <Button
      icon={<Icon name="plus" size={15} />}
      onClick={() => {
        setCreating(true);
      }}
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
        labels={labels}
        onClose={() => {
          setCreating(false);
        }}
        onCreate={onCreate}
        open={creating}
      />
      <ConfirmDialog
        cancelLabel={labels.cancel}
        closeLabel={labels.close}
        confirmLabel={labels.revoke}
        errorMessage={errorMessage}
        onClose={() => {
          setRevoking(null);
        }}
        onConfirm={() =>
          revoking === null ? Promise.resolve() : onRevoke(revoking.id)
        }
        open={revoking !== null}
        title={labels.revokeTitle}
        tone="danger"
      >
        <p>{revoking?.name}</p>
      </ConfirmDialog>
    </Section>
  );
}
