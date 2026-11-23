import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { classes } from "./classes.js";
import { SwitchControl } from "./FormControls.js";
import { Icon } from "./Icon.js";
import { IconButton } from "./IconButton.js";
/**
 * A switch that can inherit its value. While it inherits, it shows the
 * inherited value dimmed and an edit button that starts an override with
 * that value. An override shows a normal switch and a reset button.
 */
export function InheritedSwitchControl({ className, disabled = false, inherited, label, onChange, overrideLabel = "Override", resetLabel = "Use the inherited value", value, }) {
    const inherits = value === null;
    return (_jsxs("span", { className: classes("od-inherited-switch", className), "data-inherited": inherits, children: [_jsx(SwitchControl, { checked: value ?? inherited, disabled: disabled || inherits, label: label, onChange: (event) => {
                    onChange(event.currentTarget.checked);
                } }), _jsx(IconButton, { disabled: disabled, icon: _jsx(Icon, { name: inherits ? "edit" : "undo", size: 16 }), label: inherits ? overrideLabel : resetLabel, onClick: () => {
                    onChange(inherits ? inherited : null);
                } })] }));
}
//# sourceMappingURL=InheritedSwitchControl.js.map