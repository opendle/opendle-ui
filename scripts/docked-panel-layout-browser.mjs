import { strict as assert } from "node:assert";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import AxeBuilder from "@axe-core/playwright";
import { chromium } from "@playwright/test";
import { build } from "esbuild";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));
const fixtureSource = `
import React, { StrictMode, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Button, DockedPanelLayout } from "./dist/index.js";

function Fixture() {
  const [innerOpen, setInnerOpen] = useState(false);
  const [outerOpen, setOuterOpen] = useState(false);
  const [activeSheet, setActiveSheet] = useState(null);
  const [innerOpenerAvailable, setInnerOpenerAvailable] = useState(true);
  const [removeInnerOpenerOnClose, setRemoveInnerOpenerOnClose] = useState(false);
  const [showOuterOnInnerClose, setShowOuterOnInnerClose] = useState(false);
  const innerOpenerRef = useRef(null);
  const outerOpenerRef = useRef(null);
  const selectedItemRef = useRef(null);

  const openInner = () => {
    setInnerOpen(true);
    setActiveSheet("inner");
  };
  const openOuter = () => {
    setOuterOpen(true);
    setActiveSheet("outer");
  };

  return (
    <DockedPanelLayout
      activeSheet={activeSheet}
      innerPanel={{
        children: (
          <div className="fixture-panel-fields">
            <label htmlFor="property-name">Property name</label>
            <input id="property-name" defaultValue="title" />
            <Button onClick={() => setActiveSheet("outer")}>Show YAML sheet</Button>
            <Button onClick={() => setRemoveInnerOpenerOnClose(true)}>
              Remove property opener on close
            </Button>
            <Button onClick={() => setShowOuterOnInnerClose(true)}>
              Show YAML when property closes
            </Button>
          </div>
        ),
        fallbackFocusRef: selectedItemRef,
        onClose: () => {
          if (removeInnerOpenerOnClose) {
            setInnerOpenerAvailable(false);
            setRemoveInnerOpenerOnClose(false);
          }
          setInnerOpen(false);
          if (showOuterOnInnerClose) {
            setOuterOpen(true);
            setActiveSheet("outer");
            setShowOuterOnInnerClose(false);
          } else {
            setActiveSheet(null);
          }
        },
        open: innerOpen,
        openerRef: innerOpenerRef,
        title: "Property inspector",
        width: "20rem",
      }}
      outerPanel={{
        children: (
          <div className="fixture-panel-fields">
            <label htmlFor="yaml-source">YAML source</label>
            <textarea id="yaml-source" defaultValue="objectTypes: {}" />
            <Button onClick={() => setActiveSheet("inner")}>
              Show property sheet
            </Button>
            <Button variant="secondary">Last YAML control</Button>
          </div>
        ),
        fallbackFocusRef: selectedItemRef,
        onClose: () => {
          setOuterOpen(false);
          setActiveSheet(null);
        },
        open: outerOpen,
        openerRef: outerOpenerRef,
        title: "YAML source",
        width: "20rem",
      }}
    >
      <main className="fixture-workspace">
        <h1>Ontology editor</h1>
        <button ref={selectedItemRef} type="button">Selected graph item</button>
        {innerOpenerAvailable ? (
          <button ref={innerOpenerRef} onClick={openInner} type="button">
            Open property inspector
          </button>
        ) : (
          <button onClick={() => setInnerOpenerAvailable(true)} type="button">
            Restore property opener
          </button>
        )}
        <button ref={outerOpenerRef} onClick={openOuter} type="button">
          Open YAML source
        </button>
        <output aria-label="Property open state">{String(innerOpen)}</output>
        <output aria-label="YAML open state">{String(outerOpen)}</output>
      </main>
    </DockedPanelLayout>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode><Fixture /></StrictMode>,
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
    sourcefile: "docked-panel-layout-browser-fixture.jsx",
  },
  write: false,
});
const browserScript = bundle.outputFiles[0]?.text;
assert.ok(browserScript, "The docked-panel fixture must build one script.");
const css = await readFile(
  new URL("../styles/tokens.css", import.meta.url),
  "utf8",
);
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Docked panel test</title><style>${css}*{box-sizing:border-box}html,body,#root{width:100%;height:100%;margin:0}.fixture-workspace{height:100%;padding:1rem;background:var(--od-color-background)}.fixture-workspace>*+*{margin-inline-start:.5rem}.fixture-panel-fields{display:grid;gap:1rem}.fixture-panel-fields :is(input,textarea){width:100%;min-height:2.75rem}</style></head><body><div id="root"></div></body></html>`;
const systemChrome = "/usr/bin/google-chrome";
const browser = await chromium.launch({
  executablePath: existsSync(systemChrome) ? systemChrome : undefined,
  headless: true,
});

