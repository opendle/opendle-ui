import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useLayoutEffect, useMemo, useRef } from "react";
import { calendarDayDate, calendarDayKey, calendarGridDays, } from "./calendarDates.js";
import { CalendarEntry } from "./CalendarEntry.js";
import { CalendarWeek } from "./CalendarWeek.js";
import { Icon } from "./Icon.js";
import { calendarBoardLabels, } from "./calendarItems.js";
import { classes } from "./classes.js";
import { useCalendarDrag } from "./useCalendarDrag.js";
function groupByDay(items, timeZone) {
    const groups = new Map();
    const sorted = items.toSorted((first, second) => Date.parse(first.start) - Date.parse(second.start));
    for (const item of sorted) {
        const day = calendarDayKey(new Date(item.start), timeZone);
        const group = groups.get(day);
        if (group === undefined)
            groups.set(day, [item]);
        else
            group.push(item);
    }
    return groups;
}
function Grid({ anchor, drag, formats, groups, labels, mode, onCreate, onSelect, today, }) {
    const days = calendarGridDays(mode, anchor);
    const anchorMonth = anchor.slice(0, 7);
    const hasItems = days.some((day) => groups.has(day));
    return (_jsxs(_Fragment, { children: [_jsx("div", { "aria-hidden": "true", className: "od-calendar-weekdays", children: days.slice(0, 7).map((day) => (_jsx("span", { children: formats.weekday.format(calendarDayDate(day)) }, day))) }), _jsx("ol", { className: "od-calendar-grid", children: days.map((day) => {
                    const date = calendarDayDate(day);
                    const items = groups.get(day) ?? [];
                    return (_jsxs("li", { className: "od-calendar-day", "data-empty": items.length === 0, "data-outside": mode === "month" && day.slice(0, 7) !== anchorMonth, "data-past": day < today, "data-today": day === today, ...drag.target(day, formats.time), children: [_jsxs("time", { "aria-current": day === today ? "date" : undefined, "aria-label": formats.fullDay.format(date), className: "od-calendar-day-head", dateTime: day, children: [_jsx("span", { className: "od-calendar-day-weekday", children: formats.weekday.format(date) }), _jsx("span", { className: "od-calendar-day-number", children: date.getDate() })] }), onCreate === undefined || day < today ? null : (_jsx("button", { "aria-label": `${labels.create ?? "New post"}: ${formats.fullDay.format(date)}`, className: "od-calendar-create", onClick: () => {
                                    onCreate(day);
                                }, title: labels.create ?? "New post", type: "button", children: _jsx(Icon, { name: "plus", size: 14 }) })), items.map((item) => (_jsx(CalendarEntry, { item: item, drag: drag.entry(item), onSelect: onSelect, followUpLabels: labels.followUps, stateLabels: labels.states, time: formats.time.format(new Date(item.start)) }, item.id)))] }, day));
                }) }), hasItems ? null : _jsx("p", { className: "od-calendar-empty", children: labels.empty })] }));
}
function Timeline({ formats, groups, hasEarlier, hasLater, labels, onLoadEarlier, onLoadLater, onSelect, today, }) {
    const days = useMemo(() => {
        const keys = new Set(groups.keys());
        keys.add(today);
        return [...keys].toSorted().map((day, index, sorted) => ({
            day,
            items: groups.get(day) ?? [],
            startsMonth: sorted[index - 1]?.slice(0, 7) !== day.slice(0, 7),
        }));
    }, [groups, today]);
    const rootRef = useRef(null);
    const opened = useRef(false);
    const previous = useRef(null);
    const firstDay = days[0]?.day ?? today;
    // Open at the present. Then keep the reader in place when earlier days
    // appear above.
    useLayoutEffect(() => {
        const root = rootRef.current;
        if (root === null)
            return;
        const scroller = root.ownerDocument.documentElement;
        if (!opened.current) {
            opened.current = true;
            root
                .querySelector('[data-today="true"]')
                ?.scrollIntoView({ block: "start" });
        }
        else if (previous.current !== null && previous.current.first > firstDay) {
            root.ownerDocument.defaultView?.scrollBy(0, scroller.scrollHeight - previous.current.height);
        }
        previous.current = { first: firstDay, height: scroller.scrollHeight };
    }, [days, firstDay]);
    const observe = useCallback((load) => (button) => {
        if (button === null || load === undefined)
            return undefined;
        if (typeof IntersectionObserver === "undefined")
            return undefined;
        const observer = new IntersectionObserver((entries) => {
            if (entries.some((entry) => entry.isIntersecting))
                load();
        }, { rootMargin: "400px 0px" });
        observer.observe(button);
        return () => {
            observer.disconnect();
        };
    }, []);
    const earlierRef = useMemo(() => observe(onLoadEarlier), [observe, onLoadEarlier]);
    const laterRef = useMemo(() => observe(onLoadLater), [observe, onLoadLater]);
    return (_jsxs("div", { className: "od-calendar-timeline", ref: rootRef, children: [hasEarlier ? (_jsx("button", { className: "od-calendar-more", onClick: onLoadEarlier, ref: earlierRef, type: "button", children: labels.earlier })) : null, _jsx("ol", { className: "od-calendar-timeline-days", children: days.map(({ day, items, startsMonth }) => {
                    const date = calendarDayDate(day);
                    return (_jsxs("li", { className: "od-calendar-timeline-day", "data-empty": items.length === 0, "data-past": day < today, "data-today": day === today, children: [startsMonth ? (_jsx("h2", { className: "od-calendar-timeline-month", children: formats.month.format(date) })) : null, _jsxs("time", { "aria-current": day === today ? "date" : undefined, "aria-label": formats.fullDay.format(date), className: "od-calendar-day-head", dateTime: day, children: [_jsx("span", { className: "od-calendar-day-weekday", children: formats.weekday.format(date) }), _jsx("span", { className: "od-calendar-day-number", children: date.getDate() })] }), _jsx("div", { className: "od-calendar-timeline-items", children: items.length === 0 ? (_jsx("span", { className: "od-calendar-timeline-now", children: labels.today })) : (items.map((item) => (_jsx(CalendarEntry, { item: item, layout: "row", onSelect: onSelect, followUpLabels: labels.followUps, stateLabels: labels.states, time: formats.time.format(new Date(item.start)) }, item.id)))) })] }, day));
                }) }), hasLater ? (_jsx("button", { className: "od-calendar-more", onClick: onLoadLater, ref: laterRef, type: "button", children: labels.later })) : null] }));
}
/**
 * A calendar of entries that go to one or more networks. It has a month
 * view, a week view and a continuous timeline. The host owns the data.
 */
