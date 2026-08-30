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
import {
  Button,
  GraphInspector,
  GraphNode,
  GraphToolbar,
  GraphViewport,
  GraphWorkspace,
  PageSurface,
  Toast,
} from "./dist/index.js";

function Fixture() {
  const [inspector, setInspector] = useState(null);
  const [guardedEscapeCount, setGuardedEscapeCount] = useState(0);
  const [openerAvailable, setOpenerAvailable] = useState(true);
  const [reachabilityInspector, setReachabilityInspector] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const returnFocusRef = useRef(null);
  const reachabilityReturnFocusRef = useRef(null);
  const selectedControlRef = useRef(null);
  const panel = inspector === null ? null : (
    <GraphInspector
      activationKey={inspector?.startsWith("ref-only") ? undefined : inspector}
      initialFocusRef={inspector === "external-initial" ? returnFocusRef : undefined}
      key={inspector === "replacement" ? inspector : "active-inspector"}
      onClose={() => setInspector(null)}
      onKeyDown={(event) => {
        if (inspector !== "guarded" || event.key !== "Escape") return;
        event.preventDefault();
        setGuardedEscapeCount((count) => count + 1);
      }}
      returnFocusRef={returnFocusRef}
      title={
        inspector === "create"
          ? "Create service"
          : inspector === "guarded"
            ? "Guarded details"
          : inspector === "unavailable"
            ? "Unavailable details"
          : inspector === "replacement"
            ? "Replacement details"
            : "Service details"
      }
    >
      <p>{"Long inspector content. ".repeat(80)}</p>
      <label>Service title <input defaultValue="Shared service" /></label>
      <a aria-label="Tiny inspector link" href="#fixture-target">i</a>
      <div aria-hidden="true" style={{ flex: "0 0 auto", height: "30rem" }} />
      {inspector === "detail-a" ? (
        <button type="button" onClick={() => setInspector("replacement")}>
          Replace inspector
        </button>
      ) : null}
    </GraphInspector>
  );
  return (
    <>
      <output aria-label="Guarded Escape count">{guardedEscapeCount}</output>
      <Button type="button" onClick={() => setToastVisible(true)}>Show saved message</Button>
      <PageSurface data-testid="guttered-surface">
        <h1>Graph workspace browser check</h1>
        <GraphWorkspace
          aria-label="Centered service tree"
          inspector={panel}
          toolbar={
            <GraphToolbar actions={
              <>
                <Button type="button" onClick={(event) => {
                  returnFocusRef.current = event.currentTarget;
                  setInspector("create");
                }}>Create service</Button>
                <Button type="button" onClick={(event) => {
                  returnFocusRef.current = event.currentTarget;
                  setInspector("guarded");
                }}>Open guarded inspector</Button>
                <Button type="button" onClick={(event) => {
                  returnFocusRef.current = event.currentTarget;
                  setInspector("external-initial");
                }}>Open with external initial target</Button>
                {openerAvailable ? <Button type="button" onClick={(event) => {
                  returnFocusRef.current = event.currentTarget;
                  setOpenerAvailable(false);
                  setInspector("unavailable");
                }}>Open unavailable record</Button> : null}
              </>
            } />
          }
        >
          <GraphViewport
            aria-label="Centered tree viewport"
            canvasAlignment="center"
            canvasHeight={320}
            canvasWidth={640}
          >
            <GraphNode
              aria-label="Inspect service A"
              onClick={(event) => {
                returnFocusRef.current = event.currentTarget;
                setInspector("detail-a");
              }}
              title="Service A"
              x={40}
              y={120}
            />
            <GraphNode
              aria-label="Inspect ref-only service A"
              onClick={(event) => {
                returnFocusRef.current = event.currentTarget;
                setInspector("ref-only-a");
              }}
              title="Ref-only A"
              x={40}
              y={220}
            />
            <GraphNode
              aria-label="Inspect ref-only service B"
              onClick={(event) => {
                returnFocusRef.current = event.currentTarget;
                setInspector("ref-only-b");
              }}
              title="Ref-only B"
              x={280}
              y={220}
            />
            <GraphNode
              aria-label="Inspect service B"
              onClick={(event) => {
                returnFocusRef.current = event.currentTarget;
                setInspector("detail-b");
              }}
              title="Service B"
              x={280}
              y={120}
            />
          </GraphViewport>
        </GraphWorkspace>
      </PageSurface>
      <PageSurface>
        <GraphWorkspace
          aria-label="Overlay reachability graph"
          inspector={
            reachabilityInspector ? (
              <GraphInspector
                onClose={() => setReachabilityInspector(false)}
                returnFocusRef={reachabilityReturnFocusRef}
                title="Reachability record"
              >
                <p>The selected record must stay visible.</p>
              </GraphInspector>
            ) : null
          }
          selectedControlRef={selectedControlRef}
          style={{ width: "min(1106px, 100%)" }}
          toolbar={
            <GraphToolbar
              actions={
                <Button
                  onClick={(event) => {
                    reachabilityReturnFocusRef.current = event.currentTarget;
                    setReachabilityInspector(true);
                  }}
                  type="button"
                >
                  Open reachability inspector
                </Button>
              }
            />
          }
        >
          <GraphViewport
            aria-label="Overlay reachability viewport"
            canvasHeight={180}
            canvasWidth={2100}
          >
            <GraphNode
              aria-label="Selected reachability service"
              ref={selectedControlRef}
              selected
              title="Reachability service"
              x={1400}
              y={50}
            />
          </GraphViewport>
        </GraphWorkspace>
      </PageSurface>
      <PageSurface data-testid="edge-surface" edgeToEdge>
        <GraphWorkspace aria-label="Start aligned free graph">
          <GraphViewport
            aria-label="Start aligned viewport"
            canvasHeight={180}
            canvasWidth={360}
          >
            <GraphNode aria-label="Free node" title="Free node" x={0} y={50} />
          </GraphViewport>
        </GraphWorkspace>
      </PageSurface>
      <PageSurface>
        <GraphWorkspace aria-label="Overflow tree">
          <GraphViewport
            aria-label="Overflow tree viewport"
            canvasAlignment="center"
            canvasHeight={900}
            canvasWidth={1500}
          >
            <GraphNode aria-label="Far node" title="Far node" x={1100} y={760} />
          </GraphViewport>
        </GraphWorkspace>
      </PageSurface>
      {toastVisible ? (
        <Toast
          aria-label="Save status"
          onDismiss={() => setToastVisible(false)}
          role="status"
        >
          Service saved
        </Toast>
      ) : null}
    </>
  );
}

