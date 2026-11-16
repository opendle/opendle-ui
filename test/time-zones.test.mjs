import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  CalendarBoard,
  calendarDayKey,
  calendarPeriod,
  dateTimeInputInstant,
  dateTimeInputValue,
  timeZoneParts,
} from "../dist/index.js";
import { calendarDropTime } from "../dist/components/calendarDropTime.js";

test("input formatting uses the selected zone, including fractional offsets", () => {
  assert.equal(
    dateTimeInputValue("2026-11-01T01:15:00Z", "America/Los_Angeles"),
    "2026-10-31T18:15",
  );
  assert.equal(
    dateTimeInputValue("2026-11-01T01:15:00Z", "Asia/Kathmandu"),
    "2026-11-01T07:00",
  );
  assert.equal(
    dateTimeInputInstant("2026-11-01T07:00", "Asia/Kathmandu"),
    "2026-11-01T01:15:00.000Z",
  );
  assert.equal(
    dateTimeInputInstant("2026-11-01T07:00:04.123", "Asia/Kathmandu"),
    "2026-11-01T01:15:04.123Z",
  );
  assert.equal(
    calendarDayKey(new Date("2026-11-01T01:15:00Z"), "America/Los_Angeles"),
    "2026-10-31",
  );
  assert.equal(
    timeZoneParts(new Date("2026-11-01T01:15:00Z"), "Asia/Kathmandu").hour,
    7,
  );
});

test("invalid dates and malformed control values have no instant", () => {
  for (const value of [
    "",
    "bad",
    "2026-02-30T10:00",
    "2026-13-01T10:00",
    "2026-11-01T24:00",
    "2026-11-01T10:60",
    "2026-11-01T10:00:60",
    "2026-11-01T10:00Z",
  ]) {
    assert.equal(dateTimeInputInstant(value, "UTC"), null, value);
  }
  assert.equal(dateTimeInputValue("bad", "UTC"), "");
});

test("clock gaps and folds require an explicit choice", () => {
  assert.equal(
    dateTimeInputInstant("2026-03-08T02:30", "America/New_York"),
    null,
  );
  assert.equal(
    dateTimeInputInstant("2026-11-01T01:30", "America/New_York"),
    null,
  );
  assert.equal(
    dateTimeInputInstant("2026-11-01T01:30", "America/New_York", "earlier"),
    "2026-11-01T05:30:00.000Z",
  );
  assert.equal(
    dateTimeInputInstant("2026-11-01T01:30", "America/New_York", "later"),
    "2026-11-01T06:30:00.000Z",
  );
  assert.equal(
    dateTimeInputInstant("2026-03-08T02:30", "America/New_York", "earlier"),
    "2026-03-08T06:30:00.000Z",
  );
  assert.equal(
    dateTimeInputInstant("2026-03-08T02:30", "America/New_York", "later"),
    "2026-03-08T07:30:00.000Z",
  );
});

test("calendar request boundaries include the full named-zone week across DST", () => {
  const spring = calendarPeriod("week", "2026-03-08", "America/New_York");
  assert.equal(spring.from.toISOString(), "2026-03-02T05:00:00.000Z");
  assert.equal(spring.to.toISOString(), "2026-03-09T04:00:00.000Z");
  assert.equal((spring.to - spring.from) / 3_600_000, 167);
  const fall = calendarPeriod("week", "2026-11-01", "America/New_York");
  assert.equal(fall.from.toISOString(), "2026-10-26T04:00:00.000Z");
  assert.equal(fall.to.toISOString(), "2026-11-02T05:00:00.000Z");
  assert.equal((fall.to - fall.from) / 3_600_000, 169);
});

test("named-zone drops preserve local time across a clock change", () => {
  const now = new Date("2026-03-01T00:00:00Z");
  assert.equal(
    calendarDropTime(
      "2026-03-07T14:25:07.123Z",
      "2026-03-09",
      undefined,
      now,
      "America/New_York",
    ),
    "2026-03-09T13:25:07.123Z",
  );
  assert.equal(
    calendarDropTime(
      "2026-03-07T14:25:00Z",
      "2026-03-08",
      5,
      now,
      "America/New_York",
    ),
    null,
  );
  assert.equal(
    calendarDropTime(
      "2026-03-07T14:25:00Z",
      "2026-11-01",
      3,
      now,
      "America/New_York",
    ),
    null,
  );
});

test("calendar entries use the selected day and hour rather than the browser zone", () => {
  const html = renderToStaticMarkup(
    React.createElement(CalendarBoard, {
      mode: "month",
      anchor: "2026-11-01",
      today: "2026-11-01",
      timeZone: "America/Los_Angeles",
      items: [
        {
          id: "zone-post",
          title: "Zone publication",
          start: "2026-11-01T01:15:00Z",
          targets: [],
        },
      ],
      onSelect() {},
    }),
  );
  const day = html.split('dateTime="2026-10-31"')[1]?.split("</li>")[0];
  assert.match(day ?? "", /Zone publication/);
  assert.match(day ?? "", /18:15/);
});
