import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Icon } from "../index.js";
import { Button } from "./Button.js";
import { Panel } from "./Panel.js";
/** A status panel for loading, empty, and recoverable error states. */
export function StatePanel({ actions, children, className, headingLevel = "h2", icon, kind = "loading", onRetry, retryLabel = "Try again", role = kind === "error" ? "alert" : "status", title, ...props }) {
    const Heading = headingLevel;
    const stateIcon = icon ?? (_jsx(Icon, { name: kind === "error" ? "warning" : kind === "empty" ? "list" : "refresh", size: 23 }));
    return (_jsxs(Panel, { ...props, className: ["od-state-panel", `od-state-panel-${kind}`, className]
            .filter(Boolean)
            .join(" "), role: role, children: [_jsx("span", { className: "od-state-panel-icon", children: stateIcon }), _jsxs("div", { className: "od-state-panel-copy", children: [_jsx(Heading, { children: title }), _jsx("div", { className: "od-state-panel-description", children: children })] }), actions || onRetry ? (_jsxs("div", { className: "od-state-panel-actions", children: [actions, onRetry ? (_jsx(Button, { variant: "secondary", onClick: onRetry, children: retryLabel })) : null] })) : null] }));
}
//# sourceMappingURL=StatePanel.js.map