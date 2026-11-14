import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { classes } from "./classes.js";
import { lastDays } from "./dateRange.js";
const noPresets = [];
/** A range of days: presets and two date inputs. */
export function DateRangeControl({ className, fromLabel, label, onChange, presets = noPresets, today, toLabel, value, }) {
    return (_jsxs("fieldset", { "aria-label": label, className: classes("od-date-range", className), children: [presets.length === 0 ? null : (_jsx("span", { className: "od-segmented", "data-size": "small", children: presets.map((preset) => {
                    const range = lastDays(today, preset.days);
                    return (_jsx("button", { "aria-pressed": range.from === value.from && range.to === value.to, onClick: () => {
                            onChange(range);
                        }, type: "button", children: preset.label }, preset.days));
                }) })), _jsxs("span", { className: "od-date-range-inputs", children: [_jsx("input", { "aria-label": fromLabel, max: value.to, onChange: (event) => {
                            if (event.currentTarget.value !== "") {
                                onChange({ ...value, from: event.currentTarget.value });
                            }
                        }, type: "date", value: value.from }), _jsx("span", { "aria-hidden": "true", children: "\u2013" }), _jsx("input", { "aria-label": toLabel, max: today, min: value.from, onChange: (event) => {
                            if (event.currentTarget.value !== "") {
                                onChange({ ...value, to: event.currentTarget.value });
                            }
                        }, type: "date", value: value.to })] })] }));
}
//# sourceMappingURL=DateRangeControl.js.map