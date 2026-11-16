import { useState, type DragEvent } from "react";

import { calendarDropTime } from "./calendarDropTime.js";
import type { CalendarItem } from "./calendarItems.js";

export interface CalendarEntryDrag {
  readonly onStart: (event: DragEvent<HTMLButtonElement>) => void;
  readonly onEnd: () => void;
}

interface CalendarDragOptions {
  readonly items: readonly CalendarItem[];
  readonly canMove: ((item: CalendarItem) => boolean) | undefined;
  readonly onMove: ((item: CalendarItem, start: string) => void) | undefined;
  readonly now: Date | undefined;
  readonly timeZone?: string | undefined;
}

/** Native drag state is local to one board. The host owns persistence. */
export function useCalendarDrag({
  canMove,
  items,
  now,
  onMove,
  timeZone,
}: CalendarDragOptions) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const present = () => now ?? new Date();
  const movable = (item: CalendarItem) =>
    onMove !== undefined &&
    canMove?.(item) === true &&
    Date.parse(item.start) > present().getTime();
  const dragged = items.find((item) => item.id === draggedId);
  const end = () => {
    setDraggedId(null);
    setActive(null);
  };
  return {
    dragging: dragged !== undefined,
    entry(item: CalendarItem): CalendarEntryDrag | undefined {
      if (!movable(item)) return undefined;
      return {
        onStart(event) {
          if (!movable(item)) {
            event.preventDefault();
            return;
          }
          event.dataTransfer.effectAllowed = "move";
          event.dataTransfer.setData("application/x-opendle-calendar", item.id);
          event.dataTransfer.setData("text/plain", item.title);
          setDraggedId(item.id);
        },
        onEnd: end,
      };
    },
    target(day: string, time: Intl.DateTimeFormat, slot?: number) {
      const key = `${day}:${String(slot ?? "day")}`;
      const start =
        dragged === undefined
          ? null
          : calendarDropTime(dragged.start, day, slot, present(), timeZone);
      const valid = start !== null && dragged !== undefined && movable(dragged);
      return {
        "data-drop-target": dragged === undefined ? undefined : valid,
        "data-drop-active": valid && active === key ? true : undefined,
        "data-drop-label": valid ? time.format(new Date(start)) : undefined,
        onDragOver(event: DragEvent<HTMLElement>) {
          if (!valid) return;
          event.preventDefault();
          event.dataTransfer.dropEffect = "move";
          setActive(key);
        },
        onDragLeave(event: DragEvent<HTMLElement>) {
          if (
            event.relatedTarget instanceof Node &&
            event.currentTarget.contains(event.relatedTarget)
          )
            return;
          setActive((current) => (current === key ? null : current));
        },
        onDrop(event: DragEvent<HTMLElement>) {
          event.preventDefault();
          const dropped = dragged;
          const value =
            dropped === undefined
              ? null
              : calendarDropTime(dropped.start, day, slot, present(), timeZone);
          end();
          if (dropped === undefined || value === null || !movable(dropped))
            return;
          if (
            event.dataTransfer.getData("application/x-opendle-calendar") !==
            dropped.id
          )
            return;
          if (Date.parse(value) !== Date.parse(dropped.start))
            onMove?.(dropped, value);
        },
      };
    },
  };
}

export type CalendarDrag = ReturnType<typeof useCalendarDrag>;
