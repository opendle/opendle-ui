import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useState } from "react";
import { classes } from "./classes.js";
import { Icon } from "./Icon.js";
import { IconButton } from "./IconButton.js";
/** A secret that shows one time, with a copy button. */
export function SecretValue({ className, copiedLabel, copyLabel, label, value, }) {
    const [copied, setCopied] = useState(false);
    const copy = useCallback(async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
    }, [value]);
    return (_jsxs("div", { className: classes("od-secret-value", className), children: [_jsx("code", { "aria-label": label, children: value }), _jsx(IconButton, { icon: _jsx(Icon, { name: copied ? "check" : "copy" }), label: copied ? copiedLabel : copyLabel, onClick: () => void copy() }), _jsx("span", { "aria-live": "polite", className: "od-visually-hidden", children: copied ? copiedLabel : "" })] }));
}
//# sourceMappingURL=SecretValue.js.map