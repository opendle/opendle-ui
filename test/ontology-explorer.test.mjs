import { strict as assert } from "node:assert";
import { readFile } from "node:fs/promises";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import {
  BoundedDataExplorer,
  Button,
  ChangeTimeline,
  ExplorerState,
  ExplorerWorkspace,
  ManagedFileList,
  MetadataBagList,
  OntologyInheritanceTree,
  SavedViewCanvas,
  formatOntologyFileSize,
  moveCanvasPosition,
} from "../dist/index.js";

const records = [
  {
    kind: "object",
    key: "project-1",
    type: "project",
    displayTitle: "Shared explorer",
    labels: ["active", "shared"],
    properties: {
      summary: [{ value: "Reusable current state" }],
    },
    timestamps: {
      createdAt: "2026-08-24T11:00:00Z",
      updatedAt: "2026-08-24T12:00:00Z",
    },
  },
  {
    kind: "link",
    key: "project-owner",
    type: "owns",
    displayTitle: "Project owner",
    labels: [],
    properties: {},
    timestamps: {
      createdAt: "2026-08-24T11:01:00Z",
      updatedAt: "2026-08-24T12:01:00Z",
    },
  },
];

test("bounded data explorer renders contract-shaped current records", () => {
  const markup = renderToStaticMarkup(
    React.createElement(BoundedDataExplorer, {
      actions: React.createElement(Button, null, "Add record"),
      description: "One bounded page.",
      empty: "No current records.",
      items: records,
      onSelect: () => undefined,
      selectedKey: "project-1",
      title: "Workspace records",
    }),
  );
  assert.match(markup, /class="od-data-explorer"/);
  assert.match(markup, /<table class="od-data-explorer-table">/);
  assert.match(markup, /aria-pressed="true"/);
  assert.match(markup, /data-label="Properties">1/);
  assert.match(markup, /<li>active<\/li>/);
  assert.doesNotMatch(markup, /service.?key|authorization|query/i);
});

test("bounded data explorer rejects an over-limit or ambiguous page", () => {
  const tooMany = Array.from({ length: 201 }, (_, index) => ({
    ...records[0],
    key: `record-${String(index)}`,
  }));
  assert.throws(
    () =>
      renderToStaticMarkup(
        React.createElement(BoundedDataExplorer, {
          items: tooMany,
          title: "Too many",
        }),
      ),
    /at most 200/,
  );
  assert.throws(
    () =>
      renderToStaticMarkup(
        React.createElement(BoundedDataExplorer, {
          items: [records[0], records[0]],
          title: "Duplicates",
        }),
      ),
    /duplicate identifiers/,
  );
  assert.throws(
    () =>
      renderToStaticMarkup(
        React.createElement(BoundedDataExplorer, {
          items: [{ ...records[0], displayTitle: "bad\0title" }],
          title: "Invalid text",
        }),
      ),
    /without NUL/,
  );
  assert.throws(
    () =>
      renderToStaticMarkup(
        React.createElement(BoundedDataExplorer, {
          items: [{ ...records[0], displayTitle: "bad\ud800title" }],
          title: "Invalid scalar text",
        }),
      ),
    /Unicode scalar values/,
  );
  assert.throws(
    () =>
      renderToStaticMarkup(
        React.createElement(BoundedDataExplorer, {
          items: [
            {
              ...records[0],
              properties: Object.fromEntries(
                Array.from({ length: 2001 }, (_, index) => [
                  `property_${String(index)}`,
                  [],
                ]),
              ),
            },
          ],
          title: "Too many properties",
        }),
      ),
    /at most 2000/,
  );
  assert.doesNotThrow(() =>
    renderToStaticMarkup(
      React.createElement(BoundedDataExplorer, {
        items: [{ ...records[0], labels: ["😀".repeat(200)] }],
        title: "Unicode scalar length",
      }),
    ),
  );
});

