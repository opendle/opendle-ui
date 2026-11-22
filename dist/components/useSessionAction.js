import { jsx as _jsx } from "react/jsx-runtime";
import { useCallback, useMemo, useRef, useState } from "react";
import { InlineAlert } from "./InlineAlert.js";
/** Run one session action at a time and keep the message of its failure. */
export function useSessionAction(action, errorMessage) {
    const inFlight = useRef(false);
    const [pending, setPending] = useState(false);
    const [failure, setFailure] = useState(null);
    const run = useCallback(async () => {
        if (inFlight.current)
            return;
        inFlight.current = true;
        setPending(true);
        setFailure(null);
        try {
            await action();
        }
        catch (error) {
            setFailure(errorMessage(error));
            inFlight.current = false;
            setPending(false);
        }
    }, [action, errorMessage]);
    const feedback = useMemo(() => failure === null ? null : (_jsx(InlineAlert, { tone: "error", children: failure })), [failure]);
    return { feedback, pending, run };
}
//# sourceMappingURL=useSessionAction.js.map