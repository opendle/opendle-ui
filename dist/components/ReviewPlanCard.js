import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useId, useState } from "react";
import { AutoGrowTextarea } from "./AutoGrowTextarea.js";
export function ReviewPlanCard({ age = "now", ariaLabel, approvedMessage = "The plan is approved and ready for its next operation.", channel, compact = false, details, meta, onApprove, onEdit, onRefuse, onRestore, priority, rejectionMessage = "No change will run from this plan.", renderActions, renderIcon, state, text, title, className, editLabel = "Edit the plan", refuseEmptyLabel, saveEditLabel = "Save changes", textMaxLength, refuseSubmitLabel = "Refuse plan", }) {
    const fieldId = useId();
    const [mode, setMode] = useState("idle");
    const [draft, setDraft] = useState(text);
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
    const actions = { approve: onApprove, edit: () => { setDraft(text); setMode("edit"); }, refuse: () => setMode("refuse") };
    return (_jsxs("article", { className: ["od-plan-card", "shared-plan-card", className].filter(Boolean).join(" "), "aria-label": ariaLabel, "data-compact": compact, "data-state": state, children: [_jsxs("div", { className: "od-plan-heading plan-heading", children: [_jsx("span", { children: renderIcon?.(state) }), _jsxs("div", { children: [_jsxs("small", { children: [priority ? `${String(priority)} · ` : "", meta] }), _jsx("strong", { children: title })] }), _jsx("span", { className: "od-plan-age", children: age })] }), state === "pending" ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "od-plan-copy plan-copy", children: [channel ? _jsx("span", { className: "od-plan-channel channel-badge", children: channel }) : null, _jsx("p", { children: text })] }), details?.length ? _jsx("dl", { className: "od-plan-details plan-details", children: details.map((detail, index) => _jsxs("div", { children: [_jsx("dt", { children: detail.label }), _jsxs("dd", { children: [detail.icon, detail.value] })] }, index)) }) : null, mode === "edit" ? _jsxs("form", { className: "od-plan-inline-form plan-inline-form", onSubmit: saveEdit, children: [_jsx("label", { htmlFor: `${fieldId}-edit`, children: editLabel }), _jsx(AutoGrowTextarea, { id: `${fieldId}-edit`, value: draft, onChange: (event) => setDraft(event.target.value), maxLength: textMaxLength, rows: 2 }), textMaxLength ? _jsxs("small", { children: [draft.length, " / ", textMaxLength] }) : null, _jsxs("div", { children: [_jsx("button", { type: "button", className: "od-button od-button-quiet text-button", onClick: () => setMode("idle"), children: "Cancel" }), _jsx("button", { type: "submit", className: "od-button od-button-primary primary-button", disabled: !draft.trim(), children: saveEditLabel })] })] }) : null, mode === "refuse" ? _jsxs("form", { className: "od-plan-inline-form plan-inline-form", onSubmit: refuse, children: [_jsx("label", { htmlFor: `${fieldId}-feedback`, children: "Tell the agent what to change" }), _jsx(AutoGrowTextarea, { id: `${fieldId}-feedback`, value: feedback, onChange: (event) => setFeedback(event.target.value), rows: 2 }), _jsxs("div", { children: [_jsx("button", { type: "button", className: "od-button od-button-quiet text-button", onClick: () => setMode("idle"), children: "Cancel" }), _jsx("button", { type: "submit", className: "od-button od-button-secondary secondary-button", children: feedback.trim() || !refuseEmptyLabel ? refuseSubmitLabel : refuseEmptyLabel })] })] }) : null, mode === "idle" ? _jsx("div", { className: "od-plan-actions plan-actions", children: renderActions?.(actions) ?? _jsxs(_Fragment, { children: [_jsx("button", { type: "button", className: "od-button od-button-secondary secondary-button", onClick: actions.refuse, children: "Refuse" }), _jsx("button", { type: "button", className: "od-button od-button-secondary secondary-button", onClick: actions.edit, children: "Edit" }), _jsx("button", { type: "button", className: "od-button od-button-primary primary-button", onClick: actions.approve, children: "Approve" })] }) }) : null] })) : _jsxs("div", { className: "od-plan-result plan-result", children: [_jsx("p", { children: state === "approved" ? approvedMessage : rejectionMessage }), _jsx("button", { type: "button", className: "od-button od-button-quiet", onClick: onRestore, children: "Restore plan" })] })] }));
}
//# sourceMappingURL=ReviewPlanCard.js.map