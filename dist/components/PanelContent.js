import { jsx as _jsx } from "react/jsx-runtime";
/** A labelled, bounded body. Keep the panel heading and close action outside. */
export function PanelContent({ children, className, tabIndex = 0, ...props }) {
    return (_jsx("section", { ...props, tabIndex: tabIndex, className: ["od-panel-content", className].filter(Boolean).join(" "), children: children }));
}
//# sourceMappingURL=PanelContent.js.map