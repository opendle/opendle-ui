import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  AccountMenu,
  CalendarBoard,
  ChannelList,
  MetricGrid,
  MetricTile,
  balancedColumns,
  timeZoneOptions,
  TagInput,
  CalendarHeader,
  CalendarViewTabs,
  FilterToolbar,
  PostDetailDialog,
  SegmentedControl,
  TagFilterBar,
  calendarGridDays,
  calendarItemState,
  calendarPeriod,
  calendarTitle,
  emptyTagFilter,
  shiftCalendarAnchor,
} from "../dist/index.js";

const render = (type, props, ...children) =>
  renderToStaticMarkup(React.createElement(type, props, ...children));

const local = (day, time) => new Date(`${day}T${time}:00`).toISOString();
const target = (id, network, state) => ({ id, network, state });
const items = [
  {
    id: "g1",
    start: local("2026-11-12", "18:30"),
    title: "Take Me With You",
    preview: { src: "/p.jpg", video: true },
    color: "#b8683c",
    targets: [
      target("p1", "instagram", "published"),
      target("p2", "pinterest", "failed"),
    ],
  },
  {
    id: "g2",
    start: local("2026-11-16", "15:00"),
    title: "Low Tide",
    targets: [target("p3", "youtube", "scheduled")],
  },
];

test("a month shows complete weeks from Monday to Sunday", () => {
  const november = calendarGridDays("month", "2026-11-14");
  assert.equal(november[0], "2026-10-26");
  assert.equal(november.at(-1), "2026-12-06");
  assert.equal(november.length, 42);
  assert.equal(calendarGridDays("month", "2021-02-10").length, 28);
  assert.deepEqual(calendarGridDays("week", "2026-11-14"), [
    "2026-11-09",
    "2026-11-10",
    "2026-11-11",
    "2026-11-12",
    "2026-11-13",
    "2026-11-14",
    "2026-11-15",
  ]);
});

test("the period, the title and the anchor follow the view", () => {
  const period = calendarPeriod("week", "2026-11-14");
  assert.equal(period.from.getDate(), 9);
  assert.equal(period.from.getHours(), 0);
  assert.equal(period.to.getDate(), 16);
  assert.equal(period.to.getHours(), 0);
  assert.equal(calendarTitle("month", "2026-11-14", "en-GB"), "November 2026");
  assert.match(calendarTitle("week", "2026-11-14", "en-GB"), /9.*15 Nov 2026/);
  assert.equal(shiftCalendarAnchor("month", "2026-01-31", 1), "2026-02-01");
  assert.equal(shiftCalendarAnchor("month", "2026-01-15", -1), "2025-12-01");
  assert.equal(shiftCalendarAnchor("week", "2026-11-14", 1), "2026-11-21");
});

test("an entry takes the most urgent state of its networks", () => {
  assert.equal(calendarItemState(items[0]), "failed");
  assert.equal(calendarItemState(items[1]), "scheduled");
  assert.equal(
    calendarItemState({
      ...items[1],
      targets: [target("a", "x", "published"), target("b", "x", "cancelled")],
    }),
    "published",
  );
});

test("the month view groups one entry with a badge for each network", () => {
  const markup = render(CalendarBoard, {
    mode: "month",
    anchor: "2026-11-14",
    today: "2026-11-14",
    items,
    locale: "en-GB",
    onSelect: () => undefined,
  });
  assert.match(markup, /<section aria-label="Calendar"[^>]*data-mode="month"/);
  assert.equal(markup.match(/class="od-calendar-day"/g).length, 42);
  assert.equal(markup.match(/class="od-calendar-item"/g).length, 2);
  assert.match(
    markup,
    /aria-label="18:30, Take Me With You, Failed" class="od-calendar-item" data-layout="card" data-state="failed"/,
  );
  assert.match(markup, /data-state="failed"[^>]*data-network="pinterest"/);
  // The marks are in the first line with the time. A post with media has a
  // preview, and a post without media has none.
  assert.match(
    markup,
    /<time[^>]*>18:30<\/time><span class="od-calendar-item-networks">/,
  );
  assert.equal(markup.match(/class="od-calendar-item-preview"/g).length, 1);
  assert.match(
    markup,
    /data-video="true"><img alt="" loading="lazy" src="\/p.jpg"/,
  );
  assert.doesNotMatch(markup, /Reel/);
  assert.match(markup, /aria-current="date"[^>]*dateTime="2026-11-14"/i);
  assert.match(markup, /data-outside="true"[^>]*data-today="false"/);
});

