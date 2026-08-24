import { strict as assert } from "node:assert";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Button, RelationshipGraph } from "../dist/index.js";
import {
  assertRelationshipGraphModel,
  relationshipGraphKeyboardTarget,
  relationshipGraphPath,
  relationshipGraphSearch,
} from "../dist/RelationshipGraphModel.js";

const nodes = [
  { id: "source-a", columnIndex: 0, order: 0, searchValue: "Source A cloud" },
  { id: "source-b", columnIndex: 0, order: 1, searchValue: "Source B local" },
  { id: "record-a", columnIndex: 1, order: 0, searchValue: "Record Alpha" },
  { id: "record-b", columnIndex: 1, order: 1, searchValue: "Record Beta" },
  { id: "target-a", columnIndex: 2, order: 0, searchValue: "Target One" },
  { id: "target-b", columnIndex: 2, order: 1, searchValue: "Target Two" },
];

const relationships = [
  { id: "source-a-record-a", sourceId: "source-a", targetId: "record-a" },
  { id: "source-b-record-b", sourceId: "source-b", targetId: "record-b" },
  { id: "record-a-target-a", sourceId: "record-a", targetId: "target-a" },
  { id: "record-b-target-b", sourceId: "record-b", targetId: "target-b" },
];

test("relationship paths contain the complete route and no unrelated branch", () => {
  assert.deepEqual(
    [...relationshipGraphPath("record-a", nodes, relationships).nodeIds].sort(),
    ["record-a", "source-a", "target-a"],
  );
  assert.deepEqual(
    [
      ...relationshipGraphPath("record-a", nodes, relationships)
        .relationshipIds,
    ].sort(),
    ["record-a-target-a", "source-a-record-a"],
  );
});

test("relationship search keeps a direct match and the records that explain it", () => {
  const result = relationshipGraphSearch("ALPHA", nodes, relationships);
  assert.deepEqual([...result.directMatchIds], ["record-a"]);
  assert.deepEqual([...result.visibleNodeIds].sort(), [
    "record-a",
    "source-a",
    "target-a",
  ]);
  assert.deepEqual(
    [
      ...relationshipGraphSearch("missing", nodes, relationships)
        .visibleNodeIds,
    ],
    [],
  );
});

test("relationship keyboard navigation stays in columns and follows connections", () => {
  assert.equal(
    relationshipGraphKeyboardTarget(
      "source-a",
      "ArrowDown",
      nodes,
      relationships,
    ),
    "source-b",
  );
  assert.equal(
    relationshipGraphKeyboardTarget(
      "source-b",
      "ArrowRight",
      nodes,
      relationships,
    ),
    "record-b",
  );
  assert.equal(
    relationshipGraphKeyboardTarget(
      "record-b",
      "ArrowRight",
      nodes,
      relationships,
    ),
    "target-b",
  );
  assert.equal(
    relationshipGraphKeyboardTarget(
      "record-b",
      "ArrowLeft",
      nodes,
      relationships,
    ),
    "source-b",
  );
  assert.equal(
    relationshipGraphKeyboardTarget("record-b", "Home", nodes, relationships),
    "record-a",
  );
  assert.equal(
    relationshipGraphKeyboardTarget(
      "source-a",
      "ArrowLeft",
      nodes,
      relationships,
    ),
    "source-a",
  );
});

test("relationship graph rejects ambiguous identifiers and invalid column links", () => {
  assert.throws(
    () => assertRelationshipGraphModel([...nodes, nodes[0]], relationships),
    /node identifiers must be unique/,
  );
  assert.throws(
    () =>
      assertRelationshipGraphModel(nodes, [
        { id: "skip", sourceId: "source-a", targetId: "target-a" },
      ]),
    /must connect adjacent columns/,
  );
  assert.throws(
    () =>
      assertRelationshipGraphModel(nodes, [
        { id: "unknown", sourceId: "source-a", targetId: "missing" },
      ]),
    /unknown node/,
  );
  assert.throws(
    () =>
      renderToStaticMarkup(
        React.createElement(RelationshipGraph, {
          "aria-label": "Duplicate columns",
          columns: [
            { id: "same", label: "First", nodes: [] },
            { id: "same", label: "Second", nodes: [] },
            { id: "third", label: "Third", nodes: [] },
          ],
          relationships: [],
        }),
      ),
    /column identifiers must be unique/,
  );
});

function graphColumns() {
  return [
    {
      id: "sources",
      label: "Sources",
      actions: React.createElement(Button, null, "Create source"),
      nodes: [{ id: "source-a", label: "Source A" }],
    },
    {
      id: "records",
      label: "Records",
      nodes: [
        {
          id: "record-a",
          label: "Record Alpha",
          detail: "A long host-owned detail",
          state: "invalid",
        },
      ],
    },
    {
      id: "targets",
      label: "Targets",
      nodes: [{ id: "target-a", label: "Target One" }],
    },
  ];
}

test("relationship graph renders named columns, button nodes, states, and contextual actions", () => {
  const markup = renderToStaticMarkup(
    React.createElement(RelationshipGraph, {
      "aria-label": "Example relationships",
      columns: graphColumns(),
      relationships: [
        {
          id: "source-record",
          sourceId: "source-a",
          targetId: "record-a",
          label: "source mapping",
        },
        {
          id: "record-target",
          sourceId: "record-a",
          targetId: "target-a",
          invalid: true,
          invalidLabel: "broken target route",
        },
      ],
      selectedNodeId: "record-a",
    }),
  );
  assert.match(markup, /<h2[^>]*>Sources<\/h2>/);
  assert.match(markup, /<h2[^>]*>Records<\/h2>/);
  assert.match(markup, /<h2[^>]*>Targets<\/h2>/);
  assert.match(markup, />Create source<\/button>/);
  assert.match(
    markup,
    /aria-label="Record Alpha\. Records column\. Invalid\. Connected to Source A by source mapping, Target One by broken target route\."/,
  );
  assert.match(markup, /data-state="invalid"/);
  assert.match(markup, /aria-pressed="true"/);
  assert.equal((markup.match(/tabindex="0"/g) ?? []).length, 1);
  assert.doesNotMatch(markup, /provider|model|assignment/i);
});

test("relationship graph shows caller-owned empty and invalid states", () => {
  const emptyColumns = graphColumns().map((column) => ({
    ...column,
    nodes: [],
  }));
  const emptyMarkup = renderToStaticMarkup(
    React.createElement(RelationshipGraph, {
      "aria-label": "Empty relationships",
      columns: emptyColumns,
      emptyState: React.createElement("p", null, "Create the first record."),
      relationships: [],
    }),
  );
  const invalidMarkup = renderToStaticMarkup(
    React.createElement(RelationshipGraph, {
      "aria-label": "Invalid relationships",
      columns: graphColumns(),
      invalidState: React.createElement("p", null, "Correct the graph data."),
      relationships: [
        { id: "source-record", sourceId: "source-a", targetId: "record-a" },
        { id: "record-target", sourceId: "record-a", targetId: "target-a" },
      ],
    }),
  );
  assert.match(emptyMarkup, /<output/);
  assert.match(emptyMarkup, /Create the first record/);
  assert.match(invalidMarkup, /role="alert"/);
  assert.match(invalidMarkup, /Correct the graph data/);
});
