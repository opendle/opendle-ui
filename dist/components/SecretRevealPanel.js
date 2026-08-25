import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useId, useRef, useState, } from "react";
import { Button } from "./Button.js";
import { InlineAlert } from "./InlineAlert.js";
async function copyWithBrowser(value) {
    await navigator.clipboard.writeText(value);
}
export function SecretRevealPanel({ secret, ...props }) {
    if (!secret)
        throw new Error("SecretRevealPanel requires a secret.");
    return _jsx(SecretRevealPanelContent, { secret: secret, ...props }, secret);
}
function SecretRevealPanelContent({ actions, children, className, copiedLabel = "Copied", copyLabel = "Copy secret", copySecret = copyWithBrowser, description = "This secret is shown one time. Store it before you close this panel.", dismissLabel = "I stored the secret", headingLevel = "h2", onCopyError, onDismiss, secret, secretLabel = "One-time secret", title = "Store this secret now", }) {
    const [copyStatus, setCopyStatus] = useState("idle");
    const active = useRef(true);
    useEffect(() => {
        active.current = true;
        return () => {
            active.current = false;
        };
    }, []);
    const titleId = `${useId()}-title`;
    const descriptionId = `${titleId}-description`;
    const copied = copyStatus === "copied";
    const failed = copyStatus === "failed";
    const Heading = headingLevel;
    async function copy() {
        try {
            await copySecret(secret);
            if (active.current)
                setCopyStatus("copied");
        }
        catch (error) {
            if (active.current) {
                setCopyStatus("failed");
                onCopyError?.(error);
            }
        }
    }
    return (_jsxs("section", { "aria-describedby": descriptionId, "aria-labelledby": titleId, className: ["od-secret-reveal-panel", className]
            .filter(Boolean)
            .join(" "), children: [_jsx("header", { className: "od-secret-reveal-heading", children: _jsxs("div", { children: [_jsx(Heading, { id: titleId, children: title }), _jsx("p", { id: descriptionId, children: description })] }) }), _jsxs("div", { className: "od-secret-reveal-body", children: [_jsx("span", { className: "od-secret-reveal-label", children: secretLabel }), _jsx("output", { "aria-label": secretLabel, className: "od-secret-reveal-value", children: _jsx("code", { children: secret }) }), _jsxs("div", { className: "od-secret-reveal-actions", children: [_jsx(Button, { onClick: () => void copy(), variant: "secondary", children: copied ? copiedLabel : copyLabel }), actions, onDismiss ? (_jsx(Button, { onClick: onDismiss, variant: "quiet", children: dismissLabel })) : null] }), _jsx("span", { "aria-live": "polite", className: "od-secret-reveal-copy-status", children: copied ? copiedLabel : null }), failed ? (_jsx(InlineAlert, { tone: "error", children: "The browser could not copy the secret. Select and copy it manually." })) : null, children ? (_jsx("div", { className: "od-secret-reveal-extra", children: children })) : null] })] }));
}
//# sourceMappingURL=SecretRevealPanel.js.map