test("record timestamps and occurrence context match the wire contract", () => {
  const renderRecord = (record) =>
    renderToStaticMarkup(
      React.createElement(BoundedDataExplorer, {
        items: [record],
        title: "Timestamp validation",
      }),
    );
  for (const invalid of [
    "2026-02-29T12:00:00Z",
    "2026-08-24T24:00:00Z",
    "2026-08-24T12:00:00+24:00",
  ]) {
    assert.throws(
      () =>
        renderRecord({
          ...records[0],
          timestamps: {
            createdAt: invalid,
            updatedAt: "2026-08-24T12:00:00Z",
          },
        }),
      /valid RFC 3339 date-time/,
    );
  }
  assert.doesNotThrow(() =>
    renderRecord({
      ...records[0],
      properties: {
        summary: [
          {
            value: "Current data",
            bagId: "bag-1",
            createdAt: "2024-02-29T12:00:00.125+05:30",
            updatedAt: "2026-08-24t12:00:00.5z",
          },
        ],
      },
      timestamps: {
        createdAt: "2024-02-29T12:00:00.125+05:30",
        updatedAt: "2026-08-24t12:00:00.5z",
      },
    }),
  );
  assert.throws(
    () =>
      renderRecord({
        ...records[0],
        properties: {
          summary: [
            { value: "Current data", createdAt: "2026-08-24T12:00:00Z" },
          ],
        },
      }),
    /both present or both absent/,
  );
  assert.throws(
    () =>
      renderRecord({
        ...records[0],
        properties: {
          summary: [{ value: "Current data", bagId: "bad\0bag" }],
        },
      }),
    /without NUL/,
  );
});

test("explorer workspace exposes navigation and all recoverable states", () => {
  const workspace = renderToStaticMarkup(
    React.createElement(
      ExplorerWorkspace,
      {
        activeItem: "records",
        description: "Current authorized workspace data.",
        inspector: React.createElement("p", null, "Selected record"),
        navigationItems: [
          { id: "records", label: "Records", count: 2 },
          { id: "files", label: "Files", count: 1 },
        ],
        navigationLabel: "Data areas",
        onSelect: () => undefined,
        title: "Data explorer",
      },
      React.createElement("p", null, "Current records"),
    ),
  );
  assert.match(workspace, /<nav aria-label="Data areas"/);
  assert.match(workspace, /aria-current="page"/);
  assert.match(workspace, /aria-label="Selected item details"/);

  for (const state of [
    "loading",
    "empty",
    "error",
    "stale",
    "offline",
    "recovering",
  ]) {
    const markup = renderToStaticMarkup(
      React.createElement(ExplorerState, {
        action: React.createElement(Button, null, "Recover"),
        description: `${state} detail`,
        state,
        title: `${state} state`,
      }),
    );
    assert.match(markup, new RegExp(`data-state="${state}"`));
    assert.match(markup, /aria-live=/);
    if (state === "loading" || state === "recovering") {
      assert.match(markup, /aria-busy="true"/);
    }
  }
});

test("saved view canvas renders only internal links and finite positions", () => {
  const objects = [
    { ...records[0], kind: "object" },
    {
      ...records[0],
      key: "person-1",
      type: "person",
      displayTitle: "Owner",
      kind: "object",
    },
  ];
  const links = [
    {
      ...records[1],
      direction: "a_to_b",
      endpointA: "person-1",
      endpointB: "project-1",
      kind: "link",
    },
  ];
  const positions = [
    { objectKey: "person-1", x: 24, y: 36 },
    { objectKey: "project-1", x: 260, y: 180 },
  ];
  const markup = renderToStaticMarkup(
    React.createElement(SavedViewCanvas, {
      "aria-label": "Saved project view",
      canvasHeight: 500,
      canvasWidth: 720,
      links,
      objects,
      onPositionChange: () => undefined,
      onSelect: () => undefined,
      positions,
      selectedKey: "project-1",
    }),
  );
  assert.match(markup, /class="od-graph-workspace od-saved-view-canvas"/);
  assert.match(markup, /Saved view with 2 objects and 1 links/);
  assert.match(markup, /Drag it or use arrow keys to move it/);
  assert.match(markup, /aria-label="Open Project owner"/);
  assert.match(markup, /A → B/);

  assert.deepEqual(
    moveCanvasPosition(positions[0], "ArrowLeft", {
      maximumX: 500,
      maximumY: 400,
      step: 36,
    }),
    { objectKey: "person-1", x: 0, y: 36 },
  );
  assert.throws(
    () =>
      renderToStaticMarkup(
        React.createElement(SavedViewCanvas, {
          canvasHeight: 500,
          canvasWidth: 720,
          links: [{ ...links[0], endpointB: "hidden-object" }],
          objects,
          positions,
        }),
      ),
    /endpoint is absent/,
  );
  assert.throws(
    () =>
      renderToStaticMarkup(
        React.createElement(SavedViewCanvas, {
          canvasHeight: Number.NaN,
          canvasWidth: 720,
          links,
          objects,
          positions,
        }),
      ),
    /finite number/,
  );
  assert.throws(
    () =>
      moveCanvasPosition(
        { objectKey: "person-1", x: Number.NaN, y: 10 },
        "ArrowRight",
        { maximumX: 500, maximumY: 400 },
      ),
    /finite number/,
  );
});

