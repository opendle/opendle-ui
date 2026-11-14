import { jsx as _jsx } from "react/jsx-runtime";
import { classes } from "./classes.js";
/** A small set of exclusive choices that shows all of them. */
export function SegmentedControl({ className, label, onChange, options, size = "default", value, }) {
    return (_jsx("fieldset", { "aria-label": label, className: classes("od-segmented", className), "data-size": size, children: options.map((option) => (_jsx("button", { "aria-pressed": option.value === value, onClick: () => {
                if (option.value !== value)
                    onChange(option.value);
            }, type: "button", children: option.label }, option.value))) }));
}
//# sourceMappingURL=SegmentedControl.js.map