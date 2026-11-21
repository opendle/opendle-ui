import { useCallback, useState } from "react";
/**
 * Track one asynchronous action: pending state and the failure message. With
 * `onError`, the host gets the message and `failure` stays `null`.
 */
export function useAsyncAction(errorMessage, onError) {
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
            const message = errorMessage(error);
            if (onError === undefined)
                setFailure(message);
            else if (message !== null)
                onError(message);
            return false;
        }
        finally {
            setPending(false);
        }
    }, [errorMessage, onError]);
    const reset = useCallback(() => {
        setFailure(null);
    }, []);
    return { pending, failure, run, reset };
}
//# sourceMappingURL=useAsyncAction.js.map