import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from "./Button.js";
import { SessionCard } from "./SessionPage.js";
import { useSessionAction } from "./useSessionAction.js";
/**
 * A session card with a small form, for example an email request or a
 * password sign-in. It has the pending, failure, and retry behavior of
 * `SignInCard`.
 */
export function SessionFormCard({ children, errorMessage, formId, onSubmit, pendingLabel, submitIcon, submitLabel, ...props }) {
    const { feedback, pending, run } = useSessionAction(onSubmit, errorMessage);
    const submit = (event) => {
        event.preventDefault();
        void run(new FormData(event.currentTarget));
    };
    return (_jsx(SessionCard, { ...props, actions: _jsxs("form", { className: "od-session-form", id: formId, method: "post", onSubmit: submit, children: [children, _jsx(Button, { icon: submitIcon, loading: pending, type: "submit", children: pending ? pendingLabel : submitLabel })] }), feedback: feedback }));
}
//# sourceMappingURL=SessionFormCard.js.map