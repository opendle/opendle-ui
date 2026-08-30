import {
  useSyncExternalStore,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";

import { Button } from "./Button.js";
import { Dialog } from "./Dialog.js";
import { Panel, PanelHeader } from "./Panel.js";

const phoneLayoutQuery = "(max-width: 48rem)";

export type DockedPanelPosition = "inner" | "outer";

export interface DockedPanelDefinition {
  readonly children: ReactNode;
  readonly closeLabel?: string;
  readonly fallbackFocusRef?: RefObject<HTMLElement | null>;
  readonly onClose: () => void;
  readonly open: boolean;
  readonly openerRef?: RefObject<HTMLElement | null>;
  readonly title: string;
  readonly width?: CSSProperties["width"];
}

export interface DockedPanelLayoutProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> {
  readonly activeSheet?: DockedPanelPosition | null;
  readonly children: ReactNode;
  readonly innerPanel?: DockedPanelDefinition;
  readonly outerPanel?: DockedPanelDefinition;
}

function subscribeToPhoneLayout(onChange: () => void) {
  if (typeof window === "undefined" || !("matchMedia" in window))
    return () => undefined;
  const query = window.matchMedia(phoneLayoutQuery);
  query.addEventListener("change", onChange);
  return () => {
    query.removeEventListener("change", onChange);
  };
}

function readPhoneLayout() {
  return (
    typeof window !== "undefined" &&
    "matchMedia" in window &&
    window.matchMedia(phoneLayoutQuery).matches
  );
}

function readServerPhoneLayout() {
  return false;
}

function canReceiveFocus(
  target: HTMLElement | null | undefined,
): target is HTMLElement {
  return Boolean(
    target?.isConnected &&
    !target.matches(":disabled") &&
    target.closest("[inert]") === null,
  );
}

function resolveReturnFocus(panel: DockedPanelDefinition): HTMLElement | null {
  const opener = panel.openerRef?.current;
  if (canReceiveFocus(opener)) return opener;
  const fallback = panel.fallbackFocusRef?.current;
  return canReceiveFocus(fallback) ? fallback : null;
}

function restorePanelFocus(panel: DockedPanelDefinition) {
  const apply = () => {
    const target = resolveReturnFocus(panel);
    if (target === null) return;
    const active = document.activeElement;
    const activeDialog =
      active instanceof HTMLElement
        ? active.closest<HTMLDialogElement>("dialog[open]")
        : null;
    if (activeDialog !== null && !activeDialog.contains(target)) return;
    target.focus({ preventScroll: true });
  };
  if (typeof requestAnimationFrame === "function")
    requestAnimationFrame(() => requestAnimationFrame(apply));
  else apply();
}

function panelStyle(width: CSSProperties["width"] | undefined) {
  return width === undefined ? undefined : { width };
}

interface DockedPanelSurfaceProps {
  readonly panel: DockedPanelDefinition;
  readonly position: DockedPanelPosition;
  readonly requestClose: (panel: DockedPanelDefinition) => void;
}

function DockedPanelSurface({
  panel,
  position,
  requestClose,
}: DockedPanelSurfaceProps) {
  const closeLabel = panel.closeLabel ?? `Close ${panel.title}`;
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.defaultPrevented || event.key !== "Escape") return;
    event.preventDefault();
    event.stopPropagation();
    requestClose(panel);
  };
  return (
    <Panel
      aria-label={panel.title}
      className="od-docked-panel"
      data-position={position}
      onKeyDown={handleKeyDown}
      role="complementary"
      style={panelStyle(panel.width)}
    >
      <PanelHeader
        actions={
          <Button
            aria-label={closeLabel}
            className="od-docked-panel-close"
            onClick={() => {
              requestClose(panel);
            }}
            type="button"
            variant="quiet"
          >
            <span aria-hidden="true">×</span>
          </Button>
        }
        title={panel.title}
      />
      <div className="od-docked-panel-content">{panel.children}</div>
    </Panel>
  );
}

function selectPhonePanel(
  activeSheet: DockedPanelPosition | null | undefined,
  innerPanel: DockedPanelDefinition | undefined,
  outerPanel: DockedPanelDefinition | undefined,
) {
  if (activeSheet === null) return null;
  if (activeSheet === "inner" && innerPanel?.open)
    return { panel: innerPanel, position: "inner" } as const;
  if (activeSheet === "outer" && outerPanel?.open)
    return { panel: outerPanel, position: "outer" } as const;
  if (outerPanel?.open)
    return { panel: outerPanel, position: "outer" } as const;
  if (innerPanel?.open)
    return { panel: innerPanel, position: "inner" } as const;
  return null;
}

/**
 * A full-height workspace with two ordered end docks and one phone sheet.
 * The host owns panel state and selects the active phone sheet.
 */
export function DockedPanelLayout({
  activeSheet,
  children,
  className,
  innerPanel,
  outerPanel,
  ...props
}: DockedPanelLayoutProps) {
  const phoneLayout = useSyncExternalStore(
    subscribeToPhoneLayout,
    readPhoneLayout,
    readServerPhoneLayout,
  );
  const requestClose = (panel: DockedPanelDefinition) => {
    panel.onClose();
    restorePanelFocus(panel);
  };
  const phoneSelection = phoneLayout
    ? selectPhonePanel(activeSheet, innerPanel, outerPanel)
    : null;
  const phonePanel = phoneSelection?.panel;

  return (
    <div
      {...props}
      className={["od-docked-panel-layout", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="od-docked-panel-layout-workspace">{children}</div>
      {!phoneLayout && innerPanel?.open ? (
        <DockedPanelSurface
          panel={innerPanel}
          position="inner"
          requestClose={requestClose}
        />
      ) : null}
      {!phoneLayout && outerPanel?.open ? (
        <DockedPanelSurface
          panel={outerPanel}
          position="outer"
          requestClose={requestClose}
        />
      ) : null}
      {phoneLayout && phonePanel ? (
        <Dialog
          bodyClassName="od-docked-panel-sheet-content"
          className="od-docked-panel-sheet"
          closeLabel={phonePanel.closeLabel ?? `Close ${phonePanel.title}`}
          key={phoneSelection.position}
          onClose={() => {
            requestClose(phonePanel);
          }}
          open
          title={phonePanel.title}
        >
          {phonePanel.children}
        </Dialog>
      ) : null}
    </div>
  );
}
