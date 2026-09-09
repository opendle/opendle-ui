import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
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
import {Button, GraphEdge, GraphEdges, GraphEmptyState, GraphInspector, GraphNode, GraphNodeAction, GraphToolbar, GraphViewport, GraphWorkspace, PageSurface} from '@opendle/ui';
function Fixture() {
  const [options, setOptions] = useState({width:876,canvasWidth:668,alignment:'center',dir:'ltr',notice:false,controlled:false,long:false,scale:1});
  const [selected, setSelected] = useState('end');
  const [open, setOpen] = useState(false);
  const [viewport, setViewport] = useState({x:0,y:0,zoom:1});
  const selectedRef = useRef(null);
  const opener = useRef(null);
  const controls = useRef(new Map());
  useLayoutEffect(() => {
    window.configure = patch => setOptions(value => ({...value,...patch}));
    window.select = id => setSelected(id);
  }, []);
  const endX = options.canvasWidth - 212*options.scale;
  const nodes = [{id:'start',x:20*options.scale,y:40*options.scale},{id:'end',x:endX,y:(options.long ? 360 : 190)*options.scale}];
  const activate = (id, trigger) => {opener.current=trigger;setSelected(id);setOpen(true);};
  const reference = id => element => {
    if(element) controls.current.set(id,element); else controls.current.delete(id);
    if(element && selected === id) selectedRef.current=element;
  };
  const notice = options.notice ? <GraphEmptyState icon={null} title="Confirmed records" description="The graph remains available." actions={<Button onClick={() => setSelected('start')}>Refresh records</Button>}/> : undefined;
  return <main aria-label="Native graph test" style={{width:options.width}} dir={options.dir}>
    <h1 className="od-visually-hidden">Native graph test</h1>
    <PageSurface edgeToEdge style={{height:'100%'}}>
      <GraphWorkspace aria-label="Native graph" fullPage selectedControlRef={selectedRef}
        toolbar={<GraphToolbar leading="Example graph" actions={<Button onClick={() => activate('end', controls.current.get('end'))}>Open record</Button>}/>}
        inspector={open ? <GraphInspector title="Selected record" onClose={() => setOpen(false)} returnFocusRef={opener}><label>Record name<input defaultValue="Saved name"/></label></GraphInspector> : undefined}>
        <GraphViewport aria-label="Native viewport" canvasWidth={options.canvasWidth} canvasHeight={(options.long ? 1000 : 480)*options.scale} canvasAlignment={options.alignment} viewportContent={notice}
          viewport={options.controlled ? viewport : undefined} onViewportChange={setViewport}>
          <GraphEdges aria-hidden="true"><GraphEdge path={'M '+108*options.scale+' '+112*options.scale+' L '+(endX+88*options.scale)+' '+(options.long ? 360 : 190)*options.scale}/></GraphEdges>
          {nodes.map(node => <GraphNode key={node.id} ref={reference(node.id)} data-control={node.id} aria-label={'Inspect '+node.id} x={node.x} y={node.y} title={options.long && node.id === 'end' ? 'A long record name with spaces and an identifier '+ 'W'.repeat(40) : node.id === 'end' ? 'Selected record' : 'First record'} selected={selected === node.id} onClick={event => activate(node.id,event.currentTarget)}/>)}
          <GraphNodeAction onFocus={event => {selectedRef.current=event.currentTarget;setSelected('action');}} data-control="action" aria-label="Add related record" variant="text" x={Math.max(0,endX-120*options.scale)} y={(options.long ? 780 : 340)*options.scale} onClick={event => activate('action',event.currentTarget)}>Add related record</GraphNodeAction>
        </GraphViewport>
      </GraphWorkspace>
    </PageSurface>
    <output hidden data-selected={selected} data-viewport={JSON.stringify(viewport)}/>
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
    sourcefile: "native-overlay-fixture.jsx",
  },
  write: false,
});
const css = await readFile(
  fileURLToPath(import.meta.resolve("@opendle/ui/styles.css")),
  "utf8",
);
const evidenceDirectory = await mkdtemp(
  join(tmpdir(), "opendle-native-overlay-"),
);
console.log(`Native overlay evidence: ${evidenceDirectory}`);
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
        requestAnimationFrame(() =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        ),
      ),
  );
}
async function configure(page, patch) {
  await page.evaluate((value) => window.configure(value), patch);
  await settle(page);
}
async function select(page, id) {
  await page.evaluate((value) => window.select(value), id);
  await settle(page);
}
async function revealVertical(page, id) {
  // Use the local native scroll area to expose tall graph content on its block axis.
  await page.locator('[data-control="' + id + '"]').evaluate((control) => {
    const viewport = control.closest(".od-graph-viewport");
    const c = control.getBoundingClientRect(),
      v = viewport.getBoundingClientRect();
    if (c.bottom > v.bottom) viewport.scrollTop += c.bottom - v.bottom + 4;
    else if (c.top < v.top) viewport.scrollTop -= v.top - c.top + 4;
  });
  await settle(page);
}
async function metrics(page, id = "end") {
  return page.evaluate((id) => {
    const viewport = document.querySelector(".od-graph-viewport");
    const canvas = document.querySelector(".od-graph-canvas");
    const inspector = document.querySelector(".od-graph-inspector");
    const control = document.querySelector('[data-control="' + id + '"]');
    const box = (element) => {
      const b = element.getBoundingClientRect();
      return {
        left: b.left,
        right: b.right,
        top: b.top,
        bottom: b.bottom,
        width: b.width,
        height: b.height,
      };
    };
    const c = box(control);
    const path = document.querySelector(".od-graph-edge-line");
    const point = (length) => {
      const position = path
        .getPointAtLength(length)
        .matrixTransform(path.getScreenCTM());
      return { x: position.x, y: position.y };
    };
    const start = box(document.querySelector('[data-control="start"]'));
    const end = box(document.querySelector('[data-control="end"]'));
    const connector = {
      start: point(0),
      end: point(path.getTotalLength()),
      source: { x: start.left + start.width / 2, y: start.bottom },
      target: { x: end.left + end.width / 2, y: end.top },
    };
    const points = [
      [c.left + 3, c.top + c.height / 2],
      [c.right - 3, c.top + c.height / 2],
      [c.left + c.width / 2, c.top + 3],
      [c.left + c.width / 2, c.bottom - 3],
    ];
    return {
      connector,
      viewport: box(viewport),
      canvas: box(canvas),
      inspector: inspector && box(inspector),
      control: c,
      mode: inspector?.dataset.mode,
      scrollWidth: viewport.scrollWidth,
      clientWidth: viewport.clientWidth,
      scrollLeft: viewport.scrollLeft,
      document: [
        document.documentElement.scrollWidth,
        document.documentElement.scrollHeight,
        innerWidth,
        innerHeight,
      ],
      hit: points.every(([x, y]) =>
        control.contains(document.elementFromPoint(x, y)),
      ),
      marginEnd: getComputedStyle(canvas).marginInlineEnd,
      transform: getComputedStyle(canvas).transform,
    };
  }, id);
}
function connected(m) {
  near(
    m.connector.start.x,
    m.connector.source.x,
    "Connector source inline anchor",
  );
  near(
    m.connector.start.y,
    m.connector.source.y,
    "Connector source block anchor",
  );
  near(
    m.connector.end.x,
    m.connector.target.x,
    "Connector target inline anchor",
  );
  near(
    m.connector.end.y,
    m.connector.target.y,
    "Connector target block anchor",
  );
}
async function reachable(page, id = "end") {
  const m = await metrics(page, id);
  connected(m);
  assert.ok(
    m.document[0] <= m.document[2] && m.document[1] <= m.document[3],
    `No document overflow: ${JSON.stringify(m)}`,
  );
  assert.ok(
    m.control.left >= m.viewport.left - 1 &&
      m.control.right <= m.viewport.right + 1,
    `Control stays inside local viewport: ${JSON.stringify(m)}`,
  );
  assert.ok(
    m.control.right <= m.inspector.left + 1 ||
      m.control.left >= m.inspector.right - 1,
    `Selected control is beside overlay: ${JSON.stringify(m)}`,
  );
  assert.ok(
    m.hit,
    `Selected control passes pointer hit checks: ${JSON.stringify(m)}`,
  );
  return m;
}
async function capture(page, name) {
  const result = await new AxeBuilder({ page }).analyze();
  await writeFile(
    join(evidenceDirectory, name + "-axe.json"),
    JSON.stringify(result, null, 2) + "\n",
  );
  const violations = result.violations;
  assert.deepEqual(violations, [], name);
  await page.screenshot({ path: join(evidenceDirectory, name + ".png") });
}
async function createPage(scale = 1) {
  const context = await browser.newContext({
    viewport: { width: Math.max(1100, 1120 * scale), height: 1000 * scale },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.setContent(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Native graph overlay</title><style>${css}html{font-size:${scale * 100}%}body{margin:0;background:#182023;color:#e5ebe7}main{height:100dvh;margin-inline-start:auto;max-width:100%}input{max-width:100%}</style></head><body><div id="root"></div></body></html>`,
  );
  await page.addScriptTag({ content: bundle.outputFiles[0].text });
  await page.waitForFunction(() => typeof window.configure === "function");
  await settle(page);
  return page;
}
try {
  const page = await createPage();
  await page.setViewportSize({ width: 1100, height: 800 });
  await settle(page);
  const before = await metrics(page);
  connected(before);
  near(before.viewport.width, 876, "Exact native viewport width");
  near(before.canvas.width, 668, "Exact native canvas width");
  near(before.canvas.left, 328, "Exact centered canvas start");
  near(before.control.left, 784, "Exact selected control start");
  await page.getByRole("button", { name: "Open record", exact: true }).click();
  await settle(page);
  const after = await metrics(page);
  await writeFile(
    join(evidenceDirectory, "exact.json"),
    JSON.stringify({ before, after }, null, 2) + "\n",
  );
  await page.screenshot({ path: join(evidenceDirectory, "exact.png") });
  await reachable(page);
  await capture(page, "exact-axe");
  await page.context().close();
  for (const scale of [1, 2]) {
    for (const dir of ["ltr", "rtl"]) {
      const page = await createPage(scale);
      for (const shape of [
        { canvasWidth: 668, alignment: "center" },
        { canvasWidth: 220, alignment: "center" },
        { canvasWidth: 1800, alignment: "center" },
        { canvasWidth: 668, alignment: "start" },
      ]) {
        const name = `${dir}-${scale}-${shape.alignment}-${shape.canvasWidth}`;
        await configure(page, {
          ...shape,
          scale,
          canvasWidth: shape.canvasWidth * scale,
          width: 876 * scale,
          dir,
          long: false,
          notice: false,
          controlled: false,
        });
        const before = await metrics(page);
        if (
          shape.alignment === "center" &&
          shape.canvasWidth * scale < before.viewport.width
        )
          near(
            (before.canvas.left + before.canvas.right) / 2,
            (before.viewport.left + before.viewport.right) / 2,
            "Closed small canvas stays centered",
          );
        await page
          .getByRole("button", { name: "Open record", exact: true })
          .click();
        await settle(page);
        const dialog = page.getByRole("dialog", { name: "Selected record" });
        assert.equal(await dialog.getAttribute("data-mode"), "overlay");
        assert.equal(
          await dialog
            .getByRole("heading", { name: "Selected record" })
            .evaluate((e) => e === document.activeElement),
          true,
          "Opening focuses heading",
        );
        const opened = await reachable(page);
        near(
          opened.control.width,
          176 * scale,
          "Default node width follows text size",
        );
        near(
          opened.canvas.width,
          before.canvas.width,
          "Opening preserves native canvas width",
        );
        near(
          opened.viewport.width,
          before.viewport.width,
          "Overlay preserves graph width",
        );
        near(opened.inspector.width, 21 * 16 * scale, "Shared inspector width");
        const originalDialog = await dialog.elementHandle();
        const input = dialog.getByLabel("Record name");
        await input.fill("Keep this draft");
        const originalInput = await input.elementHandle();
        const originalNode = await page
          .locator('[data-control="end"]')
          .elementHandle();
        for (const id of ["start", "end", "start", "end"]) {
          await select(page, id);
          await reachable(page, id);
          assert.equal(
            await input.evaluate((e) => e === document.activeElement),
            true,
            "Selection retains field focus",
          );
          assert.equal(await input.inputValue(), "Keep this draft");
        }
        await page
          .getByRole("button", { name: "Add related record", exact: true })
          .focus();
        await settle(page);
        await reachable(page, "action");
        await input.focus();
        await select(page, "end");
        await capture(page, name);
        for (const width of [
          69 * 16 * scale + 1,
          69 * 16 * scale,
          69 * 16 * scale - 1,
          48 * 16 * scale + 1,
          48 * 16 * scale,
          48 * 16 * scale - 1,
          876 * scale,
        ]) {
          await configure(page, { width });
          const expected =
            width >= 69 * 16 * scale
              ? "split"
              : width > 48 * 16 * scale
                ? "overlay"
                : "sheet";
          assert.equal(
            await dialog.getAttribute("data-mode"),
            expected,
            `${name} width ${width}`,
          );
          assert.equal(
            await dialog.evaluate((e, old) => e === old, originalDialog),
            true,
            "Resize keeps same inspector",
          );
          assert.equal(
            await input.evaluate((e, old) => e === old, originalInput),
            true,
            "Resize keeps same field",
          );
          assert.equal(
            await input.evaluate((e) => e === document.activeElement),
            true,
            "Resize keeps field focus",
          );
          assert.equal(await input.inputValue(), "Keep this draft");
          assert.equal(
            await page
              .locator('[data-control="end"]')
              .evaluate((e, old) => e === old, originalNode),
            true,
            "Resize keeps selected node",
          );
          if (expected === "overlay") await reachable(page);
          if (
            shape.alignment === "center" &&
            shape.canvasWidth === 668 &&
            (width === 69 * 16 * scale + 1 || width === 48 * 16 * scale)
          )
            await capture(page, `${dir}-${scale}-${expected}`);
          const m = await metrics(page);
          assert.ok(
            m.document[0] <= m.document[2] && m.document[1] <= m.document[3],
            "Resize has no document overflow",
          );
        }
        await dialog.getByRole("button", { name: "Close inspector" }).click();
        await settle(page);
        assert.equal(
          await page
            .locator('[data-control="end"]')
            .evaluate((e) => e === document.activeElement),
          true,
          "Close returns focus to exact opener",
        );
        const closed = await metrics(page);
        near(
          closed.canvas.width,
          before.canvas.width,
          "Close preserves canvas width",
        );
        if (
          shape.alignment === "center" &&
          shape.canvasWidth * scale < closed.viewport.width
        )
          near(
            (closed.canvas.left + closed.canvas.right) / 2,
            (closed.viewport.left + closed.viewport.right) / 2,
            "Close restores small canvas centering",
          );
      }
      // A notice and a native canvas share one trailing clearance.
      await configure(page, {
        width: 876 * scale,
        canvasWidth: 1800 * scale,
        alignment: "center",
        notice: false,
        long: true,
      });
      await page
        .getByRole("button", { name: "Open record", exact: true })
        .click();
      await settle(page);
      const withoutNotice = await reachable(page);
      const edgePath = await page
        .locator(".od-graph-edge path")
        .first()
        .getAttribute("d");
      const node = page.locator('[data-control="end"]');
      const longNode = await node.elementHandle();
      await configure(page, { notice: true });
      const withNotice = await reachable(page);
      near(
        withNotice.scrollWidth,
        Math.max(
          withoutNotice.scrollWidth,
          withNotice.clientWidth + 21.875 * 16 * scale,
        ),
        "Notice does not add a second trailing inset",
      );
      assert.equal(
        await node.evaluate((e, old) => e === old, longNode),
        true,
        "Notice preserves node DOM",
      );
      assert.equal(
        await page.locator(".od-graph-edge path").first().getAttribute("d"),
        edgePath,
        "Notice preserves connector geometry",
      );
      const noticeGeometry = await page
        .locator(".od-graph-viewport-content")
        .evaluate((e) => ({
          width: e.getBoundingClientRect().width,
          padding: getComputedStyle(e.querySelector(".od-graph-empty-state"))
            .padding,
        }));
      near(
        noticeGeometry.width,
        withNotice.viewport.width,
        "Notice keeps viewport width",
      );
      assert.equal(
        noticeGeometry.padding,
        "0px",
        "Notice has one content inset",
      );
      for (const id of ["start", "end"]) {
        await revealVertical(page, id);
        await select(page, id);
        await reachable(page, id);
      }
      await revealVertical(page, "action");
      await page
        .getByRole("button", { name: "Add related record", exact: true })
        .focus();
      await settle(page);
      await reachable(page, "action");
      await page
        .getByRole("button", { name: "Refresh records", exact: true })
        .focus();
      await settle(page);
      assert.ok(
        await page
          .getByRole("button", { name: "Refresh records", exact: true })
          .evaluate((e) => {
            const b = e.getBoundingClientRect();
            return e.contains(
              document.elementFromPoint(
                b.left + b.width / 2,
                b.top + b.height / 2,
              ),
            );
          }),
        "Notice action is not covered",
      );
      await revealVertical(page, "end");
      await page
        .getByRole("dialog", { name: "Selected record" })
        .getByLabel("Record name")
        .focus();
      await select(page, "end");
      await reachable(page, "end");
      await capture(page, `${dir}-${scale}-notice-long`);
      await page.getByRole("button", { name: "Close inspector" }).click();
      await settle(page);
      // Controlled pan/zoom keeps its absolute canvas and zero native margins.
      await configure(page, {
        controlled: true,
        notice: false,
        long: false,
        canvasWidth: 668 * scale,
      });
      const controlledBefore = await metrics(page);
      await page
        .getByRole("button", { name: "Open record", exact: true })
        .click();
      await settle(page);
      const controlledAfter = await metrics(page);
      assert.equal(controlledBefore.marginEnd, "0px");
      assert.equal(
        controlledAfter.marginEnd,
        "0px",
        "Native clearance does not enter controlled canvas",
      );
      assert.equal(
        controlledAfter.transform,
        controlledBefore.transform,
        "Opening does not change controlled transform",
      );
      const viewport = page.getByRole("application", {
        name: "Native viewport",
        exact: true,
      });
      await viewport.focus();
      await page.keyboard.press("ArrowLeft");
      await settle(page);
      assert.notEqual(
        (await metrics(page)).transform,
        controlledAfter.transform,
        "Controlled keyboard pan remains available",
      );
      await page.keyboard.press("+");
      await settle(page);
      const zoom = JSON.parse(
        await page.locator("output").getAttribute("data-viewport"),
      ).zoom;
      assert.ok(zoom > 1, "Controlled keyboard zoom remains available");
      await page.getByRole("button", { name: "Close inspector" }).click();
      await page.context().close();
    }
  }
  assert.deepEqual(errors, [], "No browser errors");
  console.log("Native graph overlay checks passed.");
} finally {
  await browser.close();
}
