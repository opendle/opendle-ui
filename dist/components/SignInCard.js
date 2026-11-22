import { jsx as _jsx } from "react/jsx-runtime";
import { useMemo } from "react";
import { Button } from "./Button.js";
import { SessionCard } from "./SessionPage.js";
import { useSessionAction } from "./useSessionAction.js";
/** One sign-in action with shared pending, failure, and retry behavior. */
export function SignInCard({ actionIcon, actionLabel, pendingLabel, onSignIn, errorMessage, ...props }) {
    const { feedback, pending, run } = useSessionAction(onSignIn, errorMessage);
    const actions = useMemo(() => (_jsx(Button, { icon: actionIcon, loading: pending, onClick: () => void run(), children: pending ? pendingLabel : actionLabel })), [pending, pendingLabel, actionIcon, actionLabel, run]);
    return _jsx(SessionCard, { ...props, actions: actions, feedback: feedback });
}
//# sourceMappingURL=SignInCard.js.map