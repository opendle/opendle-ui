import { jsx as _jsx } from "react/jsx-runtime";
import { classes } from "./classes.js";
/** A round picture of a person, with an initial as the fallback. */
export function Avatar({ className, name, size = "default", src, }) {
    return (_jsx("span", { "aria-hidden": "true", className: classes("pp-avatar", className), "data-size": size, children: src ? (_jsx("img", { alt: "", src: src })) : ((Array.from(name.trim())[0] ?? "").toUpperCase()) }));
}
//# sourceMappingURL=Avatar.js.map