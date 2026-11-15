import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";

import { Button } from "./Button.js";
import { InlineAlert } from "./InlineAlert.js";
import { SessionCard, type SessionCardProps } from "./SessionPage.js";

export interface SignInCardProps extends Omit<
  SessionCardProps,
  "actions" | "feedback"
> {
  readonly actionLabel: ReactNode;
  /** An icon before the action label. */
  readonly actionIcon?: ReactNode;
  readonly pendingLabel: ReactNode;
  readonly onSignIn: () => Promise<void>;
  /** Return `null` to show nothing, for example after the user cancels. */
  readonly errorMessage: (error: unknown) => string | null;
}

/** One sign-in action with shared pending, failure, and retry behavior. */
export function SignInCard({
  actionIcon,
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
      <Button icon={actionIcon} loading={pending} onClick={() => void signIn()}>
        {pending ? pendingLabel : actionLabel}
      </Button>
    ),
    [pending, pendingLabel, actionIcon, actionLabel, signIn],
  );
  const feedback = useMemo(
    () =>
      failure === null ? null : (
        <InlineAlert tone="error">{failure}</InlineAlert>
      ),
    [failure],
  );

  return <SessionCard {...props} actions={actions} feedback={feedback} />;
}
