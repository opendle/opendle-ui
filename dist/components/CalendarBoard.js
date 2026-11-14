import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useLayoutEffect, useMemo, useRef, } from "react";
import { calendarDayDate, calendarDayKey, calendarGridDays, } from "./calendarDates.js";
import { calendarBoardLabels, calendarItemState, } from "./calendarItems.js";
import { classes } from "./classes.js";
import { Icon, NetworkIcon } from "./Icon.js";
const stateIcons = {
    scheduled: "clock",
    publishing: "retry",
    published: "check",
    failed: "alert",
    cancelled: "close",
};
function groupByDay(items) {
    const groups = new Map();
    const sorted = items.toSorted((first, second) => Date.parse(first.start) - Date.parse(second.start));
    for (const item of sorted) {
        const day = calendarDayKey(new Date(item.start));
        const group = groups.get(day);
        if (group === undefined)
            groups.set(day, [item]);
        else
            group.push(item);
    }
    return groups;
}
function ItemButton({ formats, item, labels, onSelect }) {
    const state = calendarItemState(item);
    const time = formats.time.format(new Date(item.start));
    const style = item.color === undefined
        ? undefined
        : { "--od-calendar-item-color": item.color };
    return (_jsxs("button", { "aria-label": [time, item.kind, item.title, labels.states[state]]
            .filter(Boolean)
            .join(", "), className: "od-calendar-item", "data-state": state, onClick: () => {
            onSelect(item);
        }, style: style, type: "button", children: [_jsx("span", { className: "od-calendar-item-bar" }), _jsxs("span", { className: "od-calendar-item-top", children: [_jsx("time", { dateTime: item.start, children: time }), item.kind ? (_jsx("span", { className: "od-calendar-item-kind", children: item.kind })) : null, _jsx("span", { className: "od-calendar-item-state", title: labels.states[state], children: _jsx(Icon, { name: stateIcons[state], size: 13 }) })] }), _jsx("span", { className: "od-calendar-item-title", children: item.title }), _jsx("span", { className: "od-calendar-item-networks", children: item.targets.map((target) => (_jsx(NetworkIcon, { badge: true, className: "od-calendar-item-network", "data-state": target.state, network: target.network }, target.id))) })] }));
}
function Grid({ anchor, formats, groups, labels, mode, onSelect, today, }) {
    const days = calendarGridDays(mode, anchor);
    const anchorMonth = anchor.slice(0, 7);
    const hasItems = days.some((day) => groups.has(day));
    return (_jsxs(_Fragment, { children: [_jsx("div", { "aria-hidden": "true", className: "od-calendar-weekdays", children: days.slice(0, 7).map((day) => (_jsx("span", { children: formats.weekday.format(calendarDayDate(day)) }, day))) }), _jsx("ol", { className: "od-calendar-grid", children: days.map((day) => {
                    const date = calendarDayDate(day);
                    const items = groups.get(day) ?? [];
                    return (_jsxs("li", { className: "od-calendar-day", "data-empty": items.length === 0, "data-outside": mode === "month" && day.slice(0, 7) !== anchorMonth, "data-today": day === today, children: [_jsxs("time", { "aria-current": day === today ? "date" : undefined, "aria-label": formats.fullDay.format(date), className: "od-calendar-day-head", dateTime: day, children: [_jsx("span", { className: "od-calendar-day-weekday", children: formats.weekday.format(date) }), _jsx("span", { className: "od-calendar-day-number", children: date.getDate() })] }), items.map((item) => (_jsx(ItemButton, { formats: formats, item: item, labels: labels, onSelect: onSelect }, item.id)))] }, day));
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
                    return (_jsxs("li", { className: "od-calendar-timeline-day", "data-empty": items.length === 0, "data-past": day < today, "data-today": day === today, children: [startsMonth ? (_jsx("h2", { className: "od-calendar-timeline-month", children: formats.month.format(date) })) : null, _jsxs("time", { "aria-current": day === today ? "date" : undefined, "aria-label": formats.fullDay.format(date), className: "od-calendar-day-head", dateTime: day, children: [_jsx("span", { className: "od-calendar-day-weekday", children: formats.weekday.format(date) }), _jsx("span", { className: "od-calendar-day-number", children: date.getDate() })] }), _jsx("div", { className: "od-calendar-timeline-items", children: items.length === 0 ? (_jsx("span", { className: "od-calendar-timeline-now", children: labels.today })) : (items.map((item) => (_jsx(ItemButton, { formats: formats, item: item, labels: labels, onSelect: onSelect }, item.id)))) })] }, day));
                }) }), hasLater ? (_jsx("button", { className: "od-calendar-more", onClick: onLoadLater, ref: laterRef, type: "button", children: labels.later })) : null] }));
}
/**
 * A calendar of entries that go to one or more networks. It has a month
 * view, a week view and a continuous timeline. The host owns the data.
 */
export function CalendarBoard({ anchor, className, hasEarlier = false, hasLater = false, items, labels = calendarBoardLabels, locale, mode, onLoadEarlier, onLoadLater, onSelect, today, }) {
    const formats = useMemo(() => ({
        time: new Intl.DateTimeFormat(locale, {
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
    }), [locale]);
    const groups = useMemo(() => groupByDay(items), [items]);
    return (_jsx("section", { "aria-label": labels.board, className: classes("od-calendar", className), "data-mode": mode, children: mode === "timeline" ? (_jsx(Timeline, { formats: formats, groups: groups, hasEarlier: hasEarlier, hasLater: hasLater, labels: labels, onLoadEarlier: onLoadEarlier, onLoadLater: onLoadLater, onSelect: onSelect, today: today })) : (_jsx(Grid, { anchor: anchor, formats: formats, groups: groups, labels: labels, mode: mode, onSelect: onSelect, today: today })) }));
}
//# sourceMappingURL=CalendarBoard.js.map