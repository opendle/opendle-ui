import { strict as assert } from "node:assert";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import AxeBuilder from "@axe-core/playwright";
import { chromium } from "@playwright/test";
import { build } from "esbuild";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));
const fixtureSource = String.raw`
import React, { StrictMode, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Button, GraphInspector, RelationshipGraph } from "./dist/index.js";

const longLabel = "Record Alpha with a deliberately long label that must wrap inside its local node without increasing the page width";
const longToolbarLabel = "Context-" + "unbroken".repeat(18);
const baseColumns = [
  {
    id: "sources",
    label: "Sources",
    nodes: [
      { id: "source-a", label: "Source A", detail: "Cloud source" },
      { id: "source-b", label: "Source B", detail: "Local source" },
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
        searchText: ["collection"],
        rows: [
          { id: "record-a", label: longLabel, searchText: ["alpha"] },
          { id: "record-b", label: "Record Beta", state: "disabled" },
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
        rows: [
          { id: "target-a", label: "Target One", state: "invalid", stateLabel: "Route invalid" },
          { id: "target-b", label: "Target Two" },
          { id: "target-c", label: "Target Three" },
        ],
      },
    ],
  },
];
const relationships = [
  { id: "source-a-record-a", sourceId: "source-a", targetId: "record-a", label: "source link", accessibleLabel: "Source A supplies Record Alpha" },
  { id: "source-b-record-b", sourceId: "source-b", targetId: "record-b", label: "source link", accessibleLabel: "Source B supplies Record Beta" },
  { id: "record-a-target-a", sourceId: "record-a", targetId: "target-a", invalid: true, invalidLabel: "invalid route", accessibleLabel: "Record Alpha is the first target route" },
  { id: "record-a-target-b", sourceId: "record-a", targetId: "target-b", label: "target route", accessibleLabel: "Record Alpha is the second target route" },
  { id: "record-b-target-c", sourceId: "record-b", targetId: "target-c", label: "target route", accessibleLabel: "Record Beta is the third target route" },
];

function Fixture({ empty = false }) {
  const [selectedId, setSelectedId] = useState(null);
  const [inspectorState, setInspectorState] = useState(null);
  const [query, setQuery] = useState("");
  const [partialLoaded, setPartialLoaded] = useState(true);
  const [showAlpha, setShowAlpha] = useState(true);
  const [toolbarMode, setToolbarMode] = useState("all");
  const returnFocusRef = useRef(null);
  function openCreate(label, trigger) {
    returnFocusRef.current = trigger;
    setSelectedId(null);
    setInspectorState({ kind: "create", id: label.toLowerCase().replace(" ", "-"), label });
  }
  const visibleColumns = baseColumns.map((column) => {
    const itemLabel =
      column.id === "records"
        ? "mapping"
        : column.label.slice(0, -1).toLowerCase();
    return {
      ...column,
      actions: (
        <Button
          type="button"
          variant="secondary"
          onClick={(event) =>
            openCreate("Create " + itemLabel, event.currentTarget)
          }
        >
          Create {itemLabel}
        </Button>
      ),
      partialResult:
        !empty && partialLoaded && column.id === "records"
          ? {
              action: <Button type="button" variant="secondary">Load more records</Button>,
              label: "Partial records",
            }
          : undefined,
      nodes: empty
        ? []
        : showAlpha
          ? column.nodes
          : column.nodes.map((node) =>
              "rows" in node
                ? {
                    ...node,
                    rows: node.rows.filter((row) => row.id !== "record-a"),
                  }
                : node,
            ),
    };
  });
  const visibleRelationships = empty
    ? []
    : showAlpha
    ? relationships
    : relationships.filter(
        (relationship) =>
          relationship.sourceId !== "record-a" &&
          relationship.targetId !== "record-a",
      );
  const inspector = inspectorState?.kind === "node" ? (
    <GraphInspector
      activationKey={inspectorState.node.id}
      onClose={() => setInspectorState(null)}
      returnFocusRef={returnFocusRef}
      title={inspectorState.node.label}
    >
      <p>Host-owned inspector content for {inspectorState.node.label}.</p>
    </GraphInspector>
  ) : null;
  const auxiliaryInspector = inspectorState?.kind === "create" ? (
    <GraphInspector
      activationKey={inspectorState.id}
      onClose={() => setInspectorState(null)}
      returnFocusRef={returnFocusRef}
      title={inspectorState.label}
    >
      <p>Host-owned create form with no selected graph node.</p>
      {Array.from({ length: 18 }, (_, index) => (
        <label key={index}>
          Field {index + 1}
          <input defaultValue={"Value " + String(index + 1)} />
        </label>
      ))}
    </GraphInspector>
  ) : null;
  window.setRelationshipGraphQuery = setQuery;
  window.setRelationshipGraphPartial = setPartialLoaded;
  window.setRelationshipToolbarMode = setToolbarMode;
  return (
    <main>
      <h1>Relationship graph browser check</h1>
      {empty ? null : (
        <Button type="button" variant="secondary" onClick={() => setShowAlpha(false)}>
          Remove selected record
        </Button>
      )}
      <RelationshipGraph
        aria-label="Example relationship graph"
        auxiliaryInspector={auxiliaryInspector}
        columns={visibleColumns}
        emptyState="Create the first relationship record."
        inspector={inspector}
        onNodeActivate={({ node, trigger }) => {
          returnFocusRef.current = trigger;
          setInspectorState({ kind: "node", node });
        }}
        onSelectionChange={setSelectedId}
        onSearchQueryChange={setQuery}
        partialNoResultsDescription="Load more records or change search."
        partialNoResultsTitle="No matching loaded records"
        relationships={visibleRelationships}
        searchQuery={query}
        selectedNodeId={selectedId}
        toolbar={
          toolbarMode === "search"
            ? {}
            : {
                leading: (
                  <Button type="button" variant="secondary">
                    {longToolbarLabel}
                  </Button>
                ),
                actions: (
                  <Button type="button" variant="secondary">
                    {"Refresh-" + "unbroken".repeat(18)}
                  </Button>
                ),
              }
        }
      />
    </main>
  );
}

const secondColumns = [
  { id: "second-sources", label: "Second sources", nodes: [{ id: "second-source", label: "Second source" }] },
  { id: "second-records", label: "Second records", nodes: [{ id: "second-record", label: "Second record" }] },
  { id: "second-targets", label: "Second targets", nodes: [{ id: "second-target", label: "Second target" }] },
];
const secondRelationships = [
  { id: "second-source-record", sourceId: "second-source", targetId: "second-record" },
  { id: "second-record-target", sourceId: "second-record", targetId: "second-target" },
];

function MultipleGraphsFixture() {
  return (
    <main>
      <h1>Multiple relationship graphs</h1>
      <RelationshipGraph aria-label="First relationship graph" columns={baseColumns} relationships={relationships} searchLabel="Search first graph" />
      <RelationshipGraph aria-label="Second relationship graph" columns={secondColumns} relationships={secondRelationships} searchLabel="Search second graph" />
    </main>
  );
}

const nonActionableColumns = [
  {
    id: "referenced-sources",
    label: "Referenced sources",
    nodes: [{ id: "referenced-source", label: "Referenced source" }],
  },
  {
    id: "referenced-records",
    label: "Referenced records",
    nodes: [
      {
        id: "unavailable-records",
        label: "Unavailable referenced records",
        headerActionable: false,
        rowsLabel: "Referenced rows",
        state: "unavailable",
        detail: "The host cannot act on this group header.",
        rows: [
          { id: "referenced-row-a", label: "Referenced row A" },
          { id: "referenced-row-b", label: "Referenced row B" },
        ],
      },
    ],
  },
  {
    id: "referenced-targets",
    label: "Referenced targets",
    nodes: [
      { id: "referenced-target-a", label: "Referenced target A" },
      { id: "referenced-target-b", label: "Referenced target B" },
    ],
  },
];
const nonActionableRelationships = [
  { id: "referenced-source-row-a", sourceId: "referenced-source", targetId: "referenced-row-a" },
  { id: "referenced-row-a-target-a", sourceId: "referenced-row-a", targetId: "referenced-target-a" },
  { id: "referenced-row-b-target-b", sourceId: "referenced-row-b", targetId: "referenced-target-b" },
];

function NonActionableGroupFixture() {
  const [query, setQuery] = useState("");
  return (
    <main>
      <h1>Non-actionable relationship group</h1>
      <RelationshipGraph
        aria-label="Non-actionable relationship graph"
        columns={nonActionableColumns}
        onSearchQueryChange={setQuery}
        relationships={nonActionableRelationships}
        searchQuery={query}
      />
    </main>
  );
}

const fixtureRoot = createRoot(document.getElementById("root"));
fixtureRoot.render(<StrictMode><Fixture /></StrictMode>);
window.showMultipleRelationshipGraphs = () => fixtureRoot.render(<StrictMode><MultipleGraphsFixture /></StrictMode>);
window.showEmptyRelationshipGraph = () => fixtureRoot.render(<StrictMode><Fixture empty /></StrictMode>);
window.showNonActionableRelationshipGraph = () => fixtureRoot.render(<StrictMode><NonActionableGroupFixture /></StrictMode>);
`;

