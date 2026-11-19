import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  CalendarEntry,
  RelativeTime,
  formatRelativeTime,
} from "../dist/index.js";

const now = Date.parse("2026-11-19T10:00:00Z");
const options = { locale: "en", now, timeZone: "UTC" };
const at = (iso) => formatRelativeTime(iso, options);

test("the precision decreases with the distance", () => {
  assert.equal(at("2026-11-19T10:00:30Z"), "now");
  assert.equal(at("2026-11-19T09:59:20Z"), "now");
  assert.equal(at("2026-11-19T10:12:00Z"), "in 12 minutes");
  assert.equal(at("2026-11-19T09:01:00Z"), "59 minutes ago");
  assert.equal(at("2026-11-19T10:59:40Z"), "in 1 hour");
  assert.equal(at("2026-11-19T13:40:00Z"), "in 4 hours");
  assert.equal(at("2026-11-18T13:00:00Z"), "21 hours ago");
  assert.equal(at("2026-11-20T09:50:00Z"), "tomorrow");
  assert.equal(at("2026-11-17T23:00:00Z"), "2 days ago");
  assert.equal(at("2026-11-25T08:00:00Z"), "in 6 days");
  assert.equal(at("2026-11-26T08:00:00Z"), "in 1 week");
  assert.equal(at("2026-11-02T08:00:00Z"), "2 weeks ago");
  assert.equal(at("2027-01-20T08:00:00Z"), "in 2 months");
  assert.equal(at("2025-12-01T08:00:00Z"), "1 year ago");
  assert.equal(at("2024-10-01T08:00:00Z"), "2 years ago");
});

test("calendar days use the time zone", () => {
  // 2026-11-21 04:00 UTC is 2026-11-20 23:00 in New York.
  const instant = "2026-11-21T04:00:00Z";
  assert.equal(at(instant), "in 2 days");
  assert.equal(
    formatRelativeTime(instant, { ...options, timeZone: "America/New_York" }),
    "tomorrow",
  );
  // 2026-11-17 22:00 UTC is 2026-11-18 02:00 in Dubai.
  const past = "2026-11-17T22:00:00Z";
  assert.equal(at(past), "2 days ago");
  assert.equal(
    formatRelativeTime(past, { ...options, timeZone: "Asia/Dubai" }),
    "yesterday",
  );
});

test("short and narrow unit styles are available", () => {
  assert.equal(
    formatRelativeTime("2026-11-19T13:00:00Z", {
      ...options,
      unitStyle: "narrow",
    }),
    "in 3h",
  );
  assert.equal(
    formatRelativeTime("2026-11-05T09:00:00Z", {
      ...options,
      unitStyle: "narrow",
    }),
    "2w ago",
  );
  assert.equal(
    formatRelativeTime("2026-11-19T13:00:00Z", {
      ...options,
      unitStyle: "short",
    }),
    "in 3 hr.",
  );
});

test("RelativeTime gives the full date in the title", () => {
  const markup = renderToStaticMarkup(
    React.createElement(RelativeTime, {
      locale: "en",
      timeZone: "UTC",
      value: "2020-01-02T08:00:00Z",
    }),
  );
  assert.match(markup, /^<time /);
  assert.match(markup, /class="od-relative-time"/);
  assert.match(markup, /dateTime="2020-01-02T08:00:00.000Z"/);
  assert.match(markup, /title="Thursday, January 2, 2020 at 8:00 AM"/);
  assert.match(markup, />\d+ years ago<\/time>$/);
});

test("RelativeTime shows the fallback for an invalid value", () => {
  for (const value of [null, "", "not a date"]) {
    assert.equal(
      renderToStaticMarkup(React.createElement(RelativeTime, { value })),
      '<span class="od-relative-time od-relative-time-invalid">—</span>',
    );
  }
  assert.match(
    renderToStaticMarkup(
      React.createElement(RelativeTime, {
        timeZone: "Not/AZone",
        value: "2026-11-19T10:00:00Z",
      }),
    ),
    /od-relative-time-invalid/,
  );
});

test("CalendarEntry can show a relative time", () => {
  const item = {
    id: "g1",
    start: "2020-01-02T08:00:00Z",
    title: "Low Tide",
    targets: [{ id: "p1", network: "youtube", state: "published" }],
  };
  const props = { date: "Thu 2 Jan", item, onSelect: () => {}, time: "08:00" };
  const absolute = renderToStaticMarkup(
    React.createElement(CalendarEntry, props),
  );
  assert.match(
    absolute,
    /<time dateTime="2020-01-02T08:00:00Z">Thu 2 Jan, 08:00</,
  );
  const relative = renderToStaticMarkup(
    React.createElement(CalendarEntry, {
      ...props,
      relative: true,
      timeZone: "UTC",
    }),
  );
  assert.match(relative, /aria-label="Thu 2 Jan, 08:00, Low Tide/);
  assert.match(relative, /title="Thu 2 Jan, 08:00">\d+ years ago<\/time>/);
  const narrow = renderToStaticMarkup(
    React.createElement(CalendarEntry, {
      ...props,
      relative: true,
      timeZone: "UTC",
      unitStyle: "narrow",
    }),
  );
  assert.match(narrow, /title="Thu 2 Jan, 08:00">\d+y ago<\/time>/);
});
