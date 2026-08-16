import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function PageHeading({ actions, className, description, eyebrow, headingLevel = "h1", title, }) {
    const Heading = headingLevel;
    return (_jsxs("div", { className: ["od-page-heading", className].filter(Boolean).join(" "), children: [_jsxs("div", { children: [_jsx("p", { className: "od-eyebrow", children: eyebrow }), _jsx(Heading, { children: title }), description ? (_jsx("p", { className: "od-page-description", children: description })) : null] }), actions ? _jsx("div", { className: "od-heading-actions", children: actions }) : null] }));
}
//# sourceMappingURL=PageHeading.js.map