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
  /** A stable ID for the form when a browser needs to identify it. */
  readonly formId?: string;
  /** The form values at submit time, including values filled by the browser. */
  readonly onSubmit: (data: FormData) => Promise<void>;
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
  formId,
  onSubmit,
  pendingLabel,
  submitIcon,
  submitLabel,
  ...props
}: SessionFormCardProps) {
  const { feedback, pending, run } = useSessionAction(onSubmit, errorMessage);
  const submit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    void run(new FormData(event.currentTarget));
  };

  return (
    <SessionCard
      {...props}
      actions={
        <form
          className="od-session-form"
          id={formId}
          method="post"
          onSubmit={submit}
        >
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
