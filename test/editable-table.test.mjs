import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { EditableTable } from "../dist/index.js";

const rows = [
  {
    id: "route-1",
    label: "Primary route",
    draft: { name: "Primary route", provider: "North" },
    committedDraft: { name: "Primary route", provider: "North" },
    editing: true,
    dirty: true,
    stale: true,
  },
  {
    id: "route-2",
    label: "Locked route",
    draft: { name: "Locked route", provider: "South" },
    locked: true,
  },
  {
    id: "create-route",
    label: "New route",
    draft: { name: "", provider: "North" },
    editing: true,
    dirty: true,
    isNew: true,
    validation: "Name is required.",
  },
];

const columns = [
  {
    key: "name",
    header: "Name",
    phoneLabel: "Route name",
    width: "18rem",
    renderRead: ({ row }) =>
      React.createElement("strong", null, row.draft.name),
    renderEdit: ({ row, update, validation, validationId }) =>
      React.createElement("input", {
        "aria-describedby": validation ? validationId : undefined,
        "aria-invalid": validation ? "true" : undefined,
        "aria-label": `Name for ${row.label}`,
        onChange: (event) => update({ name: event.currentTarget.value }),
        value: row.draft.name,
      }),
  },
  {
    key: "provider",
    header: "Provider",
    width: "12rem",
    renderRead: ({ row }) => row.draft.provider,
    renderEdit: ({ row, update }) =>
      React.createElement(
        "select",
        {
          "aria-label": `Provider for ${row.label}`,
          onChange: (event) => update({ provider: event.currentTarget.value }),
          value: row.draft.provider,
        },
        React.createElement("option", { value: "North" }, "North"),
        React.createElement("option", { value: "South" }, "South"),
      ),
  },
];

function renderEditableTable(overrides = {}) {
  return renderToStaticMarkup(
    React.createElement(EditableTable, {
      ariaLabel: "Provider routes",
      columns,
      getDeleteConfirmation: (row) => ({
        title: `Delete ${row.label}?`,
        description: `Delete ${row.label} and its assignment.`,
        confirmLabel: `Delete ${row.label}`,
      }),
      onCancel: () => undefined,
      onCreate: () => undefined,
      onDelete: () => undefined,
      onDraftChange: () => undefined,
      onEdit: () => undefined,
      onSave: () => undefined,
      rows,
      saveMode: "explicit",
      validate: (row) => (row.draft.name ? null : "Name is required."),
      ...overrides,
    }),
  );
}

test("EditableTable builds read and edit cells on the shared DataTable", () => {
  const markup = renderEditableTable();
  assert.match(markup, /aria-label="Provider routes editor"/);
  assert.match(markup, /<table[^>]*class="od-data-table-table"/);
  assert.match(markup, /<ul[^>]*aria-label="Provider routes cards"/);
  assert.match(markup, /Name for Primary route/);
  assert.match(markup, /Route name/);
  assert.match(markup, /Source data changed\. Your draft is preserved\./);
  assert.match(markup, /Name is required\./);
  assert.match(markup, /Create New route/);
  assert.match(markup, /aria-disabled="true"/);
  const validationIds = [...markup.matchAll(/id="([^"]+-validation)"/g)].map(
    (match) => match[1],
  );
  const describedIds = [
    ...markup.matchAll(/aria-describedby="([^"]+-validation)"/g),
  ].map((match) => match[1]);
  assert.equal(validationIds.length, 2);
  assert.equal(new Set(validationIds).size, 2);
  assert.deepEqual(new Set(describedIds), new Set(validationIds));
});

test("EditableTable exposes explicit, automatic, and batch save modes", () => {
  const explicit = renderEditableTable();
  assert.match(explicit, /Save Primary route/);

  const automatic = renderEditableTable({ saveMode: "automatic" });
  assert.doesNotMatch(automatic, /Save Primary route/);
  assert.match(automatic, /Cancel Primary route/);

  const batch = renderEditableTable({ saveMode: "batch" });
  assert.match(batch, /Discard changes/);
  assert.match(batch, /Save 2 changes/);
  assert.doesNotMatch(batch, /Save Primary route/);
});

test("EditableTable does not discard a locked batch draft", () => {
  const batch = renderEditableTable({
    rows: [
      {
        ...rows[0],
        locked: true,
      },
    ],
    saveMode: "batch",
  });
  assert.match(batch, /<button[^>]*disabled=""[^>]*>Discard changes<\/button>/);
  assert.match(batch, /<button[^>]*disabled=""[^>]*>Save 1 changes<\/button>/);
});

test("EditableTable validates host-neutral identifiers and create hooks", () => {
  assert.throws(
    () => renderEditableTable({ ariaLabel: " " }),
    /ariaLabel must not be empty/,
  );
  assert.throws(
    () => renderEditableTable({ columns: [] }),
    /at least one column/,
  );
  assert.throws(
    () => renderEditableTable({ rows: [rows[0], rows[0]] }),
    /row identifiers must be non-empty and unique/,
  );
  assert.throws(
    () => renderEditableTable({ onCreate: undefined }),
    /requires onCreate/,
  );
  assert.throws(
    () => renderEditableTable({ onSave: undefined, saveMode: "batch" }),
    /requires onSave/,
  );
});

test("EditableTable keeps scoped reorder controls inside each caller scope", () => {
  const scopedRows = [
    {
      ...rows[0],
      id: "north-1",
      label: "North one",
      editing: false,
      dirty: false,
    },
    {
      ...rows[0],
      id: "north-2",
      label: "North two",
      editing: false,
      dirty: false,
    },
    {
      ...rows[0],
      id: "south-1",
      label: "South one",
      draft: { name: "South one", provider: "South" },
      editing: false,
      dirty: false,
    },
  ];
  const markup = renderEditableTable({
    rows: scopedRows,
    reorder: {
      getScope: (row) => row.draft.provider,
      onReorder: () => undefined,
    },
  });
  assert.match(markup, />Move North two up<\/button>/);
  assert.match(
    markup,
    /<button[^>]*disabled=""[^>]*>Move North one up<\/button>/,
  );
  assert.match(
    markup,
    /<button[^>]*disabled=""[^>]*>Move South one up<\/button>/,
  );
});

test("EditableTable documents complete scoped reorder results", () => {
  const declaration = readFileSync(
    new URL("../dist/components/EditableTable.d.ts", import.meta.url),
    "utf8",
  );
  assert.match(
    declaration,
    /Index in the complete caller scope, including rows that cannot move\./,
  );
  assert.match(
    declaration,
    /Complete caller scope after the move, including rows that cannot move\./,
  );
});
