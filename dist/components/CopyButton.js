import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useState } from "react";
import { Icon } from "./Icon.js";
import { IconButton } from "./IconButton.js";
/** An icon button that copies a text and then shows a check mark. */
export function CopyButton({ className, copiedLabel = "Copied", copyLabel = "Copy", value, }) {
    const [copied, setCopied] = useState(false);
    const copy = useCallback(async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
    }, [value]);
    return (_jsxs(_Fragment, { children: [_jsx(IconButton, { className: className, icon: _jsx(Icon, { name: copied ? "check" : "copy" }), label: copied ? copiedLabel : copyLabel, onClick: () => void copy() }), _jsx("span", { "aria-live": "polite", className: "od-visually-hidden", children: copied ? copiedLabel : "" })] }));
}
//# sourceMappingURL=CopyButton.js.map