import { strict as assert } from "node:assert";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Button, GraphInspector, RelationshipGraph } from "../dist/index.js";
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

const compoundNodes = [
  { id: "source", columnIndex: 0, order: 0, searchValue: "Source" },
  {
    id: "record-group",
    columnIndex: 1,
    kind: "group",
    order: 0,
    searchValue: "Record collection",
  },
  {
    id: "shared-row",
    columnIndex: 1,
    kind: "row",
    order: 1,
    parentId: "record-group",
    searchValue: "Shared row",
  },
  {
    id: "second-row",
    columnIndex: 1,
    kind: "row",
    order: 2,
    parentId: "record-group",
    searchValue: "Second row",
  },
  {
    id: "target-group",
    columnIndex: 2,
    kind: "group",
    order: 0,
    searchValue: "Target collection",
  },
  {
    id: "first-rung",
    columnIndex: 2,
    kind: "row",
    order: 1,
    parentId: "target-group",
    searchValue: "First rung",
  },
  {
    id: "second-rung",
    columnIndex: 2,
    kind: "row",
    order: 2,
    parentId: "target-group",
    searchValue: "Second rung",
  },
];

const compoundRelationships = [
  { id: "source-row", sourceId: "source", targetId: "shared-row" },
  { id: "row-first", sourceId: "shared-row", targetId: "first-rung" },
  { id: "row-second", sourceId: "shared-row", targetId: "second-rung" },
];

test("compound search keeps group context and every route for a group match", () => {
  const groupResult = relationshipGraphSearch(
    "record collection",
    compoundNodes,
    compoundRelationships,
  );
  assert.deepEqual([...groupResult.directMatchIds], ["record-group"]);
  assert.deepEqual([...groupResult.visibleNodeIds].sort(), [
    "first-rung",
    "record-group",
    "second-row",
    "second-rung",
    "shared-row",
    "source",
    "target-group",
  ]);

  const rowResult = relationshipGraphSearch(
    "shared row",
    compoundNodes,
    compoundRelationships,
  );
  assert.deepEqual([...rowResult.directMatchIds], ["shared-row"]);
  assert.equal(rowResult.visibleNodeIds.has("record-group"), true);
  assert.equal(rowResult.visibleNodeIds.has("second-row"), false);
  assert.equal(rowResult.visibleNodeIds.has("target-group"), true);
});

test("compound paths and keyboard targets use exact nested controls", () => {
  const path = relationshipGraphPath(
    "shared-row",
    compoundNodes,
    compoundRelationships,
  );
  assert.deepEqual([...path.nodeIds].sort(), [
    "first-rung",
    "record-group",
    "second-rung",
    "shared-row",
    "source",
    "target-group",
  ]);
  assert.equal(
    relationshipGraphKeyboardTarget(
      "shared-row",
      "ArrowUp",
      compoundNodes,
      compoundRelationships,
    ),
    "record-group",
  );
  assert.equal(
    relationshipGraphKeyboardTarget(
      "shared-row",
      "ArrowRight",
      compoundNodes,
      compoundRelationships,
    ),
    "first-rung",
  );
  assert.equal(
    relationshipGraphKeyboardTarget(
      "second-rung",
      "ArrowLeft",
      compoundNodes,
      compoundRelationships,
    ),
    "shared-row",
  );
});

