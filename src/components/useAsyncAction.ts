import { useCallback, useState } from "react";

export interface AsyncAction {
  readonly pending: boolean;
  readonly failure: string | null;
  /** Run the work. It resolves `true` when the work succeeds. */
  readonly run: (work: () => Promise<void>) => Promise<boolean>;
  readonly reset: () => void;
}

/** Track one asynchronous action: pending state and the failure message. */
export function useAsyncAction(
  errorMessage: (error: unknown) => string | null,
): AsyncAction {
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const run = useCallback(
    async (work: () => Promise<void>) => {
      setPending(true);
      setFailure(null);
      try {
        await work();
        return true;
      } catch (error) {
        setFailure(errorMessage(error));
        return false;
      } finally {
        setPending(false);
      }
    },
    [errorMessage],
  );
  const reset = useCallback(() => {
    setFailure(null);
  }, []);
  return { pending, failure, run, reset };
}
