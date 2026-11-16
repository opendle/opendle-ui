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
