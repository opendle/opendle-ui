import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { ActionMenu } from "./ActionMenu.js";
import { Avatar } from "./Avatar.js";
import { Card } from "./Card.js";
import { classes } from "./classes.js";
import { ConfirmationDialog } from "./ConfirmationDialog.js";
import { Icon } from "./Icon.js";
import { InlineAlert } from "./InlineAlert.js";
import { LoadingIndicator } from "./LoadingIndicator.js";
import { memberListLabels, } from "./memberLabels.js";
import { StatusPill } from "./StatusPill.js";
import { useAsyncAction } from "./useAsyncAction.js";
/**
 * The members of a group and the invitations to it: the picture, the name,
 * the email address, a state, the role and a menu of actions.
 */
export function MemberList({ className, errorMessage, items, labels: partialLabels, loading = false, onError, onLinkClick, onRoleChange, roleConfirmation, roles, }) {
    const labels = { ...memberListLabels, ...partialLabels };
    const change = useAsyncAction(errorMessage, onError);
    const [changing, setChanging] = useState(null);
    const [confirming, setConfirming] = useState(null);
    const store = (next) => {
        if (onRoleChange === undefined)
            return;
        setChanging(next);
        void change
            .run(() => onRoleChange(next.id, next.role))
            .finally(() => {
            setChanging(null);
        });
    };
    const choose = (item, role) => {
        if (role === item.role || changing !== null)
            return;
        const confirmation = roleConfirmation?.(item, role) ?? null;
        if (confirmation === null)
            store({ id: item.id, role });
        else
            setConfirming({ id: item.id, role, confirmation });
    };
    return (_jsxs(Card, { className: classes("od-member-card", className), children: [change.failure === null ? null : (_jsx(InlineAlert, { className: "od-member-alert", tone: "error", children: change.failure })), items.length === 0 && loading ? (_jsx(LoadingIndicator, { block: true, label: labels.loading })) : items.length === 0 ? (_jsx("p", { className: "od-list-empty", children: labels.empty })) : (_jsx("ul", { className: "od-member-list", children: items.map((item) => (_jsx(MemberRow, { changing: changing, item: item, labels: labels, onChoose: onRoleChange === undefined
                        ? null
                        : (role) => {
                            choose(item, role);
                        }, onLinkClick: onLinkClick, roles: roles }, item.id))) })), _jsx(ConfirmationDialog, { cancelLabel: labels.cancel, confirmLabel: confirming?.confirmation.confirmLabel ?? "", description: confirming?.confirmation.description ?? "", onCancel: () => {
                    setConfirming(null);
                }, onConfirm: () => {
                    if (confirming === null)
                        return;
                    setConfirming(null);
                    store(confirming);
                }, open: confirming !== null, title: confirming?.confirmation.title ?? "", tone: confirming?.confirmation.tone ?? "default" })] }));
}
function MemberRow({ changing, item, labels, onChoose, onLinkClick, roles, }) {
    const roleLabel = roles.find((role) => role.value === item.role)?.label ?? item.role;
    const email = item.email === undefined || item.email === null || item.email === item.name
        ? null
        : item.email;
    const choose = item.roleEditable === true ? onChoose : null;
    const actions = item.actions ?? [];
    return (_jsxs("li", { className: "od-member-row", "data-invitation": item.invitation === true || undefined, children: [item.invitation === true ? (_jsx("span", { "aria-hidden": "true", className: "od-member-invitation-mark", children: _jsx(Icon, { name: "mail", size: 16 }) })) : (_jsx(Avatar, { name: item.name, src: item.avatarUrl })), _jsxs("span", { className: "od-member-identity", children: [_jsxs("span", { className: "od-member-heading", children: [_jsx("span", { className: "od-member-name", children: item.href === undefined ? (item.name) : (_jsx("a", { href: item.href, onClick: onLinkClick, children: item.name })) }), item.you === true ? (_jsx("span", { className: "od-member-you", children: labels.you })) : null, item.status === undefined ? null : (_jsx(StatusPill, { className: "od-member-status", tone: item.status.tone, children: item.status.label }))] }), email === null ? null : (_jsx("span", { className: "od-member-email", children: email })), item.detail === undefined ? null : (_jsx("span", { className: "od-member-detail", children: item.detail }))] }), _jsx("span", { className: "od-member-role", children: choose !== null ? (_jsx("select", { "aria-label": `${labels.role}: ${item.name}`, className: "od-member-role-select", disabled: changing !== null, onChange: (event) => {
                        choose(event.currentTarget.value);
                    }, value: changing?.id === item.id ? changing.role : item.role, children: roles.map((role) => (_jsx("option", { value: role.value, children: role.label }, role.value))) })) : (_jsx("span", { className: "od-member-role-text", children: roleLabel })) }), _jsx("span", { className: "od-member-actions", children: actions.length === 0 ? null : (_jsx(ActionMenu, { items: actions, label: `${labels.moreActions}: ${item.name}` })) })] }));
}
//# sourceMappingURL=MemberList.js.map