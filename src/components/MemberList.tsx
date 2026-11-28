import { useState, type MouseEvent } from "react";

import { ActionMenu } from "./ActionMenu.js";
import { Avatar } from "./Avatar.js";
import { Card } from "./Card.js";
import { classes } from "./classes.js";
import { ConfirmationDialog } from "./ConfirmationDialog.js";
import { Icon } from "./Icon.js";
import { InlineAlert } from "./InlineAlert.js";
import { LoadingIndicator } from "./LoadingIndicator.js";
import {
  memberListLabels,
  type MemberConfirmation,
  type MemberItem,
  type MemberListLabels,
  type MemberRoleOption,
} from "./memberLabels.js";
import { StatusPill } from "./StatusPill.js";
import { useAsyncAction } from "./useAsyncAction.js";

export interface MemberListProps {
  readonly items: readonly MemberItem[];
  readonly roles: readonly MemberRoleOption[];
  /** Show a loading sign in place of the empty list until the first answer. */
  readonly loading?: boolean;
  /** Store a new role. Without it, all roles are read-only. */
  readonly onRoleChange?: (id: string, role: string) => Promise<void>;
  /** A confirmation before a role change. `null` changes the role at once. */
  readonly roleConfirmation?: (
    item: MemberItem,
    role: string,
  ) => MemberConfirmation | null;
  /** The click of a name link, for example for the router of the host. */
  readonly onLinkClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  readonly errorMessage: (error: unknown) => string | null;
  /**
   * Show a failure outside the component, for example in a toast. With it,
   * the component shows no failure of its own.
   */
  readonly onError?: (message: string) => void;
  readonly labels?: Partial<MemberListLabels>;
  readonly className?: string;
}

interface RoleChange {
  readonly id: string;
  readonly role: string;
}

interface PendingChange extends RoleChange {
  readonly confirmation: MemberConfirmation;
}

/**
 * The members of a group and the invitations to it: the picture, the name,
 * the email address, a state, the role and a menu of actions.
 */
export function MemberList({
  className,
  errorMessage,
  items,
  labels: partialLabels,
  loading = false,
  onError,
  onLinkClick,
  onRoleChange,
  roleConfirmation,
  roles,
}: MemberListProps) {
  const labels = { ...memberListLabels, ...partialLabels };
  const change = useAsyncAction(errorMessage, onError);
  const [changing, setChanging] = useState<RoleChange | null>(null);
  const [confirming, setConfirming] = useState<PendingChange | null>(null);

  const store = (next: RoleChange) => {
    if (onRoleChange === undefined) return;
    setChanging(next);
    void change
      .run(() => onRoleChange(next.id, next.role))
      .finally(() => {
        setChanging(null);
      });
  };

  const choose = (item: MemberItem, role: string) => {
    if (role === item.role || changing !== null) return;
    const confirmation = roleConfirmation?.(item, role) ?? null;
    if (confirmation === null) store({ id: item.id, role });
    else setConfirming({ id: item.id, role, confirmation });
  };

  return (
    <Card className={classes("od-member-card", className)}>
      {change.failure === null ? null : (
        <InlineAlert className="od-member-alert" tone="error">
          {change.failure}
        </InlineAlert>
      )}
      {items.length === 0 && loading ? (
        <LoadingIndicator block label={labels.loading} />
      ) : items.length === 0 ? (
        <p className="od-list-empty">{labels.empty}</p>
      ) : (
        <ul className="od-member-list">
          {items.map((item) => (
            <MemberRow
              changing={changing}
              item={item}
              key={item.id}
              labels={labels}
              onChoose={
                onRoleChange === undefined
                  ? null
                  : (role) => {
                      choose(item, role);
                    }
              }
              onLinkClick={onLinkClick}
              roles={roles}
            />
          ))}
        </ul>
      )}
      <ConfirmationDialog
        cancelLabel={labels.cancel}
        confirmLabel={confirming?.confirmation.confirmLabel ?? ""}
        description={confirming?.confirmation.description ?? ""}
        onCancel={() => {
          setConfirming(null);
        }}
        onConfirm={() => {
          if (confirming === null) return;
          setConfirming(null);
          store(confirming);
        }}
        open={confirming !== null}
        title={confirming?.confirmation.title ?? ""}
        tone={confirming?.confirmation.tone ?? "default"}
      />
    </Card>
  );
}

interface MemberRowProps {
  readonly item: MemberItem;
  readonly roles: readonly MemberRoleOption[];
  readonly labels: MemberListLabels;
  readonly changing: RoleChange | null;
  /** Choose a role. `null` shows each role as text. */
  readonly onChoose: ((role: string) => void) | null;
  readonly onLinkClick:
    ((event: MouseEvent<HTMLAnchorElement>) => void) | undefined;
}

function MemberRow({
  changing,
  item,
  labels,
  onChoose,
  onLinkClick,
  roles,
}: MemberRowProps) {
  const roleLabel =
    roles.find((role) => role.value === item.role)?.label ?? item.role;
  const email =
    item.email === undefined || item.email === null || item.email === item.name
      ? null
      : item.email;
  const choose = item.roleEditable === true ? onChoose : null;
  const actions = item.actions ?? [];
  return (
    <li
      className="od-member-row"
      data-invitation={item.invitation === true || undefined}
    >
      {item.invitation === true ? (
        <span aria-hidden="true" className="od-member-invitation-mark">
          <Icon name="mail" size={16} />
        </span>
      ) : (
        <Avatar name={item.name} src={item.avatarUrl} />
      )}
      <span className="od-member-identity">
        <span className="od-member-heading">
          <span className="od-member-name">
            {item.href === undefined ? (
              item.name
            ) : (
              <a href={item.href} onClick={onLinkClick}>
                {item.name}
              </a>
            )}
          </span>
          {item.you === true ? (
            <span className="od-member-you">{labels.you}</span>
          ) : null}
          {item.status === undefined ? null : (
            <StatusPill className="od-member-status" tone={item.status.tone}>
              {item.status.label}
            </StatusPill>
          )}
        </span>
        {email === null ? null : (
          <span className="od-member-email">{email}</span>
        )}
        {item.detail === undefined ? null : (
          <span className="od-member-detail">{item.detail}</span>
        )}
      </span>
      <span className="od-member-role">
        {choose !== null ? (
          <select
            aria-label={`${labels.role}: ${item.name}`}
            className="od-member-role-select"
            disabled={changing !== null}
            onChange={(event) => {
              choose(event.currentTarget.value);
            }}
            value={changing?.id === item.id ? changing.role : item.role}
          >
            {roles.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        ) : (
          <span className="od-member-role-text">{roleLabel}</span>
        )}
      </span>
      <span className="od-member-actions">
        {actions.length === 0 ? null : (
          <ActionMenu
            items={actions}
            label={`${labels.moreActions}: ${item.name}`}
          />
        )}
      </span>
    </li>
  );
}
