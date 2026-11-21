import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { classes } from "./classes.js";
import { Icon } from "./Icon.js";
/**
 * A tag label. It is a toggle when the host gives `onPressedChange`: on is
 * filled, off has an outline, and an unavailable function has a flat muted
 * fill and a blocked mark.
 */
export function TagChip({ children, className, color, disabled = false, title, onPressedChange, pressed = false, unavailable = false, }) {
    if (onPressedChange === undefined) {
        return (_jsx("span", { className: classes("od-tag", className), "data-color": color, title: title, children: children }));
    }
    return (_jsxs("button", { "aria-pressed": pressed, className: classes("od-tag", className), "data-color": color, "data-unavailable": unavailable || undefined, disabled: disabled || unavailable, title: title, onClick: () => {
            onPressedChange(!pressed);
        }, type: "button", children: [unavailable ? _jsx(Icon, { name: "blocked", size: 12 }) : null, children] }));
}
//# sourceMappingURL=TagChip.js.map