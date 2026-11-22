import type { ReactNode, SyntheticEvent } from "react";

import { Button } from "./Button.js";
import { SessionCard, type SessionCardProps } from "./SessionPage.js";
import { useSessionAction } from "./useSessionAction.js";

export interface SessionFormCardProps extends Omit<
  SessionCardProps,
  "actions" | "feedback" | "onSubmit" | "children"
> {
  /** The fields of the form, for example an email and a password. */
  readonly children: ReactNode;
  readonly submitLabel: ReactNode;
  readonly pendingLabel: ReactNode;
  /** An icon before the submit label. */
  readonly submitIcon?: ReactNode;
  readonly onSubmit: () => Promise<void>;
  /** Return `null` to show nothing. */
  readonly errorMessage: (error: unknown) => string | null;
}

/**
 * A session card with a small form, for example an email request or a
 * password sign-in. It has the pending, failure, and retry behavior of
 * `SignInCard`.
 */
export function SessionFormCard({
  children,
  errorMessage,
  onSubmit,
  pendingLabel,
  submitIcon,
  submitLabel,
  ...props
}: SessionFormCardProps) {
  const { feedback, pending, run } = useSessionAction(onSubmit, errorMessage);
  const submit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    void run();
  };

  return (
    <SessionCard
      {...props}
      actions={
        <form className="od-session-form" onSubmit={submit}>
          {children}
          <Button icon={submitIcon} loading={pending} type="submit">
            {pending ? pendingLabel : submitLabel}
          </Button>
        </form>
      }
      feedback={feedback}
    />
  );
}
