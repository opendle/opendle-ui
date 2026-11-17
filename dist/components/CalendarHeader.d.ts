import type { ReactNode } from "react";
import { type CalendarHeaderLabels } from "./calendarLabels.js";
export interface CalendarHeaderProps {
    readonly title: ReactNode;
    /** Without these, the header has no period navigation. */
    readonly onPrevious?: () => void;
    readonly onNext?: () => void;
    readonly onToday: () => void;
    /** Page actions at the end of the row, for example a create button. */
    readonly actions?: ReactNode;
    readonly labels?: CalendarHeaderLabels;
    readonly className?: string;
}
/**
 * The page heading of a calendar: the period and its navigation. Put the
 * view switch, `CalendarViewTabs`, in a `FilterToolbar` below it.
 */
export declare function CalendarHeader({ actions, className, labels, onNext, onPrevious, onToday, title, }: CalendarHeaderProps): import("react").JSX.Element;
//# sourceMappingURL=CalendarHeader.d.ts.map