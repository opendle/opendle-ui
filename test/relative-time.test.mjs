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
const minute = 60_000;
const hour = 60 * minute;
const day = 24 * hour;
const at = (offset, unitStyle = "narrow") =>
  formatRelativeTime(now + offset, { locale: "en", now, unitStyle });

test("one unit shows from 3, two units below 3", () => {
  assert.equal(at(20_000), "now");
  assert.equal(at(-30_000), "now");
  assert.equal(at(13 * minute), "in 13m");
  assert.equal(at(-47 * minute), "47m ago");
  assert.equal(at(59.7 * minute), "in 1h");
  assert.equal(at(2 * hour + 15 * minute), "in 2h 15m");
  assert.equal(at(-(2 * hour + 59 * minute + 40_000)), "3h ago");
  assert.equal(at(3 * hour + 20 * minute), "in 3h");
  assert.equal(at(-23.7 * hour), "1d ago");
  assert.equal(at(36 * hour), "in 1d 12h");
  assert.equal(at(-(2 * day + 5 * hour)), "2d 5h ago");
  assert.equal(at(3 * day + 5 * hour), "in 3d");
  assert.equal(at(6.7 * day), "in 1w");
  assert.equal(at(-16 * day), "2w 2d ago");
  assert.equal(at(30 * day), "in 4w");
  assert.equal(at(45 * day), "in 1mo 2w");
  assert.equal(at(200 * day), "in 7mo");
  assert.equal(at(-400 * day), "1y 1mo ago");
  assert.equal(at(900 * day), "in 2y 6mo");
});

test("the unit style sets the unit length", () => {
  assert.equal(at(36 * hour, "long"), "in 1 day 12 hours");
  assert.equal(at(-(2 * hour + 15 * minute), "long"), "2 hours 15 minutes ago");
  assert.equal(at(36 * hour, "short"), "in 1 day 12 hr.");
  assert.equal(at(-5 * day, "long"), "5 days ago");
});

test("two units keep the word order of the locale", () => {
  const of = (locale, offset) =>
    formatRelativeTime(now + offset, { locale, now, unitStyle: "narrow" });
  assert.equal(of("de", -36 * hour), "vor 1 Tag 12 Std.");
  assert.equal(of("ja", -36 * hour), "1日 12時間前");
  assert.equal(of("ko", 36 * hour), "1일 12시간 후");
});

test("an invalid date throws", () => {
  assert.throws(() => formatRelativeTime("not a date", { now }), RangeError);
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
    }),
  );
  assert.match(relative, /aria-label="Thu 2 Jan, 08:00, Low Tide/);
  assert.match(relative, /<button [^>]*title="Thu 2 Jan, 08:00"/);
  assert.doesNotMatch(absolute, /<button [^>]*title=/);
  assert.match(relative, /title="Thu 2 Jan, 08:00">\d+ years ago<\/time>/);
  const narrow = renderToStaticMarkup(
    React.createElement(CalendarEntry, {
      ...props,
      relative: true,
      unitStyle: "narrow",
    }),
  );
  assert.match(narrow, /title="Thu 2 Jan, 08:00">\d+y ago<\/time>/);
});
