import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
export function StatCard({ className, icon, label, note, orientation = "stacked", tone, trend, trendClassName, unit, value, visual, }) {
    return (_jsx("article", { className: [
            "od-stat-card",
            orientation === "inline" ? "od-stat-card-inline" : null,
            "stat-card",
            tone ? `od-stat-card-${tone}` : null,
            className,
        ]
            .filter(Boolean)
            .join(" "), children: orientation === "inline" ? (_jsxs(_Fragment, { children: [_jsx("span", { className: [
                        "od-stat-icon",
                        "stat-icon",
                        tone ? `stat-icon-${tone}` : null,
                    ]
                        .filter(Boolean)
                        .join(" "), children: icon }), _jsxs("div", { className: "od-stat-copy", children: [_jsx("span", { className: "od-stat-label stat-label", children: label }), _jsxs("strong", { children: [value, unit ? _jsx("span", { className: "od-stat-unit", children: unit }) : null] }), note ? _jsx("small", { className: "od-stat-note", children: note }) : null, trend ? (_jsx("span", { className: ["od-stat-trend", "stat-trend", trendClassName]
                                .filter(Boolean)
                                .join(" "), children: trend })) : null, visual] })] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "od-stat-top stat-top", children: [_jsx("span", { className: "od-stat-label stat-label", children: label }), _jsx("span", { className: [
                                "od-stat-icon",
                                "stat-icon",
                                tone ? `stat-icon-${tone}` : null,
                            ]
                                .filter(Boolean)
                                .join(" "), children: icon })] }), _jsxs("strong", { children: [value, unit ? _jsx("span", { className: "od-stat-unit", children: unit }) : null] }), trend || note ? (_jsxs("span", { className: ["od-stat-trend", "stat-trend", trendClassName]
                        .filter(Boolean)
                        .join(" "), children: [trend, " ", note ? _jsx("em", { children: note }) : null] })) : null, visual] })) }));
}
//# sourceMappingURL=StatCard.js.map