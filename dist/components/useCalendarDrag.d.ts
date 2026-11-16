import { type DragEvent } from "react";
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
export declare function useCalendarDrag({ canMove, items, now, onMove, timeZone, }: CalendarDragOptions): {
    dragging: boolean;
    entry(item: CalendarItem): CalendarEntryDrag | undefined;
    target(day: string, time: Intl.DateTimeFormat, slot?: number): {
        "data-drop-target": boolean | undefined;
        "data-drop-active": boolean | undefined;
        "data-drop-label": string | undefined;
        onDragOver(event: DragEvent<HTMLElement>): void;
        onDragLeave(event: DragEvent<HTMLElement>): void;
        onDrop(event: DragEvent<HTMLElement>): void;
    };
};
export type CalendarDrag = ReturnType<typeof useCalendarDrag>;
export {};
//# sourceMappingURL=useCalendarDrag.d.ts.map