const bundle = await build({
  bundle: true,
  format: "iife",
  jsx: "automatic",
  logLevel: "silent",
  platform: "browser",
  stdin: {
    contents: fixtureSource,
    loader: "jsx",
    resolveDir: repositoryRoot,
    sourcefile: "relationship-graph-browser-fixture.jsx",
  },
  write: false,
});
const browserScript = bundle.outputFiles[0]?.text;
assert.ok(
  browserScript,
  "The relationship graph fixture must build one script.",
);
const css = await readFile(
  new URL("../styles/tokens.css", import.meta.url),
  "utf8",
);
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Relationship graph test</title><style>${css}*{box-sizing:border-box}body{margin:0;background:var(--od-color-background);color:var(--od-color-foreground)}main{width:100%;min-width:0;padding:var(--od-page-gutter)}h1{font-size:1.25rem}</style></head><body><div id="root"></div></body></html>`;
const systemChrome = "/usr/bin/google-chrome";
const browser = await chromium.launch({
  executablePath: existsSync(systemChrome) ? systemChrome : undefined,
  headless: true,
});

function node(page, id) {
  return page.locator(`[data-node-id="${id}"]`);
}

function activeElementIs(locator) {
  return locator.evaluate((element) => element === document.activeElement);
}

function waitForInspectorFocusCleanup(page) {
  return page.evaluate(
    () =>
      new Promise((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(resolve);
        });
      }),
  );
}

async function loadFixture(page) {
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setContent(html);
  await page.addScriptTag({ content: browserScript });
  await page
    .getByRole("region", { name: "Example relationship graph viewport" })
    .waitFor();
  await page.waitForFunction(
    () =>
      document.querySelectorAll(".od-relationship-graph-connector").length ===
      5,
  );
  return errors;
}

async function assertNoPageOverflow(page, message) {
  const geometry = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  assert.equal(
    geometry.scrollWidth <= geometry.clientWidth,
    true,
    `${message}: ${JSON.stringify(geometry)}`,
  );
}

try {
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const desktop = await desktopContext.newPage();
  const desktopErrors = await loadFixture(desktop);
  assert.equal(
    await desktop.locator(".od-relationship-graph-column").count(),
    3,
  );
  assert.equal(await desktop.locator(".od-relationship-graph-node").count(), 9);
  assert.equal(
    await desktop.locator(".od-relationship-graph-node[tabindex='0']").count(),
    1,
  );
  assert.equal(
    await desktop
      .locator(".od-relationship-graph-connectors[aria-hidden='true']")
      .count(),
    1,
  );
  assert.match(
    await node(desktop, "target-a").getAttribute("aria-label"),
    /Route invalid/,
  );
  assert.match(
    await node(desktop, "record-a").getAttribute("aria-label"),
    /first target route/,
  );
  assert.equal(
    await desktop
      .locator(
        ".od-relationship-graph-group[data-group-id='record-group'] [data-node-id='record-a']",
      )
      .count(),
    1,
    "A nested row must stay in its labelled compound group.",
  );

  const exactConnectorGeometry = await desktop
    .locator("[data-relationship-id='record-a-target-b']")
    .evaluate((connector) => {
      const board = connector.closest(".od-relationship-graph-board");
      const target = board?.querySelector("[data-node-id='target-b']");
      const boardBounds = board?.getBoundingClientRect();
      const targetBounds = target?.getBoundingClientRect();
      const coordinates = connector
        .getAttribute("d")
        ?.trim()
        .split(/[ ,]/u)
        .filter(Boolean)
        .slice(-2)
        .map(Number);
      return {
        expectedX: (targetBounds?.left ?? 0) - (boardBounds?.left ?? 0),
        expectedY:
          (targetBounds?.top ?? 0) +
          (targetBounds?.height ?? 0) / 2 -
          (boardBounds?.top ?? 0),
        targetId: connector.getAttribute("data-target-node-id"),
        x: coordinates?.[0] ?? Number.NaN,
        y: coordinates?.[1] ?? Number.NaN,
      };
    });
  assert.equal(exactConnectorGeometry.targetId, "target-b");
  assert.equal(
    Math.abs(exactConnectorGeometry.x - exactConnectorGeometry.expectedX) < 1 &&
      Math.abs(exactConnectorGeometry.y - exactConnectorGeometry.expectedY) < 1,
    true,
    `A connector must end at its exact nested row: ${JSON.stringify(exactConnectorGeometry)}`,
  );

  const columnPositions = await desktop
    .locator(".od-relationship-graph-column")
    .evaluateAll((elements) =>
      elements.map((element) => element.getBoundingClientRect().left),
    );
  assert.equal(
    columnPositions[0] < columnPositions[1] &&
      columnPositions[1] < columnPositions[2],
    true,
  );
  const readableColumns = await desktop
    .locator(".od-relationship-graph-column")
    .evaluateAll((elements) =>
      elements.every((element) => {
        const heading = element.querySelector("h2");
        return (
          element.getBoundingClientRect().width >= 240 &&
          (heading?.scrollWidth ?? 0) <= (heading?.clientWidth ?? 0)
        );
      }),
    );
  assert.equal(
    readableColumns,
    true,
    "Wide columns and their headings must stay readable without clipping.",
  );

  const graphViewport = desktop.getByRole("region", {
    name: "Example relationship graph viewport",
  });
  const graphToolbar = desktop.locator(".od-relationship-graph-toolbar");
  assert.equal(await graphToolbar.count(), 1);
  assert.equal(
    await graphToolbar.locator(":scope > div").count(),
    3,
    "The complete toolbar must render its three non-empty slots.",
  );
  const leadingToolbarAction = desktop.getByRole("button", {
    name: /^Context-unbroken/,
  });
  const toolbarSearch = desktop.getByRole("searchbox", {
    name: "Search graph",
  });
  const trailingToolbarAction = desktop.getByRole("button", {
    name: /^Refresh-unbroken/,
  });
  await leadingToolbarAction.focus();
  await desktop.keyboard.press("Tab");
  assert.equal(await activeElementIs(toolbarSearch), true);
  await desktop.keyboard.press("Tab");
  assert.equal(await activeElementIs(trailingToolbarAction), true);
  const viewportWidthBeforeInspector = await graphViewport.evaluate(
    (element) => element.getBoundingClientRect().width,
  );
  const createMapping = desktop.getByRole("button", {
    name: "Create mapping",
  });
  await createMapping.click();
  const createInspector = desktop.getByRole("dialog", {
    name: "Create mapping",
  });
  await createInspector.waitFor();
  assert.equal(
    await activeElementIs(
      createInspector.getByRole("button", { name: "Close inspector" }),
    ),
    true,
    "An auxiliary inspector must receive initial focus.",
  );
  assert.equal(
    await desktop
      .locator(".od-relationship-graph-node[aria-pressed='true']")
      .count(),
    0,
    "An auxiliary inspector must not require a selected node.",
  );
  const desktopInspectorGeometry = await createInspector.evaluate((element) => {
    const graph = element.closest(".od-relationship-graph");
    const inspectorBounds = element.getBoundingClientRect();
    const graphBounds = graph?.getBoundingClientRect();
    return {
      graphRight: graphBounds?.right ?? 0,
      inspectorLeft: inspectorBounds.left,
      inspectorRight: inspectorBounds.right,
    };
  });
  assert.equal(
    desktopInspectorGeometry.inspectorLeft > 1440 / 2 &&
      Math.abs(
        desktopInspectorGeometry.graphRight -
          desktopInspectorGeometry.inspectorRight,
      ) < 24,
    true,
    "A desktop relationship inspector must use the right-side slot.",
  );
  assert.equal(
    await graphViewport.evaluate(
      (element) => element.getBoundingClientRect().width,
    ),
    viewportWidthBeforeInspector,
    "An inspector must not change the graph width.",
  );
  await desktop.keyboard.press("Escape");
  await createInspector.waitFor({ state: "detached" });
  assert.equal(
    await activeElementIs(createMapping),
    true,
    "Escape must return focus to the exact create action.",
  );

  await createMapping.click();
  await createInspector.waitFor();
  await node(desktop, "record-b").click();
  const replacementInspector = desktop.getByRole("dialog", {
    name: "Record Beta",
  });
  await replacementInspector.waitFor();
  assert.equal(
    await activeElementIs(
      replacementInspector.getByRole("button", { name: "Close inspector" }),
    ),
    true,
    "A create-to-detail replacement must keep focus in the inspector slot.",
  );
  await desktop.keyboard.press("Escape");
  await replacementInspector.waitFor({ state: "detached" });
  assert.equal(
    await activeElementIs(node(desktop, "record-b")),
    true,
    "A replacement inspector must return focus to the exact node trigger.",
  );

  await node(desktop, "source-a").hover();
  assert.equal(
    await desktop
      .locator(".od-relationship-graph-node[data-active='true']")
      .count(),
    6,
  );
  assert.equal(
    await desktop
      .locator(".od-relationship-graph-node[data-dimmed='true']")
      .count(),
    3,
  );
  assert.equal(
    await desktop
      .locator(".od-relationship-graph-connector[data-active='true']")
      .count(),
    3,
  );
  await desktop.mouse.move(2, 2);

  await node(desktop, "source-a").focus();
  assert.equal(
    await desktop
      .locator(".od-relationship-graph-node[data-active='true']")
      .count(),
    6,
  );
  await desktop.keyboard.press("ArrowDown");
  assert.equal(await activeElementIs(node(desktop, "source-b")), true);
  await desktop.keyboard.press("ArrowRight");
  assert.equal(await activeElementIs(node(desktop, "record-b")), true);
  await desktop.keyboard.press("ArrowRight");
  assert.equal(await activeElementIs(node(desktop, "target-c")), true);
  await desktop.keyboard.press("ArrowLeft");
  assert.equal(await activeElementIs(node(desktop, "record-b")), true);
  await desktop.keyboard.press("Home");
  assert.equal(await activeElementIs(node(desktop, "record-group")), true);
  await desktop.keyboard.press("ArrowRight");
  assert.equal(
    await activeElementIs(node(desktop, "record-group")),
    true,
    "A direction with no exact relationship must keep focus in place.",
  );
  await desktop.keyboard.press("ArrowDown");
  assert.equal(await activeElementIs(node(desktop, "record-a")), true);
  await desktop.keyboard.press("Enter");
  const enterInspector = desktop.getByRole("dialog", { name: /Record Alpha/ });
  await enterInspector.waitFor();
  await desktop.keyboard.press("Escape");
  await enterInspector.waitFor({ state: "detached" });
  await waitForInspectorFocusCleanup(desktop);
  assert.equal(await activeElementIs(node(desktop, "record-a")), true);
  await desktop.keyboard.press("End");
  assert.equal(
    await activeElementIs(node(desktop, "record-b")),
    true,
    `End must focus Record Beta, but focus is on ${await desktop.evaluate(
      () =>
        document.activeElement?.getAttribute("data-node-id") ??
        document.activeElement?.textContent,
    )}.`,
  );

  await node(desktop, "record-a").focus();
  await desktop.keyboard.press("Space");
  const inspector = desktop.getByRole("dialog", { name: /Record Alpha/ });
  await inspector.waitFor();
  assert.equal(
    await node(desktop, "record-a").getAttribute("aria-pressed"),
    "true",
  );
  await desktop.keyboard.press("Escape");
  await inspector.waitFor({ state: "detached" });
  assert.equal(await activeElementIs(node(desktop, "record-a")), true);
  assert.equal(
    await node(desktop, "record-a").getAttribute("aria-pressed"),
    "true",
  );

  await node(desktop, "source-a").hover();
  await node(desktop, "record-b").focus();
  await desktop.keyboard.press("End");
  assert.equal(
    await node(desktop, "record-b").getAttribute("data-active"),
    "true",
    "Keyboard navigation must take priority over a stale pointer position.",
  );
  assert.equal(
    await node(desktop, "source-a").getAttribute("data-active"),
    "false",
    "A hovered route must stop when keyboard focus moves to another route.",
  );
  await desktop.mouse.move(2, 2);

  await node(desktop, "record-a").focus();
  await desktop.evaluate(() => window.setRelationshipGraphQuery("beta"));
  await desktop.waitForFunction(
    () => document.activeElement?.getAttribute("data-node-id") === "record-b",
  );
  assert.equal(
    await desktop
      .locator(".od-relationship-graph-node[data-dimmed='true']")
      .count(),
    0,
    "A filtered focus target must not leave a stale dimmed route.",
  );
  await desktop.evaluate(() => window.setRelationshipGraphQuery(""));

  await desktop.locator("body").click({ position: { x: 1, y: 1 } });
  await desktop.keyboard.press("/");
  const search = desktop.getByRole("searchbox", { name: "Search graph" });
  assert.equal(await activeElementIs(search), true);
  await search.fill("beta");
  assert.equal(await desktop.locator(".od-relationship-graph-node").count(), 5);
  assert.equal(
    await node(desktop, "record-b").getAttribute("data-search-match"),
    "true",
  );
  assert.equal(
    await desktop.locator(".od-relationship-graph-connector").count(),
    2,
  );
  assert.equal(
    await desktop
      .locator(".od-relationship-graph-node[data-search-context='true']")
      .count(),
    4,
    "A direct nested-row match must keep its group and relationship context.",
  );
  await search.fill("record collection");
  assert.equal(await desktop.locator(".od-relationship-graph-node").count(), 9);
  assert.equal(
    await node(desktop, "record-group").getAttribute("data-search-match"),
    "true",
  );
  assert.equal(
    await node(desktop, "record-a").getAttribute("data-search-context"),
    "true",
  );
  await search.fill("missing");
  await desktop.waitForFunction(
    () => document.activeElement?.textContent === "Load more records",
  );
  assert.match(
    await desktop.locator("output.od-visually-hidden").textContent(),
    /No matching loaded records/,
    "A partial no-match must announce that only loaded records were searched.",
  );
  await desktop.evaluate(() => window.setRelationshipGraphPartial(false));
  await desktop.waitForFunction(
    () => document.activeElement?.textContent === "Clear search",
  );
  assert.match(
    await desktop.locator("output.od-visually-hidden").textContent(),
    /No matching items/,
    "A complete no-match must use the complete-result announcement.",
  );
  assert.equal(
    await desktop.locator(".od-relationship-graph-column").count(),
    3,
    "A no-result state must keep all three columns.",
  );
  assert.equal(
    await desktop
      .locator(".od-relationship-graph-column-actions button")
      .count(),
    3,
    "A no-result state must keep all supplied column actions.",
  );
  await desktop.getByRole("button", { name: "Clear search" }).first().click();
  assert.equal(await desktop.locator(".od-relationship-graph-node").count(), 9);
  assert.equal(
    await node(desktop, "record-a").getAttribute("aria-pressed"),
    "true",
  );
  assert.equal(
    await activeElementIs(node(desktop, "record-a")),
    true,
    "Clearing search must restore focus to the prior selected control.",
  );
  await desktop.evaluate(() => window.setRelationshipToolbarMode("search"));
  await desktop.waitForFunction(
    () =>
      document.querySelector(".od-relationship-graph-toolbar")?.children
        .length === 1,
  );
  assert.equal(
    await node(desktop, "record-a").getAttribute("aria-pressed"),
    "true",
    "A toolbar slot change must not reset graph selection.",
  );

  const longLabelFits = await node(desktop, "record-a").evaluate(
    (element) => element.scrollWidth <= element.clientWidth,
  );
  assert.equal(longLabelFits, true, "A long label must wrap inside its node.");
  await node(desktop, "record-a").click();
  await inspector.waitFor();
  await desktop.getByRole("button", { name: "Remove selected record" }).click();
  await inspector.waitFor({ state: "detached" });
  await node(desktop, "record-a").waitFor({ state: "detached" });
  await desktop.waitForFunction(
    () => document.activeElement?.getAttribute("data-node-id") === "source-a",
  );
  assert.match(
    await desktop.locator("output.od-visually-hidden").textContent(),
    /Record Alpha.*unavailable/,
  );
  assert.equal(
    await desktop
      .locator(".od-relationship-graph-node[aria-pressed='true']")
      .count(),
    0,
  );
  assert.deepEqual(
    (await new AxeBuilder({ page: desktop }).analyze()).violations,
    [],
    "The desktop relationship graph must have no automated accessibility violations.",
  );

  await desktop.evaluate(() => window.showNonActionableRelationshipGraph());
  const nonActionableGraph = desktop.getByRole("region", {
    name: "Non-actionable relationship graph viewport",
  });
  await nonActionableGraph.waitFor();
  const labelledGroup = desktop.getByRole("group", {
    exact: true,
    name: "Unavailable referenced records",
  });
  assert.equal(await labelledGroup.count(), 1);
  const groupSummary = desktop.locator(
    '[data-group-header-id="unavailable-records"]',
  );
  assert.equal(
    await groupSummary.evaluate((element) => element.tagName),
    "DIV",
  );
  assert.equal(await groupSummary.getAttribute("tabindex"), null);
  assert.equal(
    await desktop
      .getByRole("button", {
        exact: true,
        name: "Unavailable referenced records",
      })
      .count(),
    0,
    "A label-only group header must not be a button.",
  );
  assert.equal(
    await nonActionableGraph
      .locator('.od-relationship-graph-node[tabindex="0"]')
      .count(),
    1,
    "The label-only group must keep one graph tab stop.",
  );
  await node(desktop, "referenced-row-b").focus();
  await desktop.keyboard.press("Home");
  assert.equal(await activeElementIs(node(desktop, "referenced-row-a")), true);
  await desktop.keyboard.press("ArrowUp");
  assert.equal(await activeElementIs(node(desktop, "referenced-row-a")), true);
  await desktop.keyboard.press("ArrowDown");
  assert.equal(await activeElementIs(node(desktop, "referenced-row-b")), true);
  const nonActionableSearch = desktop.getByRole("searchbox", {
    name: "Search graph",
  });
  await nonActionableSearch.fill("unavailable referenced records");
  assert.equal(await groupSummary.getAttribute("data-search-match"), "true");
  assert.equal(
    await labelledGroup
      .locator(
        '[data-group-id="unavailable-records"][data-search-context="true"]',
      )
      .count(),
    2,
    "A group-label match must keep its nested actionable rows as context.",
  );
  assert.equal(await groupSummary.getAttribute("data-state"), "unavailable");
  assert.match(await groupSummary.textContent(), /Unavailable/);
  assert.deepEqual(
    (await new AxeBuilder({ page: desktop }).analyze()).violations,
    [],
    "The non-actionable group fixture must have no accessibility violations.",
  );

  await desktop.evaluate(() => window.showEmptyRelationshipGraph());
  await desktop.getByText("Create the first relationship record.").waitFor();
  assert.equal(
    await desktop.locator(".od-relationship-graph-column").count(),
    3,
    "An empty graph must keep all three columns.",
  );
  assert.equal(
    await desktop
      .locator(".od-relationship-graph-column-actions button")
      .count(),
    3,
    "An empty graph must keep all supplied column actions.",
  );
  assert.equal(await desktop.locator(".od-relationship-graph-node").count(), 0);
  const emptyCreateMapping = desktop.getByRole("button", {
    name: "Create mapping",
  });
  await emptyCreateMapping.click();
  const emptyCreateInspector = desktop.getByRole("dialog", {
    name: "Create mapping",
  });
  await emptyCreateInspector.waitFor();
  await desktop.keyboard.press("Escape");
  await emptyCreateInspector.waitFor({ state: "detached" });
  assert.equal(
    await activeElementIs(emptyCreateMapping),
    true,
    "An empty-graph inspector must return focus to its exact create action.",
  );
  const emptySearch = desktop.getByRole("searchbox", { name: "Search graph" });
  await emptySearch.fill("missing");
  await desktop.getByRole("button", { name: "Clear search" }).click();
  assert.equal(
    await activeElementIs(emptySearch),
    true,
    "Clearing an empty graph must return focus to its graph-owned search.",
  );

  await desktop.evaluate(() => window.showMultipleRelationshipGraphs());
  const secondGraph = desktop.getByRole("region", {
    name: "Second relationship graph viewport",
  });
  await secondGraph.waitFor();
  await desktop.evaluate(() => document.activeElement?.blur());
  await desktop.keyboard.press("/");
  assert.equal(
    await activeElementIs(
      desktop.getByRole("searchbox", { name: "Search first graph" }),
    ),
    true,
    "The first graph must own the shortcut when no graph contains focus.",
  );
  await secondGraph.locator("[data-node-id='second-source']").focus();
  await desktop.keyboard.press("/");
  assert.equal(
    await activeElementIs(
      desktop.getByRole("searchbox", { name: "Search second graph" }),
    ),
    true,
    "The focused graph must own the shortcut when several graphs exist.",
  );
  assert.deepEqual(desktopErrors, []);

  const overflowContext = await browser.newContext({
    viewport: { width: 800, height: 800 },
  });
  const overflowPage = await overflowContext.newPage();
  const overflowErrors = await loadFixture(overflowPage);
  const localOverflow = await overflowPage
    .getByRole("region", { name: "Example relationship graph viewport" })
    .evaluate((element) => element.scrollWidth > element.clientWidth);
  assert.equal(
    localOverflow,
    true,
    "A compact desktop must keep graph overflow in its viewport.",
  );
  const stableToolbarGeometry = await overflowPage.evaluate(() => {
    const toolbar = document.querySelector(".od-relationship-graph-toolbar");
    const viewport = document.querySelector(".od-relationship-graph-viewport");
    const before = toolbar?.getBoundingClientRect();
    if (viewport instanceof HTMLElement) viewport.scrollLeft = 120;
    const after = toolbar?.getBoundingClientRect();
    return {
      afterLeft: after?.left,
      afterTop: after?.top,
      beforeLeft: before?.left,
      beforeTop: before?.top,
      scrollLeft: viewport instanceof HTMLElement ? viewport.scrollLeft : 0,
    };
  });
  assert.equal(stableToolbarGeometry.scrollLeft > 0, true);
  assert.deepEqual(
    [stableToolbarGeometry.afterLeft, stableToolbarGeometry.afterTop],
    [stableToolbarGeometry.beforeLeft, stableToolbarGeometry.beforeTop],
    "Local graph scrolling must not move the toolbar.",
  );
  await assertNoPageOverflow(
    overflowPage,
    "The compact desktop page must not overflow",
  );
  assert.deepEqual(overflowErrors, []);

  const phoneContext = await browser.newContext({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  });
  const phone = await phoneContext.newPage();
  const phoneErrors = await loadFixture(phone);
  const phoneToolbarOrder = await phone
    .locator(".od-relationship-graph-toolbar > div")
    .evaluateAll((elements) =>
      elements.map((element) => ({
        className: element.className,
        top: element.getBoundingClientRect().top,
      })),
    );
  assert.deepEqual(
    phoneToolbarOrder.map(({ className }) => className),
    [
      "od-graph-toolbar-leading",
      "od-graph-toolbar-center",
      "od-graph-toolbar-actions",
    ],
  );
  assert.equal(
    phoneToolbarOrder[0].top < phoneToolbarOrder[1].top &&
      phoneToolbarOrder[1].top < phoneToolbarOrder[2].top,
    true,
    "Phone toolbar slots must reflow in rendered order.",
  );
  const phoneColumnPositions = await phone
    .locator(".od-relationship-graph-column")
    .evaluateAll((elements) =>
      elements.map((element) => {
        const bounds = element.getBoundingClientRect();
        return { left: bounds.left, top: bounds.top };
      }),
    );
  assert.equal(
    phoneColumnPositions[0].top < phoneColumnPositions[1].top &&
      phoneColumnPositions[1].top < phoneColumnPositions[2].top,
    true,
    "Phone columns must stack in relationship order.",
  );
  assert.equal(
    Math.abs(phoneColumnPositions[0].left - phoneColumnPositions[1].left) < 1,
    true,
    "Phone columns must use one aligned width.",
  );
  assert.equal(
    await phone
      .locator(
        ".od-relationship-graph-group[data-group-id='record-group'] [data-node-id='record-a']",
      )
      .count(),
    1,
    "Phone stacking must keep nested rows in their compound group.",
  );
  const phoneRelationshipText = node(phone, "record-a").locator(
    ".od-relationship-graph-node-relationships",
  );
  assert.equal(
    await phoneRelationshipText.evaluate(
      (element) => getComputedStyle(element).display !== "none",
    ),
    true,
    "A phone row must show its complete relationship text.",
  );
  assert.match(
    await phoneRelationshipText.textContent(),
    /Source A supplies Record Alpha.*first target route.*second target route/s,
  );
  const phoneCreateMapping = phone.getByRole("button", {
    name: "Create mapping",
  });
  await phoneCreateMapping.click();
  const phoneInspector = phone.getByRole("dialog", { name: "Create mapping" });
  await phoneInspector.waitFor();
  const phoneInspectorGeometry = await phoneInspector.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    const content = element.querySelector(".od-graph-inspector-content");
    return {
      bottom: bounds.bottom,
      innerHeight: window.innerHeight,
      position: getComputedStyle(element).position,
      top: bounds.top,
      contentClientHeight: content?.clientHeight ?? 0,
      contentScrollHeight: content?.scrollHeight ?? 0,
    };
  });
  assert.equal(
    phoneInspectorGeometry.position,
    "fixed",
    "A phone inspector must use viewport geometry.",
  );
  assert.equal(
    phoneInspectorGeometry.top >= 0 &&
      phoneInspectorGeometry.bottom <= phoneInspectorGeometry.innerHeight,
    true,
    `A phone inspector must stay wholly in the viewport: ${JSON.stringify(phoneInspectorGeometry)}`,
  );
  assert.equal(
    phoneInspectorGeometry.contentScrollHeight >
      phoneInspectorGeometry.contentClientHeight,
    true,
    "A long phone inspector must scroll its content locally.",
  );
  await assertNoPageOverflow(
    phone,
    "An open phone inspector must not cause page overflow",
  );
  await phone.keyboard.press("Escape");
  await phoneInspector.waitFor({ state: "detached" });
  assert.equal(
    await activeElementIs(phoneCreateMapping),
    true,
    "A phone inspector must return focus to the exact create action.",
  );
  await assertNoPageOverflow(phone, "The phone page must not overflow");
  await phone.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });
  await assertNoPageOverflow(phone, "The phone page must reflow at 200% text");
  await phoneCreateMapping.click();
  await phoneInspector.waitFor();
  const zoomedInspectorGeometry = await phoneInspector.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    return {
      bottom: bounds.bottom,
      innerHeight: window.innerHeight,
      top: bounds.top,
    };
  });
  assert.equal(
    zoomedInspectorGeometry.top >= 0 &&
      zoomedInspectorGeometry.bottom <= zoomedInspectorGeometry.innerHeight,
    true,
    `A phone inspector must stay visible at 200% text: ${JSON.stringify(zoomedInspectorGeometry)}`,
  );
  await phone.keyboard.press("Escape");
  await phoneInspector.waitFor({ state: "detached" });
  assert.equal(
    await phone
      .getByRole("region", { name: "Example relationship graph viewport" })
      .evaluate((element) => element.scrollHeight > element.clientHeight),
    true,
    "The phone graph must keep vertical overflow in its local viewport.",
  );
  assert.deepEqual(
    (await new AxeBuilder({ page: phone }).analyze()).violations,
    [],
    "The phone relationship graph must have no automated accessibility violations.",
  );
  assert.deepEqual(phoneErrors, []);

  await phoneContext.close();
  await overflowContext.close();
  await desktopContext.close();
} finally {
  await browser.close();
}

console.log("Relationship graph browser checks passed.");
