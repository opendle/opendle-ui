import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
const monthDayFormatter = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
});
const monthLabelFormatter = new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
});
const weekdayFormatter = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    timeZone: "UTC",
});
function parseDate(date) {
    return new Date(`${date}T12:00:00Z`);
}
function eventDuration(item) {
    const [startHour = 0, startMinute = 0] = item.start.split(":").map(Number);
    const [endHour = 0, endMinute = 0] = item.end.split(":").map(Number);
    return endHour * 60 + endMinute - (startHour * 60 + startMinute);
}
function eventStyle(item) {
    const [hour = 0, minute = 0] = item.start.split(":").map(Number);
    const [endHour = 0, endMinute = 0] = item.end.split(":").map(Number);
    return {
        "--calendar-event-top": `${String(Math.max(0, hour * 60 + minute - 8 * 60))}px`,
        "--calendar-event-height": `${String(Math.max(38, endHour * 60 + endMinute - (hour * 60 + minute)))}px`,
    };
}
function monthDays(year, monthIndex) {
    const monthStart = new Date(Date.UTC(year, monthIndex, 1, 12));
    const mondayOffset = (monthStart.getUTCDay() + 6) % 7;
    const gridStart = new Date(monthStart);
    gridStart.setUTCDate(monthStart.getUTCDate() - mondayOffset);
    return Array.from({ length: 42 }, (_, index) => {
        const date = new Date(gridStart);
        date.setUTCDate(gridStart.getUTCDate() + index);
        return {
            date: date.toISOString().slice(0, 10),
            day: date.getUTCDate(),
            inMonth: date.getUTCMonth() === monthIndex,
        };
    });
}
function ChannelMark({ channel, renderChannel, }) {
    return (renderChannel?.(channel) ?? (_jsx("span", { className: "calendar-event-channel", "data-calendar-network": channel.toLowerCase(), title: `${channel} channel`, "aria-hidden": "true", children: channel.slice(0, 1).toUpperCase() })));
}
function EventButton({ item, compact, selected, dragging, onSelect, onDragStart, onDragEnd, renderChannel, }) {
    const singleLine = !compact && eventDuration(item) <= 45;
    const itemLabel = `${item.channel ? `${item.channel}, ` : ""}${item.title}, ${item.start} to ${item.end}, ${item.state}`;
    const classes = [
        "calendar-event",
        `calendar-event-${item.kind}`,
        `calendar-event-${item.state}`,
        compact ? "calendar-event-month-chip" : "",
        singleLine ? "calendar-event-short" : "",
    ]
        .filter(Boolean)
        .join(" ");
    return (_jsxs("button", { className: classes, "data-calendar-channel": item.channel?.toLowerCase(), "data-calendar-layout": compact ? "month-chip" : singleLine ? "single-line" : "timed", "data-selected": selected, "data-dragging": dragging, draggable: item.editable, style: compact ? undefined : eventStyle(item), title: `${item.start} · ${item.title}`, type: "button", "aria-label": itemLabel, onClick: () => {
            onSelect(item);
        }, onDragStart: (event) => {
            onDragStart(event, item);
        }, onDragEnd: onDragEnd, children: [compact ? (_jsxs("span", { className: "calendar-event-compact-line", children: [item.channel ? (_jsx(ChannelMark, { channel: item.channel, renderChannel: renderChannel })) : null, _jsx("strong", { children: item.title })] })) : singleLine ? (_jsxs("span", { className: "calendar-event-single-line", children: [_jsx("span", { className: "calendar-event-time", children: item.start }), item.channel ? (_jsx(ChannelMark, { channel: item.channel, renderChannel: renderChannel })) : null, _jsx("strong", { children: item.title })] })) : (_jsxs(_Fragment, { children: [_jsx("span", { className: "calendar-event-time", children: item.start }), _jsx("strong", { children: item.title }), _jsx("span", { className: "calendar-event-meta", children: item.kind === "agent-stage" ? ("Agent stage") : item.channel ? (_jsx(ChannelMark, { channel: item.channel, renderChannel: renderChannel })) : (item.kind.replace("-", " ")) })] })), item.editable ? (_jsx("span", { className: "calendar-event-grip", "aria-hidden": "true", children: "\u22EE" })) : (_jsx("span", { className: "calendar-event-check", "aria-hidden": "true", children: "\u2713" }))] }));
}
export function CalendarBoard({ mode, items, weekDates, weekHours, today, selectedId, draggedId, dropDate, onSelect, onDragStart, onDragEnd, onAllowDrop, onClearDrop, onMove, currentTimeLabel, renderChannel, }) {
    if (mode === "timeline") {
        const sortedItems = items
            .slice()
            .sort((a, b) => `${a.date}T${a.start}`.localeCompare(`${b.date}T${b.start}`));
        return (_jsx("div", { className: "calendar-timeline", "aria-label": "Canonical activity timeline", children: sortedItems.map((item) => (_jsxs("button", { type: "button", "data-selected": selectedId === item.id, onClick: () => {
                    onSelect(item);
                }, children: [_jsxs("time", { dateTime: `${item.date}T${item.start}:00Z`, children: [item.date, _jsxs("span", { children: [item.start, " UTC"] })] }), _jsx("i", { "aria-hidden": "true" }), _jsxs("span", { children: [_jsxs("small", { children: [item.kind.replace("-", " "), " \u00B7 ", item.state] }), _jsx("strong", { children: item.title }), _jsx("p", { children: item.detail })] }), item.channel ? (_jsx(ChannelMark, { channel: item.channel, renderChannel: renderChannel })) : null] }, item.id))) }));
    }
    if (mode === "month") {
        const monthDate = parseDate(today);
        const monthYear = monthDate.getUTCFullYear();
        const monthIndex = monthDate.getUTCMonth();
        const days = monthDays(monthYear, monthIndex);
        const monthLabel = monthLabelFormatter.format(monthDate);
        return (_jsxs("div", { className: "calendar-month", "data-calendar-week-count": "6", "aria-label": `${monthLabel} month view`, children: [["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (_jsx("div", { className: "calendar-month-weekday", children: day }, day))), days.map((day, index) => {
                    const dayItems = items
                        .filter((item) => item.date === day.date)
                        .sort((a, b) => a.start.localeCompare(b.start));
                    const past = day.date < today;
                    return (_jsxs("div", { className: "calendar-month-day", "data-calendar-week": Math.floor(index / 7) + 1, "data-drop-active": dropDate === day.date, "data-calendar-event-count": dayItems.length, "data-in-month": day.inMonth, "data-past": past, "data-today": day.date === today, "aria-label": `${monthDayFormatter.format(parseDate(day.date))}, ${String(dayItems.length)} ${dayItems.length === 1 ? "event" : "events"}`, onDragEnter: (event) => {
                            onAllowDrop(event, day.date);
                        }, onDragOver: (event) => {
                            onAllowDrop(event, day.date);
                        }, onDragLeave: onClearDrop, onDrop: (event) => {
                            onMove(event, day.date);
                        }, children: [_jsxs("div", { className: "calendar-month-date", children: [_jsx("span", { children: day.day }), day.date === today ? _jsx("small", { children: "Today" }) : null, past && dayItems.length ? (_jsx("span", { "aria-label": "Read-only", children: "\uD83D\uDD12" })) : null] }), _jsx("div", { className: "calendar-month-events", children: dayItems.map((item) => (_jsx(EventButton, { compact: true, item: item, selected: selectedId === item.id, dragging: draggedId === item.id, onSelect: onSelect, onDragStart: onDragStart, onDragEnd: onDragEnd, renderChannel: renderChannel }, item.id))) })] }, day.date));
                })] }));
    }
    return (_jsx("div", { className: "calendar-week-scroll", children: _jsxs("div", { className: "calendar-week", "aria-label": "Calendar week", children: [_jsx("div", { className: "calendar-week-corner" }), weekDates.map((date) => (_jsxs("div", { className: "calendar-day-heading", "data-today": date === today, children: [_jsx("span", { children: weekdayFormatter.format(parseDate(date)) }), _jsx("strong", { children: parseDate(date).getUTCDate() }), date === today ? _jsx("small", { children: "Today" }) : null] }, date))), _jsx("div", { className: "calendar-time-axis", "aria-hidden": "true", children: weekHours.map((hour) => (_jsx("span", { children: hour }, hour))) }), weekDates.map((date) => {
                    const dayItems = items
                        .filter((item) => item.date === date)
                        .sort((a, b) => a.start.localeCompare(b.start));
                    const past = date < today;
                    return (_jsxs("div", { className: "calendar-day-column", "data-drop-active": dropDate === date, "data-past": past, "data-today": date === today, onDragEnter: (event) => {
                            onAllowDrop(event, date);
                        }, onDragOver: (event) => {
                            onAllowDrop(event, date);
                        }, onDragLeave: onClearDrop, onDrop: (event) => {
                            onMove(event, date);
                        }, children: [_jsx("div", { className: "calendar-hour-lines", "aria-hidden": "true", children: weekHours.map((hour) => (_jsx("i", {}, hour))) }), date === today ? (_jsx("div", { className: "calendar-now-line", "aria-label": `Current time${currentTimeLabel ? `, ${currentTimeLabel}` : ""}`, children: _jsx("span", { children: currentTimeLabel ?? "Now" }) })) : null, dayItems.map((item) => (_jsx(EventButton, { item: item, selected: selectedId === item.id, dragging: draggedId === item.id, onSelect: onSelect, onDragStart: onDragStart, onDragEnd: onDragEnd, renderChannel: renderChannel }, item.id))), past ? (_jsx("span", { className: "calendar-past-label", children: "\uD83D\uDD12 Read-only" })) : null] }, date));
                })] }) }));
}
//# sourceMappingURL=CalendarBoard.js.map