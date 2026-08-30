import { useLayoutEffect, useState } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { createPortal } from "react-dom";

export interface ToastProps extends HTMLAttributes<HTMLOutputElement> {
  readonly children: ReactNode;
  readonly onDismiss?: () => void;
}

function findActiveModalDialog(): HTMLDialogElement | null {
  if (typeof document === "undefined") return null;
  try {
    const focusedDialog = document.activeElement?.closest("dialog:modal");
    if (focusedDialog instanceof HTMLDialogElement) return focusedDialog;
    const modalDialogs =
      document.querySelectorAll<HTMLDialogElement>("dialog:modal");
    return modalDialogs.item(modalDialogs.length - 1);
  } catch {
    return null;
  }
}

function useActiveModalDialog() {
  const [activeModalDialog, setActiveModalDialog] =
    useState<HTMLDialogElement | null>(null);

  useLayoutEffect(() => {
    const updateActiveModalDialog = () => {
      setActiveModalDialog(findActiveModalDialog());
    };
    updateActiveModalDialog();
    document.addEventListener("focusin", updateActiveModalDialog);
    const observer = new MutationObserver(updateActiveModalDialog);
    observer.observe(document.documentElement, {
      attributeFilter: ["open"],
      attributes: true,
      childList: true,
      subtree: true,
    });
    return () => {
      document.removeEventListener("focusin", updateActiveModalDialog);
      observer.disconnect();
    };
  }, []);

  return activeModalDialog;
}

export function Toast({
  children,
  className,
  onDismiss,
  ...props
}: ToastProps) {
  const activeModalDialog = useActiveModalDialog();
  const toast = (
    <output
      {...props}
      className={["od-toast", className].filter(Boolean).join(" ")}
    >
      <span>{children}</span>
      {onDismiss ? (
        <button type="button" aria-label="Dismiss message" onClick={onDismiss}>
          ×
        </button>
      ) : null}
    </output>
  );
  return activeModalDialog === null
    ? toast
    : createPortal(toast, activeModalDialog);
}
