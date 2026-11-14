import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { classes } from "./classes.js";
import { Icon, type IconName } from "./Icon.js";

export type FeedbackTone = "neutral" | "success" | "warning" | "error";

const toneIcons: Record<FeedbackTone, IconName> = {
  neutral: "info",
  success: "success",
  warning: "alert",
  error: "alert",
};

export interface InlineAlertProps {
  readonly children: ReactNode;
  readonly tone?: FeedbackTone;
  readonly className?: string;
}

/** A message next to the control or form that it describes. */
export function InlineAlert({
  children,
  className,
  tone = "neutral",
}: InlineAlertProps) {
  return (
    <div
      className={classes("pp-alert", className)}
      data-tone={tone}
      role={tone === "error" ? "alert" : "status"}
    >
      <Icon name={toneIcons[tone]} size={16} />
      <span>{children}</span>
    </div>
  );
}

export interface ToastMessage {
  readonly id: number;
  readonly message: string;
  readonly tone: "success" | "error";
}

export interface ToastStackProps {
  readonly toasts: readonly ToastMessage[];
  /** The accessible name of the region. */
  readonly label: string;
}

/** Short-lived messages above all content, including an open dialog. */
export function ToastStack({ label, toasts }: ToastStackProps) {
  const regionRef = useRef<HTMLElement>(null);
  const newest = toasts.at(-1)?.id ?? null;

  useLayoutEffect(() => {
    const region = regionRef.current;
    if (region === null || typeof region.showPopover !== "function") return;
    // Show again for each new message, so it is above a dialog opened later.
    if (region.matches(":popover-open")) region.hidePopover();
    if (newest !== null) region.showPopover();
  }, [newest]);

  return (
    <section
      aria-label={label}
      className="pp-toasts"
      popover="manual"
      ref={regionRef}
    >
      {toasts.map((toast) => (
        <output className="pp-toast" data-tone={toast.tone} key={toast.id}>
          <Icon name={toast.tone === "error" ? "alert" : "check"} size={16} />
          {toast.message}
        </output>
      ))}
    </section>
  );
}

export interface ToastQueue {
  readonly toasts: readonly ToastMessage[];
  readonly showToast: (message: string, tone?: ToastMessage["tone"]) => void;
}

/** Hold toast messages and remove each one after `duration` milliseconds. */
export function useToastQueue(duration = 4000): ToastQueue {
  const [toasts, setToasts] = useState<readonly ToastMessage[]>([]);
  const nextId = useRef(1);
  const showToast = useCallback(
    (message: string, tone: ToastMessage["tone"] = "success") => {
      const id = nextId.current++;
      setToasts((current) => [...current.slice(-2), { id, message, tone }]);
      setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
      }, duration);
    },
    [duration],
  );
  return { toasts, showToast };
}