createRoot(document.getElementById("root")).render(<StrictMode><Fixture /></StrictMode>);
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
    sourcefile: "graph-workspace-browser-fixture.jsx",
  },
  write: false,
});
const browserScript = bundle.outputFiles[0]?.text;
assert.ok(browserScript, "The graph browser fixture must build one script.");
const css = await readFile(
  new URL("../styles/tokens.css", import.meta.url),
  "utf8",
);
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Graph workspace test</title><style>${css}*:not(.od-graph-inspector){box-sizing:border-box}body{margin:0;background:var(--od-color-background)}#root{display:grid;grid-template-columns:minmax(0,1fr);min-width:0;gap:1rem}.od-graph-workspace{height:34rem;min-height:0}.od-page-surface:nth-of-type(n+2) .od-graph-workspace{height:14rem}</style></head><body><main id="root"></main></body></html>`;
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
  await page.getByRole("region", { name: "Centered service tree" }).waitFor();
  return errors;
}

function activeElementIs(locator) {
  return locator.evaluate((element) => element === document.activeElement);
}

function activeElementIsOutside(locator) {
  return locator.evaluate(
    (element) =>
      document.activeElement instanceof HTMLElement &&
      document.activeElement !== document.body &&
      !element.contains(document.activeElement),
  );
}

async function captureReviewScreenshot(page, name) {
  const directory = process.env.OPENDLE_UI_SCREENSHOT_DIR;
  if (directory === undefined) return;
  await page.screenshot({ path: `${directory}/${name}.png` });
}

