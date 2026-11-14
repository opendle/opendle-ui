import { useCallback, useState } from "react";
/** Track one asynchronous action: pending state and the failure message. */
export function useAsyncAction(errorMessage) {
    const [pending, setPending] = useState(false);
    const [failure, setFailure] = useState(null);
    const run = useCallback(async (work) => {
        setPending(true);
        setFailure(null);
        try {
            await work();
            return true;
        }
        catch (error) {
            setFailure(errorMessage(error));
            return false;
        }
        finally {
            setPending(false);
        }
    }, [errorMessage]);
    const reset = useCallback(() => {
        setFailure(null);
    }, []);
    return { pending, failure, run, reset };
}
//# sourceMappingURL=useAsyncAction.js.map