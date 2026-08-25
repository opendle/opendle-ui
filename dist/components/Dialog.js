import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useId, useLayoutEffect, useRef, } from "react";
import { Button } from "./Button.js";
const focusableSelector = 'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), summary, iframe, audio[controls], video[controls], [contenteditable="true"], [tabindex]:not([tabindex="-1"])';
function classes(...values) {
    return values.filter(Boolean).join(" ");
}
function isBackdropClick(dialog, event) {
    if (event.target !== dialog)
        return false;
    const bounds = dialog.getBoundingClientRect();
    return (event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom);
}
function openModal(dialog) {
    if (dialog.open)
        return;
    if (typeof dialog.showModal === "function") {
        dialog.showModal();
        return;
    }
    dialog.setAttribute("open", "");
}
function closeModal(dialog) {
    if (!dialog?.open)
        return;
    if (typeof dialog.close === "function") {
        dialog.close();
        return;
    }
    dialog.removeAttribute("open");
}
function restoreFocus(target) {
    if (!target?.isConnected)
        return;
    const apply = () => {
        if (!target.isConnected)
            return;
        const active = document.activeElement;
        const activeDialog = active instanceof HTMLElement
            ? active.closest("dialog[open]")
            : null;
        if (activeDialog !== null && !activeDialog.contains(target))
            return;
        target.focus({ preventScroll: true });
    };
    if (typeof requestAnimationFrame === "function")
        requestAnimationFrame(apply);
    else
        apply();
}
function focusInitialElement(dialog, initialFocusRef) {
    const explicitTarget = initialFocusRef?.current;
    if (explicitTarget?.isConnected === true &&
        dialog.contains(explicitTarget) &&
        !explicitTarget.matches(":disabled")) {
        explicitTarget.focus({ preventScroll: true });
        return;
    }
    const target = dialog.querySelector("[data-dialog-initial-focus]:not(:disabled)") ??
        dialog.querySelector("[data-dialog-close]:not(:disabled)") ??
        dialog.querySelector(focusableSelector);
    (target ?? dialog).focus({ preventScroll: true });
}
function containTabFocus(dialog, event) {
    if (event.key !== "Tab")
        return;
    const focusable = Array.from(dialog.querySelectorAll(focusableSelector)).filter((element) => element.getClientRects().length > 0 &&
        element.getAttribute("aria-hidden") !== "true");
    const first = focusable.at(0);
    const last = focusable.at(-1);
    if (first === undefined || last === undefined) {
        event.preventDefault();
        dialog.focus({ preventScroll: true });
        return;
    }
    const active = document.activeElement;
    if (event.shiftKey && (active === first || !dialog.contains(active))) {
        event.preventDefault();
        last.focus({ preventScroll: true });
    }
    else if (!event.shiftKey && (active === last || !dialog.contains(active))) {
        event.preventDefault();
        first.focus({ preventScroll: true });
    }
}
/** A controlled native modal with fixed framing and local body scrolling. */
export function Dialog({ actions, actionsClassName, "aria-describedby": suppliedDescribedBy, "aria-label": ariaLabel, "aria-labelledby": suppliedLabelledBy, bodyClassName, children, className, closeDisabled = false, closeLabel = "Close dialog", description, eyebrow, headerClassName, headingLevel = "h2", initialFocusRef, onClose, open, returnFocusRef, showCloseButton = true, size = "default", title, ...props }) {
    const titleId = useId();
    const descriptionId = useId();
    const dialogRef = useRef(null);
    const triggerRef = useRef(null);
    const wasOpenRef = useRef(false);
    const Heading = headingLevel;
    const requestClose = useCallback(() => {
        if (!closeDisabled)
            onClose();
    }, [closeDisabled, onClose]);
    const describedBy = [
        description === undefined ? undefined : descriptionId,
        suppliedDescribedBy,
    ]
        .filter(Boolean)
        .join(" ");
    useLayoutEffect(() => {
        const dialog = dialogRef.current;
        if (dialog === null)
            return;
        if (open) {
            const needsModalOpen = !dialog.open;
            if (!wasOpenRef.current) {
                const suppliedTarget = returnFocusRef?.current;
                const active = document.activeElement;
                triggerRef.current =
                    suppliedTarget?.isConnected === true
                        ? suppliedTarget
                        : active instanceof HTMLElement && !dialog.contains(active)
                            ? active
                            : null;
            }
            openModal(dialog);
            if (!wasOpenRef.current || needsModalOpen)
                focusInitialElement(dialog, initialFocusRef);
        }
        else if (wasOpenRef.current) {
            closeModal(dialog);
            restoreFocus(triggerRef.current);
        }
        wasOpenRef.current = open;
    }, [initialFocusRef, open, returnFocusRef]);
    useLayoutEffect(() => () => {
        closeModal(dialogRef.current);
        restoreFocus(triggerRef.current);
    }, []);
    useLayoutEffect(() => {
        const dialog = dialogRef.current;
        if (dialog === null)
            return;
        const handleClick = (event) => {
            if (isBackdropClick(dialog, event))
                requestClose();
        };
        const handleKeyDown = (event) => {
            containTabFocus(dialog, event);
        };
        dialog.addEventListener("click", handleClick);
        dialog.addEventListener("keydown", handleKeyDown);
        return () => {
            dialog.removeEventListener("click", handleClick);
            dialog.removeEventListener("keydown", handleKeyDown);
        };
    }, [requestClose]);
    return (_jsx("dialog", { ...props, "aria-describedby": describedBy || undefined, "aria-label": ariaLabel, "aria-labelledby": ariaLabel === undefined ? (suppliedLabelledBy ?? titleId) : undefined, className: classes("od-dialog", className), "data-size": size, onCancel: (event) => {
            event.preventDefault();
            requestClose();
        }, ref: dialogRef, tabIndex: props.tabIndex ?? -1, children: open ? (_jsxs(_Fragment, { children: [_jsxs("header", { className: classes("od-dialog-header", headerClassName), children: [_jsxs("div", { children: [eyebrow === undefined ? null : (_jsx("p", { className: "od-dialog-eyebrow", children: eyebrow })), _jsx(Heading, { id: titleId, children: title }), description === undefined ? null : (_jsx("div", { className: "od-dialog-description", id: descriptionId, children: description }))] }), !showCloseButton ? null : (_jsx(Button, { "aria-label": closeLabel, "data-dialog-close": "true", disabled: closeDisabled, onClick: requestClose, type: "button", variant: "quiet", children: _jsx("span", { "aria-hidden": "true", children: "\u00D7" }) }))] }), _jsx("div", { className: classes("od-dialog-body", bodyClassName), children: children }), actions === undefined ? null : (_jsx("footer", { className: classes("od-dialog-actions", actionsClassName), children: actions }))] })) : null }));
}
//# sourceMappingURL=Dialog.js.map