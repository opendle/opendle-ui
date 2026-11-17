import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { characterCount } from "./characterLength.js";
import { classes } from "./classes.js";
const countFormat = new Intl.NumberFormat();
/** A count of characters against an optional limit. */
export function CharacterCount({ className, label, limit, value, }) {
    const count = typeof value === "number" ? value : characterCount(value);
    const over = limit !== null && count > limit;
    return (_jsxs("span", { className: classes("od-character-count", className), "data-invalid": over, children: [label === undefined ? null : (_jsx("span", { className: "od-visually-hidden", children: `${label}: ` })), countFormat.format(count), limit === null ? null : ` / ${countFormat.format(limit)}`] }));
}
//# sourceMappingURL=CharacterCount.js.map