test("an entry shows its comments and like with their most urgent state", () => {
  const markup = render(CalendarBoard, {
    mode: "month",
    anchor: "2026-11-14",
    today: "2026-11-14",
    items: [
      {
        ...items[1],
        followUps: [
          { id: "c1", kind: "comment", state: "published" },
          { id: "c2", kind: "comment", state: "failed" },
          { id: "c3", kind: "comment", state: "cancelled" },
          { id: "l1", kind: "like", state: "scheduled" },
        ],
      },
    ],
    locale: "en-GB",
    onSelect: () => undefined,
  });
  assert.match(
    markup,
    /aria-label="15:00, Low Tide, Scheduled, Comments: Failed, Like: Scheduled"/,
  );
  // A cancelled comment does not count.
  assert.match(
    markup,
    /class="od-calendar-item-follow-up" data-state="failed" title="Comments: Failed"><svg[^]*?<\/svg>2<\/span>/,
  );
  assert.match(
    markup,
    /class="od-calendar-item-follow-up" data-state="scheduled" title="Like: Scheduled"><svg[^]*?<\/svg><\/span>/,
  );
});

test("the week view shows seven days", () => {
  const markup = render(CalendarBoard, {
    mode: "week",
    anchor: "2026-11-14",
    today: "2026-11-14",
    items,
    onSelect: () => undefined,
  });
  assert.equal(markup.match(/class="od-calendar-day"/g).length, 7);
  // One time in the table with the time axis, one time in the phone list.
  assert.equal(markup.match(/class="od-calendar-item"/g).length, 2);
  assert.equal(markup.match(/class="od-calendar-week-hour"/g).length, 24);
  assert.equal(markup.match(/<tr data-half=/g).length, 48);
  assert.match(markup, /<time>09:00<\/time>/);
  // With the present at 13:20, the past ends in the row of 13:00 of today.
  const timed = render(CalendarBoard, {
    mode: "week",
    anchor: "2026-11-14",
    today: "2026-11-14",
    now: new Date(2026, 10, 14, 13, 20),
    items,
    onSelect: () => undefined,
  });
  assert.equal(timed.match(/data-now="true"/g).length, 1);
  assert.match(timed, /--od-calendar-now:66\.7%/);
  assert.equal(timed.match(/<td data-past="true"/g).length, 5 * 48 + 26);
});

test("the timeline shows the days with entries and marks the present", () => {
  const markup = render(CalendarBoard, {
    mode: "timeline",
    anchor: "2026-11-14",
    today: "2026-11-14",
    items,
    hasEarlier: true,
    locale: "en-GB",
    onSelect: () => undefined,
  });
  assert.equal(markup.match(/class="od-calendar-timeline-day"/g).length, 3);
  assert.match(markup, /<span class="od-calendar-timeline-now">Today<\/span>/);
  assert.equal(markup.match(/od-calendar-timeline-month/g).length, 1);
  assert.match(markup, />Earlier<\/button>/);
  assert.doesNotMatch(markup, />Later<\/button>/);
});

