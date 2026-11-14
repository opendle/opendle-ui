import type { ReactNode } from "react";
import type { CalendarMode } from "./calendarDates.js";
import { type CalendarHeaderLabels } from "./calendarLabels.js";
export interface CalendarHeaderProps {
    readonly title: ReactNode;
    readonly mode: CalendarMode;
    readonly onModeChange: (mode: CalendarMode) => void;
    /** Without these, the header has no period navigation. */
    readonly onPrevious?: () => void;
    readonly onNext?: () => void;
    readonly onToday: () => void;
    readonly labels?: CalendarHeaderLabels;
    readonly className?: string;
}
/** The page heading of a calendar: period, navigation and the view switch. */
export declare function CalendarHeader({ className, labels, mode, onModeChange, onNext, onPrevious, onToday, title, }: CalendarHeaderProps): import("react").JSX.Element;
//# sourceMappingURL=CalendarHeader.d.ts.map