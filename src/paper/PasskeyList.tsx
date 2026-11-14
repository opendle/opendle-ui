import { useCallback, useMemo, useState } from "react";

import { DateTime } from "../components/DateTime.js";
import { Button, IconButton } from "./Button.js";
import { ConfirmDialog } from "./Dialog.js";
import { InlineAlert } from "./Feedback.js";
import { Icon } from "./Icon.js";
import { passkeyListLabels, type PasskeyListLabels } from "./labels.js";
import { Card, ItemList, ItemRow, Section } from "./Page.js";

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
}: PasskeyListProps) {
  const [adding, setAdding] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [removing, setRemoving] = useState<PasskeyItem | null>(null);

  const add = useCallback(async () => {
    setAdding(true);
    setFailure(null);
    try {
      await onAdd();
    } catch (error) {
      setFailure(errorMessage(error));
    } finally {
      setAdding(false);
    }
  }, [errorMessage, onAdd]);

  const removeMessage = useCallback(
    (error: unknown) => errorMessage(error) ?? "",
    [errorMessage],
  );

  return (
    <Section
      actions={
        <Button
          disabled={adding}
          icon={<Icon name="plus" size={15} />}
          onClick={() => void add()}
        >
          {adding ? labels.adding : labels.add}
        </Button>
      }
      title={labels.title}
    >
      {failure === null ? null : (
        <InlineAlert className="pp-section-alert" tone="error">
          {failure}
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
            />
          ))}
        </ItemList>
      </Card>
      <ConfirmDialog
        cancelLabel={labels.cancel}
        closeLabel={labels.close}
        confirmLabel={labels.remove}
        errorMessage={removeMessage}
        onClose={() => {
          setRemoving(null);
        }}
        onConfirm={() =>
          removing === null ? Promise.resolve() : onRemove(removing.id)
        }
        open={removing !== null}
        title={labels.removeTitle}
        tone="danger"
      >
        <p>{removing === null ? null : removing.label || labels.unnamed}</p>
      </ConfirmDialog>
    </Section>
  );
}

interface PasskeyRowProps {
  readonly item: PasskeyItem;
  readonly labels: PasskeyListLabels;
  readonly onRemove: ((item: PasskeyItem) => void) | null;
}

function PasskeyRow({ item, labels, onRemove }: PasskeyRowProps) {
  const name = item.label || labels.unnamed;
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
    <ItemRow actions={actions} icon={passkeyIcon} meta={meta} title={name} />
  );
}