test("keyboard targets skip a non-actionable compound group header", () => {
  const nonActionableNodes = compoundNodes.map((node) =>
    node.id === "record-group" ? { ...node, actionable: false } : node,
  );
  assert.equal(
    relationshipGraphKeyboardTarget(
      "shared-row",
      "ArrowUp",
      nonActionableNodes,
      compoundRelationships,
    ),
    "shared-row",
  );
  assert.equal(
    relationshipGraphKeyboardTarget(
      "second-row",
      "Home",
      nonActionableNodes,
      compoundRelationships,
    ),
    "shared-row",
  );
  assert.equal(
    relationshipGraphKeyboardTarget(
      "record-group",
      "ArrowDown",
      nonActionableNodes,
      compoundRelationships,
    ),
    null,
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
      assertRelationshipGraphModel(
        [{ ...nodes[0], columnIndex: Number.NaN }],
        [],
      ),
    /invalid column/,
  );
  assert.throws(
    () =>
      assertRelationshipGraphModel(
        [nodes[0], { ...nodes[1], order: nodes[0].order }],
        [],
      ),
    /orders must be unique/,
  );
  assert.throws(
    () =>
      assertRelationshipGraphModel(
        [
          {
            id: "orphan-row",
            columnIndex: 1,
            kind: "row",
            order: 0,
            searchValue: "Orphan",
          },
        ],
        [],
      ),
    /must name its parent group/,
  );
  assert.throws(
    () =>
      assertRelationshipGraphModel(
        [
          {
            id: "group",
            columnIndex: 1,
            kind: "group",
            order: 0,
            searchValue: "Group",
          },
          {
            id: "peer-with-parent",
            columnIndex: 1,
            kind: "node",
            order: 1,
            parentId: "group",
            searchValue: "Peer",
          },
        ],
        [],
      ),
    /must not have a parent group/,
  );
  assert.throws(
    () =>
      assertRelationshipGraphModel(
        [
          nodes[0],
          {
            id: "label-only-group",
            actionable: false,
            columnIndex: 1,
            kind: "group",
            order: 0,
            searchValue: "Label-only group",
          },
        ],
        [
          {
            id: "invalid-group-endpoint",
            sourceId: "source-a",
            targetId: "label-only-group",
          },
        ],
      ),
    /must use actionable endpoints/,
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
  assert.throws(
    () =>
      renderToStaticMarkup(
        React.createElement(RelationshipGraph, {
          "aria-label": "Wrong column count",
          columns: graphColumns().slice(0, 2),
          relationships: [],
        }),
      ),
    /exactly three columns/,
  );
  assert.throws(
    () =>
      renderToStaticMarkup(
        React.createElement(RelationshipGraph, {
          "aria-label": " ",
          columns: graphColumns(),
          relationships: [],
        }),
      ),
    /accessible name/,
  );
  assert.throws(
    () =>
      renderToStaticMarkup(
        React.createElement(RelationshipGraph, {
          "aria-label": "Invalid state",
          columns: graphColumns().map((column, index) =>
            index === 0
              ? {
                  ...column,
                  nodes: [{ ...column.nodes[0], state: "unknown" }],
                }
              : column,
          ),
          relationships: [],
        }),
      ),
    /invalid state/,
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

function compoundColumns() {
  return [
    {
      id: "sources",
      label: "Sources",
      nodes: [
        { id: "source", label: "Source", state: "error" },
        { id: "source-ready", label: "Ready source", state: "ready" },
        {
          id: "source-enabled",
          label: "Enabled source",
          state: "enabled",
        },
        {
          id: "source-custom",
          label: "Custom source",
          stateLabel: "Host-defined state",
        },
      ],
    },
    {
      id: "records",
      label: "Records",
      nodes: [
        {
          id: "record-group",
          label: "Record collection",
          rowsLabel: "Record rows",
          state: "inherited",
          rows: [
            { id: "shared-row", label: "Shared row", state: "partial" },
            { id: "second-row", label: "Second row", state: "loading" },
          ],
        },
      ],
    },
    {
      id: "targets",
      label: "Targets",
      nodes: [
        {
          id: "target-group",
          label: "Target collection",
          rowsLabel: "Ordered rows",
          state: "empty",
          rows: [
            { id: "first-rung", label: "First rung", state: "unavailable" },
            { id: "second-rung", label: "Second rung", state: "disabled" },
          ],
        },
      ],
    },
  ];
}

test("relationship graph renders semantic compound groups and nested row controls", () => {
  const markup = renderToStaticMarkup(
    React.createElement(RelationshipGraph, {
      "aria-label": "Compound relationships",
      columns: compoundColumns(),
      defaultSearchQuery: "shared row",
      relationships: [
        {
          id: "source-row",
          sourceId: "source",
          targetId: "shared-row",
          accessibleLabel: "Source supplies the shared row",
        },
        {
          id: "row-first",
          sourceId: "shared-row",
          targetId: "first-rung",
          accessibleLabel: "Shared row is first",
        },
        {
          id: "row-second",
          sourceId: "shared-row",
          targetId: "second-rung",
          accessibleLabel: "Shared row is second",
        },
      ],
    }),
  );
  assert.match(
    markup,
    /<fieldset[^>]*class="od-relationship-graph-group"[^>]*>.*?<legend[^>]*>Record collection<\/legend>/s,
  );
  assert.match(markup, />Record rows</);
  assert.match(markup, /data-node-kind="group"/);
  assert.match(markup, /data-node-kind="row"/);
  assert.match(markup, /data-group-id="record-group"/);
  assert.match(markup, /data-expanded="true"/);
  assert.match(markup, /data-search-match="true"/);
  assert.match(markup, /data-search-context="true"/);
  assert.match(markup, />Context</);
  assert.match(markup, />Partial</);
  assert.equal((markup.match(/tabindex="0"/g) ?? []).length, 1);
  assert.doesNotMatch(markup, /provider|model|assignment/i);

  const allStatesMarkup = renderToStaticMarkup(
    React.createElement(RelationshipGraph, {
      "aria-label": "Compound states",
      columns: compoundColumns(),
      relationships: [],
    }),
  );
  for (const stateLabel of [
    "Ready",
    "Enabled",
    "Error",
    "Inherited",
    "Partial",
    "Loading",
    "Empty",
    "Unavailable",
    "Disabled",
  ]) {
    assert.match(allStatesMarkup, new RegExp(`>${stateLabel}<`));
  }
  assert.match(allStatesMarkup, />Host-defined state</);
});

test("relationship graph keeps a non-actionable group header out of selection and keyboard order", () => {
  const columns = compoundColumns().map((column) =>
    column.id === "records"
      ? {
          ...column,
          nodes: column.nodes.map((item) => ({
            ...item,
            headerActionable: false,
          })),
        }
      : column,
  );
  const markup = renderToStaticMarkup(
    React.createElement(RelationshipGraph, {
      "aria-label": "Label-only compound relationships",
      columns,
      defaultSearchQuery: "record collection",
      inspector: React.createElement(
        GraphInspector,
        { title: "Group inspector" },
        "This inspector must stay closed.",
      ),
      relationships: compoundRelationships,
      selectedNodeId: "record-group",
    }),
  );
  assert.match(
    markup,
    /<fieldset[^>]*class="od-relationship-graph-group"[^>]*>.*?<legend[^>]*>Record collection<\/legend>/s,
  );
  assert.match(
    markup,
    /<div[^>]*data-group-header-id="record-group"[^>]*data-node-kind="group"[^>]*data-search-context="false"[^>]*data-search-match="true"/,
  );
  assert.doesNotMatch(markup, /<button[^>]*data-node-id="record-group"/);
  assert.match(
    markup,
    /data-group-id="record-group"[^>]*data-node-id="shared-row"[^>]*data-search-context="true"/,
  );
  assert.equal((markup.match(/tabindex="0"/g) ?? []).length, 1);
  assert.doesNotMatch(markup, /<dialog/);
});

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
  assert.match(emptyMarkup, /aria-live="polite"/);
  assert.match(emptyMarkup, /Create the first record/);
  assert.equal((emptyMarkup.match(/<h2/g) ?? []).length, 3);
  assert.match(emptyMarkup, />Create source<\/button>/);
  assert.match(invalidMarkup, /role="alert"/);
  assert.match(invalidMarkup, /Correct the graph data/);
});

test("relationship graph keeps all column actions in empty and no-result states", () => {
  const emptyColumns = ["Sources", "Records", "Targets"].map((label) => ({
    id: label.toLowerCase(),
    label,
    actions: React.createElement(Button, null, `Create ${label}`),
    nodes: [],
  }));
  const emptyMarkup = renderToStaticMarkup(
    React.createElement(RelationshipGraph, {
      "aria-label": "Empty action graph",
      columns: emptyColumns,
      relationships: [],
    }),
  );
  const noResultMarkup = renderToStaticMarkup(
    React.createElement(RelationshipGraph, {
      "aria-label": "No-result action graph",
      columns: graphColumns(),
      defaultSearchQuery: "missing",
      relationships: [],
    }),
  );
  assert.equal((emptyMarkup.match(/<h2/g) ?? []).length, 3);
  assert.equal(
    (emptyMarkup.match(/>Create [A-Z][a-z]*<\/button>/g) ?? []).length,
    3,
  );
  assert.equal((noResultMarkup.match(/<h2/g) ?? []).length, 3);
  assert.match(noResultMarkup, />Create source<\/button>/);
  assert.match(noResultMarkup, />Clear search<\/button>/);
});

test("relationship graph marks host-supplied partial-result actions and messages", () => {
  const columns = graphColumns().map((column) =>
    column.id === "records"
      ? {
          ...column,
          partialResult: {
            action: React.createElement(Button, null, "Load more records"),
            label: "Partial records",
          },
        }
      : column,
  );
  const markup = renderToStaticMarkup(
    React.createElement(RelationshipGraph, {
      "aria-label": "Partial result graph",
      columns,
      defaultSearchQuery: "missing",
      partialNoResultsDescription: "Load more records or change search.",
      partialNoResultsTitle: "No matching loaded records",
      relationships: [],
    }),
  );
  assert.match(markup, /data-partial-result="true"/);
  assert.match(markup, />Partial records</);
  assert.match(markup, />Load more records<\/button>/);
  assert.match(markup, />No matching loaded records</);
  assert.match(markup, />Load more records or change search\.</);
});

test("relationship graph supports one auxiliary inspector without a selection", () => {
  const auxiliaryInspector = React.createElement(
    GraphInspector,
    { title: "Create record" },
    "Create form",
  );
  const markup = renderToStaticMarkup(
    React.createElement(RelationshipGraph, {
      "aria-label": "Create graph",
      auxiliaryInspector,
      columns: graphColumns(),
      relationships: [],
      selectedNodeId: null,
    }),
  );
  assert.match(markup, /<dialog[^>]*open=""/);
  assert.match(markup, />Create record<\/h2>/);

  assert.throws(
    () =>
      renderToStaticMarkup(
        React.createElement(RelationshipGraph, {
          "aria-label": "Conflicting inspector graph",
          auxiliaryInspector,
          columns: graphColumns(),
          inspector: React.createElement(
            GraphInspector,
            { title: "Selected record" },
            "Details",
          ),
          relationships: [],
          selectedNodeId: "record-a",
        }),
      ),
    /one auxiliary or selected-node inspector/,
  );
});

test("relationship graph ignores empty Boolean inspector nodes", () => {
  const selectedInspector = React.createElement(
    GraphInspector,
    { title: "Selected record" },
    "Selected details",
  );
  const auxiliaryInspector = React.createElement(
    GraphInspector,
    { title: "Create record" },
    "Create form",
  );
  const selectedMarkup = renderToStaticMarkup(
    React.createElement(RelationshipGraph, {
      "aria-label": "False auxiliary inspector graph",
      auxiliaryInspector: false,
      columns: graphColumns(),
      inspector: selectedInspector,
      relationships: [],
      selectedNodeId: "record-a",
    }),
  );
  const auxiliaryMarkup = renderToStaticMarkup(
    React.createElement(RelationshipGraph, {
      "aria-label": "False selected inspector graph",
      auxiliaryInspector,
      columns: graphColumns(),
      inspector: false,
      relationships: [],
      selectedNodeId: "record-a",
    }),
  );
  assert.match(selectedMarkup, />Selected record<\/h2>/);
  assert.match(auxiliaryMarkup, />Create record<\/h2>/);
});

test("relationship graph keeps legacy selected-node inspector safety", () => {
  const inspector = React.createElement(
    GraphInspector,
    { title: "Selected record" },
    "Details",
  );
  const selectedMarkup = renderToStaticMarkup(
    React.createElement(RelationshipGraph, {
      "aria-label": "Selected graph",
      columns: graphColumns(),
      inspector,
      relationships: [],
      selectedNodeId: "record-a",
    }),
  );
  const missingMarkup = renderToStaticMarkup(
    React.createElement(RelationshipGraph, {
      "aria-label": "Missing selection graph",
      columns: graphColumns(),
      inspector,
      relationships: [],
      selectedNodeId: "missing",
    }),
  );
  assert.match(selectedMarkup, /<dialog/);
  assert.doesNotMatch(missingMarkup, /<dialog/);
});
