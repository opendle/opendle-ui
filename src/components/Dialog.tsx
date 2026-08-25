import {
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
  type DialogHTMLAttributes,
  type ReactNode,
  type RefObject,
} from "react";

import { Button } from "./Button.js";

export type DialogSize = "narrow" | "default" | "wide";

const focusableSelector =
  'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), summary, iframe, audio[controls], video[controls], [contenteditable="true"], [tabindex]:not([tabindex="-1"])';

export interface DialogProps extends Omit<
  DialogHTMLAttributes<HTMLDialogElement>,
  "children" | "onCancel" | "onClick" | "onClose" | "open" | "title"
> {
  readonly open: boolean;
  readonly title: ReactNode;
  readonly description?: ReactNode;
  readonly eyebrow?: ReactNode;
  readonly children: ReactNode;
  readonly actions?: ReactNode;
  readonly headingLevel?: "h2" | "h3";
  readonly size?: DialogSize;
  readonly closeLabel?: string;
  readonly closeDisabled?: boolean;
  readonly showCloseButton?: boolean;
  readonly initialFocusRef?: RefObject<HTMLElement | null>;
  readonly returnFocusRef?: RefObject<HTMLElement | null>;
  readonly headerClassName?: string;
  readonly bodyClassName?: string;
  readonly actionsClassName?: string;
  readonly onClose: () => void;
}

function classes(...values: (string | false | null | undefined)[]) {
  return values.filter(Boolean).join(" ");
}

function isBackdropClick(dialog: HTMLDialogElement, event: MouseEvent) {
  if (event.target !== dialog) return false;
  const bounds = dialog.getBoundingClientRect();
  return (
    event.clientX < bounds.left ||
    event.clientX > bounds.right ||
    event.clientY < bounds.top ||
    event.clientY > bounds.bottom
  );
}

function openModal(dialog: HTMLDialogElement) {
  if (dialog.open) return;
  if (typeof dialog.showModal === "function") {
    dialog.showModal();
    return;
  }
  dialog.setAttribute("open", "");
}

function closeModal(dialog: HTMLDialogElement | null) {
  if (!dialog?.open) return;
  if (typeof dialog.close === "function") {
    dialog.close();
    return;
  }
  dialog.removeAttribute("open");
}

function canReceiveReturnFocus(
  target: HTMLElement | null | undefined,
  dialog?: HTMLDialogElement,
): target is HTMLElement {
  return Boolean(
    target?.isConnected &&
    !target.matches(":disabled") &&
    target.closest("[inert]") === null &&
    !dialog?.contains(target),
  );
}

function isReturnFocusCandidate(
  target: HTMLElement | null | undefined,
  dialog: HTMLDialogElement,
): target is HTMLElement {
  return Boolean(target?.isConnected && !dialog.contains(target));
}

function restoreFocus(target: HTMLElement | null) {
  if (!canReceiveReturnFocus(target)) return;
  const apply = () => {
    if (!canReceiveReturnFocus(target)) return;
    const active = document.activeElement;
    const activeDialog =
      active instanceof HTMLElement
        ? active.closest<HTMLDialogElement>("dialog[open]")
        : null;
    if (activeDialog !== null && !activeDialog.contains(target)) return;
    target.focus({ preventScroll: true });
  };
  if (typeof requestAnimationFrame === "function") requestAnimationFrame(apply);
  else apply();
}

function focusInitialElement(
  dialog: HTMLDialogElement,
  initialFocusRef: RefObject<HTMLElement | null> | undefined,
) {
  const explicitTarget = initialFocusRef?.current;
  if (
    explicitTarget?.isConnected === true &&
    dialog.contains(explicitTarget) &&
    !explicitTarget.matches(":disabled")
  ) {
    explicitTarget.focus({ preventScroll: true });
    return;
  }
  const target =
    dialog.querySelector<HTMLElement>(
      "[data-dialog-initial-focus]:not(:disabled)",
    ) ??
    dialog.querySelector<HTMLElement>("[data-dialog-close]:not(:disabled)") ??
    dialog.querySelector<HTMLElement>(focusableSelector);
  (target ?? dialog).focus({ preventScroll: true });
}

function containTabFocus(
  dialog: HTMLDialogElement,
  event: globalThis.KeyboardEvent,
) {
  if (event.key !== "Tab") return;
  const focusable = Array.from(
    dialog.querySelectorAll<HTMLElement>(focusableSelector),
  ).filter(
    (element) =>
      element.getClientRects().length > 0 &&
      element.getAttribute("aria-hidden") !== "true",
  );
  const first = focusable.at(0);
  const last = focusable.at(-1);
  if (first === undefined || last === undefined) {
    event.preventDefault();
    dialog.focus({ preventScroll: true });
    return;
  }
  const active = document.activeElement;
  if (event.shiftKey && (active === first || !dialog.contains(active))) {
    event.preventDefault();
    last.focus({ preventScroll: true });
  } else if (!event.shiftKey && (active === last || !dialog.contains(active))) {
    event.preventDefault();
    first.focus({ preventScroll: true });
  }
}

