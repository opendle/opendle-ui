import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import AxeBuilder from "@axe-core/playwright";
import { chromium } from "@playwright/test";
import { build } from "esbuild";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));
const fixture = String.raw`
import React, {StrictMode, useLayoutEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Button, GraphEmptyState, GraphInspector, GraphNode, GraphToolbar, GraphViewport, GraphWorkspace, PageSurface, RelationshipGraph} from '@opendle/ui';
function Fixture() {
  const [options, setOptions] = useState({kind:'tree',state:'stale',edge:true,oversized:true});
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);
  const [retries, setRetries] = useState(0);
  const opener = useRef(null);
  useLayoutEffect(() => {window.configure = patch => setOptions(value => ({...value,...patch}));}, []);
  const retry = <Button onClick={() => {setRetries(value => value + 1);setOptions(value => ({...value,state:'loading'}));}}>Retry records</Button>;
  const messages = {empty:'No records',loading:'Loading records',stale:'Confirmed records are shown',error:'Records could not load'};
  const content = options.state === 'omitted' ? undefined : options.state === 'false' ? false : options.state === 'fragment' ? <>{null}{false}<></></> : (
    <div role={options.state === 'error' ? 'alert' : 'status'}>
      <GraphEmptyState title={messages[options.state]} description="The graph stays available while the next request completes." actions={options.state === 'error' || options.state === 'empty' ? retry : undefined}/>
    </div>
  );
  const columns = ['Sources','Records','Targets'].map((label,index) => ({id:label,label,nodes:options.state === 'empty' ? [] : Array.from({length:options.oversized ? 24 : 1},(_,i) => ({id:label+i,label:label+' '+i,detail:'Confirmed item'}))}));
  const inspector = open ? <GraphInspector title="Selected record" onClose={() => setOpen(false)} returnFocusRef={opener}><label>Record name<input defaultValue="Saved name"/></label></GraphInspector> : undefined;
  const actions = <Button onClick={() => setOptions(value => ({...value,state:'loading'}))}>Refresh records</Button>;
  const toolbar = <GraphToolbar leading={<span>Example graph</span>} actions={actions}/>;
  return <main aria-label="Graph test" className={options.oversized ? 'fixture-oversized' : undefined}>
    <h1 className="od-visually-hidden">Graph test</h1>
    <PageSurface edgeToEdge={options.edge} style={{height:'100%'}}>
      {options.kind === 'relations' ? <RelationshipGraph aria-label="Relations" viewportLabel={options.defaultLabel ? undefined : 'Exact records viewport'} fullPage columns={columns} relationships={[]} viewportContent={content} selectedNodeId={selected} onSelectionChange={setSelected} onNodeActivate={({node,trigger}) => {opener.current=trigger;setSelected(node.id);setOpen(true);}} inspector={inspector} toolbar={{leading:'Example graph',actions}}/> :
      <GraphWorkspace aria-label="Tree graph" fullPage toolbar={toolbar} inspector={inspector} selectedControlRef={opener}>
        <GraphViewport aria-label="Exact tree viewport" canvasAlignment={options.alignment ?? 'center'} canvasWidth={options.oversized ? 1800 : 220} canvasHeight={options.oversized ? 1800 : 160} viewportContent={content}>
          {options.state !== 'empty' && <GraphNode x={10} y={10} title="Retained node" selected={selected === 'tree'} onClick={event => {opener.current=event.currentTarget;setSelected('tree');setOpen(true);}}/>}
        </GraphViewport>
      </GraphWorkspace>}
      <output hidden data-retries={retries} data-selected={selected ?? ''}/>
    </PageSurface>
  </main>;
}
createRoot(document.getElementById('root')).render(<StrictMode><Fixture/></StrictMode>);
`;
const bundle = await build({
  bundle: true,
  format: "iife",
  platform: "browser",
  jsx: "automatic",
  logLevel: "silent",
  stdin: {
    contents: fixture,
    loader: "jsx",
    resolveDir: repositoryRoot,
    sourcefile: "viewport-content-fixture.jsx",
  },
  write: false,
});
const css = await readFile(
  new URL("../styles/tokens.css", import.meta.url),
  "utf8",
);
const screenshotDirectory = await mkdtemp(
  join(tmpdir(), "opendle-viewport-content-"),
);
const browser = await chromium.launch({
  executablePath: existsSync("/usr/bin/google-chrome")
    ? "/usr/bin/google-chrome"
    : undefined,
  headless: true,
});
const errors = [];
const near = (actual, expected, label) =>
  assert.ok(
    Math.abs(actual - expected) <= 1,
    `${label}: ${actual} != ${expected}`,
  );
