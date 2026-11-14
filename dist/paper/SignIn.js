import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useRef, useState } from "react";
import { Button } from "./Button.js";
import { InlineAlert } from "./Feedback.js";
import { Icon } from "./Icon.js";
/** A full page with one passkey action. */
export function PasskeySignIn({ actionLabel, brandMark, errorMessage, onSignIn, pendingLabel, title, }) {
    const inFlight = useRef(false);
    const [pending, setPending] = useState(false);
    const [failure, setFailure] = useState(null);
    const signIn = useCallback(async () => {
        if (inFlight.current)
            return;
        inFlight.current = true;
        setPending(true);
        setFailure(null);
        try {
            await onSignIn();
        }
        catch (error) {
            setFailure(errorMessage(error));
        }
        finally {
            inFlight.current = false;
            setPending(false);
        }
    }, [errorMessage, onSignIn]);
    return (_jsx("main", { className: "pp-sign-in", children: _jsxs("div", { className: "pp-sign-in-panel", children: [_jsxs("div", { className: "pp-sign-in-brand", children: [brandMark, _jsx("h1", { children: title })] }), _jsx(Button, { disabled: pending, icon: _jsx(Icon, { name: "passkey" }), onClick: () => void signIn(), variant: "primary", children: pending ? pendingLabel : actionLabel }), failure === null ? null : (_jsx(InlineAlert, { tone: "error", children: failure }))] }) }));
}
//# sourceMappingURL=SignIn.js.map