import {
  useCallback,
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
}

/**
 * Hold one message for `duration` milliseconds. A new message replaces the
 * old one, so only one toast shows at a time. Render it as
 * `<Toast key={toast.id}>`.
 */
export function useToastQueue(duration = 4000): ToastQueue {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const nextId = useRef(1);
  const showToast = useCallback(
    (message: string, tone: ToastTone = "success") => {
      const id = nextId.current++;
      setToast({ id, message, tone });
      setTimeout(() => {
        setToast((current) => (current?.id === id ? null : current));
      }, duration);
    },
    [duration],
  );
  return { toast, showToast };
}
