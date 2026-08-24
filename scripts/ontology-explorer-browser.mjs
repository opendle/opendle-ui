import { strict as assert } from "node:assert";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { build } from "esbuild";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));
const fixtureSource = String.raw`
import React, { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
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
} from "./dist/index.js";

const records = [{
  kind: "object", key: "record-1", type: "project",
  displayTitle: "Shared explorer", labels: ["active", "shared"],
  properties: { summary: [{ value: "Current data" }] },
}];
const graphObjects = [records[0], {
  kind: "object", key: "record-2", type: "person",
  displayTitle: "Owner", labels: [], properties: {},
}];
const graphLinks = [{
  kind: "link", key: "link-1", type: "owns", displayTitle: "Owner link",
  labels: [], properties: {}, endpointA: "record-2", endpointB: "record-1",
  direction: "a_to_b",
}];
const states = ["loading", "empty", "error", "stale", "offline", "recovering"];

function BrowserFixture() {
  const [activeItem, setActiveItem] = useState("records");
  const [selected, setSelected] = useState("none");
  const [positions, setPositions] = useState([
    { objectKey: "record-1", x: 24, y: 60 },
    { objectKey: "record-2", x: 300, y: 180 },
  ]);
  return (
    <ExplorerWorkspace
      activeItem={activeItem}
      description="Current authorized workspace data."
      navigationItems={[
        { id: "records", label: "Records", count: 1 },
        { id: "files", label: "Files", count: 1 },
      ]}
      navigationLabel="Explorer areas"
      onSelect={setActiveItem}
      title="Ontology explorer"
    >
      <output aria-label="Last selection" data-selection={selected}>{selected}</output>
      <div className="browser-fixture-stack">
        <BoundedDataExplorer
          actions={<Button>Add record</Button>}
          description="One bounded page."
          items={records}
          onSelect={(record) => setSelected("table:" + record.key)}
          selectedKey={selected === "table:record-1" ? "record-1" : undefined}
          title="Current records"
        />
        <ChangeTimeline
          items={[{ kind: "object", record: records[0] }]}
          onSelect={(item) => setSelected("timeline:" + item.record.key)}
          title="Current changes"
        />
        <SavedViewCanvas
          aria-label="Current saved view"
          canvasHeight={400}
          canvasWidth={640}
          links={graphLinks}
          objects={graphObjects}
          onPositionChange={(nextPosition) => {
            setPositions((current) => current.map((position) =>
              position.objectKey === nextPosition.objectKey ? nextPosition : position,
            ));
          }}
          onSelect={(record) => setSelected("graph:" + record.key)}
          positions={positions}
          selectedKey={selected.startsWith("graph:") ? selected.slice(6) : undefined}
        />
        <OntologyInheritanceTree
          definitions={[
            { apiName: "entity", title: "Entity", parentTypes: [] },
            { apiName: "project", title: "Project", parentTypes: ["entity"] },
          ]}
          onSelect={(definition) => setSelected("type:" + definition.apiName)}
          title="Object type inheritance"
        />
        <MetadataBagList
          bags={[{
            id: "bag-1", source: "Browser fixture",
            location: { latitude: 48.85, longitude: 2.35 },
            createdAt: "2026-08-24T11:00:00Z",
            updatedAt: "2026-08-24T12:00:00Z",
          }]}
          onSelect={(bag) => setSelected("bag:" + bag.id)}
          title="Metadata bags"
        />
        <ManagedFileList
          items={[{
            metadata: {
              fileId: "file-1", mediaType: "application/pdf",
              name: "current-file.pdf", sha256: "a".repeat(64), size: 2048,
              createdAt: "2026-08-24T12:00:00Z",
            },
            state: "downloading",
          }]}
          onSelect={(file) => setSelected("file:" + file.fileId)}
          title="Managed files"
        />
        {states.map((state) => (
          <ExplorerState
            action={<Button>Recover</Button>}
            description={state + " detail"}
            key={state}
            state={state}
            title={state + " state"}
          />
        ))}
      </div>
    </ExplorerWorkspace>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode><BrowserFixture /></StrictMode>,
);
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
    sourcefile: "ontology-explorer-browser-fixture.jsx",
  },
  write: false,
});
const browserScript = bundle.outputFiles[0]?.text;
assert.ok(browserScript, "The browser fixture must build one script.");

const css = await readFile(
  new URL("../styles/tokens.css", import.meta.url),
  "utf8",
);
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Ontology explorer test</title><style>${css}.browser-fixture-stack{display:grid;gap:1rem}</style></head><body><main><div id="root"></div></main></body></html>`;
const systemChrome = "/usr/bin/google-chrome";
const browser = await chromium.launch({
  executablePath: existsSync(systemChrome) ? systemChrome : undefined,
  headless: true,
});

async function loadFixture(page) {
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setContent(html);
  await page.addScriptTag({ content: browserScript });
  await page.getByRole("heading", { name: "Ontology explorer" }).waitFor();
  return errors;
}

