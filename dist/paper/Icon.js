import { jsx as _jsx } from "react/jsx-runtime";
import { createElement } from "react";
import { iconShapes, networkMarks } from "./iconData.js";
import { classes } from "./classes.js";
/** A decorative stroke icon. Give the control that contains it a name. */
export function Icon({ className, name, size = 18, ...props }) {
    return (_jsx("svg", { ...props, "aria-hidden": "true", className: classes("pp-icon", className), fill: "none", height: size, stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.75", viewBox: "0 0 24 24", width: size, children: iconShapes[name].map(([tag, attributes]) => createElement(tag, {
            ...attributes,
            key: `${tag}:${Object.values(attributes).join(",")}`,
        })) }));
}
/** The mark of a social network in its brand colour. */
export function NetworkIcon({ badge = false, className, labelled = false, network, }) {
    const mark = networkMarks[network];
    return (_jsx("span", { "aria-label": labelled ? mark.label : undefined, className: classes("pp-network", className), "data-badge": badge, "data-network": network, role: labelled ? "img" : undefined, children: _jsx("svg", { "aria-hidden": "true", viewBox: "0 0 24 24", children: _jsx("path", { d: mark.path }) }) }));
}
//# sourceMappingURL=Icon.js.map