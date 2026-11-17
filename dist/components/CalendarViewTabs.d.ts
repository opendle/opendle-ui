import type { CalendarMode } from "./calendarDates.js";
import { type CalendarHeaderLabels } from "./calendarLabels.js";
export interface CalendarViewTabsProps {
    /** The prefix of the tab and panel IDs. Give the same value to `TabPanel`. */
    readonly idBase: string;
    readonly value: CalendarMode;
    readonly onChange: (mode: CalendarMode) => void;
    readonly labels?: CalendarHeaderLabels;
    readonly className?: string;
}
/** The month, week and timeline tabs of a calendar, for a `FilterToolbar`. */
export declare function CalendarViewTabs({ className, idBase, labels, onChange, value, }: CalendarViewTabsProps): import("react").JSX.Element;
//# sourceMappingURL=CalendarViewTabs.d.ts.map