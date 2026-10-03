import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useId, useState } from "react";
import { AutoGrowTextarea } from "./AutoGrowTextarea.js";
import { ActionButton, ActionButtonGroup } from "./ActionButton.js";
import { Icon } from "../index.js";
function detailKey(detail) {
    if (detail.id)
        return detail.id;
    const primitiveParts = [detail.label, detail.value].filter((part) => typeof part === "string" ||
        typeof part === "number" ||
        typeof part === "bigint");
    return primitiveParts.length > 0
        ? primitiveParts.map(String).join(":")
        : "detail";
}
export function ReviewPlanCard({ age = "now", ariaLabel, approvedMessage = "The plan is approved and ready for its next operation.", channel, compact = false, details, meta, onApprove, onEdit, onRefuse, onRestore, priority, rejectionMessage = "No change will run from this plan.", renderActions, renderIcon, state, text, title, className, editLabel = "Edit the plan", refuseEmptyLabel, saveEditLabel = "Save changes", textMaxLength, refuseSubmitLabel = "Refuse plan", }) {
    const fieldId = useId();
    const [mode, setMode] = useState("idle");
    const [draft, setDraft] = useState("");
    const [feedback, setFeedback] = useState("");
    function saveEdit(event) {
        event.preventDefault();
        const next = draft.trim();
        if (!next)
            return;
        onEdit(next);
        setMode("idle");
    }
    function refuse(event) {
        event.preventDefault();
        onRefuse(feedback.trim());
        setMode("idle");
    }
    const actions = {
        approve: onApprove,
        edit: () => {
            setDraft(text);
            setMode("edit");
        },
        refuse: () => {
            setMode("refuse");
        },
    };
    return (_jsxs("article", { className: ["od-plan-card", "shared-plan-card", className]
            .filter(Boolean)
            .join(" "), "aria-label": ariaLabel, "data-compact": compact, "data-state": state, children: [_jsxs("div", { className: "od-plan-heading plan-heading", children: [_jsx("span", { children: renderIcon?.(state) }), _jsxs("div", { children: [_jsxs("small", { children: [priority ? _jsxs(_Fragment, { children: [priority, " \u00B7 "] }) : null, meta] }), _jsx("strong", { children: title })] }), _jsx("span", { className: "od-plan-age", children: age })] }), state === "pending" ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "od-plan-copy plan-copy", children: [channel ? (_jsx("span", { className: "od-plan-channel channel-badge", children: channel })) : null, _jsx("p", { children: text })] }), details?.length ? (_jsx("dl", { className: "od-plan-details plan-details", children: details.map((detail) => (_jsxs("div", { children: [_jsx("dt", { children: detail.label }), _jsxs("dd", { children: [detail.icon, detail.value] })] }, detailKey(detail)))) })) : null, mode === "edit" ? (_jsxs("form", { className: "od-plan-inline-form plan-inline-form", onSubmit: saveEdit, children: [_jsx("label", { htmlFor: `${fieldId}-edit`, children: editLabel }), _jsx(AutoGrowTextarea, { id: `${fieldId}-edit`, value: draft, onChange: (event) => {
                                    setDraft(event.target.value);
                                }, maxLength: textMaxLength, rows: 2 }), textMaxLength ? (_jsxs("small", { children: [draft.length, " / ", textMaxLength] })) : null, _jsxs(ActionButtonGroup, { children: [_jsx(ActionButton, { label: "Cancel", icon: _jsx(Icon, { name: "close", size: 16 }), variant: "quiet", className: "text-button", onClick: () => {
                                            setMode("idle");
                                        } }), _jsx(ActionButton, { label: saveEditLabel, icon: _jsx(Icon, { name: "check", size: 16 }), type: "submit", variant: "primary", className: "primary-button", disabled: !draft.trim() })] })] })) : null, mode === "refuse" ? (_jsxs("form", { className: "od-plan-inline-form plan-inline-form", onSubmit: refuse, children: [_jsx("label", { htmlFor: `${fieldId}-feedback`, children: "Tell the agent what to change" }), _jsx(AutoGrowTextarea, { id: `${fieldId}-feedback`, value: feedback, onChange: (event) => {
                                    setFeedback(event.target.value);
                                }, rows: 2 }), _jsxs(ActionButtonGroup, { children: [_jsx(ActionButton, { label: "Cancel", icon: _jsx(Icon, { name: "close", size: 16 }), variant: "quiet", className: "text-button", onClick: () => {
                                            setMode("idle");
                                        } }), _jsx(ActionButton, { label: feedback.trim() || !refuseEmptyLabel
                                            ? refuseSubmitLabel
                                            : refuseEmptyLabel, icon: _jsx(Icon, { name: "close", size: 16 }), type: "submit", className: "secondary-button" })] })] })) : null, mode === "idle" ? (_jsx(ActionButtonGroup, { className: "od-plan-actions plan-actions", children: renderActions?.(actions) ?? (_jsxs(_Fragment, { children: [_jsx(ActionButton, { label: "Refuse", icon: _jsx(Icon, { name: "close", size: 16 }), className: "secondary-button", onClick: actions.refuse }), _jsx(ActionButton, { label: "Edit", icon: _jsx(Icon, { name: "edit", size: 16 }), className: "secondary-button", onClick: actions.edit }), _jsx(ActionButton, { label: "Approve", icon: _jsx(Icon, { name: "check", size: 16 }), variant: "primary", className: "primary-button", onClick: actions.approve })] })) })) : null] })) : (_jsxs("div", { className: "od-plan-result plan-result", children: [_jsx("p", { children: state === "approved" ? approvedMessage : rejectionMessage }), _jsx(ActionButton, { label: "Restore plan", icon: _jsx(Icon, { name: "refresh", size: 16 }), variant: "quiet", onClick: onRestore })] }))] }));
}
//# sourceMappingURL=ReviewPlanCard.js.map