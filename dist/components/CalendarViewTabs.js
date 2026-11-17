import { jsx as _jsx } from "react/jsx-runtime";
import { calendarHeaderLabels, } from "./calendarLabels.js";
import { Tabs } from "./Tabs.js";
const modes = ["month", "week", "timeline"];
/** The month, week and timeline tabs of a calendar, for a `FilterToolbar`. */
export function CalendarViewTabs({ className, idBase, labels = calendarHeaderLabels, onChange, value, }) {
    return (_jsx(Tabs, { idBase: idBase, items: modes.map((mode) => ({ id: mode, label: labels.modes[mode] })), label: labels.view, onChange: onChange, value: value, ...(className === undefined ? {} : { className }) }));
}
//# sourceMappingURL=CalendarViewTabs.js.map