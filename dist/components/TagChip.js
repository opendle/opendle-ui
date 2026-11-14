import { jsx as _jsx } from "react/jsx-runtime";
import { classes } from "./classes.js";
/** A tag label. It is a toggle when the host gives `onPressedChange`. */
export function TagChip({ children, className, onPressedChange, pressed = false, }) {
    if (onPressedChange === undefined) {
        return _jsx("span", { className: classes("od-tag", className), children: children });
    }
    return (_jsx("button", { "aria-pressed": pressed, className: classes("od-tag", className), onClick: () => {
            onPressedChange(!pressed);
        }, type: "button", children: children }));
}
//# sourceMappingURL=TagChip.js.map