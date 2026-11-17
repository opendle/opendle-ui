import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from "./Button.js";
import { calendarHeaderLabels, } from "./calendarLabels.js";
import { classes } from "./classes.js";
import { Icon } from "./Icon.js";
import { IconButton } from "./IconButton.js";
/**
 * The page heading of a calendar: the period and its navigation. Put the
 * view switch, `CalendarViewTabs`, in a `FilterToolbar` below it.
 */
export function CalendarHeader({ actions, className, labels = calendarHeaderLabels, onNext, onPrevious, onToday, title, }) {
    return (_jsxs("header", { className: classes("od-calendar-header", className), children: [_jsx("h1", { children: title }), _jsxs("div", { className: "od-calendar-header-navigation", children: [onPrevious === undefined ? null : (_jsx(IconButton, { icon: _jsx(Icon, { name: "chevron-left" }), label: labels.previous, onClick: onPrevious })), _jsx(Button, { onClick: onToday, variant: "secondary", children: labels.today }), onNext === undefined ? null : (_jsx(IconButton, { icon: _jsx(Icon, { name: "chevron-right" }), label: labels.next, onClick: onNext }))] }), actions ? (_jsx("div", { className: "od-heading-actions od-calendar-header-actions", children: actions })) : null] }));
}
//# sourceMappingURL=CalendarHeader.js.map