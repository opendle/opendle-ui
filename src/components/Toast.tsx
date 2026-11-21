import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { createPortal } from "react-dom";

import { classes } from "./classes.js";
import { Icon } from "./Icon.js";

export type ToastTone = "neutral" | "success" | "error";

export interface ToastProps extends HTMLAttributes<HTMLOutputElement> {
  readonly children: ReactNode;
  readonly onDismiss?: () => void;
  /** `success` and `error` add an icon. */
  readonly tone?: ToastTone;
}

type ModalSubscriber = () => void;

const modalSubscribers = new Set<ModalSubscriber>();
let activeModalDialog: HTMLDialogElement | null = null;
let modalObserver: MutationObserver | null = null;

function findActiveModalDialog(): HTMLDialogElement | null {
  if (typeof document === "undefined") return null;
  try {
    const focusedDialog =
      document.activeElement instanceof Element
        ? document.activeElement.closest("dialog:modal")
        : null;
    if (focusedDialog instanceof HTMLDialogElement) return focusedDialog;

    const hitTarget = document.elementFromPoint(
      Math.max(0, Math.floor(window.innerWidth / 2)),
      Math.max(0, Math.floor(window.innerHeight / 2)),
    );
    const hitDialog = hitTarget?.closest("dialog:modal");
    if (hitDialog instanceof HTMLDialogElement) return hitDialog;

    const modalDialogs =
      document.querySelectorAll<HTMLDialogElement>("dialog:modal");
    return modalDialogs.item(modalDialogs.length - 1);
  } catch {
    return null;
  }
}

function updateActiveModalDialog() {
  const nextDialog = findActiveModalDialog();
  if (nextDialog === activeModalDialog) return;
  activeModalDialog = nextDialog;
  for (const subscriber of modalSubscribers) subscriber();
}

function nodeContainsDialog(node: Node) {
  return (
    node instanceof HTMLDialogElement ||
    (node instanceof Element && node.querySelector("dialog") !== null)
  );
}

function modalMutationCanChangeTarget(record: MutationRecord) {
  if (record.type === "attributes")
    return record.target instanceof HTMLDialogElement;
  return [...record.addedNodes, ...record.removedNodes].some(
    nodeContainsDialog,
  );
}

function startModalTracking() {
  if (modalObserver !== null || typeof document === "undefined") return;
  document.addEventListener("focusin", updateActiveModalDialog);
  document.addEventListener("toggle", updateActiveModalDialog, true);
  document.addEventListener("close", updateActiveModalDialog, true);
  modalObserver = new MutationObserver((records) => {
    if (records.some(modalMutationCanChangeTarget)) updateActiveModalDialog();
  });
  modalObserver.observe(document.documentElement, {
    attributeFilter: ["open"],
    attributes: true,
    childList: true,
    subtree: true,
  });
  updateActiveModalDialog();
}

function stopModalTracking() {
  if (modalObserver === null || modalSubscribers.size !== 0) return;
  document.removeEventListener("focusin", updateActiveModalDialog);
  document.removeEventListener("toggle", updateActiveModalDialog, true);
  document.removeEventListener("close", updateActiveModalDialog, true);
  modalObserver.disconnect();
  modalObserver = null;
  activeModalDialog = null;
}

function subscribeToActiveModal(subscriber: ModalSubscriber) {
  modalSubscribers.add(subscriber);
  startModalTracking();
  return () => {
    modalSubscribers.delete(subscriber);
    stopModalTracking();
  };
}

function useActiveModalDialog() {
  return useSyncExternalStore(
    subscribeToActiveModal,
    () => activeModalDialog,
    () => null,
  );
}

function subscribeToHydration() {
  return () => undefined;
}

function useHasHydrated() {
  return useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );
}

function createToastPortalContainer() {
  if (typeof document === "undefined") return null;
  const container = document.createElement("span");
  container.dataset.odToastPortalHost = "";
  return container;
}

