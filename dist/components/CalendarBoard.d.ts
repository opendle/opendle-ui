import type { DragEvent, ReactNode } from "react";
export type CalendarMode = "week" | "month" | "timeline";
export type CalendarEventState = "planned" | "completed";
export interface CalendarEvent {
    readonly id: string;
    readonly title: string;
    readonly detail: string;
    readonly date: string;
    readonly start: string;
    readonly end: string;
    readonly kind: string;
    readonly state: CalendarEventState;
    readonly channel?: string;
    readonly editable: boolean;
}
export interface CalendarBoardProps {
    readonly mode: CalendarMode;
    readonly items: readonly CalendarEvent[];
    readonly weekDates: readonly string[];
    readonly weekHours: readonly string[];
    readonly today: string;
    readonly selectedId: string | null;
    readonly draggedId: string | null;
    readonly dropDate: string | null;
    readonly onSelect: (item: CalendarEvent) => void;
    readonly onDragStart: (event: DragEvent<HTMLElement>, item: CalendarEvent) => void;
    readonly onDragEnd: () => void;
    readonly onAllowDrop: (event: DragEvent<HTMLElement>, date: string) => void;
    readonly onClearDrop: (event: DragEvent<HTMLElement>) => void;
    readonly onMove: (event: DragEvent<HTMLElement>, date: string) => void;
    readonly currentTimeLabel?: string;
    readonly renderChannel?: (channel: string) => ReactNode;
}
export declare function CalendarBoard({ mode, items, weekDates, weekHours, today, selectedId, draggedId, dropDate, onSelect, onDragStart, onDragEnd, onAllowDrop, onClearDrop, onMove, currentTimeLabel, renderChannel, }: CalendarBoardProps): import("react").JSX.Element;
//# sourceMappingURL=CalendarBoard.d.ts.map