export function CalendarBoard({ anchor, canMove, className, hasEarlier = false, hasLater = false, items, labels = calendarBoardLabels, locale, mode, now, onLoadEarlier, onCreate, onLoadLater, onMove, onSelect, today, timeZone, }) {
    const formats = useMemo(() => ({
        time: new Intl.DateTimeFormat(locale, {
            timeZone,
            hour: "2-digit",
            minute: "2-digit",
            hourCycle: "h23",
        }),
        hour: new Intl.DateTimeFormat(locale, {
            hour: "2-digit",
            minute: "2-digit",
            hourCycle: "h23",
        }),
        weekday: new Intl.DateTimeFormat(locale, { weekday: "short" }),
        fullDay: new Intl.DateTimeFormat(locale, {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        }),
        month: new Intl.DateTimeFormat(locale, {
            month: "long",
            year: "numeric",
        }),
    }), [locale, timeZone]);
    const groups = useMemo(() => groupByDay(items, timeZone), [items, timeZone]);
    const drag = useCalendarDrag({ items, canMove, onMove, now, timeZone });
    return (_jsx("section", { "aria-label": labels.board, className: classes("od-calendar", className), "data-mode": mode, "data-dragging": drag.dragging || undefined, children: mode === "timeline" ? (_jsx(Timeline, { formats: formats, groups: groups, hasEarlier: hasEarlier, hasLater: hasLater, labels: labels, onLoadEarlier: onLoadEarlier, onLoadLater: onLoadLater, onSelect: onSelect, today: today })) : (_jsxs(_Fragment, { children: [mode === "week" ? (_jsx(CalendarWeek, { anchor: anchor, drag: drag, formats: formats, groups: groups, labels: labels, now: now, onCreate: onCreate, onSelect: onSelect, today: today, timeZone: timeZone })) : null, _jsx(Grid, { anchor: anchor, drag: drag, formats: formats, groups: groups, labels: labels, mode: mode, onCreate: onCreate, onSelect: onSelect, today: today })] })) }));
}
//# sourceMappingURL=CalendarBoard.js.map