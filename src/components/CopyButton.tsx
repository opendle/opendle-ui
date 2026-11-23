import { useCallback, useState } from "react";

import { Icon } from "./Icon.js";
import { IconButton } from "./IconButton.js";

export interface CopyButtonProps {
  readonly value: string;
  readonly copyLabel?: string;
  readonly copiedLabel?: string;
  readonly className?: string;
}

/** An icon button that copies a text and then shows a check mark. */
export function CopyButton({
  className,
  copiedLabel = "Copied",
  copyLabel = "Copy",
  value,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
  }, [value]);
  return (
    <>
      <IconButton
        className={className}
        icon={<Icon name={copied ? "check" : "copy"} />}
        label={copied ? copiedLabel : copyLabel}
        onClick={() => void copy()}
      />
      <span aria-live="polite" className="od-visually-hidden">
        {copied ? copiedLabel : ""}
      </span>
    </>
  );
}
