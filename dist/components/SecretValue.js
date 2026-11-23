import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { classes } from "./classes.js";
import { CopyButton } from "./CopyButton.js";
/** A secret that shows one time, with a copy button. */
export function SecretValue({ className, copiedLabel, copyLabel, label, value, }) {
    return (_jsxs("div", { className: classes("od-secret-value", className), children: [_jsx("code", { "aria-label": label, children: value }), _jsx(CopyButton, { copiedLabel: copiedLabel, copyLabel: copyLabel, value: value })] }));
}
//# sourceMappingURL=SecretValue.js.map