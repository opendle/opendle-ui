import { useLayoutEffect, type RefObject } from "react";

const gutter = 8;
const maximumHeight = 288;

/**
 * Show a list of options in the browser top layer next to its field. The list
 * opens below the field, or above it when the space below is too small. A
 * dialog or a container that hides its overflow does not cut it. With
 * `matchWidth`, the list has the width of the field; otherwise its style sheet
 * gives the width. The list must have `popover="manual"`.
 */
export function useAnchoredListbox(
  open: boolean,
  expectedHeight: number,
  anchorRef: RefObject<HTMLElement | null>,
  listboxRef: RefObject<HTMLElement | null>,
  matchWidth = true,
): void {
  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    const listbox = listboxRef.current;
    if (!open || !anchor || !listbox) return;
    const view = anchor.ownerDocument.defaultView;
    if (!view) return;
    const position = () => {
      const bounds = anchor.getBoundingClientRect();
      const viewport = view.visualViewport;
      const viewportTop = viewport?.offsetTop ?? 0;
      const viewportLeft = viewport?.offsetLeft ?? 0;
      const viewportHeight = viewport?.height ?? view.innerHeight;
      const viewportWidth = viewport?.width ?? view.innerWidth;
      const below = viewportTop + viewportHeight - bounds.bottom - gutter;
      const above = bounds.top - viewportTop - gutter;
      const expected = Math.min(
        maximumHeight,
        viewportHeight / 2,
        expectedHeight,
      );
      const opensAbove = below < expected && above > below;
      const maxHeight = Math.max(
        0,
        Math.min(maximumHeight, viewportHeight / 2, opensAbove ? above : below),
      );
      const shown = listbox.matches(":popover-open");
      let width = Math.min(bounds.width, viewportWidth - gutter * 2);
      if (matchWidth) listbox.style.width = `${String(width)}px`;
      else if (shown) width = listbox.getBoundingClientRect().width;
      listbox.style.left = `${String(Math.max(viewportLeft + gutter, Math.min(bounds.left, viewportLeft + viewportWidth - width - gutter)))}px`;
      listbox.style.maxHeight = `${String(maxHeight)}px`;
      const actualHeight = shown
        ? listbox.getBoundingClientRect().height
        : expected;
      listbox.style.top = `${String(opensAbove ? bounds.top - Math.min(actualHeight, maxHeight) - 4 : bounds.bottom + 4)}px`;
      listbox.dataset.side = opensAbove ? "above" : "below";
    };
    position();
    listbox.showPopover();
    position();
    anchor.ownerDocument.addEventListener("scroll", position, {
      capture: true,
      passive: true,
    });
    view.addEventListener("resize", position);
    view.visualViewport?.addEventListener("resize", position);
    view.visualViewport?.addEventListener("scroll", position, {
      passive: true,
    });
    const observer = new ResizeObserver(position);
    observer.observe(anchor);
    return () => {
      observer.disconnect();
      anchor.ownerDocument.removeEventListener("scroll", position, true);
      view.removeEventListener("resize", position);
      view.visualViewport?.removeEventListener("resize", position);
      view.visualViewport?.removeEventListener("scroll", position);
      if (listbox.matches(":popover-open")) listbox.hidePopover();
    };
  }, [open, expectedHeight, anchorRef, listboxRef, matchWidth]);
}
