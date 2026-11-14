import { useCallback, useRef, useState, type ReactNode } from "react";

import { Button } from "./Button.js";
import { InlineAlert } from "./Feedback.js";
import { Icon } from "./Icon.js";

export interface PasskeySignInProps {
  /** The product mark above the title. */
  readonly brandMark?: ReactNode;
  readonly title: string;
  readonly actionLabel: string;
  readonly pendingLabel: string;
  /** Run the passkey ceremony. A rejection shows `errorMessage`. */
  readonly onSignIn: () => Promise<void>;
  /** Return `null` to show nothing, for example after the user cancels. */
  readonly errorMessage: (error: unknown) => string | null;
}

/** A full page with one passkey action. */
export function PasskeySignIn({
  actionLabel,
  brandMark,
  errorMessage,
  onSignIn,
  pendingLabel,
  title,
}: PasskeySignInProps) {
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
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }, [errorMessage, onSignIn]);

  return (
    <main className="pp-sign-in">
      <div className="pp-sign-in-panel">
        <div className="pp-sign-in-brand">
          {brandMark}
          <h1>{title}</h1>
        </div>
        <Button
          disabled={pending}
          icon={<Icon name="passkey" />}
          onClick={() => void signIn()}
          variant="primary"
        >
          {pending ? pendingLabel : actionLabel}
        </Button>
        {failure === null ? null : (
          <InlineAlert tone="error">{failure}</InlineAlert>
        )}
      </div>
    </main>
  );
}
