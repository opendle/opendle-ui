import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useId, } from "react";
import { Card } from "./Card.js";
/** A centered page boundary for sign-in, session, and bootstrap states. */
export function SessionPage({ children, className, ...props }) {
    return (_jsx("main", { ...props, className: ["od-session-page", className].filter(Boolean).join(" "), children: children }));
}
/** A product-neutral card for one bounded session action. */
export function SessionCard({ actions, className, description, eyebrow, feedback, footer, headingLevel = "h1", icon, title, "aria-labelledby": labelledBy, ...props }) {
    const generatedHeadingId = useId();
    const Heading = headingLevel;
    return (_jsxs(Card, { ...props, "aria-labelledby": labelledBy ?? generatedHeadingId, className: ["od-session-card", className].filter(Boolean).join(" "), children: [icon ? _jsx("span", { className: "od-session-icon", children: icon }) : null, eyebrow ? _jsx("p", { className: "od-session-eyebrow", children: eyebrow }) : null, _jsx(Heading, { id: labelledBy === undefined ? generatedHeadingId : undefined, children: title }), description ? (_jsx("div", { className: "od-session-description", children: description })) : null, actions ? _jsx("div", { className: "od-session-actions", children: actions }) : null, feedback ? _jsx("div", { className: "od-session-feedback", children: feedback }) : null, footer ? _jsx("footer", { className: "od-session-footer", children: footer }) : null] }));
}
//# sourceMappingURL=SessionPage.js.map