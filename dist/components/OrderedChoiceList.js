import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useId, useLayoutEffect, useRef, useState } from "react";
import { IconButton } from "./IconButton.js";
import { SearchableSelect, } from "./SearchableSelect.js";
function ActionIcon({ kind, }) {
    const path = {
        grip: "M5 4h.01M11 4h.01M5 8h.01M11 8h.01M5 12h.01M11 12h.01",
        up: "M8 13V3M4 7l4-4 4 4",
        down: "M8 3v10M4 9l4 4 4-4",
        remove: "M4 4l8 8M12 4l-8 8",
    }[kind];
    return (_jsx("svg", { "aria-hidden": "true", width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: kind === "grip" ? 2.5 : 1.6, strokeLinecap: "round", strokeLinejoin: "round", children: _jsx("path", { d: path }) }));
}
/** A compact controlled list with searchable additions and accessible reordering. */
export function OrderedChoiceList({ label, addLabel, addPlaceholder, items, options, disabled = false, maxItems, onAdd, onRemove, onReorder, }) {
    const instructionId = useId();
    const [movingId, setMovingId] = useState(null);
    const [dropTargetId, setDropTargetId] = useState(null);
    const [announcement, setAnnouncement] = useState("");
    const rowRefs = useRef(new Map());
    const addRef = useRef(null);
    const pendingFocus = useRef(null);
    const pendingAddValue = useRef(null);
    const pointerDrag = useRef(null);
    const suppressClick = useRef(false);
    const ids = new Set(items.map((item) => item.id));
    if (ids.size !== items.length ||
        items.some((item) => !item.id.trim() || !item.label.trim()))
        throw new Error("Ordered choices must have unique non-empty IDs and labels.");
    if (maxItems !== undefined &&
        (!Number.isSafeInteger(maxItems) || maxItems < 1))
        throw new Error("Ordered choice maximum must be a positive integer.");
    if (new Set(options.map((option) => option.value)).size !== options.length)
        throw new Error("Ordered choice option values must be unique.");
    const selectedValues = new Set(items.map((item) => item.value));
    const available = options.filter((option) => !selectedValues.has(option.value));
    const canAdd = !disabled &&
        (maxItems === undefined || items.length < maxItems) &&
        available.some((option) => !option.disabled && option.value !== "");
    useLayoutEffect(() => {
        const addedValue = pendingAddValue.current;
        if (addedValue !== null) {
            pendingAddValue.current = null;
            if (!canAdd) {
                pendingFocus.current =
                    [...items].reverse().find((item) => item.value === addedValue)?.id ??
                        null;
            }
        }
        if (pendingFocus.current === null)
            return;
        const row = rowRefs.current.get(pendingFocus.current);
        pendingFocus.current = null;
        const target = row?.querySelector("button:not(:disabled)") ??
            addRef.current?.querySelector("input:not(:disabled)");
        target?.focus({ preventScroll: true });
    }, [items, canAdd]);
    function move(id, targetIndex) {
        if (disabled || targetIndex < 0 || targetIndex >= items.length)
            return;
        const fromIndex = items.findIndex((item) => item.id === id);
        if (fromIndex < 0 || fromIndex === targetIndex)
            return;
        const order = items.map((item) => item.id);
        order.splice(fromIndex, 1);
        order.splice(targetIndex, 0, id);
        pendingFocus.current = id;
        onReorder(order);
        setAnnouncement(`${items[fromIndex]?.label ?? "Item"} moved to position ${String(targetIndex + 1)}.`);
    }
    return (_jsxs("div", { className: "od-ordered-choice-list", children: [_jsx("span", { className: "od-visually-hidden", id: instructionId, children: "Use the up and down arrow keys to change the position." }), _jsx("ol", { "aria-label": label, className: "od-ordered-choice-items", children: items.map((item, index) => (_jsxs("li", { className: "od-ordered-choice-item", "data-moving": movingId === item.id, "data-drop-target": dropTargetId === item.id, ref: (element) => {
                        if (element)
                            rowRefs.current.set(item.id, element);
                        else
                            rowRefs.current.delete(item.id);
                    }, children: [items.length > 1 ? (_jsx(IconButton, { className: "od-ordered-choice-handle", "aria-label": `Reorder ${item.label}`, "aria-describedby": instructionId, "aria-keyshortcuts": "ArrowUp ArrowDown", title: `Reorder ${item.label}`, icon: _jsx(ActionIcon, { kind: "grip" }), disabled: disabled, onPointerDown: (event) => {
                                if (disabled || event.button !== 0)
                                    return;
                                event.currentTarget.setPointerCapture(event.pointerId);
                                pointerDrag.current = {
                                    id: item.id,
                                    pointerId: event.pointerId,
                                    startY: event.clientY,
                                    targetIndex: index,
                                    started: false,
                                };
                            }, onPointerMove: (event) => {
                                const drag = pointerDrag.current;
                                if (drag?.pointerId !== event.pointerId || disabled)
                                    return;
                                if (!drag.started &&
                                    Math.abs(event.clientY - drag.startY) < 4)
                                    return;
                                drag.started = true;
                                setMovingId(drag.id);
                                let nearest = Infinity;
                                for (const [candidateIndex, candidate] of items.entries()) {
                                    const bounds = rowRefs.current
                                        .get(candidate.id)
                                        ?.getBoundingClientRect();
                                    if (!bounds)
                                        continue;
                                    const distance = Math.abs(event.clientY - (bounds.top + bounds.height / 2));
                                    if (distance < nearest) {
                                        nearest = distance;
                                        drag.targetIndex = candidateIndex;
                                    }
                                }
                                setDropTargetId(items[drag.targetIndex]?.id ?? null);
                                const scroller = event.currentTarget.closest(".od-dialog-body");
                                if (scroller) {
                                    const bounds = scroller.getBoundingClientRect();
                                    if (event.clientY < bounds.top + 32)
                                        scroller.scrollTop -= 16;
                                    else if (event.clientY > bounds.bottom - 32)
                                        scroller.scrollTop += 16;
                                }
                            }, onPointerUp: (event) => {
                                const drag = pointerDrag.current;
                                pointerDrag.current = null;
                                setMovingId(null);
                                setDropTargetId(null);
                                if (event.currentTarget.hasPointerCapture(event.pointerId))
                                    event.currentTarget.releasePointerCapture(event.pointerId);
                                if (!drag?.started)
                                    return;
                                suppressClick.current = true;
                                move(drag.id, drag.targetIndex);
                            }, onPointerCancel: () => {
                                pointerDrag.current = null;
                                setMovingId(null);
                                setDropTargetId(null);
                            }, onClick: () => {
                                if (suppressClick.current) {
                                    suppressClick.current = false;
                                    return;
                                }
                                setAnnouncement(`${item.label}. Use the up and down arrow keys to change the position.`);
                            }, onKeyDown: (event) => {
                                if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                                    event.preventDefault();
                                    move(item.id, index + (event.key === "ArrowUp" ? -1 : 1));
                                }
                                else if (event.key === "Escape" && movingId !== null) {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    pointerDrag.current = null;
                                    setMovingId(null);
                                    setDropTargetId(null);
                                }
                            } })) : null, _jsxs("span", { className: "od-ordered-choice-position", "aria-label": `Position ${String(index + 1)}`, children: ["#", index + 1] }), _jsxs("span", { className: "od-ordered-choice-name", children: [_jsx("strong", { children: item.label }), item.detail ? _jsx("span", { children: item.detail }) : null] }), _jsxs("span", { className: "od-ordered-choice-actions", children: [index > 0 ? (_jsx(IconButton, { "aria-label": `Move ${item.label} up`, title: "Move up", icon: _jsx(ActionIcon, { kind: "up" }), disabled: disabled, onClick: () => {
                                        move(item.id, index - 1);
                                    } })) : null, index < items.length - 1 ? (_jsx(IconButton, { "aria-label": `Move ${item.label} down`, title: "Move down", icon: _jsx(ActionIcon, { kind: "down" }), disabled: disabled, onClick: () => {
                                        move(item.id, index + 1);
                                    } })) : null, _jsx(IconButton, { "aria-label": `Remove ${item.label}`, title: "Remove", icon: _jsx(ActionIcon, { kind: "remove" }), disabled: disabled, onClick: () => {
                                        pendingFocus.current =
                                            items[index + 1]?.id ?? items[index - 1]?.id ?? "";
                                        setMovingId(null);
                                        onRemove(item.id);
                                        setAnnouncement(`${item.label} removed.`);
                                    } })] })] }, item.id))) }), _jsx("div", { className: "od-ordered-choice-add", ref: addRef, children: _jsx(SearchableSelect, { label: addLabel, ...(addPlaceholder ? { placeholder: addPlaceholder } : {}), options: available, value: "", disabled: !canAdd, onChange: (value) => {
                        if (!canAdd ||
                            !value ||
                            !available.some((option) => option.value === value && !option.disabled))
                            return;
                        pendingAddValue.current = value;
                        onAdd(value);
                        setAnnouncement(`${options.find((option) => option.value === value)?.label ?? "Item"} added at position ${String(items.length + 1)}.`);
                    } }) }), _jsx("span", { "aria-live": "polite", "aria-atomic": "true", className: "od-visually-hidden", children: announcement })] }));
}
//# sourceMappingURL=OrderedChoiceList.js.map