import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";

import { Button } from "./Button.js";
import { SessionCard, type SessionCardProps } from "./SessionPage.js";

export interface SignInCardProps extends Omit<
  SessionCardProps,
  "actions" | "feedback"
> {
  readonly actionLabel: ReactNode;
  readonly pendingLabel: ReactNode;
  readonly onSignIn: () => Promise<void>;
  readonly errorMessage: (error: unknown) => string;
}

/** One sign-in action with shared pending, failure, and retry behavior. */
export function SignInCard({
  actionLabel,
  pendingLabel,
  onSignIn,
  errorMessage,
  ...props
}: SignInCardProps) {
  const inFlight = useRef(false);
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const signIn = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setPending(true);
    setFailure(null);
    try {
      await onSignIn();
    } catch (error) {
      setFailure(errorMessage(error));
      inFlight.current = false;
      setPending(false);
    }
  }, [onSignIn, errorMessage]);

  const actions = useMemo(
    () => (
      <Button disabled={pending} onClick={() => void signIn()}>
        {pending ? pendingLabel : actionLabel}
      </Button>
    ),
    [pending, pendingLabel, actionLabel, signIn],
  );
  const feedback = useMemo(
    () => (failure === null ? null : <p role="alert">{failure}</p>),
    [failure],
  );

  return <SessionCard {...props} actions={actions} feedback={feedback} />;
}
