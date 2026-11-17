import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useEffectEvent, useId, useLayoutEffect, useRef, } from "react";
import { Icon } from "./Icon.js";
import { IconButton } from "./IconButton.js";
const kinds = ["image", "pdf", "video"];
function isBackdropClick(dialog, event) {
    if (event.target !== dialog)
        return false;
    const bounds = dialog.getBoundingClientRect();
    return (event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom);
}
function restoreFocus(trigger) {
    if (!trigger?.isConnected)
        return;
    const apply = () => {
        const active = document.activeElement;
        if (active instanceof HTMLElement && active.closest("dialog[open]"))
            return;
        if (trigger.isConnected)
            trigger.focus({ preventScroll: true });
    };
    if (typeof requestAnimationFrame === "function")
        requestAnimationFrame(apply);
    else
        apply();
}
function assertMediaKind(kind) {
    if (!kinds.includes(kind)) {
        throw new TypeError("MediaLightbox accepts only image, PDF or video media.");
    }
}
/** A blob URL or a path on the host origin. Never a remote or script URL. */
function isHostSource(source) {
    if (source.startsWith("blob:"))
        return source.length > 5;
    return /^\/(?![/\\])/.test(source);
}
/** Inputs and media players use the arrow keys themselves. */
function ownsArrowKeys(target) {
    return (target instanceof HTMLElement &&
        target.closest("input, textarea, select, video, audio, [contenteditable]") !== null);
}
/** A controlled modal preview of one host-owned image, video or PDF. */
export function MediaLightbox({ className, details, imageAlt, kind, onClose, onNext, onPrevious, open, poster, source, title, ...props }) {
    const titleId = useId();
    const dialogRef = useRef(null);
    const headingRef = useRef(null);
    const triggerRef = useRef(null);
    const wasOpenRef = useRef(false);
    const requestClose = useCallback(() => {
        onClose();
    }, [onClose]);
    useLayoutEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog)
            return;
        if (open) {
            if (!wasOpenRef.current) {
                const active = document.activeElement;
                triggerRef.current = active instanceof HTMLElement ? active : null;
            }
            if (!dialog.open) {
                if (typeof dialog.showModal === "function")
                    dialog.showModal();
                else
                    dialog.setAttribute("open", "");
            }
            if (!wasOpenRef.current)
                headingRef.current?.querySelector("button")?.focus();
        }
        else if (wasOpenRef.current) {
            if (dialog.open) {
                if (typeof dialog.close === "function")
                    dialog.close();
                else
                    dialog.removeAttribute("open");
            }
            restoreFocus(triggerRef.current);
        }
        wasOpenRef.current = open;
    }, [open]);
    useLayoutEffect(() => () => {
        const dialog = dialogRef.current;
        if (dialog?.open) {
            if (typeof dialog.close === "function")
                dialog.close();
            else
                dialog.removeAttribute("open");
        }
        restoreFocus(triggerRef.current);
    }, []);
    useLayoutEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog)
            return;
        const handleClick = (event) => {
            if (isBackdropClick(dialog, event))
                requestClose();
        };
        dialog.addEventListener("click", handleClick);
        return () => {
            dialog.removeEventListener("click", handleClick);
        };
    }, [requestClose]);
    const moveWith = useEffectEvent((key) => {
        const move = key === "ArrowLeft" ? onPrevious : key === "ArrowRight" ? onNext : null;
        move?.();
        return move !== null && move !== undefined;
    });
    useLayoutEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog)
            return;
        const handleKeyDown = (event) => {
            if (event.defaultPrevented || event.altKey || event.ctrlKey)
                return;
            if (event.metaKey || event.target === null)
                return;
            if (ownsArrowKeys(event.target))
                return;
            if (moveWith(event.key))
                event.preventDefault();
        };
        dialog.addEventListener("keydown", handleKeyDown);
        return () => {
            dialog.removeEventListener("keydown", handleKeyDown);
        };
    }, []);
    // The last item has no next button: keep the focus, and so the arrow keys,
    // in the preview when the focused button goes away.
    const canMoveBack = onPrevious !== undefined;
    const canMoveOn = onNext !== undefined;
    useLayoutEffect(() => {
        const dialog = dialogRef.current;
        if (!open || !dialog?.open)
            return;
        if (dialog.contains(document.activeElement))
            return;
        headingRef.current?.querySelector("button")?.focus();
    }, [open, source, canMoveBack, canMoveOn]);
    assertMediaKind(kind);
    if (!isHostSource(source)) {
        throw new TypeError("MediaLightbox accepts only a host-owned blob URL or a same-origin path.");
    }
    if (poster !== undefined && !isHostSource(poster)) {
        throw new TypeError("A video poster must be a host-owned blob URL or a same-origin path.");
    }
    if (title.trim() === "") {
        throw new TypeError("A media preview must have a name.");
    }
    if (kind === "image" && (!imageAlt || imageAlt.trim() === "")) {
        throw new TypeError("An image preview must have alternative text.");
    }
    return (_jsx("dialog", { ...props, "aria-labelledby": titleId, className: ["od-media-lightbox", className].filter(Boolean).join(" "), onCancel: (event) => {
            event.preventDefault();
            requestClose();
        }, ref: dialogRef, children: open ? (_jsxs(_Fragment, { children: [_jsxs("header", { className: "od-media-lightbox-heading", ref: headingRef, children: [_jsxs("div", { className: "od-media-lightbox-title", children: [_jsx("strong", { id: titleId, children: title }), details === undefined ? null : (_jsx("div", { className: "od-media-lightbox-details", children: details }))] }), _jsx(IconButton, { className: "od-media-lightbox-close", icon: _jsx(Icon, { name: "close", size: 18 }), label: "Close preview", onClick: requestClose })] }), _jsxs("div", { className: "od-media-lightbox-stage", "data-kind": kind, children: [kind === "image" ? (_jsx("img", { alt: imageAlt, src: source }, source)) : kind === "video" ? (_jsx("video", { "aria-label": title, autoPlay: true, controls: true, playsInline: true, poster: poster, preload: "metadata", src: source }, source)) : (_jsx("iframe", { "aria-label": `Preview ${title}`, referrerPolicy: "no-referrer", sandbox: "", src: source, title: title }, source)), onPrevious ? (_jsx(IconButton, { className: "od-media-lightbox-move", "data-direction": "previous", icon: _jsx(Icon, { name: "chevron-left", size: 22 }), label: "Previous", onClick: onPrevious })) : null, onNext ? (_jsx(IconButton, { className: "od-media-lightbox-move", "data-direction": "next", icon: _jsx(Icon, { name: "chevron-right", size: 22 }), label: "Next", onClick: onNext })) : null] })] })) : null }));
}
//# sourceMappingURL=MediaLightbox.js.map