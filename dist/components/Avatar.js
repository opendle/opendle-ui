import { jsx as _jsx } from "react/jsx-runtime";
import { classes } from "./classes.js";
/** A picture in a frame, with an initial as the fallback. */
export function Avatar({ className, name, shape = "rounded", size = "default", src, }) {
    return (_jsx("span", { "aria-hidden": "true", className: classes("od-avatar", className), "data-shape": shape === "rounded" ? undefined : shape, "data-size": size, children: src ? (_jsx("img", { alt: "", src: src })) : ((Array.from(name.trim())[0] ?? "").toUpperCase()) }));
}
//# sourceMappingURL=Avatar.js.map