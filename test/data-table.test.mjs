import { strict as assert } from "node:assert";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { DataTable } from "../dist/index.js";

const rows = [
  {
    id: "row-1",
    name: "First record",
    state: "Ready",
    detail: "A long detail value that stays owned by the host.",
  },
  {
    id: "row-2",
    name: "Second record",
    state: "Pending",
    detail: "Another detail value.",
  },
];

const columns = [
  {
    key: "name",
    header: "Name",
    width: "18rem",
    sortable: true,
    render: ({ row }) => React.createElement("strong", null, row.name),
  },
  {
    key: "state",
    header: "State",
    phoneLabel: "Current state",
    width: "10rem",
    render: ({ row }) => row.state,
  },
];

function renderDataTable(overrides = {}) {
  return renderToStaticMarkup(
    React.createElement(DataTable, {
      actions: [
        {
          key: "open",
          label: (row) => `Open ${row.name}`,
          onAction: () => undefined,
        },
      ],
      ariaLabel: "Current records",
      columns,
      density: "compact",
      expansion: {
        expandedRowIds: ["row-1"],
        onChange: () => undefined,
        detail: ({ row }) => React.createElement("p", null, row.detail),
      },
      filters: React.createElement("button", { type: "button" }, "Ready only"),
      getRowId: (row) => row.id,
      getRowLabel: (row) => row.name,
      loadMore: {
        hasMore: true,
        loadedLabel: "2 loaded",
        onLoadMore: () => undefined,
      },
      rows,
      search: React.createElement("input", {
        "aria-label": "Search records",
        type: "search",
      }),
      selection: {
        selectedRowIds: ["row-1"],
        onChange: () => undefined,
      },
      sort: {
        columnKey: "name",
        direction: "ascending",
        onChange: () => undefined,
      },
      state: { kind: "stale", message: "These rows can be out of date." },
      ...overrides,
    }),
  );
}

test("DataTable exports a semantic desktop table and accessible phone cards", () => {
  const markup = renderDataTable();
  assert.match(markup, /<section[^>]*aria-label="Current records"/);
  assert.match(markup, /<table[^>]*class="od-data-table-table"/);
  assert.match(markup, /<caption[^>]*>Current records<\/caption>/);
  assert.match(markup, /<th[^>]*aria-sort="ascending"[^>]*scope="col"/);
  assert.match(markup, /<col style="width:18rem"/);
  assert.match(markup, /<ul[^>]*aria-label="Current records cards"/);
  assert.match(markup, /<article[^>]*aria-labelledby=/);
  assert.match(markup, /<dt>Current state<\/dt>/);
  assert.match(markup, /aria-expanded="true"/);
  assert.match(markup, /A long detail value/);
  assert.match(markup, /class="od-data-table od-data-table-density-compact"/);
  assert.match(markup, /These rows can be out of date/);
  assert.match(markup, /Load more rows/);
});

test("DataTable exposes disabled and pending row actions safely", () => {
  const markup = renderDataTable({
    isRowDisabled: (row) => row.id === "row-1",
    isRowPending: (row) => row.id === "row-2",
    state: { kind: "ready" },
  });
  assert.match(markup, /<tr[^>]*aria-disabled="true"/);
  assert.match(markup, /<tr[^>]*aria-busy="true"/);
  assert.match(
    markup,
    /<button[^>]*disabled=""[^>]*>Open First record<\/button>/,
  );
  assert.match(
    markup,
    /<button[^>]*aria-busy="true"[^>]*disabled=""[^>]*>Open Second record<\/button>/,
  );
  assert.match(markup, /<li[^>]*data-disabled="true"/);
  assert.match(markup, /First record is disabled\./);
  assert.match(markup, /<legend[^>]*>Actions for First record<\/legend>/);
});