function isActive(locator) {
  return locator.evaluate((element) => element === document.activeElement);
}

const context = await browser.newContext({
  viewport: { width: 1280, height: 800 },
});

try {
  const page = await context.newPage();
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setContent(html);
  await page.addScriptTag({ content: browserScript });

  const layout = page.locator(".od-docked-panel-layout");
  const innerOpener = page.getByRole("button", {
    name: "Open property inspector",
  });
  const outerOpener = page.getByRole("button", { name: "Open YAML source" });
  await innerOpener.click();
  await outerOpener.click();

  const innerPanel = page.getByRole("complementary", {
    name: "Property inspector",
  });
  const outerPanel = page.getByRole("complementary", { name: "YAML source" });
  await innerPanel.waitFor();
  await outerPanel.waitFor();
  const geometry = await layout.evaluate((element) => {
    const workspace = element.querySelector(
      ".od-docked-panel-layout-workspace",
    );
    const inner = element.querySelector('[data-position="inner"]');
    const outer = element.querySelector('[data-position="outer"]');
    const layoutBounds = element.getBoundingClientRect();
    const workspaceBounds = workspace?.getBoundingClientRect();
    const innerBounds = inner?.getBoundingClientRect();
    const outerBounds = outer?.getBoundingClientRect();
    return {
      innerLeft: innerBounds?.left,
      innerRight: innerBounds?.right,
      layoutRight: layoutBounds.right,
      outerLeft: outerBounds?.left,
      outerRight: outerBounds?.right,
      workspaceRight: workspaceBounds?.right,
      workspaceWidth: workspaceBounds?.width,
    };
  });
  assert.equal(geometry.workspaceWidth, 640);
  assert.equal(geometry.workspaceRight, geometry.innerLeft);
  assert.equal(geometry.innerRight, geometry.outerLeft);
  assert.equal(geometry.outerRight, geometry.layoutRight);
  const desktopCloseBounds = await outerPanel
    .getByRole("button", { name: "Close YAML source" })
    .boundingBox();
  assert.ok(desktopCloseBounds);
  assert.equal(
    desktopCloseBounds.width >= 44 && desktopCloseBounds.height >= 44,
    true,
  );
  assert.deepEqual(
    (await new AxeBuilder({ page }).analyze()).violations,
    [],
    "The desktop docked-panel fixture must have no Axe violations.",
  );

  await page.setViewportSize({ width: 390, height: 844 });
  const yamlSheet = page.getByRole("dialog", { name: "YAML source" });
  await yamlSheet.waitFor();
  assert.equal(await page.getByRole("dialog").count(), 1);
  assert.deepEqual(await yamlSheet.boundingBox(), {
    height: 844,
    width: 390,
    x: 0,
    y: 0,
  });
  assert.equal(
    await page.getByLabel("Property open state").textContent(),
    "true",
  );
  assert.equal(await page.getByLabel("YAML open state").textContent(), "true");
  const phoneCloseBounds = await yamlSheet
    .getByRole("button", { name: "Close YAML source" })
    .boundingBox();
  assert.ok(phoneCloseBounds);
  assert.equal(
    phoneCloseBounds.width >= 44 && phoneCloseBounds.height >= 44,
    true,
  );
  const lastYamlControl = yamlSheet.getByRole("button", {
    name: "Last YAML control",
  });
  await lastYamlControl.focus();
  await page.keyboard.press("Tab");
  assert.equal(
    await isActive(
      yamlSheet.getByRole("button", { name: "Close YAML source" }),
    ),
    true,
    "Tab must wrap to the first sheet control.",
  );
  await yamlSheet.getByRole("button", { name: "Show property sheet" }).click();
  const propertySheet = page.getByRole("dialog", {
    name: "Property inspector",
  });
  await propertySheet.waitFor();
  assert.equal(await page.getByRole("dialog").count(), 1);
  assert.equal(
    await isActive(
      propertySheet.getByRole("button", {
        name: "Close Property inspector",
      }),
    ),
    true,
    "A newly selected phone sheet must receive focus.",
  );

  await page.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });
  assert.equal(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
    true,
    "The phone sheet must not add horizontal overflow at 200-percent text.",
  );
  assert.deepEqual(
    (await new AxeBuilder({ page }).analyze()).violations,
    [],
    "The phone docked-panel fixture must have no Axe violations.",
  );
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "";
  });

  await page.setViewportSize({ width: 1280, height: 800 });
  await innerPanel.waitFor();
  await outerPanel.waitFor();
  assert.equal(
    await innerPanel.evaluate((inner) =>
      inner.nextElementSibling?.getAttribute("data-position"),
    ),
    "outer",
    "Both open states must return in stable desktop order.",
  );

  await page.setViewportSize({ width: 390, height: 844 });
  await propertySheet.waitFor();
  await propertySheet
    .getByRole("button", { name: "Remove property opener on close" })
    .click();
  await propertySheet
    .getByRole("button", { name: "Close Property inspector" })
    .click();
  await propertySheet.waitFor({ state: "detached" });
  const selectedItem = page.getByRole("button", {
    name: "Selected graph item",
  });
  await page.waitForFunction(
    () => document.activeElement?.textContent === "Selected graph item",
  );
  assert.equal(await isActive(selectedItem), true);

  await page.getByRole("button", { name: "Restore property opener" }).click();
  const restoredOpener = page.getByRole("button", {
    name: "Open property inspector",
  });
  await restoredOpener.click();
  await propertySheet.waitFor();
  await page.keyboard.press("Escape");
  await propertySheet.waitFor({ state: "detached" });
  await page.waitForFunction(
    () => document.activeElement?.textContent === "Open property inspector",
  );
  assert.equal(await isActive(restoredOpener), true);

  await page.setViewportSize({ width: 1280, height: 800 });
  await restoredOpener.click();
  await innerPanel.waitFor();
  await innerPanel.getByLabel("Property name").focus();
  await page.keyboard.press("Escape");
  await innerPanel.waitFor({ state: "detached" });
  await page.waitForFunction(
    () => document.activeElement?.textContent === "Open property inspector",
  );
  assert.equal(await isActive(restoredOpener), true);

  await restoredOpener.click();
  await innerPanel.waitFor();
  await page.setViewportSize({ width: 390, height: 844 });
  await propertySheet.waitFor();
  await propertySheet
    .getByRole("button", { name: "Show YAML when property closes" })
    .click();
  await propertySheet
    .getByRole("button", { name: "Close Property inspector" })
    .click();
  await yamlSheet.waitFor();
  await page.evaluate(
    () =>
      new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
      }),
  );
  assert.equal(
    await isActive(
      yamlSheet.getByRole("button", { name: "Close YAML source" }),
    ),
    true,
    "Delayed panel focus return must stay inside a newly opened sheet.",
  );
  assert.deepEqual(errors, []);
  await page.close();
} finally {
  await context.close();
  await browser.close();
}

console.log("Docked panel layout browser checks passed.");
