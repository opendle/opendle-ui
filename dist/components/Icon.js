import { jsx as _jsx } from "react/jsx-runtime";
import { createElement } from "react";
import { classes } from "./classes.js";
import { iconShapes, networkMarks } from "./iconData.js";
/** Icons drawn as one path. A generated icon of the same name replaces one. */
const extraIconPaths = {
    home: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
    "panel-left": "M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z M9 3v18",
    link: "M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7 M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7",
    activity: "M3 12h4l2-7 4 14 2-7h6",
    "arrow-up": "M12 19V5m-5 5 5-5 5 5",
    audit: "M5 4h14v16H5z M8 8h8 M8 12h8 M8 16h5",
    bell: "M10.3 21a2 2 0 0 0 3.4 0 M3.3 15.3A1 1 0 0 0 4 17h16a1 1 0 0 0 .7-1.7C19.4 14 18 12.5 18 8A6 6 0 0 0 6 8c0 4.5-1.4 6-2.7 7.3",
    book: "M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21z M4 5.5v15",
    chevron: "m6 9 6 6 6-6",
    check: "m5 12 4 4 10-10",
    clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 2",
    close: "M6 6l12 12M6 18 18 6",
    cloud: "M7 18h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 8a5 5 0 0 0 1 10",
    database: "M4 5c0-1.1 3.6-2 8-2s8 .9 8 2-3.6 2-8 2-8-.9-8-2z M4 5v7c0 1.1 3.6 2 8 2s8-.9 8-2V5 M4 12v7c0 1.1 3.6 2 8 2s8-.9 8-2v-7",
    edit: "m16 3 5 5-12 12-6 1 1-6 12-12z M14 5l5 5",
    eye: "M3 12s3-5 9-5 9 5 9 5-3 5-9 5-9-5-9-5Zm9 2a2 2 0 1 0 0-4 2 2 0 0 0 0 4",
    file: "M6 3h8l4 4v14H6z M14 3v5h5 M9 13h6 M9 17h5",
    filter: "M4 6h16M7 12h10m-7 6h4",
    grid: "M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M14 14h6v6h-6z",
    health: "M12 21s8-4.3 8-10.2V5.5L12 3 4 5.5v5.3C4 16.7 12 21 12 21z M8 12l2.5 2.5L16 9",
    key: "M15 7a4 4 0 1 0-3.9 5H5v3h3v3h3v-3h2.1A4 4 0 0 0 15 7z M15 7h.01",
    layers: "m12 3 9 5-9 5-9-5z M3 12l9 5 9-5 M3 16l9 5 9-5",
    languages: "M5 8l6 6 M4 14l6-6 2-3 M2 5h12 M7 2h1 M22 22l-5-10-5 10 M14 18h6",
    list: "M8 6h12M8 12h12M8 18h12M4 6h.1M4 12h.1M4 18h.1",
    lock: "M5 10h14v10H5zM8 10V7a4 4 0 0 1 8 0v3",
    logout: "M10 17l5-5-5-5 M15 12H3 M21 19V5a2 2 0 0 0-2-2h-5",
    menu: "M4 6h16 M4 12h16 M4 18h16",
    more: "M5 12h.1M12 12h.1M19 12h.1",
    moon: "M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5z",
    plus: "M12 5v14 M5 12h14",
    refresh: "M20 11a8 8 0 0 0-14.7-3.9L3 10 M3 5v5h5 M4 13a8 8 0 0 0 14.7 3.9L21 14 M21 19v-5h-5",
    search: "m21 21-4.3-4.3 M10.8 18a7.2 7.2 0 1 0 0-14.4 7.2 7.2 0 0 0 0 14.4z",
    server: "M4 5h16v5H4z M4 14h16v5H4z M7 7.5h.01 M7 16.5h.01 M10 7.5h6 M10 16.5h6",
    settings: "M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.2h-2.5v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H7v-2.5h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V5h2.5v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.2v2.5h-.2a1.7 1.7 0 0 0-1.5 1z",
    shield: "M12 21s8-4.3 8-10.2V5.5L12 3 4 5.5v5.3C4 16.7 12 21 12 21z",
    spark: "m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7z M19 17v4 M17 19h4",
    users: "M16 20v-1.5a4.5 4.5 0 0 0-9 0V20 M11.5 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z M17 4.5a3 3 0 0 1 0 5.8 M20 20v-1.2a4 4 0 0 0-2.7-3.8",
    warning: "m12 4 9 16H3l9-16Zm0 5v4m0 3h.1",
    workspace: "M4 5h16v14H4z M4 9h16 M8 5v4",
};
function isGenerated(name) {
    return name in iconShapes;
}
/** A stroke icon. It is decorative unless the host gives `aria-label`. */
export function Icon({ className, name, size = 18, ...props }) {
    return (_jsx("svg", { ...props, "aria-hidden": props["aria-label"] ? undefined : true, className: classes("od-icon", className), fill: "none", height: size, stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: props.strokeWidth ?? 1.75, viewBox: "0 0 24 24", width: size, children: isGenerated(name) ? (iconShapes[name].map(([tag, attributes]) => createElement(tag, {
            ...attributes,
            key: `${tag}:${Object.values(attributes).join(",")}`,
        }))) : (_jsx("path", { d: extraIconPaths[name] })) }));
}
/**
 * The mark of a social network in its brand colour. The network name is its
 * accessible name and shows on hover.
 */
export function NetworkIcon({ badge = false, className, network, ...props }) {
    const mark = networkMarks[network];
    return (_jsx("span", { ...props, className: classes("od-network", className), "data-badge": badge, "data-network": network, title: mark.label, children: _jsx("svg", { "aria-label": mark.label, role: "img", viewBox: "0 0 24 24", children: _jsx("path", { d: mark.path }) }) }));
}
//# sourceMappingURL=Icon.js.map