import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useState } from "react";
import { IconButton } from "./Button.js";
import { classes } from "./classes.js";
import { Icon } from "./Icon.js";
/** A secret that shows one time, with a copy button. */
export function SecretReveal({ className, copiedLabel, copyLabel, label, value, }) {
    const [copied, setCopied] = useState(false);
    const copy = useCallback(async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
    }, [value]);
    return (_jsxs("div", { className: classes("pp-secret", className), children: [_jsx("code", { "aria-label": label, children: value }), _jsx(IconButton, { icon: _jsx(Icon, { name: copied ? "check" : "copy" }), label: copied ? copiedLabel : copyLabel, onClick: () => void copy() }), _jsx("span", { "aria-live": "polite", className: "pp-visually-hidden", children: copied ? copiedLabel : "" })] }));
}
//# sourceMappingURL=SecretReveal.js.map