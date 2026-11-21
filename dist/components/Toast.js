import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, } from "react";
import { createPortal } from "react-dom";
import { classes } from "./classes.js";
import { Icon } from "./Icon.js";
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
/**
 * Show the popover of the toasts in the top layer, inside the active modal
 * dialog when there is one, so the toasts show above the dialog and outside
 * its clip.
 */
function ToastLayer({ children }) {
    const activeDialog = useActiveModalDialog();
    const hasHydrated = useHasHydrated();
    const inlineHostRef = useRef(null);
    const [portalContainer] = useState(createToastPortalContainer);
    useLayoutEffect(() => {
        if (!hasHydrated)
            return;
        const target = activeDialog ?? inlineHostRef.current;
        if (portalContainer === null || target === null)
            return;
        target.append(portalContainer);
        // A move in the document closes a popover, so show it again.
        const popover = portalContainer.firstElementChild;
        if (popover instanceof HTMLElement &&
            typeof popover.showPopover === "function" &&
            !popover.matches(":popover-open")) {
            popover.showPopover();
        }
    }, [activeDialog, hasHydrated, portalContainer]);
    useLayoutEffect(() => () => {
        portalContainer?.remove();
    }, [portalContainer]);
    if (!hasHydrated || portalContainer === null)
        return children;
    return (_jsxs(_Fragment, { children: [_jsx("span", { "data-od-toast-inline-host": "", ref: inlineHostRef }), createPortal(children, portalContainer)] }));
}
function ToastContent({ children, dismissLabel, onDismiss, tone, }) {
    return (_jsxs(_Fragment, { children: [tone === "neutral" ? null : (_jsx(Icon, { name: tone === "error" ? "alert" : "check", size: 16 })), _jsx("span", { children: children }), onDismiss ? (_jsx("button", { type: "button", "aria-label": dismissLabel, onClick: onDismiss, children: "\u00D7" })) : null] }));
}
/** One message above all content, also above an open dialog. */
export function Toast({ children, className, onDismiss, tone = "neutral", ...props }) {
    const hasHydrated = useHasHydrated();
    return (_jsx(ToastLayer, { children: _jsx("output", { ...props, className: classes("od-toast", className), "data-tone": tone, popover: hasHydrated ? "manual" : undefined, children: _jsx(ToastContent, { dismissLabel: "Dismiss message", onDismiss: onDismiss, tone: tone, children: children }) }) }));
}
/**
 * The toasts of a `useToastQueue`, one above the other. A pointer or the
 * focus on the stack stops the time of all its toasts.
 */
export function ToastStack({ className, dismissLabel = "Dismiss message", onDismiss, onPause, toasts, }) {
    const hasHydrated = useHasHydrated();
    if (toasts.length === 0)
        return null;
    return (_jsx(ToastLayer, { children: _jsx("div", { className: classes("od-toast-stack", className), onBlur: (event) => {
                if (!event.currentTarget.contains(event.relatedTarget))
                    onPause?.(false);
            }, onFocus: () => onPause?.(true), onPointerEnter: () => onPause?.(true), onPointerLeave: () => onPause?.(false), popover: hasHydrated ? "manual" : undefined, children: toasts.map((toast) => (_jsx("div", { className: "od-toast-slot", "data-leaving": toast.leaving === true || undefined, children: _jsx("output", { className: "od-toast", "data-tone": toast.tone, children: _jsx(ToastContent, { dismissLabel: dismissLabel, onDismiss: toast.tone === "error"
                            ? () => {
                                onDismiss(toast.id);
                            }
                            : undefined, tone: toast.tone, children: toast.message }) }) }, toast.id))) }) }));
}
/** The time of the leave animation, in milliseconds. */
const leaveTime = 200;
/**
 * Several toasts at a time, each with its own time: a message shows for
 * `duration` milliseconds and an error for `errorDuration`. When a toast
 * comes and `limit` toasts show, the oldest message closes, or the oldest
 * error when all are errors. The same message with the same tone does not
 * show two times: its time starts again. Render the toasts with
 * `<ToastStack toasts={toasts} onDismiss={dismissToast} onPause={pauseToasts}/>`.
 */
export function useToastQueue(duration = 4000, errorDuration = duration * 2, limit = 3) {
    const [toasts, setToasts] = useState([]);
    const list = useRef([]);
    const timers = useRef(new Map());
    const leaves = useRef(new Set());
    const paused = useRef(false);
    const nextId = useRef(1);
    const commit = useCallback((next) => {
        list.current = next;
        setToasts(next);
    }, []);
    const dismissToast = useCallback((id) => {
        const timer = timers.current.get(id);
        if (timer?.handle)
            clearTimeout(timer.handle);
        timers.current.delete(id);
        if (!list.current.some((toast) => toast.id === id && !toast.leaving))
            return;
        commit(list.current.map((toast) => toast.id === id ? { ...toast, leaving: true } : toast));
        const leave = setTimeout(() => {
            leaves.current.delete(leave);
            commit(list.current.filter((toast) => toast.id !== id));
        }, leaveTime);
        leaves.current.add(leave);
    }, [commit]);
    const run = useCallback((id, left) => {
        const old = timers.current.get(id);
        if (old?.handle)
            clearTimeout(old.handle);
        timers.current.set(id, {
            left,
            start: Date.now(),
            handle: paused.current
                ? null
                : setTimeout(() => {
                    dismissToast(id);
                }, left),
        });
    }, [dismissToast]);
    const showToast = useCallback((message, tone = "success") => {
        const time = tone === "error" ? errorDuration : duration;
        const shown = list.current.filter((toast) => !toast.leaving);
        const same = shown.find((toast) => toast.message === message && toast.tone === tone);
        if (same !== undefined) {
            run(same.id, time);
            return;
        }
        if (shown.length >= limit) {
            const oldest = shown.find((toast) => toast.tone !== "error") ?? shown[0];
            if (oldest !== undefined)
                dismissToast(oldest.id);
        }
        const id = nextId.current++;
        commit([...list.current, { id, message, tone }]);
        run(id, time);
    }, [commit, dismissToast, duration, errorDuration, limit, run]);
    const pauseToasts = useCallback((pause) => {
        if (paused.current === pause)
            return;
        paused.current = pause;
        const now = Date.now();
        for (const [id, timer] of timers.current) {
            if (pause) {
                if (timer.handle)
                    clearTimeout(timer.handle);
                timers.current.set(id, {
                    left: timer.left - (now - timer.start),
                    start: now,
                    handle: null,
                });
            }
            else {
                run(id, timer.left);
            }
        }
    }, [run]);
    useEffect(() => {
        const running = timers.current;
        const leaving = leaves.current;
        return () => {
            for (const timer of running.values()) {
                if (timer.handle)
                    clearTimeout(timer.handle);
            }
            for (const leave of leaving)
                clearTimeout(leave);
        };
    }, []);
    return { toasts, showToast, dismissToast, pauseToasts };
}
//# sourceMappingURL=Toast.js.map