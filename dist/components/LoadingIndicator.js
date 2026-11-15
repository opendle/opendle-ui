import { jsx as _jsx } from "react/jsx-runtime";
import { classes } from "./classes.js";
/**
 * The one sign that something loads. It turns; with reduced motion it fades
 * in and out and does not move.
 */
export function LoadingIndicator({ block = false, className, label, size = "default", }) {
    return (_jsx("output", { "aria-label": label, className: classes("od-loading", className), "data-block": block, "data-size": size, children: _jsx("span", { className: "od-loading-ring" }) }));
}
//# sourceMappingURL=LoadingIndicator.js.map