try {
  const desktopContext = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const desktop = await desktopContext.newPage();
  const desktopErrors = await loadFixture(desktop);
  const selection = desktop.getByRole("status", { name: "Last selection" });

  assert.equal(
    await desktop.getByRole("navigation", { name: "Explorer areas" }).count(),
    1,
  );
  assert.equal(await desktop.getByRole("table").count(), 1);
  assert.equal(await desktop.getByRole("progressbar").count(), 1);
  assert.equal(await desktop.getByRole("alert").count(), 2);
  assert.equal(await desktop.locator('[aria-busy="true"]').count(), 2);
  assert.deepEqual(
    (await new AxeBuilder({ page: desktop }).analyze()).violations,
    [],
    "The desktop explorer must have no automated accessibility violations.",
  );

  const filesNavigation = desktop.getByRole("button", { name: /^Files/ });
  await filesNavigation.click();
  assert.equal(await filesNavigation.getAttribute("aria-current"), "page");
  assert.equal(
    await desktop
      .getByRole("button", { name: /^Records/ })
      .getAttribute("aria-current"),
    null,
  );

  const recordButton = desktop
    .getByRole("table")
    .getByRole("button", { name: "Open Shared explorer" });
  await recordButton.click();
  assert.equal(
    await selection.getAttribute("data-selection"),
    "table:record-1",
  );
  assert.equal(await recordButton.getAttribute("aria-pressed"), "true");

  const graphNode = desktop.getByRole("button", {
    name: "Shared explorer. Drag it or use arrow keys to move it.",
  });
  await graphNode.scrollIntoViewIfNeeded();
  await graphNode.focus();
  await graphNode.press("ArrowRight");
  assert.match(
    await graphNode.getAttribute("style"),
    /translate\(36px, 60px\)/,
  );
  assert.equal(
    await graphNode.evaluate((element) => document.activeElement === element),
    true,
  );

  const graphEdge = desktop.getByRole("button", { name: "Open Owner link" });
  await graphEdge.focus();
  await graphEdge.press("Enter");
  assert.equal(await selection.getAttribute("data-selection"), "graph:link-1");

  const nodeBox = await graphNode.boundingBox();
  assert.ok(nodeBox, "The saved-view node must have browser geometry.");
  await desktop.mouse.move(nodeBox.x + 20, nodeBox.y + 20);
  await desktop.mouse.down();
  await desktop.mouse.move(nodeBox.x + 50, nodeBox.y + 40, { steps: 3 });
  await desktop.mouse.up();
  assert.match(
    await graphNode.getAttribute("style"),
    /translate\(66px, 80px\)/,
  );
  assert.equal(
    await selection.getAttribute("data-selection"),
    "graph:link-1",
    "Dragging a node must not also select it.",
  );

  await desktop.keyboard.press("Tab");
  const focused = desktop.locator(":focus");
  const focusStyle = await focused.evaluate((element) => ({
    height: element.getBoundingClientRect().height,
    outline: getComputedStyle(element).outlineStyle,
  }));
  assert.ok(
    focusStyle.height >= 44,
    "Keyboard targets must be at least 44 CSS pixels high.",
  );
  assert.notEqual(focusStyle.outline, "none");
  assert.equal(
    await desktop.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
    true,
  );

  await desktop.emulateMedia({ reducedMotion: "reduce" });
  assert.equal(
    await desktop
      .locator(
        '.od-explorer-state[data-state="loading"] .od-explorer-state-mark',
      )
      .evaluate((element) => getComputedStyle(element).animationName),
    "none",
  );
  await desktop.emulateMedia({ forcedColors: "active" });
  await filesNavigation.focus();
  assert.notEqual(
    await filesNavigation.evaluate(
      (element) => getComputedStyle(element).outlineStyle,
    ),
    "none",
  );
  assert.deepEqual(desktopErrors, []);

  const phoneContext = await browser.newContext({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  });
  const phone = await phoneContext.newPage();
  const phoneErrors = await loadFixture(phone);
  assert.equal(
    await phone
      .locator(".od-ontology-tree-graph")
      .evaluate((element) => getComputedStyle(element).display),
    "none",
  );
  assert.equal(
    await phone
      .locator(".od-ontology-tree-list")
      .evaluate((element) => getComputedStyle(element).display),
    "grid",
  );
  assert.equal(
    await phone
      .locator(".od-data-explorer-table")
      .evaluate((element) => getComputedStyle(element).display),
    "block",
  );
  assert.deepEqual(
    await phone.getByRole("columnheader").allTextContents(),
    ["Record", "Kind", "Type", "Labels", "Properties"],
    "Phone cards must keep the real table headers in the accessibility tree.",
  );
  assert.equal(
    await phone.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
    true,
  );
  assert.deepEqual(
    (await new AxeBuilder({ page: phone }).analyze()).violations,
    [],
    "The phone explorer must have no automated accessibility violations.",
  );
  await phone.getByRole("button", { name: "Open current-file.pdf" }).tap();
  assert.equal(
    await phone
      .getByRole("status", { name: "Last selection" })
      .getAttribute("data-selection"),
    "file:file-1",
  );
  await phone.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });
  assert.equal(
    await phone.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
    true,
  );
  await phone.keyboard.press("Tab");
  assert.equal(
    await phone.locator(":focus").evaluate((element) => element.tagName),
    "BUTTON",
  );
  assert.deepEqual(phoneErrors, []);
  await desktopContext.close();
  await phoneContext.close();
} finally {
  await browser.close();
}

process.stdout.write("Ontology explorer browser checks passed.\n");