async function settle(page) {
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
}
async function configure(page, patch) {
  await page.evaluate((value) => window.configure(value), patch);
  await settle(page);
}
async function metrics(page) {
  return page.evaluate(() => {
    const viewport = document.querySelector(
      ".od-graph-viewport, .od-relationship-graph-viewport",
    );
    const content = viewport.querySelector(".od-graph-viewport-content");
    const canvas = viewport.querySelector(
      ".od-graph-canvas, .od-relationship-graph-board",
    );
    const toolbar = document.querySelector(".od-graph-toolbar");
    const box = (element) => {
      const r = element.getBoundingClientRect();
      return {
        x: r.x,
        y: r.y,
        width: r.width,
        height: r.height,
        right: r.right,
        bottom: r.bottom,
      };
    };
    const probe = document.createElement("div");
    probe.style.width = "var(--od-page-gutter)";
    probe.style.position = "absolute";
    document.querySelector(".od-page-surface").append(probe);
    const gutter = probe.getBoundingClientRect().width;
    probe.remove();
    const style = content && getComputedStyle(content);
    const empty = content?.querySelector(".od-graph-empty-state");
    return {
      viewport: box(viewport),
      content: content && box(content),
      canvas: canvas && box(canvas),
      toolbar: box(toolbar),
      padding: style && [
        parseFloat(style.paddingLeft),
        parseFloat(style.paddingRight),
      ],
      emptyPadding: empty && [
        getComputedStyle(empty).paddingLeft,
        getComputedStyle(empty).paddingRight,
      ],
      gutter,
      scroll: [
        viewport.scrollWidth,
        viewport.scrollHeight,
        viewport.clientWidth,
        viewport.clientHeight,
      ],
      document: [
        document.documentElement.scrollWidth,
        document.documentElement.scrollHeight,
        innerWidth,
        innerHeight,
      ],
    };
  });
}
async function noOverflow(page) {
  const m = await metrics(page);
  assert.ok(
    m.document[0] <= m.document[2] && m.document[1] <= m.document[3],
    JSON.stringify(m),
  );
  return m;
}
try {
  for (const size of [
    { width: 1440, height: 1000 },
    { width: 1100, height: 800 },
    { width: 390, height: 844 },
  ]) {
    for (const textScale of [1, 2]) {
      const context = await browser.newContext({
        viewport: size,
        deviceScaleFactor: 1,
      });
      const page = await context.newPage();
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      // CSS environment substitution supplies deterministic unequal physical safe areas.
      const safeCss = css
        .replaceAll(
          "env(safe-area-inset-left)",
          "var(--fixture-safe-left, 0px)",
        )
        .replaceAll(
          "env(safe-area-inset-right)",
          "var(--fixture-safe-right, 0px)",
        );
      await page.setContent(
        `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Graph viewport content</title><style>${safeCss}html{font-size:${textScale * 100}%}body{margin:0;background:#182023;color:#e5ebe7}#root,main{height:100dvh}main{min-width:0}.fixture-oversized .od-relationship-graph-board{min-width:1800px}input{max-width:100%}</style></head><body><div id="root"></div></body></html>`,
      );
      await page.addScriptTag({ content: bundle.outputFiles[0].text });
      await page.waitForFunction(() => typeof window.configure === "function");
      for (const kind of ["tree", "relations"]) {
        await configure(page, {
          kind,
          state: "stale",
          edge: true,
          oversized: true,
        });
        const viewport = page.getByRole("region", {
          name:
            kind === "tree" ? "Exact tree viewport" : "Exact records viewport",
          exact: true,
        });
        await viewport.waitFor();
        for (const state of ["loading", "stale", "error", "empty"]) {
          await configure(page, { state });
          await viewport.evaluate((element) => {
            element.scrollTop = 0;
            element.scrollLeft = 0;
          });
          const m = await noOverflow(page);
          near(
            m.content.width,
            m.viewport.width,
            "Content uses viewport width",
          );
          near(m.content.x, m.viewport.x, "Content starts at viewport edge");
          assert.ok(
            m.canvas.y >= m.content.bottom - 1,
            "Board follows state content",
          );
          near(m.padding[0], m.gutter, "Left shared inset");
          near(m.padding[1], m.gutter, "Right shared inset");
          assert.deepEqual(
            m.emptyPadding,
            ["0px", "0px"],
            "Nested state has no second inset",
          );
          if (state !== "empty")
            assert.equal(
              await viewport
                .locator(kind === "tree" ? ".od-graph-node" : "[data-node-id]")
                .count(),
              kind === "tree" ? 1 : 72,
            );
          const axe = await new AxeBuilder({ page }).analyze();
          assert.deepEqual(
            axe.violations,
            [],
            `${kind} ${size.width} ${textScale} ${state}`,
          );
          await page.screenshot({
            path: join(
              screenshotDirectory,
              `${kind}-${size.width}-${textScale}-${state}.png`,
            ),
          });
          if (state === "error" || state === "empty") {
            const before = Number(
              await page
                .locator("output[data-retries]")
                .getAttribute("data-retries"),
            );
            await page.getByRole("button", { name: "Retry records" }).focus();
            await page.keyboard.press("Enter");
            await settle(page);
            assert.equal(
              Number(
                await page
                  .locator("output[data-retries]")
                  .getAttribute("data-retries"),
              ),
              before + 1,
            );
            await page
              .getByRole("heading", { name: "Loading records" })
              .waitFor();
          }
        }
        await configure(page, { state: "stale" });
        await page.evaluate(() => {
          document.documentElement.style.setProperty(
            "--fixture-safe-left",
            "137px",
          );
          document.documentElement.style.setProperty(
            "--fixture-safe-right",
            "9px",
          );
        });
        let m = await noOverflow(page);
        near(m.padding[0], Math.max(m.gutter, 137), "Physical left maximum");
        near(m.padding[1], Math.max(m.gutter, 9), "Physical right maximum");
        assert.deepEqual(m.emptyPadding, ["0px", "0px"]);
        await page.screenshot({
          path: join(
            screenshotDirectory,
            `${kind}-${size.width}-${textScale}-safe.png`,
          ),
        });
        await page.evaluate(() => {
          document.documentElement.style.setProperty(
            "--fixture-safe-left",
            "9px",
          );
          document.documentElement.style.setProperty(
            "--fixture-safe-right",
            "137px",
          );
        });
        m = await noOverflow(page);
        near(
          m.padding[0],
          Math.max(m.gutter, 9),
          "Swapped physical left maximum",
        );
        near(
          m.padding[1],
          Math.max(m.gutter, 137),
          "Swapped physical right maximum",
        );
        assert.ok(
          await page.locator(".od-graph-toolbar").evaluate((toolbar) =>
            [...toolbar.querySelectorAll("input,button")].every((control) => {
              const r = control.getBoundingClientRect();
              return r.left >= 0 && r.right <= innerWidth;
            }),
          ),
          "Safe areas do not clip toolbar controls",
        );
        const before = m.toolbar;
        await viewport.evaluate((element) => {
          element.scrollLeft = 180;
          element.scrollTop = 240;
        });
        assert.ok(
          await viewport.evaluate(
            (element) => element.scrollLeft > 0 && element.scrollTop > 0,
          ),
          "Both local axes scroll",
        );
        m = await noOverflow(page);
        near(m.toolbar.x, before.x, "Toolbar x stays fixed");
        near(m.toolbar.y, before.y, "Toolbar y stays fixed");
        await viewport.evaluate((element) => {
          element.scrollLeft = 0;
          element.scrollTop = 0;
        });
        await page.evaluate(() => {
          document.documentElement.style.removeProperty("--fixture-safe-left");
          document.documentElement.style.removeProperty("--fixture-safe-right");
        });
        const node = viewport.locator(
          kind === "tree" ? ".od-graph-node" : '[data-node-id="Sources0"]',
        );
        await node.click();
        const dialog = page.getByRole("dialog", { name: "Selected record" });
        await dialog.waitFor();
        await dialog.getByLabel("Record name").fill("Unsaved name");
        const original = await node.elementHandle();
        const originalDialog = await dialog.elementHandle();
        for (const state of ["loading", "stale", "error"]) {
          await configure(page, { state });
          assert.equal(
            await node.evaluate((element, old) => element === old, original),
            true,
            "Selected control stays mounted",
          );
          assert.equal(
            await dialog.evaluate(
              (element, old) => element === old,
              originalDialog,
            ),
            true,
            "Inspector stays mounted",
          );
          assert.equal(
            await dialog.getByLabel("Record name").inputValue(),
            "Unsaved name",
          );
          assert.equal(
            await page
              .locator("output[data-retries]")
              .getAttribute("data-selected"),
            kind === "tree" ? "tree" : "Sources0",
          );
        }
        await noOverflow(page);
        assert.deepEqual(
          (await new AxeBuilder({ page }).analyze()).violations,
          [],
        );
        await page.screenshot({
          path: join(
            screenshotDirectory,
            `${kind}-${size.width}-${textScale}-inspector.png`,
          ),
        });
        await page.keyboard.press("Escape");
        await dialog.waitFor({ state: "detached" });
        await settle(page);
        assert.equal(
          await node.evaluate((element) => element === document.activeElement),
          true,
          "Escape returns to retained opener",
        );
      }
      // Omitted content keeps default labels and small-tree geometry in all page modes.
      for (const edge of [true, false, undefined]) {
        await configure(page, {
          kind: "tree",
          state: "omitted",
          oversized: false,
          edge,
        });
        const before = await metrics(page);
        for (const state of ["false", "fragment"]) {
          await configure(page, { state });
          assert.equal(
            await page.locator(".od-graph-viewport-content").count(),
            0,
          );
          assert.deepEqual((await metrics(page)).canvas, before.canvas);
        }
        await configure(page, { state: "stale" });
        const after = await noOverflow(page);
        near(
          after.canvas.x + after.canvas.width / 2,
          after.viewport.x + after.viewport.width / 2,
          "Small tree centered horizontally",
        );
        const free =
          after.viewport.bottom - after.content.bottom - after.canvas.height;
        near(
          after.canvas.y,
          after.content.bottom + Math.max(0, free) / 2,
          "Small tree centered below state",
        );
      }
      await configure(page, {
        kind: "relations",
        state: "omitted",
        defaultLabel: true,
        edge: true,
      });
      await page
        .getByRole("region", { name: "Relations viewport", exact: true })
        .waitFor();
      // An overlay starts just above the 48rem host boundary, including at 200% text.
      await page.setViewportSize({
        width: 48 * 16 * textScale + 1,
        height: 1000,
      });
      for (const kind of ["tree", "relations"]) {
        for (const oversized of [false, true]) {
          await configure(page, {
            kind,
            state: "error",
            edge: true,
            oversized,
            defaultLabel: false,
          });
          const node = page.locator(
            kind === "tree" ? ".od-graph-node" : '[data-node-id="Sources0"]',
          );
          await node.click();
          const dialog = page.getByRole("dialog", { name: "Selected record" });
          await dialog.getByLabel("Record name").fill("Keep this draft");
          assert.equal(await dialog.getAttribute("data-mode"), "overlay");
          const retry = page.getByRole("button", { name: "Retry records" });
          for (
            let step = 0;
            step < 8 &&
            !(await retry.evaluate(
              (element) => element === document.activeElement,
            ));
            step++
          )
            await page.keyboard.press("Shift+Tab");
          assert.ok(
            await retry.evaluate(
              (element) => element === document.activeElement,
            ),
            "Retry is in the native Tab order",
          );
          assert.ok(
            await retry.evaluate((element) => {
              const r = element.getBoundingClientRect();
              return [
                [r.left + 3, r.y + r.height / 2],
                [r.right - 3, r.y + r.height / 2],
                [r.x + r.width / 2, r.top + 3],
                [r.x + r.width / 2, r.bottom - 3],
                [r.x + r.width / 2, r.y + r.height / 2],
              ].every(([x, y]) =>
                element.contains(document.elementFromPoint(x, y)),
              );
            }),
            "Focused Retry is not covered by the overlay",
          );
          const before = Number(
            await page
              .locator("output[data-retries]")
              .getAttribute("data-retries"),
          );
          await page.keyboard.press("Enter");
          await settle(page);
          assert.equal(
            Number(
              await page
                .locator("output[data-retries]")
                .getAttribute("data-retries"),
            ),
            before + 1,
          );
          assert.equal(
            await dialog.getByLabel("Record name").inputValue(),
            "Keep this draft",
          );
          await configure(page, { state: "error" });
          const viewport = page.locator(
            ".od-graph-viewport, .od-relationship-graph-viewport",
          );
          await viewport.evaluate((element) => {
            element.scrollTop = 0;
            element.scrollLeft = 200;
          });
          await retry.click();
          await settle(page);
          assert.equal(
            Number(
              await page
                .locator("output[data-retries]")
                .getAttribute("data-retries"),
            ),
            before + 2,
          );
          assert.equal(
            await dialog.getByLabel("Record name").inputValue(),
            "Keep this draft",
          );
          await noOverflow(page);
          await configure(page, { state: "error" });
          await retry.focus();
          assert.deepEqual(
            (await new AxeBuilder({ page }).analyze()).violations,
            [],
          );
          await page.screenshot({
            path: join(
              screenshotDirectory,
              `${kind}-${size.width}-${textScale}-overlay-${oversized}.png`,
            ),
          });
          if (oversized) {
            await configure(page, { state: "omitted" });
            await viewport.evaluate((element) => {
              element.scrollLeft = 200;
              element.scrollTop = 0;
            });
            const scrollBefore = await viewport.evaluate(
              (element) => element.scrollLeft,
            );
            assert.ok(scrollBefore > 0);
            await page
              .getByRole("button", { name: "Refresh records" })
              .evaluate((element) => element.focus({ preventScroll: true }));
            assert.equal(
              await viewport.evaluate((element) => element.scrollLeft),
              scrollBefore,
              "Toolbar focus does not move omitted-content graph",
            );
            await dialog
              .getByLabel("Record name")
              .evaluate((element) => element.focus({ preventScroll: true }));
            assert.equal(
              await viewport.evaluate((element) => element.scrollLeft),
              scrollBefore,
              "Inspector focus does not move omitted-content graph",
            );
          }
          await dialog.getByRole("button", { name: "Close inspector" }).click();
          await dialog.waitFor({ state: "detached" });
        }
      }
      await context.close();
    }
  }
  assert.deepEqual(errors, [], "No browser errors");
  console.log(
    `Graph viewport content checks passed. Screenshots: ${screenshotDirectory}`,
  );
} finally {
  await browser.close();
}
