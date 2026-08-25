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
} from "./dist/index.js";

function Fixture() {
  const [inspector, setInspector] = useState(null);
  const [guardedEscapeCount, setGuardedEscapeCount] = useState(0);
  const returnFocusRef = useRef(null);
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
          : inspector === "replacement"
            ? "Replacement details"
            : "Service details"
      }
    >
      <p>{"Long inspector content. ".repeat(80)}</p>
      <label>Service title <input defaultValue="Shared service" /></label>
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
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Graph workspace test</title><style>${css}*{box-sizing:border-box}body{margin:0;background:var(--od-color-background)}#root{display:grid;grid-template-columns:minmax(0,1fr);min-width:0;gap:1rem}.od-graph-workspace{height:34rem;min-height:0}.od-page-surface:nth-of-type(n+2) .od-graph-workspace{height:14rem}</style></head><body><main id="root"></main></body></html>`;
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

async function verifyInspector(page, opener, title, phone) {
  await opener.click();
  const inspector = page.getByRole("dialog", { name: title });
  await inspector.waitFor();
  const close = inspector.getByRole("button", { name: "Close inspector" });
  assert.equal(
    await activeElementIs(close),
    true,
    `${title} must move initial focus to its close control.`,
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
    `${title} must return focus to the exact opening control.`,
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
  const changedClose = desktop
    .getByRole("dialog", { name: "Service details" })
    .getByRole("button", { name: "Close inspector" });
  assert.equal(
    await activeElementIs(changedClose),
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
  const refOnlyClose = desktop
    .getByRole("dialog", { name: "Service details" })
    .getByRole("button", { name: "Close inspector" });
  assert.equal(
    await activeElementIs(refOnlyClose),
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
  const replacementClose = desktop
    .getByRole("dialog", { name: "Replacement details" })
    .getByRole("button", { name: "Close inspector" });
  await replacementClose.waitFor();
  await desktop.waitForTimeout(100);
  assert.equal(
    await activeElementIs(replacementClose),
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