test("current-state timeline does not claim a durable event history", () => {
  const markup = renderToStaticMarkup(
    React.createElement(ChangeTimeline, {
      description: "Current records updated after the selected point.",
      items: [
        { kind: "object", record: records[0] },
        {
          kind: "metadata_bag",
          bag: {
            id: "bag-1",
            source: "Workspace form",
            createdAt: "2026-08-24T11:02:00Z",
            updatedAt: "2026-08-24T12:02:00Z",
          },
        },
      ],
      onSelect: () => undefined,
      title: "Current changes",
    }),
  );
  assert.match(markup, /aria-label="Current changed records"/);
  assert.match(markup, /Metadata bag/);
  assert.match(markup, /dateTime="2026-08-24T12:02:00Z"/);
  assert.doesNotMatch(markup, /deleted|old value|changed field|consumer/i);
});

test("ontology inheritance view has a top-to-bottom graph and phone list", () => {
  const definitions = [
    {
      apiName: "entity",
      title: "Entity",
      parentTypes: [],
      inherited: true,
    },
    {
      apiName: "project",
      title: "Project",
      parentTypes: ["entity"],
    },
    {
      apiName: "archived_project",
      title: "Archived project",
      parentTypes: ["project"],
      deprecated: true,
    },
  ];
  const markup = renderToStaticMarkup(
    React.createElement(OntologyInheritanceTree, {
      definitions,
      onSelect: () => undefined,
      selectedApiName: "project",
      title: "Object type inheritance",
    }),
  );
  assert.match(markup, /Top-to-bottom ontology inheritance graph/);
  assert.match(markup, /Inherited type/);
  assert.match(markup, /Deprecated type/);
  assert.match(markup, /Parents: project/);
  assert.throws(
    () =>
      renderToStaticMarkup(
        React.createElement(OntologyInheritanceTree, {
          definitions: [{ ...definitions[1], parentTypes: ["absent"] }],
          title: "Invalid inheritance",
        }),
      ),
    /parent type is absent/,
  );
  assert.doesNotThrow(() =>
    renderToStaticMarkup(
      React.createElement(OntologyInheritanceTree, {
        definitions: Array.from({ length: 201 }, (_, index) => ({
          apiName: `type_${String(index)}`,
          title: `Type ${String(index)}`,
          parentTypes: [],
        })),
        title: "Contract-sized inheritance",
      }),
    ),
  );
  assert.throws(
    () =>
      renderToStaticMarkup(
        React.createElement(OntologyInheritanceTree, {
          definitions: [
            { apiName: "first", title: "First", parentTypes: ["second"] },
            { apiName: "second", title: "Second", parentTypes: ["first"] },
          ],
          title: "Cyclic inheritance",
        }),
      ),
    /cycle/,
  );
});