test("DataTable renders loading, empty, error, retry, and complete states", () => {
  const loading = renderDataTable({
    actions: [],
    expansion: undefined,
    filters: undefined,
    loadMore: undefined,
    rows: [],
    search: undefined,
    selection: undefined,
    sort: undefined,
    state: { kind: "loading", message: "Loading current rows…" },
  });
  assert.match(loading, /aria-busy="true"/);
  assert.match(loading, /Loading current rows…/);
  assert.doesNotMatch(loading, /<table/);

  const empty = renderDataTable({
    rows: [],
    state: { kind: "empty", message: "No matching rows." },
  });
  assert.match(empty, /No matching rows/);
  const error = renderDataTable({
    rows: [],
    state: {
      kind: "error",
      message: "Rows are unavailable.",
      onRetry: () => undefined,
      retryLabel: "Try again",
    },
  });
  assert.match(error, /role="alert"/);
  assert.match(error, />Try again<\/button>/);
  const complete = renderDataTable({
    loadMore: {
      hasMore: false,
      completeLabel: "The bounded result is complete.",
    },
    state: { kind: "ready" },
  });
  assert.match(complete, /The bounded result is complete/);
  assert.match(complete, /2 loaded/);
  const bounded = renderDataTable({ maxRows: 2, state: { kind: "ready" } });
  assert.match(bounded, /The row limit is loaded/);
  assert.doesNotMatch(bounded, />Load more rows<\/button>/);
  const unavailable = renderDataTable({
    rows: [],
    state: { kind: "unavailable", message: "This result is unavailable." },
  });
  assert.match(unavailable, /od-data-table-state-unavailable/);
  assert.match(unavailable, /This result is unavailable/);
});

test("DataTable does not expose inactive sorting semantics", () => {
  const markup = renderDataTable({ sort: undefined, state: { kind: "ready" } });
  assert.doesNotMatch(markup, /aria-sort=/);
  assert.doesNotMatch(markup, /od-data-table-sort-control/);
});

test("DataTable uses a singular default live row count", () => {
  const markup = renderDataTable({ rows: [rows[0]], state: { kind: "ready" } });
  assert.match(markup, />1 row loaded\.<\/output>/);
});

test("DataTable rejects unsafe or ambiguous bounds", () => {
  assert.throws(() => renderDataTable({ ariaLabel: " " }), /must not be empty/);
  assert.throws(() => renderDataTable({ columns: [] }), /at least one column/);
  assert.throws(
    () => renderDataTable({ rows: [rows[0], rows[0]] }),
    /duplicate row identifiers/,
  );
  assert.throws(
    () => renderDataTable({ maxRows: 1 }),
    /accepts at most 1 rows/,
  );
  assert.throws(
    () => renderDataTable({ getRowLabel: () => " " }),
    /row label must not be empty/,
  );
  assert.throws(
    () =>
      renderDataTable({
        actions: [
          { key: "same", label: () => "One", onAction: () => undefined },
          { key: "same", label: () => "Two", onAction: () => undefined },
        ],
      }),
    /duplicate action keys/,
  );
});

test("DataTable gives collision-prone row identifiers unique DOM relationships", () => {
  const collisionRows = [
    { ...rows[0], id: "a!", name: "Punctuation record" },
    { ...rows[1], id: "a-21-", name: "Encoded-looking record" },
  ];
  const markup = renderDataTable({
    expansion: {
      detail: ({ row }) => React.createElement("p", null, row.detail),
      expandedRowIds: collisionRows.map((row) => row.id),
      onChange: () => undefined,
    },
    rows: collisionRows,
    state: { kind: "ready" },
  });
  const detailIds = [...markup.matchAll(/id="([^"]+-detail)"/g)].map(
    (match) => match[1],
  );
  const controlledIds = [...markup.matchAll(/aria-controls="([^"]+)"/g)].map(
    (match) => match[1],
  );
  assert.equal(detailIds.length, 4);
  assert.equal(new Set(detailIds).size, 4);
  assert.deepEqual(new Set(controlledIds), new Set(detailIds));
});