/** A controlled native modal with fixed framing and local body scrolling. */
export function Dialog({
  actions,
  actionsClassName,
  "aria-describedby": suppliedDescribedBy,
  "aria-label": ariaLabel,
  "aria-labelledby": suppliedLabelledBy,
  bodyClassName,
  children,
  className,
  closeDisabled = false,
  closeLabel = "Close dialog",
  description,
  eyebrow,
  headerClassName,
  headingLevel = "h2",
  initialFocusRef,
  onClose,
  open,
  returnFocusRef,
  showCloseButton = true,
  size = "default",
  title,
  ...props
}: DialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const latestReturnFocusTargetRef = useRef<HTMLElement | null>(null);
  const wasOpenRef = useRef(false);
  const Heading = headingLevel;
  const requestClose = useCallback(() => {
    if (!closeDisabled) onClose();
  }, [closeDisabled, onClose]);
  const describedBy = [
    description === undefined ? undefined : descriptionId,
    suppliedDescribedBy,
  ]
    .filter(Boolean)
    .join(" ");

  useLayoutEffect(() => {
    if (!open) return;
    if (!wasOpenRef.current) latestReturnFocusTargetRef.current = null;
    const target = returnFocusRef?.current;
    const dialog = dialogRef.current;
    if (dialog && isReturnFocusCandidate(target, dialog)) {
      latestReturnFocusTargetRef.current = target;
    }
  });

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null) return;
    if (open) {
      const needsModalOpen = !dialog.open;
      if (!wasOpenRef.current) {
        const suppliedTarget = returnFocusRef?.current;
        const active = document.activeElement;
        triggerRef.current = isReturnFocusCandidate(suppliedTarget, dialog)
          ? suppliedTarget
          : active instanceof HTMLElement &&
              canReceiveReturnFocus(active, dialog)
            ? active
            : null;
      }
      openModal(dialog);
      if (!wasOpenRef.current || needsModalOpen)
        focusInitialElement(dialog, initialFocusRef);
    } else if (wasOpenRef.current) {
      closeModal(dialog);
      const latestTarget = latestReturnFocusTargetRef.current;
      restoreFocus(
        canReceiveReturnFocus(latestTarget, dialog)
          ? latestTarget
          : triggerRef.current,
      );
    }
    wasOpenRef.current = open;
  }, [initialFocusRef, open, returnFocusRef]);

  useLayoutEffect(
    () => () => {
      const dialog = dialogRef.current;
      closeModal(dialog);
      const latestTarget = latestReturnFocusTargetRef.current;
      restoreFocus(
        canReceiveReturnFocus(latestTarget, dialog ?? undefined)
          ? latestTarget
          : triggerRef.current,
      );
    },
    [],
  );

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null) return;
    const handleClick = (event: MouseEvent) => {
      if (isBackdropClick(dialog, event)) requestClose();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      containTabFocus(dialog, event);
    };
    const handleSubmit = (event: SubmitEvent) => {
      if (!(event.target instanceof HTMLFormElement)) return;
      const submitterMethod =
        event.submitter instanceof HTMLButtonElement ||
        event.submitter instanceof HTMLInputElement
          ? event.submitter.getAttribute("formmethod")
          : null;
      const method = submitterMethod ?? event.target.getAttribute("method");
      if (method?.toLowerCase() !== "dialog") return;
      event.preventDefault();
      requestClose();
    };
    dialog.addEventListener("click", handleClick);
    dialog.addEventListener("keydown", handleKeyDown);
    dialog.addEventListener("submit", handleSubmit);
    return () => {
      dialog.removeEventListener("click", handleClick);
      dialog.removeEventListener("keydown", handleKeyDown);
      dialog.removeEventListener("submit", handleSubmit);
    };
  }, [requestClose]);

  return (
    <>
      {/* react-doctor-disable-next-line react-doctor/no-noninteractive-element-interactions -- A native dialog is the semantic interactive modal. Its handler contains Escape before it reaches a nested inspector. */}
      <dialog
        {...props}
        aria-describedby={describedBy || undefined}
        aria-label={ariaLabel}
        aria-labelledby={
          ariaLabel === undefined ? (suppliedLabelledBy ?? titleId) : undefined
        }
        className={classes("od-dialog", className)}
        data-size={size}
        onCancel={(event) => {
          event.preventDefault();
          requestClose();
        }}
        onKeyDown={(event) => {
          props.onKeyDown?.(event);
          if (event.key === "Escape") event.stopPropagation();
        }}
        ref={dialogRef}
        tabIndex={props.tabIndex ?? -1}
      >
        {open ? (
          <>
            <header className={classes("od-dialog-header", headerClassName)}>
              <div>
                {eyebrow === undefined ? null : (
                  <p className="od-dialog-eyebrow">{eyebrow}</p>
                )}
                <Heading id={titleId}>{title}</Heading>
                {description === undefined ? null : (
                  <div className="od-dialog-description" id={descriptionId}>
                    {description}
                  </div>
                )}
              </div>
              {!showCloseButton ? null : (
                <Button
                  aria-label={closeLabel}
                  data-dialog-close="true"
                  disabled={closeDisabled}
                  onClick={requestClose}
                  type="button"
                  variant="quiet"
                >
                  <span aria-hidden="true">×</span>
                </Button>
              )}
            </header>
            <div className={classes("od-dialog-body", bodyClassName)}>
              {children}
            </div>
            {actions === undefined ? null : (
              <footer
                className={classes("od-dialog-actions", actionsClassName)}
              >
                {actions}
              </footer>
            )}
          </>
        ) : null}
      </dialog>
    </>
  );
}