export function Toast({
  children,
  className,
  onDismiss,
  tone = "neutral",
  ...props
}: ToastProps) {
  const activeDialog = useActiveModalDialog();
  const hasHydrated = useHasHydrated();
  const inlineHostRef = useRef<HTMLSpanElement>(null);
  const [portalContainer] = useState(createToastPortalContainer);
  // The top layer keeps the toast above a dialog and outside its clip.
  const toast = (
    <output
      {...props}
      className={classes("od-toast", className)}
      data-tone={tone}
      popover={hasHydrated ? "manual" : undefined}
    >
      {tone === "neutral" ? null : (
        <Icon name={tone === "error" ? "alert" : "check"} size={16} />
      )}
      <span>{children}</span>
      {onDismiss ? (
        <button type="button" aria-label="Dismiss message" onClick={onDismiss}>
          ×
        </button>
      ) : null}
    </output>
  );

  useLayoutEffect(() => {
    if (!hasHydrated) return;
    const target = activeDialog ?? inlineHostRef.current;
    if (portalContainer === null || target === null) return;
    target.append(portalContainer);
    // A move in the document closes a popover, so show it again.
    const output = portalContainer.querySelector<HTMLElement>(".od-toast");
    if (
      output?.isConnected === true &&
      typeof output.showPopover === "function" &&
      !output.matches(":popover-open")
    ) {
      output.showPopover();
    }
  }, [activeDialog, hasHydrated, portalContainer]);

  useLayoutEffect(
    () => () => {
      portalContainer?.remove();
    },
    [portalContainer],
  );

  if (!hasHydrated || portalContainer === null) return toast;
  return (
    <>
      <span data-od-toast-inline-host="" ref={inlineHostRef} />
      {createPortal(toast, portalContainer)}
    </>
  );
}

export interface ToastMessage {
  readonly id: number;
  readonly message: string;
  readonly tone: ToastTone;
}

export interface ToastQueue {
  /** The one visible message, or `null`. */
  readonly toast: ToastMessage | null;
  readonly showToast: (message: string, tone?: ToastTone) => void;
  /** Close the visible message. A message that waits shows next. */
  readonly dismissToast: () => void;
  /**
   * Give these to the `Toast`: a pointer or the focus on the toast stops the
   * time, and an error has a close button.
   */
  readonly toastProps: Pick<
    ToastProps,
    "onBlur" | "onDismiss" | "onFocus" | "onPointerEnter" | "onPointerLeave"
  >;
}

interface ToastState {
  readonly shown: ToastMessage | null;
  /** A message that waits for the end of an error. */
  readonly waiting: ToastMessage | null;
}

const noToast: ToastState = { shown: null, waiting: null };

/**
 * Hold one message: a message for `duration` milliseconds, an error for
 * `errorDuration`. A new message replaces a message, and a new error
 * replaces the message or the error. A message that comes during an error
 * waits until the error ends or the user closes it. A pointer or the focus
 * on the toast stops the time. Render it as
 * `<Toast key={toast.id} tone={toast.tone} {...toastProps}>`.
 */
export function useToastQueue(
  duration = 4000,
  errorDuration = duration * 2,
): ToastQueue {
  const [state, setState] = useState<ToastState>(noToast);
  const [paused, setPaused] = useState(false);
  const nextId = useRef(1);
  // The time that the shown message has left, in milliseconds.
  const timing = useRef({ id: 0, left: 0 });
  const { shown } = state;

  const dismissToast = useCallback(() => {
    setPaused(false);
    setState(({ waiting }) => ({ shown: waiting, waiting: null }));
  }, []);

  const showToast = useCallback(
    (message: string, tone: ToastTone = "success") => {
      const toast = { id: nextId.current++, message, tone };
      setPaused(false);
      setState(({ shown: current, waiting }) =>
        tone !== "error" && current?.tone === "error"
          ? { shown: current, waiting: toast }
          : { shown: toast, waiting: tone === "error" ? waiting : null },
      );
    },
    [],
  );

  useEffect(() => {
    if (shown === null || paused) return undefined;
    if (timing.current.id !== shown.id) {
      timing.current = {
        id: shown.id,
        left: shown.tone === "error" ? errorDuration : duration,
      };
    }
    const start = Date.now();
    const timer = setTimeout(dismissToast, timing.current.left);
    return () => {
      clearTimeout(timer);
      timing.current.left -= Date.now() - start;
    };
  }, [dismissToast, duration, errorDuration, paused, shown]);

  const toastProps: ToastQueue["toastProps"] = {
    onBlur: (event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
    },
    onFocus: () => {
      setPaused(true);
    },
    onPointerEnter: () => {
      setPaused(true);
    },
    onPointerLeave: () => {
      setPaused(false);
    },
    ...(shown?.tone === "error" ? { onDismiss: dismissToast } : {}),
  };
  return { toast: shown, showToast, dismissToast, toastProps };
}
