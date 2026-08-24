import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useId, useLayoutEffect, useRef, } from "react";
import { Button } from "./Button.js";
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
    if (kind !== "image" && kind !== "pdf") {
        throw new TypeError("MediaLightbox accepts only image or PDF media.");
    }
}
/** A controlled modal preview for one host-owned image or PDF blob URL. */
export function MediaLightbox({ className, imageAlt, kind, onClose, open, source, title, ...props }) {
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
    assertMediaKind(kind);
    if (!source.startsWith("blob:") || source.length === 5) {
        throw new TypeError("MediaLightbox accepts only a host-owned blob URL.");
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
        }, ref: dialogRef, children: open ? (_jsxs(_Fragment, { children: [_jsxs("header", { className: "od-media-lightbox-heading", ref: headingRef, children: [_jsx("strong", { id: titleId, children: title }), _jsx(Button, { onClick: requestClose, variant: "quiet", children: "Close preview" })] }), kind === "image" ? (_jsx("img", { alt: imageAlt, src: source }, source)) : (_jsx("iframe", { "aria-label": `Preview ${title}`, referrerPolicy: "no-referrer", sandbox: "", src: source, title: title }, source))] })) : null }));
}
//# sourceMappingURL=MediaLightbox.js.map