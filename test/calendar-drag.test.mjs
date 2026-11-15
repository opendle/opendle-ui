import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CalendarBoard } from "../dist/index.js";
import { calendarDropTime } from "../dist/components/calendarDropTime.js";

const instant = (day, time) => new Date(`${day}T${time}`).toISOString();
const now = new Date(2026, 10, 15, 13, 18, 42);
const future = instant("2026-11-18", "09:25:07");

test("a month drop keeps the original local time on its destination day", () => {
  assert.equal(
    calendarDropTime(future, "2026-11-20", undefined, now),
    instant("2026-11-20", "09:25:07"),
  );
});

test("a month drop to an earlier time today publishes at the present time", () => {
  assert.equal(
    calendarDropTime(future, "2026-11-15", undefined, now),
    now.toISOString(),
  );
  assert.equal(
    calendarDropTime(
      instant("2026-11-18", "18:10:00"),
      "2026-11-15",
      undefined,
      now,
    ),
    instant("2026-11-15", "18:10:00"),
  );
  assert.equal(calendarDropTime(future, "2026-11-14", undefined, now), null);
});

test("a week drop takes the destination half hour and rejects earlier slots", () => {
  assert.equal(
    calendarDropTime(future, "2026-11-16", 31, now),
    instant("2026-11-16", "15:30:00"),
  );
  assert.equal(
    calendarDropTime(future, "2026-11-15", 26, now),
    now.toISOString(),
  );
  assert.equal(calendarDropTime(future, "2026-11-15", 25, now), null);
  assert.equal(calendarDropTime(future, "2026-11-14", 47, now), null);
  assert.equal(calendarDropTime(future, "2026-11-16", 48, now), null);
  assert.equal(calendarDropTime(future, "2026-11-16", -1, now), null);
});

test("only future entries approved by the host are draggable", () => {
  const entry = (id, start) => ({
    id,
    start,
    title: id,
    targets: [{ id, network: "youtube", state: "scheduled" }],
  });
  const props = {
    mode: "month",
    anchor: "2026-11-15",
    today: "2026-11-15",
    now,
    items: [
      entry("past", instant("2026-11-14", "09:00:00")),
      entry("future", future),
      entry("locked", future),
    ],
    onSelect() {},
    onMove() {},
    canMove: (item) => item.id !== "locked",
  };
  const render = (changes) =>
    renderToStaticMarkup(
      React.createElement(CalendarBoard, { ...props, ...changes }),
    );
  assert.equal(render({}).match(/draggable="true"/g)?.length, 1);
  assert.doesNotMatch(render({ onMove: undefined }), /draggable="true"/);
  assert.doesNotMatch(render({ canMove: undefined }), /draggable="true"/);
  assert.doesNotMatch(render({ mode: "timeline" }), /draggable="true"/);
});
