import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
const modalSubscribers = new Set();
let activeModalDialog = null;
let modalObserver = null;
function findActiveModalDialog() {
    if (typeof document === "undefined")
        return null;
    try {
        const focusedDialog = document.activeElement instanceof Element
            ? document.activeElement.closest("dialog:modal")
            : null;
        if (focusedDialog instanceof HTMLDialogElement)
            return focusedDialog;
        const hitTarget = document.elementFromPoint(Math.max(0, Math.floor(window.innerWidth / 2)), Math.max(0, Math.floor(window.innerHeight / 2)));
        const hitDialog = hitTarget?.closest("dialog:modal");
        if (hitDialog instanceof HTMLDialogElement)
            return hitDialog;
        const modalDialogs = document.querySelectorAll("dialog:modal");
        return modalDialogs.item(modalDialogs.length - 1);
    }
    catch {
        return null;
    }
}
function updateActiveModalDialog() {
    const nextDialog = findActiveModalDialog();
    if (nextDialog === activeModalDialog)
        return;
    activeModalDialog = nextDialog;
    for (const subscriber of modalSubscribers)
        subscriber();
}
function nodeContainsDialog(node) {
    return (node instanceof HTMLDialogElement ||
        (node instanceof Element && node.querySelector("dialog") !== null));
}
function modalMutationCanChangeTarget(record) {
    if (record.type === "attributes")
        return record.target instanceof HTMLDialogElement;
    return [...record.addedNodes, ...record.removedNodes].some(nodeContainsDialog);
}
function startModalTracking() {
    if (modalObserver !== null || typeof document === "undefined")
        return;
    document.addEventListener("focusin", updateActiveModalDialog);
    document.addEventListener("toggle", updateActiveModalDialog, true);
    document.addEventListener("close", updateActiveModalDialog, true);
    modalObserver = new MutationObserver((records) => {
        if (records.some(modalMutationCanChangeTarget))
            updateActiveModalDialog();
    });
    modalObserver.observe(document.documentElement, {
        attributeFilter: ["open"],
        attributes: true,
        childList: true,
        subtree: true,
    });
    updateActiveModalDialog();
}
function stopModalTracking() {
    if (modalObserver === null || modalSubscribers.size !== 0)
        return;
    document.removeEventListener("focusin", updateActiveModalDialog);
    document.removeEventListener("toggle", updateActiveModalDialog, true);
    document.removeEventListener("close", updateActiveModalDialog, true);
    modalObserver.disconnect();
    modalObserver = null;
    activeModalDialog = null;
}
function subscribeToActiveModal(subscriber) {
    modalSubscribers.add(subscriber);
    startModalTracking();
    return () => {
        modalSubscribers.delete(subscriber);
        stopModalTracking();
    };
}
function useActiveModalDialog() {
    return useSyncExternalStore(subscribeToActiveModal, () => activeModalDialog, () => null);
}
function subscribeToHydration() {
    return () => undefined;
}
function useHasHydrated() {
    return useSyncExternalStore(subscribeToHydration, () => true, () => false);
}
function createToastPortalContainer() {
    if (typeof document === "undefined")
        return null;
    const container = document.createElement("span");
    container.dataset.odToastPortalHost = "";
    return container;
}
export function Toast({ children, className, onDismiss, ...props }) {
    const activeDialog = useActiveModalDialog();
    const hasHydrated = useHasHydrated();
    const inlineHostRef = useRef(null);
    const [portalContainer] = useState(createToastPortalContainer);
    const toast = (_jsxs("output", { ...props, className: ["od-toast", className].filter(Boolean).join(" "), children: [_jsx("span", { children: children }), onDismiss ? (_jsx("button", { type: "button", "aria-label": "Dismiss message", onClick: onDismiss, children: "\u00D7" })) : null] }));
    useLayoutEffect(() => {
        if (!hasHydrated)
            return;
        const target = activeDialog ?? inlineHostRef.current;
        if (portalContainer === null || target === null)
            return;
        target.append(portalContainer);
    }, [activeDialog, hasHydrated, portalContainer]);
    useLayoutEffect(() => () => {
        portalContainer?.remove();
    }, [portalContainer]);
    if (!hasHydrated || portalContainer === null)
        return toast;
    return (_jsxs(_Fragment, { children: [_jsx("span", { "data-od-toast-inline-host": "", ref: inlineHostRef }), createPortal(toast, portalContainer)] }));
}
//# sourceMappingURL=Toast.js.map