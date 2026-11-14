import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  Conversation,
  ChartLegend,
  InboxList,
  StackedBarChart,
  chartTicks,
  foldSeries,
  lastDays,
} from "../dist/index.js";

const render = (type, props) =>
  renderToStaticMarkup(React.createElement(type, props));

const message = (id, change = {}) => ({
  id,
  depth: 0,
  authorName: "Mara Keys",
  authorHandle: "@mara.keys",
  avatarUrl: null,
  text: "Hello",
  when: "3 h",
  createdAt: "2026-11-14T09:00:00Z",
  own: false,
  liked: false,
  likeCount: null,
  state: "new",
  canReply: true,
  canLike: true,
  ...change,
});

test("the selected message has the reply box with the mention", () => {
  const markup = render(Conversation, {
    messages: [message("a"), message("b", { authorName: "Jonas" })],
    selectedId: "a",
    mention: (item) => item.authorHandle,
    limit: 2200,
    suggestions: ["Thank you!"],
    onReply: async () => undefined,
  });
  assert.equal(markup.match(/<textarea/g).length, 1);
  assert.match(
    markup,
    /aria-label="Reply to Mara Keys"[^>]*>@mara\.keys <\/textarea>/,
  );
  assert.match(markup, /11 \/ 2,200/);
  assert.match(markup, />Thank you!<\/button>/);
});

test("a message shows only the actions that the host and the network permit", () => {
  const own = render(Conversation, {
    messages: [message("a", { own: true })],
    onReply: async () => undefined,
    onLike: () => undefined,
    onIgnore: () => undefined,
  });
  assert.doesNotMatch(own, /od-message-action/);
  const readOnly = render(Conversation, {
    messages: [message("a", { likeCount: 4 })],
  });
  assert.doesNotMatch(readOnly, /<button/);
  assert.match(readOnly, /data-static="true"/);
  const noLike = render(Conversation, {
    messages: [message("a", { canLike: false, canReply: false })],
    onReply: async () => undefined,
    onLike: () => undefined,
    onIgnore: () => undefined,
  });
  assert.doesNotMatch(noLike, /aria-label="Like"|>Reply</);
  assert.match(noLike, /aria-label="Ignore"/);
});

test("InboxList marks the selected row and shows the empty text", () => {
  const item = {
    id: "a",
    network: "instagram",
    authorName: "Mara",
    avatarUrl: null,
    text: "Hello",
    when: "3 h",
    createdAt: "2026-11-14T09:00:00Z",
    href: "/community/a",
  };
  const markup = render(InboxList, {
    items: [item],
    selectedId: "a",
    label: "Inbox",
    empty: "No messages",
  });
  assert.match(
    markup,
    /aria-current="true" class="od-inbox-row" href="\/community\/a"/,
  );
  assert.equal(
    render(InboxList, { items: [], label: "Inbox", empty: "No messages" }),
    '<p class="od-inbox-empty">No messages</p>',
  );
});

test("chart ticks are round and include the maximum", () => {
  assert.deepEqual(chartTicks(0), [0, 1]);
  assert.deepEqual(chartTicks(7), [0, 2, 4, 6, 8]);
  assert.deepEqual(chartTicks(820), [0, 250, 500, 750, 1000]);
});

test("the series without a colour become one neutral series", () => {
  const series = Array.from({ length: 11 }, (_, slot) => ({
    id: `s${String(slot)}`,
    label: `S${String(slot)}`,
    slot,
    values: [slot, null],
  }));
  assert.equal(foldSeries(series.slice(0, 9), "Other").length, 9);
  const folded = foldSeries(series, "Other");
  assert.equal(folded.length, 10);
  assert.deepEqual(folded[9], {
    id: "other",
    label: "Other",
    slot: 9,
    values: [19, null],
  });
  // A filter that removes a series does not move the colours of the others.
  assert.deepEqual(
    foldSeries([series[3], series[8]], "Other").map((entry) => entry.slot),
    [3, 8],
  );
});

test("StackedBarChart has a legend and a table with all values", () => {
  const markup = render(StackedBarChart, {
    label: "Views",
    days: ["2026-11-13", "2026-11-14"],
    series: [
      { id: "a", label: "YouTube", slot: 0, total: "30", values: [10, 20] },
      { id: "b", label: "X", slot: 1, values: [null, 5] },
    ],
  });
  assert.match(markup, /<svg aria-label="Views"/);
  assert.equal(markup.match(/class="od-chart-bar"/g).length, 3);
  assert.match(markup, /YouTube<b>30<\/b>/);
  // One line between two segments of a bar, and none on a short segment.
  assert.equal(markup.match(/class="od-chart-separator"/g).length, 1);
  assert.doesNotMatch(
    render(StackedBarChart, {
      label: "Views",
      legend: false,
      days: ["2026-11-14"],
      series: [
        { id: "a", label: "YouTube", slot: 0, values: [10] },
        { id: "b", label: "X", slot: 1, values: [5] },
      ],
    }),
    /od-chart-legend/,
  );
  assert.match(
    markup,
    /<th scope="row">2026-11-14<\/th><td>20<\/td><td>5<\/td><td>25<\/td>/,
  );
});

test("a preset range ends at the current day", () => {
  assert.deepEqual(lastDays("2026-11-14", 30), {
    from: "2026-10-16",
    to: "2026-11-14",
  });
  assert.deepEqual(lastDays("2026-03-01", 1), {
    from: "2026-03-01",
    to: "2026-03-01",
  });
});

test("ChartLegend names each series with its colour slot", () => {
  const markup = render(ChartLegend, {
    label: "Channels",
    items: [{ id: "a", label: "YouTube", slot: 2 }],
  });
  assert.match(markup, /<ul aria-label="Channels"/);
  assert.match(markup, /data-slot="2"><\/i>YouTube<\/li>/);
});
