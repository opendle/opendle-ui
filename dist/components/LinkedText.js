import { jsx as _jsx } from "react/jsx-runtime";
import { textParts } from "./textParts.js";
/** A text in which each web address is a link that opens in a new tab. */
export function LinkedText({ className, text }) {
    return textParts(text).map((part, index) => part.href === undefined ? (part.text) : (_jsx("a", { className: className, href: part.href, rel: "noreferrer", target: "_blank", children: part.text }, `${String(index)}:${part.href}`)));
}
//# sourceMappingURL=LinkedText.js.map