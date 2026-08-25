import {
  useEffect,
  useId,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
} from "react";

import { Button } from "./Button.js";
import { InlineAlert } from "./InlineAlert.js";

async function copyWithBrowser(value: string): Promise<void> {
  await navigator.clipboard.writeText(value);
}

export interface SecretRevealPanelProps {
  readonly actions?: ReactNode;
  readonly children?: ReactNode;
  readonly className?: string;
  readonly copiedLabel?: ReactNode;
  readonly copyLabel?: ReactNode;
  readonly copySecret?: (secret: string) => Promise<void>;
  readonly description?: ReactNode;
  readonly dismissLabel?: ReactNode;
  readonly headingLevel?: "h2" | "h3";
  readonly onCopyError?: (error: unknown) => void;
  readonly onDismiss?: () => void;
  readonly secret: string;
  readonly secretLabel?: string;
  readonly title?: ReactNode;
}

export function SecretRevealPanel({
  secret,
  ...props
}: SecretRevealPanelProps) {
  if (!secret) throw new Error("SecretRevealPanel requires a secret.");
  return <SecretRevealPanelContent key={secret} secret={secret} {...props} />;
}

function SecretRevealPanelContent({
  actions,
  children,
  className,
  copiedLabel = "Copied",
  copyLabel = "Copy secret",
  copySecret = copyWithBrowser,
  description = "This secret is shown one time. Store it before you close this panel.",
  dismissLabel = "I stored the secret",
  headingLevel = "h2",
  onCopyError,
  onDismiss,
  secret,
  secretLabel = "One-time secret",
  title = "Store this secret now",
}: SecretRevealPanelProps) {
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">(
    "idle",
  );
  const active = useRef(true);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  const titleId = `${useId()}-title`;
  const descriptionId = `${titleId}-description`;
  const copied = copyStatus === "copied";
  const failed = copyStatus === "failed";
  const Heading = headingLevel as ElementType;

  async function copy() {
    try {
      await copySecret(secret);
      if (active.current) setCopyStatus("copied");
    } catch (error) {
      if (active.current) {
        setCopyStatus("failed");
        onCopyError?.(error);
      }
    }
  }

  return (
    <section
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className={["od-secret-reveal-panel", className]
        .filter(Boolean)
        .join(" ")}
    >
      <header className="od-secret-reveal-heading">
        <div>
          <Heading id={titleId}>{title}</Heading>
          <p id={descriptionId}>{description}</p>
        </div>
      </header>
      <div className="od-secret-reveal-body">
        <span className="od-secret-reveal-label">{secretLabel}</span>
        <output aria-label={secretLabel} className="od-secret-reveal-value">
          <code>{secret}</code>
        </output>
        <div className="od-secret-reveal-actions">
          <Button onClick={() => void copy()} variant="secondary">
            {copied ? copiedLabel : copyLabel}
          </Button>
          {actions}
          {onDismiss ? (
            <Button onClick={onDismiss} variant="quiet">
              {dismissLabel}
            </Button>
          ) : null}
        </div>
        <span aria-live="polite" className="od-secret-reveal-copy-status">
          {copied ? copiedLabel : null}
        </span>
        {failed ? (
          <InlineAlert tone="error">
            The browser could not copy the secret. Select and copy it manually.
          </InlineAlert>
        ) : null}
        {children ? (
          <div className="od-secret-reveal-extra">{children}</div>
        ) : null}
      </div>
    </section>
  );
}
