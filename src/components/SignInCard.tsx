import { useMemo, type ReactNode } from "react";

import { Button } from "./Button.js";
import { SessionCard, type SessionCardProps } from "./SessionPage.js";
import { useSessionAction } from "./useSessionAction.js";

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
  const { feedback, pending, run } = useSessionAction(onSignIn, errorMessage);

  const actions = useMemo(
    () => (
      <Button icon={actionIcon} loading={pending} onClick={() => void run()}>
        {pending ? pendingLabel : actionLabel}
      </Button>
    ),
    [pending, pendingLabel, actionIcon, actionLabel, run],
  );

  return <SessionCard {...props} actions={actions} feedback={feedback} />;
}