async function verifyInspector(page, opener, title, phone) {
  await opener.click();
  const inspector = page.getByRole("dialog", { name: title });
  await inspector.waitFor();
  const heading = inspector.getByRole("heading", { level: 2, name: title });
  assert.equal(
    await activeElementIs(heading),
    true,
    `${title} must move initial focus to its heading.`,
  );
  const workspaceBounds = await page
    .getByRole("region", { name: "Centered service tree" })
    .boundingBox();
  const inspectorBounds = await inspector.boundingBox();
  assert.ok(workspaceBounds && inspectorBounds);
  if (phone) {
    const viewport = page.viewportSize();
    assert.ok(viewport);
    assert.equal(
      Math.abs(
        viewport.height - (inspectorBounds.y + inspectorBounds.height) - 12,
      ) < 3,
      true,
      `${title} must use the viewport-bottom slot on a phone: ${JSON.stringify({ inspectorBounds, viewport })}`,
    );
    assert.equal(
      inspectorBounds.y >= 0 &&
        inspectorBounds.y + inspectorBounds.height <= viewport.height,
      true,
      `${title} must stay wholly in the phone viewport.`,
    );
    assert.equal(
      inspectorBounds.x >= 12 &&
        inspectorBounds.x + inspectorBounds.width <= viewport.width - 12,
      true,
      `${title} must keep the phone inset.`,
    );
    await page.keyboard.press("Shift+Tab");
    assert.equal(
      await inspector.evaluate((element) =>
        element.contains(document.activeElement),
      ),
      true,
      `${title} must contain reverse Tab focus in the modal sheet; active element is ${await page.evaluate(() => document.activeElement?.outerHTML)}.`,
    );
    await opener.focus();
    assert.equal(
      await inspector.evaluate((element) =>
        element.contains(document.activeElement),
      ),
      true,
      `${title} must keep programmatic background focus in the modal sheet.`,
    );
  } else {
    assert.equal(
      inspectorBounds.x > workspaceBounds.x + workspaceBounds.width / 2,
      true,
      `${title} must use the shared right-side slot on a desktop.`,
    );
  }
  await page.keyboard.press("Escape");
  await inspector.waitFor({ state: "detached" });
  assert.equal(
    await activeElementIs(opener),
    true,
    `${title} must return focus to the exact opening control; active element is ${await page.evaluate(() => document.activeElement?.outerHTML)}.`,
  );
}