test("an empty calendar has its empty text and no entry", () => {
  const markup = render(CalendarBoard, {
    mode: "month",
    anchor: "2026-11-14",
    today: "2026-11-14",
    items: [],
    onSelect: () => undefined,
  });
  assert.match(markup, /<p class="od-calendar-empty">No posts<\/p>/);
  assert.doesNotMatch(markup, /od-calendar-item"/);
});

test("CalendarHeader has the period navigation only with its handlers", () => {
  const props = {
    title: "November 2026",
    onToday: () => undefined,
  };
  const timeline = render(CalendarHeader, props);
  assert.match(timeline, /<h1>November 2026<\/h1>/);
  assert.doesNotMatch(timeline, /aria-label="Previous"/);
  const month = render(CalendarHeader, {
    ...props,
    onPrevious: () => undefined,
    onNext: () => undefined,
  });
  assert.match(month, /aria-label="Previous"/);
  assert.match(month, /aria-label="Next"/);
  assert.doesNotMatch(month, /Month|role="tablist"/);
});

test("CalendarViewTabs selects the view of the calendar", () => {
  const markup = render(CalendarViewTabs, {
    idBase: "calendar",
    value: "week",
    onChange: () => undefined,
  });
  assert.match(
    markup,
    /^<div aria-label="View" class="od-tabs" role="tablist">/,
  );
  assert.match(
    markup,
    /aria-controls="calendar-panel-week" aria-selected="true"[^>]*>Week</,
  );
  assert.deepEqual(
    [...markup.matchAll(/role="tab"[^>]*>(\w+)</g)].map((match) => match[1]),
    ["Month", "Week", "Timeline"],
  );
});

test("FilterToolbar puts the tabs first and the search last", () => {
  const search = React.createElement("input", { type: "search" });
  const full = render(
    FilterToolbar,
    { start: React.createElement("span", null, "tabs"), end: search },
    React.createElement("span", null, "filters"),
  );
  assert.equal(
    full,
    '<div class="od-filter-toolbar" data-tabs="true"><div class="od-filter-toolbar-row"><div class="od-filter-toolbar-tabs"><span>tabs</span></div><div class="od-filter-toolbar-controls"><div class="od-filter-toolbar-filters"><span>filters</span></div><div class="od-filter-toolbar-search"><input type="search"/></div></div></div></div>',
  );
  const plain = render(FilterToolbar, {
    className: "page-filters",
    end: search,
  });
  assert.match(
    plain,
    /class="od-filter-toolbar page-filters" data-tabs="false"/,
  );
  assert.doesNotMatch(plain, /od-filter-toolbar-tabs/);
});

test("SegmentedControl marks the selected choice", () => {
  const markup = render(SegmentedControl, {
    label: "Tag logic",
    value: "any",
    onChange: () => undefined,
    options: [
      { value: "all", label: "AND" },
      { value: "any", label: "OR" },
    ],
  });
  assert.match(markup, /^<fieldset aria-label="Tag logic"/);
  assert.match(markup, /<button aria-pressed="false" type="button">AND</);
  assert.match(markup, /<button aria-pressed="true" type="button">OR</);
});

test("TagFilterBar has one group of tags and shows only groups with entries", () => {
  const props = { value: emptyTagFilter, onChange: () => undefined };
  assert.equal(render(TagFilterBar, { ...props, channels: [], tags: [] }), "");
  const channelsOnly = render(TagFilterBar, {
    ...props,
    channels: [{ id: "c1", network: "youtube", label: "YouTube" }],
    tags: [],
  });
  assert.match(channelsOnly, /aria-label="YouTube" aria-pressed="false"/);
  assert.doesNotMatch(channelsOnly, /Tag logic/);
  const full = render(TagFilterBar, {
    ...props,
    value: { ...emptyTagFilter, channels: ["c1"], tags: ["reel"] },
    channels: [{ id: "c1", network: "youtube", label: "YouTube" }],
    tags: ["short", "reel"],
    tagColors: { reel: 4 },
  });
  assert.match(full, /data-filtered="true"/);
  assert.match(full, /aria-label="Tags"/);
  // The groups have an accessible name and no visible label.
  assert.match(full, /aria-label="Channels"/);
  assert.doesNotMatch(full, />Channels<|>Tags</);
  assert.doesNotMatch(full, /Channel tags|Post tags/);
  assert.match(
    full,
    /aria-pressed="true" class="od-tag" data-color="4"[^>]*>#reel</,
  );
  assert.match(full, /aria-pressed="false" class="od-tag"[^>]*>#short</);
  assert.match(full, /aria-label="Tag logic"/);
});

test("The tag filter starts with no selection and the OR logic", () => {
  assert.deepEqual(emptyTagFilter, { channels: [], tags: [], match: "any" });
});

const detailTarget = (id, network, state, extra = {}) => ({
  id,
  network,
  name: network,
  state,
  text: "The night we wrote the chorus.\n\n#music",
  when: "Thursday 12 November, 18:30",
  ...extra,
});

test("PostDetailDialog links each published network and shows a failure", () => {
  const markup = render(PostDetailDialog, {
    open: true,
    onClose: () => undefined,
    onRetry: async () => undefined,
    errorMessage: () => "Failed",
    title: "Take Me With You",
    tags: ["reel"],
    media: { type: "video", src: "/v.mp4", duration: "0:38" },
    targets: [
      detailTarget("p1", "instagram", "published", { url: "https://i/1" }),
      detailTarget("p2", "pinterest", "failed", { error: "Board not found" }),
      detailTarget("p3", "youtube", "scheduled"),
    ],
  });
  assert.match(markup, /Thursday 12 November, 18:30/);
  assert.equal(markup.match(/<p>/g).length, 2);
  assert.match(
    markup,
    /href="https:\/\/i\/1" rel="noreferrer" target="_blank"/,
  );
  assert.match(markup, /Board not found/);
  assert.match(markup, />Retry<\/button>/);
  assert.match(markup, /1 published/);
  assert.match(markup, /1 failed/);
  assert.match(markup, /aria-label="Play"/);
  assert.match(markup, />#reel</);
  assert.doesNotMatch(markup, /role="tablist"/);
});

test("PostDetailDialog has one tab for each version of the text", () => {
  const markup = render(PostDetailDialog, {
    open: true,
    onClose: () => undefined,
    errorMessage: () => "Failed",
    title: "Take Me With You",
    targets: [
      detailTarget("p1", "instagram", "published"),
      detailTarget("p2", "x", "published", { text: "Short text" }),
      detailTarget("p3", "threads", "published"),
      detailTarget("p4", "bluesky", "published", {
        when: "Friday 13 November, 09:00",
      }),
    ],
  });
  // A different time is not a different version: the row shows the time.
  assert.equal(markup.match(/role="tab"/g).length, 2);
  assert.match(markup, /published · Friday 13 November, 09:00/);
  assert.equal(markup.match(/class="od-post-detail-target"/g).length, 4);
});

test("PostDetailDialog has a tab for each network when the text differs", () => {
  const markup = render(PostDetailDialog, {
    open: true,
    onClose: () => undefined,
    errorMessage: () => "Failed",
    title: "Take Me With You",
    targets: [
      detailTarget("p1", "instagram", "failed"),
      detailTarget("p2", "x", "published", { text: "Short text" }),
    ],
  });
  assert.match(markup, /role="tablist"/);
  assert.equal(markup.match(/role="tab"/g).length, 2);
  assert.doesNotMatch(markup, />Retry<\/button>/);
});

test("AccountMenu is a closed menu button until a press", () => {
  const markup = render(AccountMenu, {
    avatar: "V",
    name: "Vincent",
    sections: [
      {
        id: "a",
        items: [{ id: "s", label: "Settings", onSelect: () => undefined }],
      },
    ],
  });
  assert.match(markup, /aria-expanded="false" aria-haspopup="menu"/);
  assert.doesNotMatch(markup, /role="menu"/);
});

test("TagInput shows each tag with a remove button, or as text only", () => {
  const props = {
    value: ["short"],
    onChange: () => undefined,
    label: "Tags",
    removeLabel: "Remove tag",
  };
  const editable = render(TagInput, props);
  assert.match(editable, /aria-label="Remove tag: short"/);
  assert.match(editable, /<input aria-label="Tags"/);
  const fixed = render(TagInput, { ...props, disabled: true });
  assert.doesNotMatch(fixed, /<button|<input/);
});

test("ChannelList warns about an ended authorization and hides writes", () => {
  const props = {
    items: [
      {
        id: "c1",
        network: "youtube",
        name: "tubededentifrice",
        handle: "@tube",
        tags: ["long"],
        needsReconnect: true,
        switches: [{ id: "publish", label: "Publish", on: true }],
      },
    ],
    networks: [
      { network: "youtube", label: "YouTube", href: "/oauth/youtube/start" },
      { network: "bluesky", label: "Bluesky" },
    ],
    onRename: async () => undefined,
    onTagsChange: async () => undefined,
    onSwitchChange: async () => undefined,
    onDisconnect: async () => undefined,
    onPasswordConnect: async () => undefined,
    errorMessage: () => "Failed",
  };
  const markup = render(ChannelList, props);
  assert.match(markup, /Authorization ended/);
  assert.match(markup, /href="\/oauth\/youtube\/start"[^>]*>Reconnect</);
  assert.match(markup, /aria-label="Rename: tubededentifrice"/);
  assert.match(markup, /aria-label="More actions: tubededentifrice"/);
  assert.match(markup, /aria-pressed="true"[^>]*>Publish</);
  const readOnly = render(ChannelList, { ...props, readOnly: true });
  assert.doesNotMatch(readOnly, /Rename:|More actions:|Reconnect<|>Connect</);
  assert.match(readOnly, /Authorization ended/);
});

test("MetricTile draws a line of the days, without gaps or overshoot", () => {
  const markup = render(MetricTile, {
    label: "Views",
    value: "1,204",
    change: "+12%",
    trend: "up",
    points: [10, null, 30, 30, 20],
  });
  assert.match(markup, /<dd aria-hidden="true" class="od-metric-spark">/);
  const line = markup.match(/class="od-metric-spark-line" d="([^"]+)"/)[1];
  // The day without a value is left out: three curves join four points.
  assert.equal(line.match(/C/g).length, 3);
  // No point of the path is above the highest value or below the lowest.
  const numbers = line.match(/-?\d+(\.\d+)?/g).map(Number);
  const ys = numbers.filter((_, index) => index % 2 === 1);
  assert.ok(Math.min(...ys) >= 3 - 1e-9 && Math.max(...ys) <= 29 + 1e-9);
  assert.doesNotMatch(
    render(MetricTile, { label: "Views", value: "1", points: [null, 4] }),
    /od-metric-spark/,
  );
});

test("MetricTile shows the change only when it has one", () => {
  const plain = render(MetricTile, { label: "Views", value: "1,204" });
  assert.match(plain, /<dt class="od-metric-label">Views<\/dt>/);
  assert.doesNotMatch(plain, /od-metric-change/);
  assert.match(
    render(MetricTile, {
      label: "Views",
      value: "1",
      change: "+12%",
      trend: "up",
    }),
    /<span class="od-metric-change" data-trend="up">\+12%<\/span>/,
  );
});

test("post dates can change for eligible channels in a mixed group", () => {
  const markup = render(PostDetailDialog, {
    open: true,
    onClose: () => undefined,
    errorMessage: () => "Failed",
    title: "Post",
    onReschedule: () => undefined,
    targets: [
      detailTarget("held", "youtube", "scheduled", {
        canReschedule: false,
        scheduleDisabledReason: "Held by network",
      }),
      detailTarget("pending", "facebook", "scheduled", { canReschedule: true }),
    ],
    media: { type: "video", src: "/video.mp4" },
    metrics: [{ label: "Views", value: "12" }],
  });
  assert.match(markup, /class="od-post-detail-date"(?! disabled)/);
  // Only the channel that can change its time has a button.
  assert.equal(markup.match(/od-post-detail-target-schedule/g).length, 1);
  assert.match(markup, /aria-label="Change date and time · facebook"/);
  assert.match(markup, /preload="metadata" src="\/video.mp4"/);
  assert.match(markup, /od-post-detail-metrics/);
});

test("draft media review uses the selected target carousel and alternative text", () => {
  const markup = render(PostDetailDialog, {
    open: true,
    title: "Draft",
    onClose: () => undefined,
    errorMessage: () => null,
    media: { type: "image", src: "/fallback.jpg" },
    targets: [
      {
        id: "draft",
        network: "instagram",
        name: "Band",
        state: "draft",
        text: "Caption",
        when: "Draft",
        media: [
          { type: "image", src: "/one.jpg", alt: "First cover" },
          { type: "image", src: "/two.jpg", alt: "Second cover" },
        ],
      },
    ],
  });
  assert.match(markup, /alt="First cover"/);
  assert.match(markup, /src="\/one.jpg"/);
  assert.doesNotMatch(markup, /fallback.jpg/);
  assert.match(markup, /aria-label="Previous image"[^>]*disabled/);
  assert.match(markup, /aria-label="Next image"/);
  assert.match(markup, /1 \/ 2/);
  assert.match(markup, /1 draft/);
  assert.equal(
    calendarItemState({ ...items[0], targets: [target("a", "x", "draft")] }),
    "draft",
  );
});

test("MetricTile draws bars of the days for a value of each day", () => {
  const markup = render(MetricTile, {
    label: "Views",
    value: "128",
    chart: "bars",
    points: [null, null, 127, 1],
  });
  assert.equal(markup.match(/class="od-metric-spark-bar"/g).length, 2);
  assert.equal(markup.match(/class="od-metric-spark-empty"/g).length, 2);
});

test("MetricGrid keeps the rows of tiles even", () => {
  assert.equal(balancedColumns(5, 2), 2);
  assert.equal(balancedColumns(5, 3), 3);
  assert.equal(balancedColumns(5, 6), 5);
  assert.equal(balancedColumns(8, 6), 4);
  assert.equal(balancedColumns(7, 3), 3);
  const markup = render(
    MetricGrid,
    {},
    React.createElement(MetricTile, { label: "A", value: "1", key: "a" }),
    React.createElement(MetricTile, { label: "B", value: "2", key: "b" }),
    React.createElement(MetricTile, { label: "C", value: "3", key: "c" }),
  );
  assert.match(markup, /--od-metric-columns-medium:3/);
  assert.match(markup, /--od-metric-columns-narrow:2/);
});

test("timeZoneOptions lists UTC first with the offset of each zone", () => {
  const options = timeZoneOptions([], new Date("2026-07-01T00:00:00Z"));
  assert.equal(options[0].value, "UTC");
  const paris = options.find((option) => option.value === "Europe/Paris");
  assert.equal(paris.description, "UTC+02:00");
  assert.match(paris.searchText, /Europe\/Paris/);
});
