import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from "./Button.js";
import { calendarHeaderLabels, } from "./calendarLabels.js";
import { classes } from "./classes.js";
import { Icon } from "./Icon.js";
import { IconButton } from "./IconButton.js";
import { SegmentedControl } from "./SegmentedControl.js";
const modes = ["month", "week", "timeline"];
/** The page heading of a calendar: period, navigation and the view switch. */
export function CalendarHeader({ className, labels = calendarHeaderLabels, mode, onModeChange, onNext, onPrevious, onToday, title, }) {
    return (_jsxs("header", { className: classes("od-calendar-header", className), children: [_jsx("h1", { children: title }), _jsxs("div", { className: "od-calendar-header-navigation", children: [onPrevious === undefined ? null : (_jsx(IconButton, { icon: _jsx(Icon, { name: "chevron-left" }), label: labels.previous, onClick: onPrevious })), _jsx(Button, { onClick: onToday, variant: "secondary", children: labels.today }), onNext === undefined ? null : (_jsx(IconButton, { icon: _jsx(Icon, { name: "chevron-right" }), label: labels.next, onClick: onNext }))] }), _jsx(SegmentedControl, { className: "od-calendar-header-views", label: labels.view, onChange: onModeChange, options: modes.map((value) => ({ value, label: labels.modes[value] })), value: mode })] }));
}
//# sourceMappingURL=CalendarHeader.js.map