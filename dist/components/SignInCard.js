import { jsx as _jsx } from "react/jsx-runtime";
import { useCallback, useMemo, useRef, useState } from "react";
import { Button } from "./Button.js";
import { InlineAlert } from "./InlineAlert.js";
import { SessionCard } from "./SessionPage.js";
/** One sign-in action with shared pending, failure, and retry behavior. */
export function SignInCard({ actionIcon, actionLabel, pendingLabel, onSignIn, errorMessage, ...props }) {
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
            inFlight.current = false;
            setPending(false);
        }
    }, [onSignIn, errorMessage]);
    const actions = useMemo(() => (_jsx(Button, { disabled: pending, icon: actionIcon, onClick: () => void signIn(), children: pending ? pendingLabel : actionLabel })), [pending, pendingLabel, actionIcon, actionLabel, signIn]);
    const feedback = useMemo(() => failure === null ? null : (_jsx(InlineAlert, { tone: "error", children: failure })), [failure]);
    return _jsx(SessionCard, { ...props, actions: actions, feedback: feedback });
}
//# sourceMappingURL=SignInCard.js.map