test("metadata and file views render bounded contract metadata and transfer states", () => {
  const bags = renderToStaticMarkup(
    React.createElement(MetadataBagList, {
      bags: [
        {
          id: "bag-1",
          source: "Field report",
          location: { latitude: 48.85, longitude: 2.35 },
          at: "2026-08-24T12:00:00Z",
          createdAt: "2026-08-24T11:00:00Z",
          updatedAt: "2026-08-24T12:00:00Z",
        },
      ],
      onSelect: () => undefined,
      title: "Metadata bags",
    }),
  );
  assert.match(bags, /Open metadata bag Field report/);
  assert.match(bags, /48.85, 2.35/);

  const files = renderToStaticMarkup(
    React.createElement(ManagedFileList, {
      items: [
        {
          metadata: {
            fileId: "file-1",
            name: "résumé.pdf",
            mediaType: "application/pdf",
            size: 2048,
            sha256: "a".repeat(64),
            createdAt: "2026-08-24T12:00:00Z",
          },
          message: "Downloading current bytes",
          progress: 65,
          state: "downloading",
        },
      ],
      onSelect: () => undefined,
      title: "Files",
    }),
  );
  assert.match(files, /résumé.pdf/);
  assert.match(files, /2.0 kB/);
  assert.match(files, /<progress aria-label="résumé.pdf transfer progress"/);
  assert.match(files, /SHA-256/);
  assert.match(files, /dateTime="2026-08-24T12:00:00Z"/);
  assert.equal(formatOntologyFileSize(1_500_000), "1.5 MB");
  assert.throws(
    () =>
      renderToStaticMarkup(
        React.createElement(ManagedFileList, {
          items: [
            {
              metadata: {
                fileId: "file-1",
                name: "bad.bin",
                mediaType: "application/octet-stream",
                size: 10,
                sha256: "BAD",
                createdAt: "2026-08-24T12:00:00Z",
              },
            },
          ],
          title: "Invalid files",
        }),
      ),
    /lowercase hexadecimal/,
  );
  const indeterminate = renderToStaticMarkup(
    React.createElement(ManagedFileList, {
      items: [
        {
          metadata: {
            fileId: "file-2",
            name: "pending.pdf",
            mediaType: "application/pdf",
            size: 0,
            sha256: "b".repeat(64),
            createdAt: "2026-08-24T12:00:00Z",
          },
          state: "uploading",
        },
      ],
      title: "Pending files",
    }),
  );
  assert.match(
    indeterminate,
    /<progress aria-label="pending.pdf transfer progress" max="100">/,
  );
  assert.doesNotMatch(indeterminate, /<progress[^>]+value=/);
  assert.throws(
    () =>
      renderToStaticMarkup(
        React.createElement(MetadataBagList, {
          bags: [
            {
              id: "bag-2",
              at: "2026-04-31T12:00:00Z",
              createdAt: "2026-08-24T12:00:00Z",
              updatedAt: "2026-08-24T12:00:00Z",
            },
          ],
          title: "Invalid bag time",
        }),
      ),
    /valid RFC 3339 date-time/,
  );
  assert.throws(
    () =>
      renderToStaticMarkup(
        React.createElement(ManagedFileList, {
          items: [
            {
              metadata: {
                fileId: "file-3",
                name: "invalid-time.pdf",
                mediaType: "application/pdf",
                size: 0,
                sha256: "c".repeat(64),
                createdAt: "2026-08-24 12:00:00Z",
              },
            },
          ],
          title: "Invalid file time",
        }),
      ),
    /valid RFC 3339 date-time/,
  );
});

test("shared explorer CSS contains focus, touch, reflow, and motion controls", async () => {
  const css = await readFile(
    new URL("../styles/tokens.css", import.meta.url),
    "utf8",
  );
  assert.match(css, /button:focus-visible/);
  assert.match(css, /min-height: 2\.75rem/);
  assert.match(css, /\.od-button\s*\{[^}]*min-height: 2\.75rem;/s);
  assert.match(
    css,
    /\.od-data-explorer-open span,[^}]*\.od-label-list-empty\s*\{[^}]*color: var\(--od-color-muted-strong\);/s,
  );
  assert.match(
    css,
    /@media \(max-width: 48rem\)[^]*\.od-media-lightbox\s*\{[^}]*width: 100vw;[^}]*height: 100dvh;/s,
  );
  assert.match(css, /@media \(max-width: 48rem\)/);
  assert.match(css, /\.od-data-explorer-table td::before/);
  assert.match(
    css,
    /\.od-data-explorer-table thead\s*\{[^}]*position: absolute;[^}]*clip: rect\(0 0 0 0\);/s,
  );
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /\.od-ontology-tree-graph\s*\{\s*display: none;/);
  assert.match(
    css,
    /\.od-saved-view-canvas \.od-graph-node\s*\{\s*touch-action: none;/,
  );
});
