import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { RecordTable } from "../dist/index.js";

test("a read-only record table has a named keyboard scroll region", () => {
  const html = renderToStaticMarkup(
    React.createElement(RecordTable, {
      label: "Metric sources and history",
      columns: [{ id: "metric", label: "Metric" }],
      rows: [{ id: "views", label: "Views", title: "Views", cells: [] }],
    }),
  );
  assert.match(
    html,
    /<section[^>]*aria-label="Metric sources and history scrollable table"/,
  );
  assert.match(html, /<section[^>]*tabindex="0"/);
  assert.match(html, /<caption[^>]*>Metric sources and history<\/caption>/);
  assert.match(html, /<th scope="row">Views<\/th>/);
});

test("column widths give the same fixed layout to each table", () => {
  const html = renderToStaticMarkup(
    React.createElement(RecordTable, {
      label: "Formats",
      minimumWidth: "30rem",
      columns: [
        { id: "group", label: "Format" },
        { id: "posts", label: "Posts", numeric: true, width: "6rem" },
      ],
      rows: [{ id: "video", label: "Video", title: "Video", cells: ["3"] }],
    }),
  );
  assert.match(html, /<table data-layout="fixed" style="min-width:30rem">/);
  assert.match(html, /<colgroup><col\/><col style="width:6rem"\/><\/colgroup>/);
});

test("a table without column widths keeps the automatic layout", () => {
  const html = renderToStaticMarkup(
    React.createElement(RecordTable, {
      label: "Sources",
      columns: [{ id: "metric", label: "Metric" }],
      rows: [],
    }),
  );
  assert.match(html, /<table>/);
  assert.doesNotMatch(html, /colgroup/);
});
