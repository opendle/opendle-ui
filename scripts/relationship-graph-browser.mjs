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
const columns = [
  {
    id: "sources",
    label: "Sources",
    actions: <Button type="button">Create source</Button>,
    nodes: [
      { id: "source-a", label: "Source A", detail: "Cloud source" },
      { id: "source-b", label: "Source B", detail: "Local source" },
    ],
  },
  {
    id: "records",
    label: "Records",
    actions: <Button type="button" variant="secondary">Create record</Button>,
    nodes: [
      { id: "record-a", label: longLabel, searchText: ["alpha"] },
      { id: "record-b", label: "Record Beta", state: "disabled" },
    ],
  },
  {
    id: "targets",
    label: "Targets",
    actions: <Button type="button" variant="secondary">Create target</Button>,
    nodes: [
      { id: "target-a", label: "Target One", state: "invalid", stateLabel: "Route invalid" },
      { id: "target-b", label: "Target Two" },
    ],
  },
];
const relationships = [
  { id: "source-a-record-a", sourceId: "source-a", targetId: "record-a", label: "source link" },
  { id: "source-b-record-b", sourceId: "source-b", targetId: "record-b", label: "source link" },
  { id: "record-a-target-a", sourceId: "record-a", targetId: "target-a", invalid: true, invalidLabel: "invalid route" },
  { id: "record-b-target-b", sourceId: "record-b", targetId: "target-b", label: "target route" },
];

function Fixture() {
  const [selectedId, setSelectedId] = useState(null);
  const [inspectorNode, setInspectorNode] = useState(null);
  const [query, setQuery] = useState("");
  const [showAlpha, setShowAlpha] = useState(true);
  const returnFocusRef = useRef(null);
  const visibleColumns = columns.map((column) => ({
    ...column,
    nodes: showAlpha
      ? column.nodes
      : column.nodes.filter((node) => node.id !== "record-a"),
  }));
  const visibleRelationships = showAlpha
    ? relationships
    : relationships.filter(
        (relationship) =>
          relationship.sourceId !== "record-a" &&
          relationship.targetId !== "record-a",
      );
  const inspector = inspectorNode ? (
    <GraphInspector
      activationKey={inspectorNode.id}
      onClose={() => setInspectorNode(null)}
      returnFocusRef={returnFocusRef}
      title={inspectorNode.label}
    >
      <p>Host-owned inspector content for {inspectorNode.label}.</p>
    </GraphInspector>
  ) : null;
  window.setRelationshipGraphQuery = setQuery;
  return (
    <main>
      <h1>Relationship graph browser check</h1>
      <Button type="button" variant="secondary" onClick={() => setShowAlpha(false)}>
        Remove selected record
      </Button>
      <RelationshipGraph
        aria-label="Example relationship graph"
        columns={visibleColumns}
        inspector={inspector}
        onNodeActivate={({ node, trigger }) => {
          returnFocusRef.current = trigger;
          setInspectorNode(node);
        }}
        onSelectionChange={setSelectedId}
        onSearchQueryChange={setQuery}
        relationships={visibleRelationships}
        searchQuery={query}
        selectedNodeId={selectedId}
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
      <RelationshipGraph aria-label="First relationship graph" columns={columns} relationships={relationships} searchLabel="Search first graph" />
      <RelationshipGraph aria-label="Second relationship graph" columns={secondColumns} relationships={secondRelationships} searchLabel="Search second graph" />
    </main>
  );
}

const fixtureRoot = createRoot(document.getElementById("root"));
fixtureRoot.render(<StrictMode><Fixture /></StrictMode>);
window.showMultipleRelationshipGraphs = () => fixtureRoot.render(<StrictMode><MultipleGraphsFixture /></StrictMode>);
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
      4,
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
    viewport: { width: 1280, height: 900 },
  });
  const desktop = await desktopContext.newPage();
  const desktopErrors = await loadFixture(desktop);
  assert.equal(
    await desktop.locator(".od-relationship-graph-column").count(),
    3,
  );
  assert.equal(await desktop.locator(".od-relationship-graph-node").count(), 6);
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
    /invalid route/,
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

  await node(desktop, "source-a").hover();
  assert.equal(
    await desktop
      .locator(".od-relationship-graph-node[data-active='true']")
      .count(),
    3,
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
    2,
  );
  await desktop.mouse.move(2, 2);

  await node(desktop, "source-a").focus();
  assert.equal(
    await desktop
      .locator(".od-relationship-graph-node[data-active='true']")
      .count(),
    3,
  );
  await desktop.keyboard.press("ArrowDown");
  assert.equal(await activeElementIs(node(desktop, "source-b")), true);
  await desktop.keyboard.press("ArrowRight");
  assert.equal(await activeElementIs(node(desktop, "record-b")), true);
  await desktop.keyboard.press("ArrowRight");
  assert.equal(await activeElementIs(node(desktop, "target-b")), true);
  await desktop.keyboard.press("ArrowLeft");
  assert.equal(await activeElementIs(node(desktop, "record-b")), true);
  await desktop.keyboard.press("Home");
  assert.equal(await activeElementIs(node(desktop, "record-a")), true);
  await desktop.keyboard.press("End");
  assert.equal(await activeElementIs(node(desktop, "record-b")), true);

  await node(desktop, "record-a").click();
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
    () => document.activeElement?.getAttribute("data-node-id") === "source-b",
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
  assert.equal(await desktop.locator(".od-relationship-graph-node").count(), 3);
  assert.equal(
    await node(desktop, "record-b").getAttribute("data-search-match"),
    "true",
  );
  assert.equal(
    await desktop.locator(".od-relationship-graph-connector").count(),
    2,
  );
  await desktop.getByRole("button", { name: "Clear search" }).first().click();
  assert.equal(await desktop.locator(".od-relationship-graph-node").count(), 6);
  assert.equal(
    await node(desktop, "record-a").getAttribute("aria-pressed"),
    "true",
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
    await desktop.locator(".od-visually-hidden").textContent(),
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
  await assertNoPageOverflow(phone, "The phone page must not overflow");
  await phone.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });
  await assertNoPageOverflow(phone, "The phone page must reflow at 200% text");
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
