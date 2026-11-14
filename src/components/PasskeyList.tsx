import { useCallback, useMemo, useState } from "react";

import { Button } from "./Button.js";
import { Card } from "./Card.js";
import { ConfirmationDialog } from "./ConfirmationDialog.js";
import { DateTime } from "./DateTime.js";
import { Icon } from "./Icon.js";
import { IconButton } from "./IconButton.js";
import { passkeyListLabels, type PasskeyListLabels } from "./identityLabels.js";
import { InlineAlert } from "./InlineAlert.js";
import { InlineEditableText } from "./InlineEditableText.js";
import { ItemList } from "./ItemList.js";
import { ItemRow } from "./ItemRow.js";
import { Section } from "./Section.js";
import { useAsyncAction } from "./useAsyncAction.js";

export interface PasskeyItem {
  readonly id: string;
  readonly label: string;
  readonly createdAt: string;
  readonly lastUsedAt?: string | null;
}

export interface PasskeyListProps {
  readonly items: readonly PasskeyItem[];
  /** Run the passkey ceremony and store the result. */
  readonly onAdd: () => Promise<void>;
  readonly onRemove: (id: string) => Promise<void>;
  /** Store a new name. Without it, the names are not editable. */
  readonly onRename?: (id: string, label: string) => Promise<void>;
  /** Return `null` to show nothing, for example after the user cancels. */
  readonly errorMessage: (error: unknown) => string | null;
  readonly labels?: PasskeyListLabels;
}

const dateFormat: Intl.DateTimeFormatOptions = { dateStyle: "medium" };
const passkeyIcon = <Icon name="passkey" />;

/**
 * The passkeys of one account. The last passkey has no remove button, because
 * the account must keep one.
 */
export function PasskeyList({
  errorMessage,
  items,
  labels = passkeyListLabels,
  onAdd,
  onRemove,
  onRename,
}: PasskeyListProps) {
  const change = useAsyncAction(errorMessage);
  const removal = useAsyncAction(errorMessage);
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<PasskeyItem | null>(null);
  const { run: runChange } = change;

  const add = useCallback(async () => {
    setAdding(true);
    await runChange(onAdd);
    setAdding(false);
  }, [onAdd, runChange]);

  const rename = useMemo(
    () =>
      onRename === undefined
        ? null
        : async (id: string, label: string) => {
            const done = await runChange(() => onRename(id, label));
            if (!done) throw new Error("The passkey name was not stored.");
          },
    [onRename, runChange],
  );

  const closeRemoval = () => {
    removal.reset();
    setRemoving(null);
  };

  return (
    <Section
      actions={
        <Button
          disabled={adding}
          icon={<Icon name="plus" size={15} />}
          onClick={() => void add()}
          variant="secondary"
        >
          {adding ? labels.adding : labels.add}
        </Button>
      }
      title={labels.title}
    >
      {change.failure === null ? null : (
        <InlineAlert className="od-section-alert" tone="error">
          {change.failure}
        </InlineAlert>
      )}
      <Card>
        <ItemList>
          {items.map((item) => (
            <PasskeyRow
              item={item}
              key={item.id}
              labels={labels}
              onRemove={items.length > 1 ? setRemoving : null}
              onRename={rename}
            />
          ))}
        </ItemList>
      </Card>
      <ConfirmationDialog
        cancelLabel={labels.cancel}
        confirmLabel={labels.remove}
        description={removing === null ? "" : removing.label || labels.unnamed}
        error={removal.failure}
        onCancel={closeRemoval}
        onConfirm={() => {
          if (removing === null) return;
          void removal
            .run(() => onRemove(removing.id))
            .then((done) => {
              if (done) setRemoving(null);
            });
        }}
        open={removing !== null}
        pending={removal.pending}
        pendingLabel={labels.remove}
        title={labels.removeTitle}
        tone="danger"
      />
    </Section>
  );
}

interface PasskeyRowProps {
  readonly item: PasskeyItem;
  readonly labels: PasskeyListLabels;
  readonly onRemove: ((item: PasskeyItem) => void) | null;
  readonly onRename: ((id: string, label: string) => Promise<void>) | null;
}

function PasskeyRow({ item, labels, onRemove, onRename }: PasskeyRowProps) {
  const name = item.label || labels.unnamed;
  const title = useMemo(
    () =>
      onRename === null ? (
        name
      ) : (
        <InlineEditableText
          label={`${labels.rename}: ${name}`}
          maxLength={64}
          onSave={(label) => onRename(item.id, label)}
          value={name}
        />
      ),
    [item.id, labels.rename, name, onRename],
  );
  const meta = useMemo(
    () => (
      <>
        {labels.added} <DateTime format={dateFormat} value={item.createdAt} />
        {item.lastUsedAt ? (
          <>
            {" · "}
            {labels.lastUsed}{" "}
            <DateTime format={dateFormat} value={item.lastUsedAt} />
          </>
        ) : null}
      </>
    ),
    [item, labels],
  );
  const actions = useMemo(
    () =>
      onRemove === null ? null : (
        <IconButton
          icon={<Icon name="trash" />}
          label={`${labels.remove}: ${name}`}
          onClick={() => {
            onRemove(item);
          }}
          tone="danger"
        />
      ),
    [item, labels.remove, name, onRemove],
  );
  return (
    <ItemRow actions={actions} icon={passkeyIcon} meta={meta} title={title} />
  );
}