try {
  const desktopContext = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const desktop = await desktopContext.newPage();
  const desktopErrors = await loadFixture(desktop);
  const surfaceBounds = await desktop
    .getByTestId("guttered-surface")
    .boundingBox();
  const edgeBounds = await desktop.getByTestId("edge-surface").boundingBox();
  assert.ok(surfaceBounds && edgeBounds);
  assert.equal(
    await desktop
      .getByTestId("guttered-surface")
      .evaluate(
        (element) =>
          Number.parseFloat(getComputedStyle(element).paddingLeft) > 0,
      ),
    true,
    "The guttered page must have one inset.",
  );
  assert.equal(
    Math.abs(edgeBounds.x) < 0.5 && Math.abs(edgeBounds.width - 1280) < 0.5,
    true,
    "The edge-to-edge page must use the complete viewport width.",
  );

  const centeredViewport = desktop.getByRole("region", {
    name: "Centered tree viewport",
  });
  const centeredCanvas = centeredViewport.locator(".od-graph-canvas");
  const centerGeometry = await centeredViewport.evaluate((viewport) => {
    const canvas = viewport.querySelector(".od-graph-canvas");
    const viewportBounds = viewport.getBoundingClientRect();
    const canvasBounds = canvas?.getBoundingClientRect();
    return {
      canvasLeft: canvasBounds?.left,
      canvasTop: canvasBounds?.top,
      canvasWidth: canvasBounds?.width,
      canvasHeight: canvasBounds?.height,
      viewportLeft: viewportBounds.left,
      viewportTop: viewportBounds.top,
      viewportWidth: viewportBounds.width,
      viewportHeight: viewportBounds.height,
    };
  });
  assert.equal(await centeredCanvas.getAttribute("data-alignment"), "center");
  assert.equal(
    Math.abs(
      centerGeometry.canvasLeft -
        (centerGeometry.viewportLeft +
          (centerGeometry.viewportWidth - centerGeometry.canvasWidth) / 2),
    ) < 1,
    true,
    `The intrinsic tree must be centered: ${JSON.stringify(centerGeometry)}`,
  );
  assert.equal(
    Math.abs(
      centerGeometry.canvasTop -
        (centerGeometry.viewportTop +
          (centerGeometry.viewportHeight - centerGeometry.canvasHeight) / 2),
    ) < 1,
    true,
    `The intrinsic tree must be vertically centered: ${JSON.stringify(centerGeometry)}`,
  );

  const startGeometry = await desktop
    .getByRole("region", { name: "Start aligned viewport" })
    .evaluate((viewport) => {
      const canvas = viewport.querySelector(".od-graph-canvas");
      return {
        canvasLeft: canvas?.getBoundingClientRect().left,
        canvasTop: canvas?.getBoundingClientRect().top,
        viewportLeft: viewport.getBoundingClientRect().left,
        viewportTop: viewport.getBoundingClientRect().top,
      };
    });
  assert.equal(
    Math.abs(startGeometry.canvasLeft - startGeometry.viewportLeft) < 1,
    true,
    "A free-position graph must keep start alignment by default.",
  );
  assert.equal(
    Math.abs(startGeometry.canvasTop - startGeometry.viewportTop) < 1,
    true,
    "A free-position graph must keep vertical start alignment by default.",
  );

  const overflowViewport = desktop.getByRole("region", {
    name: "Overflow tree viewport",
  });
  assert.equal(
    await overflowViewport.evaluate(
      (element) =>
        element.scrollWidth > element.clientWidth &&
        element.scrollHeight > element.clientHeight,
    ),
    true,
    "A large centered tree must keep local two-axis overflow.",
  );
  await overflowViewport.evaluate((element) => {
    element.scrollLeft = element.scrollWidth;
    element.scrollTop = element.scrollHeight;
  });
  assert.equal(
    await desktop.getByRole("button", { name: "Far node" }).isVisible(),
    true,
    "The far tree node must remain reachable through local scrolling.",
  );

  const boundaryWorkspace = desktop.getByRole("region", {
    name: "Centered service tree",
  });
  const boundaryOpener = desktop.getByRole("button", {
    name: "Create service",
  });
  await boundaryOpener.click();
  const boundaryInspector = desktop.getByRole("dialog", {
    name: "Create service",
  });
  const originalBoundaryInspector = await boundaryInspector.elementHandle();
  assert.ok(originalBoundaryInspector);
  await desktop.waitForFunction(
    () =>
      document.querySelector("[aria-label='Centered service tree']")?.dataset
        .inspectorMode === "split",
  );
  await captureReviewScreenshot(desktop, "graph-inspector-split");
  const boundaryHeading = boundaryInspector.getByRole("heading", {
    level: 2,
    name: "Create service",
  });
  const tinyInspectorLink = boundaryInspector.getByRole("link", {
    name: "Tiny inspector link",
  });
  const tinyControlBounds = await tinyInspectorLink.boundingBox();
  assert.ok(tinyControlBounds);
  assert.equal(
    tinyControlBounds.width >= 44 && tinyControlBounds.height >= 44,
    true,
    `Each inspector control must keep both 2.75rem minimum dimensions: ${JSON.stringify(tinyControlBounds)}.`,
  );
  await boundaryHeading.focus();
  await desktop.keyboard.press("Shift+Tab");
  assert.equal(
    await activeElementIsOutside(boundaryInspector),
    true,
    "Shift+Tab must reach the page from a split non-modal inspector.",
  );
  await tinyInspectorLink.focus();
  await desktop.keyboard.press("Tab");
  assert.equal(
    await activeElementIsOutside(boundaryInspector),
    true,
    "Tab must reach the page from a split non-modal inspector.",
  );
  const retainedInput = boundaryInspector.getByLabel("Service title");
  await retainedInput.fill("Retained value");
  const retainedContent = boundaryInspector.locator(
    ".od-graph-inspector-content",
  );
  const retainedScrollTop = await retainedContent.evaluate((element) => {
    element.scrollTop = 80;
    return element.scrollTop;
  });
  assert.equal(retainedScrollTop > 0, true);
  const boundaryChecks = [
    [1105, "split"],
    [1104, "split"],
    [1103, "overlay"],
    [769, "overlay"],
    [768, "sheet"],
    [767, "sheet"],
  ];
  for (const [width, mode] of boundaryChecks) {
    await boundaryWorkspace.evaluate((element, nextWidth) => {
      element.style.width = `${String(nextWidth + 2)}px`;
    }, width);
    await desktop.waitForFunction(
      ([expectedWidth, expectedMode]) => {
        const host = document.querySelector(
          "[aria-label='Centered service tree']",
        );
        return (
          host?.clientWidth === expectedWidth &&
          host.dataset.inspectorMode === expectedMode
        );
      },
      [width, mode],
    );
    assert.equal(await boundaryInspector.getAttribute("data-mode"), mode);
    assert.equal(
      await boundaryInspector.evaluate(
        (element, original) => element === original,
        originalBoundaryInspector,
      ),
      true,
      "A mode change must keep the same inspector DOM element.",
    );
    assert.equal(
      await desktop.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
      true,
      `The ${mode} mode must not add page-level horizontal overflow.`,
    );
  }
  assert.equal(await retainedInput.inputValue(), "Retained value");
  assert.equal(
    await retainedContent.evaluate((element) => element.scrollTop),
    retainedScrollTop,
  );
  const sheetGeometry = await boundaryInspector.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    return {
      bottom: window.innerHeight - bounds.bottom,
      left: bounds.left,
      maxHeight: getComputedStyle(element).maxHeight,
      right: window.innerWidth - bounds.right,
    };
  });
  assert.equal(Math.abs(sheetGeometry.left - 12) < 1, true);
  assert.equal(Math.abs(sheetGeometry.right - 12) < 1, true);
  assert.equal(Math.abs(sheetGeometry.bottom - 12) < 1, true);
  assert.equal(sheetGeometry.maxHeight, "776px");
  await boundaryWorkspace.evaluate((element) => {
    element.style.width = "771px";
  });
  await desktop.waitForFunction(
    () =>
      document.querySelector("[aria-label='Centered service tree']")?.dataset
        .inspectorMode === "overlay",
  );
  await boundaryOpener.focus();
  await boundaryWorkspace.evaluate((element) => {
    element.style.width = "770px";
  });
  await desktop.waitForFunction(
    () =>
      document.querySelector("[aria-label='Centered service tree']")?.dataset
        .inspectorMode === "sheet",
  );
  assert.equal(
    await activeElementIs(boundaryHeading),
    true,
    "A change to sheet mode from background focus must focus the inspector heading.",
  );
  await boundaryHeading.focus();
  await desktop.keyboard.press("Shift+Tab");
  assert.equal(
    await activeElementIs(tinyInspectorLink),
    true,
    "Reverse Tab from the sheet heading must wrap to the last focusable control.",
  );
  await desktop.keyboard.press("Tab");
  const boundaryClose = boundaryInspector.getByRole("button", {
    name: "Close inspector",
  });
  assert.equal(
    await activeElementIs(boundaryClose),
    true,
    "Forward Tab from the last sheet control must wrap to the first focusable control.",
  );
  assert.equal(
    await boundaryInspector.evaluate(
      (element) => getComputedStyle(element).boxSizing,
    ),
    "border-box",
    "The inspector must own its exact border-box geometry.",
  );
  await boundaryWorkspace.evaluate((element) => {
    element.style.width = "771px";
  });
  await desktop.waitForFunction(
    () =>
      document.querySelector("[aria-label='Centered service tree']")?.dataset
        .inspectorMode === "overlay",
  );
  await retainedInput.focus();
  await retainedInput.evaluate((element) => {
    element.remove();
  });
  await boundaryWorkspace.evaluate((element) => {
    element.style.width = "770px";
  });
  await desktop.waitForFunction(
    () =>
      document.querySelector("[aria-label='Centered service tree']")?.dataset
        .inspectorMode === "sheet",
  );
  assert.equal(
    await activeElementIs(boundaryHeading),
    true,
    "A mode change must focus the heading when the focused inspector control was removed.",
  );
  await boundaryWorkspace.evaluate((element) => {
    element.style.width = "";
  });
  await boundaryInspector
    .getByRole("button", { name: "Close inspector" })
    .click();
  await boundaryInspector.waitFor({ state: "detached" });
  await desktop.evaluate(() => {
    document.documentElement.style.fontSize = "20px";
  });
  const reachabilityWorkspace = desktop.getByRole("region", {
    name: "Overlay reachability graph",
  });
  await desktop
    .getByRole("button", { name: "Open reachability inspector" })
    .click();
  await desktop.waitForFunction(
    () =>
      document.querySelector("[aria-label='Overlay reachability graph']")
        ?.dataset.inspectorMode === "overlay",
  );
  const reachabilityDialog = desktop.getByRole("dialog", {
    name: "Reachability record",
  });
  const overlayGeometry = await reachabilityWorkspace.evaluate((host) => {
    const inspector = host.querySelector(".od-graph-inspector");
    const control = host.querySelector(
      "[aria-label='Selected reachability service']",
    );
    const viewport = host.querySelector(".od-graph-viewport");
    const inspectorBounds = inspector?.getBoundingClientRect();
    const controlBounds = control?.getBoundingClientRect();
    return {
      controlRight: controlBounds?.right ?? 0,
      inspectorLeft: inspectorBounds?.left ?? 0,
      inspectorWidth: inspectorBounds?.width ?? 0,
      scrollLeft: viewport?.scrollLeft ?? 0,
    };
  });
  assert.equal(
    Math.abs(overlayGeometry.inspectorWidth - 420) < 1,
    true,
    `The overlay must use its root-relative 21rem width: ${JSON.stringify(overlayGeometry)}.`,
  );
  assert.equal(
    overlayGeometry.scrollLeft > 0 &&
      overlayGeometry.controlRight <= overlayGeometry.inspectorLeft + 1,
    true,
    `The selected control must stay before the actual overlay edge: ${JSON.stringify(overlayGeometry)}.`,
  );
  await captureReviewScreenshot(desktop, "graph-inspector-overlay");
  const reachabilityHeading = reachabilityDialog.getByRole("heading", {
    level: 2,
    name: "Reachability record",
  });
  await reachabilityHeading.focus();
  await desktop.keyboard.press("Shift+Tab");
  assert.equal(
    await activeElementIsOutside(reachabilityDialog),
    true,
    "Shift+Tab must reach the page from an overlay non-modal inspector.",
  );
  await reachabilityDialog
    .getByRole("button", { name: "Close inspector" })
    .focus();
  await desktop.keyboard.press("Tab");
  if (!(await activeElementIsOutside(reachabilityDialog)))
    await desktop.keyboard.press("Tab");
  assert.equal(
    await activeElementIsOutside(reachabilityDialog),
    true,
    `Tab must reach the page from an overlay non-modal inspector; active element is ${await desktop.evaluate(() => document.activeElement?.outerHTML)}.`,
  );
  await reachabilityHeading.focus();
  await desktop.evaluate(() => {
    document.documentElement.style.fontSize = "24px";
  });
  await desktop.waitForFunction(
    () =>
      document.querySelector("[aria-label='Overlay reachability graph']")
        ?.dataset.inspectorMode === "sheet",
  );
  await captureReviewScreenshot(desktop, "graph-inspector-sheet");
  await desktop
    .getByRole("button", { name: "Open reachability inspector" })
    .focus();
  assert.equal(
    await reachabilityDialog.evaluate((element) =>
      element.contains(document.activeElement),
    ),
    true,
    "The modal sheet must keep background focus contained.",
  );
  await desktop.evaluate(() => {
    document.documentElement.style.fontSize = "16px";
  });
  await desktop.waitForFunction(
    () =>
      document.querySelector("[aria-label='Overlay reachability graph']")
        ?.dataset.inspectorMode === "split",
  );
  await reachabilityDialog
    .getByRole("button", { name: "Close inspector" })
    .click();
  await reachabilityDialog.waitFor({ state: "detached" });

  await verifyInspector(
    desktop,
    desktop.getByRole("button", { name: "Create service" }),
    "Create service",
    false,
  );
  const guardedOpener = desktop.getByRole("button", {
    name: "Open guarded inspector",
  });
  await guardedOpener.click();
  const guardedInspector = desktop.getByRole("dialog", {
    name: "Guarded details",
  });
  await desktop.keyboard.press("Escape");
  assert.equal(
    await guardedInspector.isVisible(),
    true,
    "A caller that prevents Escape must keep its inspector open.",
  );
  assert.equal(
    await desktop
      .getByRole("status", { name: "Guarded Escape count" })
      .textContent(),
    "1",
    "The shared Escape listener must preserve the caller handler.",
  );
  await guardedInspector
    .getByRole("button", { name: "Close inspector" })
    .click();
  await guardedInspector.waitFor({ state: "detached" });
  assert.equal(
    await activeElementIs(guardedOpener),
    true,
    "The guarded inspector close action must return focus to its opener.",
  );
  await desktop
    .getByRole("button", { name: "Open unavailable record" })
    .click();
  const unavailableInspector = desktop.getByRole("dialog", {
    name: "Unavailable details",
  });
  await unavailableInspector
    .getByRole("button", { name: "Close inspector" })
    .click();
  await unavailableInspector.waitFor({ state: "detached" });
  assert.equal(
    await activeElementIs(
      desktop.getByRole("button", { name: "Inspect service A" }),
    ),
    true,
    "A removed opening control must fall back to the first available graph control.",
  );
  await verifyInspector(
    desktop,
    desktop.getByRole("button", { name: "Inspect service A" }),
    "Service details",
    false,
  );
  await verifyInspector(
    desktop,
    desktop.getByRole("button", { name: "Open with external initial target" }),
    "Service details",
    false,
  );
  const serviceA = desktop.getByRole("button", { name: "Inspect service A" });
  const serviceB = desktop.getByRole("button", { name: "Inspect service B" });
  await serviceA.click();
  await desktop.getByRole("dialog", { name: "Service details" }).waitFor();
  await serviceB.click();
  const changedHeading = desktop
    .getByRole("dialog", { name: "Service details" })
    .getByRole("heading", { level: 2, name: "Service details" });
  assert.equal(
    await activeElementIs(changedHeading),
    true,
    "A changed inspector activation must receive initial focus again.",
  );
  await desktop.keyboard.press("Escape");
  await desktop
    .getByRole("dialog", { name: "Service details" })
    .waitFor({ state: "detached" });
  assert.equal(
    await activeElementIs(serviceB),
    true,
    "A mounted inspector must return focus to the second opening node.",
  );

  const refOnlyA = desktop.getByRole("button", {
    name: "Inspect ref-only service A",
  });
  const refOnlyB = desktop.getByRole("button", {
    name: "Inspect ref-only service B",
  });
  await refOnlyA.click();
  await desktop.getByRole("dialog", { name: "Service details" }).waitFor();
  await refOnlyB.click();
  const refOnlyHeading = desktop
    .getByRole("dialog", { name: "Service details" })
    .getByRole("heading", { level: 2, name: "Service details" });
  assert.equal(
    await activeElementIs(refOnlyHeading),
    true,
    "A changed return-focus ref must move focus into the updated inspector.",
  );
  await desktop.keyboard.press("Escape");
  await desktop
    .getByRole("dialog", { name: "Service details" })
    .waitFor({ state: "detached" });
  await desktop.waitForTimeout(100);
  assert.equal(
    await activeElementIs(refOnlyB),
    true,
    "A changed return-focus ref must survive the inspector cleanup race.",
  );

  await serviceA.click();
  await desktop.getByRole("button", { name: "Replace inspector" }).click();
  const replacementHeading = desktop
    .getByRole("dialog", { name: "Replacement details" })
    .getByRole("heading", { level: 2, name: "Replacement details" });
  await replacementHeading.waitFor();
  await desktop.waitForTimeout(100);
  assert.equal(
    await activeElementIs(replacementHeading),
    true,
    "An old inspector cleanup must not steal focus from its replacement.",
  );
  await desktop.keyboard.press("Escape");
  await desktop
    .getByRole("dialog", { name: "Replacement details" })
    .waitFor({ state: "detached" });
  assert.equal(
    await activeElementIs(serviceA),
    true,
    "A replacement inspector must keep the explicit return-focus target.",
  );
  assert.deepEqual(
    (await new AxeBuilder({ page: desktop }).analyze()).violations,
    [],
    "The desktop graph fixture must have no automated accessibility violations.",
  );
  assert.deepEqual(desktopErrors, []);

  const phoneContext = await browser.newContext({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  });
  const phone = await phoneContext.newPage();
  const phoneErrors = await loadFixture(phone);
  const phoneToast = phone.getByRole("status", { name: "Save status" });
  await phone.getByRole("button", { name: "Show saved message" }).click();
  await phoneToast.waitFor();
  assert.equal(
    await phoneToast.evaluate((element) => element.closest("dialog") === null),
    true,
    "A Toast must stay in its normal host position when no modal is open.",
  );
  await phoneToast.getByRole("button", { name: "Dismiss message" }).click();
  await phoneToast.waitFor({ state: "detached" });
  await phone.getByRole("button", { name: "Show saved message" }).click();
  await phoneToast.waitFor();
  const modalToastOpener = phone.getByRole("button", {
    name: "Create service",
  });
  await modalToastOpener.click();
  const modalToastInspector = phone.getByRole("dialog", {
    name: "Create service",
  });
  await modalToastInspector.waitFor();
  await phone.waitForFunction(() => {
    const toast = document.querySelector(".od-toast");
    return toast?.closest("dialog:modal") !== null;
  });
  const modalToastDismiss = phoneToast.getByRole("button", {
    name: "Dismiss message",
  });
  assert.equal(
    await modalToastDismiss.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      const target = document.elementFromPoint(
        bounds.left + bounds.width / 2,
        bounds.top + bounds.height / 2,
      );
      return target === element || element.contains(target);
    }),
    true,
    "A Toast dismiss action must stay pointer accessible in a modal inspector.",
  );
  await modalToastDismiss.click();
  await phoneToast.waitFor({ state: "detached" });
  await phone.keyboard.press("Escape");
  await modalToastInspector.waitFor({ state: "detached" });
  assert.equal(
    await activeElementIs(modalToastOpener),
    true,
    "The modal inspector must still return focus after a Toast is dismissed.",
  );
  await verifyInspector(
    phone,
    phone.getByRole("button", { name: "Create service" }),
    "Create service",
    true,
  );
  await verifyInspector(
    phone,
    phone.getByRole("button", { name: "Inspect service A" }),
    "Service details",
    true,
  );
  assert.equal(
    await phone.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
    true,
    "The phone page must not have page-level horizontal overflow.",
  );
  await phone.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });
  const textOverflow = await phone.evaluate(() => ({
    containers: [
      document.body,
      document.getElementById("root"),
      ...document.querySelectorAll(
        ".od-page-surface, .od-graph-workspace, .od-graph-viewport",
      ),
    ].map((element) => ({
      className: element?.className,
      clientWidth: element?.clientWidth,
      overflow: element ? getComputedStyle(element).overflowX : null,
      right: element?.getBoundingClientRect().right,
      scrollWidth: element?.scrollWidth,
      tag: element?.tagName,
    })),
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    fits:
      document.documentElement.scrollWidth <=
      document.documentElement.clientWidth,
    offenders: [...document.querySelectorAll("*")].flatMap((element) => {
      const bounds = element.getBoundingClientRect();
      return bounds.right > document.documentElement.clientWidth + 0.5
        ? [
            {
              className: element.className,
              right: bounds.right,
              tag: element.tagName,
            },
          ]
        : [];
    }),
  }));
  assert.equal(
    textOverflow.fits,
    true,
    `The graph page must reflow without page overflow at 200% text: ${JSON.stringify(textOverflow)}`,
  );
  assert.deepEqual(
    (await new AxeBuilder({ page: phone }).analyze()).violations,
    [],
    "The phone graph fixture must have no automated accessibility violations.",
  );
  assert.deepEqual(phoneErrors, []);
  await phoneContext.close();
  await desktopContext.close();
} finally {
  await browser.close();
}

console.log("Graph workspace browser checks passed.");
