import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef } from "react";
import { classes } from "./classes.js";
/** A tab list with arrow-key movement. The host renders the `TabPanel`. */
export function Tabs({ appearance = "line", className, idBase, items, label, onChange, value, }) {
    const listRef = useRef(null);
    function move(event, index) {
        const last = items.length - 1;
        const target = event.key === "ArrowRight"
            ? index === last
                ? 0
                : index + 1
            : event.key === "ArrowLeft"
                ? index === 0
                    ? last
                    : index - 1
                : event.key === "Home"
                    ? 0
                    : event.key === "End"
                        ? last
                        : null;
        const item = target === null ? undefined : items[target];
        if (item === undefined || target === null)
            return;
        event.preventDefault();
        onChange(item.id);
        listRef.current
            ?.querySelectorAll('[role="tab"]')
            .item(target)
            .focus();
    }
    return (_jsx("div", { "aria-label": label, className: classes("od-tabs", className), "data-appearance": appearance === "line" ? undefined : appearance, ref: listRef, role: "tablist", children: items.map((item, index) => (_jsxs("button", { "aria-controls": `${idBase}-panel-${item.id}`, "aria-selected": item.id === value, className: "od-tab", id: `${idBase}-tab-${item.id}`, onClick: () => {
                onChange(item.id);
            }, onKeyDown: (event) => {
                move(event, index);
            }, role: "tab", tabIndex: item.id === value ? 0 : -1, type: "button", children: [item.label, item.count ? _jsx("span", { className: "od-count", children: item.count }) : null] }, item.id))) }));
}
/** The content of the selected tab. */
export function TabPanel({ children, className, id, idBase }) {
    return (_jsx("div", { "aria-labelledby": `${idBase}-tab-${id}`, className: className, id: `${idBase}-panel-${id}`, role: "tabpanel", children: children }));
}
//# sourceMappingURL=Tabs.js.map