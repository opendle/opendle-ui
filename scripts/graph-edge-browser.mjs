import { strict as assert } from "node:assert";
import { existsSync } from "node:fs";
import { mkdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import AxeBuilder from "@axe-core/playwright";
import { chromium } from "@playwright/test";
import { build } from "esbuild";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));
const source = String.raw`
import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Button, PageSurface, GraphWorkspace, GraphToolbar, GraphViewport, GraphNode, GraphNodeAction, GraphEmptyState, GraphInspector, RelationshipGraph} from './dist/index.js';
function Fixture() {
 const config = window.fixture;
 const [open, setOpen] = useState(false);
 const [selected, setSelected] = useState('a');
 const action = <Button onClick={() => setOpen(true)}>Inspect graph</Button>;
 const toolbar = <GraphToolbar leading={<Button>Graph context</Button>} actions={action}/>;
 const inspector = open ? <GraphInspector title="Details" onClose={() => setOpen(false)}><p>Selected graph record.</p><Button>Inspector action</Button></GraphInspector> : undefined;
 const columns = ['Sources','Records','Targets'].map((label, index) => ({id: label, label, nodes: config.state ? [] : Array.from({length:30}, (_, n) => ({id: index + '-' + n, label: label + ' ' + n}))}));
 const relationship = <RelationshipGraph aria-label="Relationships" fullPage columns={columns} relationships={[]} toolbar={config.standaloneSearch ? undefined : {leading: <Button>Graph context</Button>, actions:action}} auxiliaryInspector={inspector} invalidState={config.state === 'error' ? <Button>Retry graph</Button> : undefined} emptyState={<Button>Load graph</Button>}/>;
 const workspace = <GraphWorkspace aria-label="Workspace" fullPage toolbar={toolbar} inspector={config.kind === 'nested' ? undefined : inspector}>
 {config.kind === 'nested' ? relationship : <GraphViewport aria-label="Graph viewport" canvasWidth={config.state ? undefined : 2200} canvasHeight={config.state ? undefined : 1800}>
 {config.state ? <GraphEmptyState icon="○" title={config.state === 'error' ? 'Graph error' : 'Graph loading'} description="Graph state details" actions={<Button>Retry graph</Button>}/> : <><GraphNode aria-label="First node" title="First node" x={40} y={40} tabIndex={selected === 'a' ? 0 : -1} onFocus={() => setSelected('a')} onKeyDown={e => {if(e.key === 'ArrowDown'){e.preventDefault(); document.querySelector('[data-context-action]').focus()}}}/><GraphNodeAction aria-label="Add below first node" data-context-action x={40} y={130} tabIndex={selected === 'action' ? 0 : -1} onFocus={() => setSelected('action')} onKeyDown={e => {if(e.key === 'ArrowUp'){e.preventDefault();document.querySelector('.od-graph-node').focus()}}} onClick={() => setOpen(true)}>+</GraphNodeAction><GraphNode aria-label="Last node" title="Last node" x={1950} y={1650} tabIndex={-1}/></>}
 </GraphViewport>}
 </GraphWorkspace>;
 const graph = config.kind === 'relationship' ? relationship : config.kind === 'toolbar' ? toolbar : workspace;
 return <main><h1 className="od-visually-hidden">Graph fixture</h1><PageSurface edgeToEdge={config.outerEdge} style={{height:'100%'}}><PageSurface edgeToEdge={config.edge} style={{height:'100%'}}>{graph}</PageSurface></PageSurface></main>;
}
createRoot(document.getElementById('root')).render(<Fixture/>);
`;
const bundle = await build({
  bundle: true,
  format: "iife",
  platform: "browser",
  write: false,
  logLevel: "silent",
  stdin: { contents: source, loader: "jsx", resolveDir: repositoryRoot },
});
const css = await readFile(
  new URL("../styles/tokens.css", import.meta.url),
  "utf8",
);
const browser = await chromium.launch({
  executablePath: existsSync("/usr/bin/google-chrome")
    ? "/usr/bin/google-chrome"
    : undefined,
  headless: true,
});
const shots = "/tmp/opendle-ui-graph-edge";
await mkdir(shots, { recursive: true });
function near(actual, expected, message) {
  assert.ok(
    Math.abs(actual - expected) <= 1,
    `${message}: ${actual} != ${expected}`,
  );
}
async function load(page, config, safe = [0, 0]) {
  const injected = css
    .replaceAll("env(safe-area-inset-left)", `${safe[0]}px`)
    .replaceAll("env(safe-area-inset-right)", `${safe[1]}px`);
  await page.setContent(
    `<!doctype html><html lang="en"><head><title>Graph fixture</title><style>${injected}body{margin:0}main{height:100dvh;min-width:0}button{font:inherit}</style></head><body><div id="root"></div></body></html>`,
  );
  await page.evaluate((config) => {
    window.fixture = config;
  }, config);
  await page.addScriptTag({ content: bundle.outputFiles[0].text });
  await page.locator(".od-page-surface .od-page-surface").waitFor();
}
async function measure(page) {
  return page.evaluate(() => {
    const rect = (element) => {
      const r = element.getBoundingClientRect();
      return {
        left: r.left,
        right: r.right,
        top: r.top,
        bottom: r.bottom,
        width: r.width,
        height: r.height,
      };
    };
    const surface = document.querySelector(".od-page-surface .od-page-surface");
    const host = surface.firstElementChild;
    const toolbar =
      host.querySelector(
        ":scope > .od-graph-toolbar, :scope > .od-relationship-graph-search",
      ) ?? host;
    const viewport = host.querySelector(
      ".od-graph-viewport, .od-relationship-graph-viewport",
    );
    const style = getComputedStyle(toolbar);
    const scroll = document.scrollingElement;
    return {
      surface: rect(surface),
      host: rect(host),
      toolbar: rect(toolbar),
      viewport: viewport ? rect(viewport) : null,
      paddingLeft: parseFloat(style.paddingLeft),
      paddingRight: parseFloat(style.paddingRight),
      gutter: parseFloat(getComputedStyle(surface).paddingLeft),
      documentOverflow:
        scroll.scrollWidth > scroll.clientWidth ||
        scroll.scrollHeight > scroll.clientHeight,
    };
  });
}
try {
  for (const [width, height] of [
    [1440, 1000],
    [1100, 800],
    [390, 844],
  ]) {
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    for (const kind of ["workspace", "relationship", "nested", "toolbar"]) {
      for (const standaloneSearch of kind === "relationship"
        ? [false, true]
        : [false]) {
        await load(page, {
          kind,
          edge: true,
          outerEdge: true,
          standaloneSearch,
        });
        let m = await measure(page);
        near(m.host.left, 0, "Stage left");
        near(m.host.right, width, "Stage right");
        const gutter = Math.min(32, Math.max(16, width * 0.025));
        near(m.paddingLeft, gutter, "One left control inset");
        near(m.paddingRight, gutter, "One right control inset");
        if (m.viewport) {
          near(m.host.height, height, "Full stage height");
          near(m.viewport.left, 0, "Viewport left");
          near(m.viewport.right, width, "Viewport right");
          near(m.viewport.bottom, height, "Viewport bottom");
          assert.ok(
            m.viewport.top >= m.toolbar.bottom - 1,
            "Controls stay before viewport",
          );
        }
        assert.equal(m.documentOverflow, false, "No document overflow");
        await page.evaluate(() => {
          document.documentElement.style.fontSize = "200%";
        });
        m = await measure(page);
        assert.equal(
          m.documentOverflow,
          false,
          "No document overflow at 200% text",
        );
        if (m.viewport)
          near(
            m.viewport.bottom,
            height,
            "Wrapped controls leave bounded graph",
          );
      }
    }
    for (const state of ["loading", "error"]) {
      for (const kind of ["workspace", "relationship"]) {
        await load(page, { kind, edge: true, outerEdge: true, state });
        const m = await measure(page);
        near(m.viewport.left, 0, "State viewport left");
        near(m.viewport.bottom, height, "State viewport bottom");
        assert.equal(m.documentOverflow, false);
      }
    }
    for (const edge of [false, undefined]) {
      await load(page, { kind: "workspace", edge, outerEdge: true });
      const m = await measure(page);
      assert.ok(
        m.gutter > 0,
        "False or omitted mode restores the gutter inside an edge page",
      );
      assert.equal(
        await page
          .locator(".od-graph-workspace")
          .getAttribute("data-edge-to-edge"),
        "false",
      );
      assert.equal(
        await page
          .locator(".od-graph-toolbar")
          .evaluate((el) => getComputedStyle(el).position),
        "absolute",
        "Non-edge toolbar stays floating",
      );
    }
    await load(
      page,
      { kind: "workspace", edge: true, outerEdge: true },
      [47, 63],
    );
    let m = await measure(page);
    near(m.paddingLeft, 47, "Physical left safe area");
    near(m.paddingRight, 63, "Physical right safe area");
    const viewport = page.locator(".od-graph-viewport");
    const toolbarTop = m.toolbar.top;
    const overflow = await viewport.evaluate((el) => {
      el.scrollLeft = 300;
      el.scrollTop = 300;
      return { x: el.scrollLeft, y: el.scrollTop };
    });
    assert.ok(overflow.x > 0 && overflow.y > 0, "Both local axes scroll");
    m = await measure(page);
    near(m.toolbar.top, toolbarTop, "Toolbar does not scroll");
    assert.equal(m.documentOverflow, false);
    await viewport.evaluate((el) => {
      el.scrollLeft = 0;
      el.scrollTop = 0;
    });
    await page.getByRole("button", { name: "First node", exact: true }).focus();
    await page.keyboard.press("ArrowDown");
    assert.equal(
      await page
        .locator("[data-context-action]")
        .evaluate((el) => el === document.activeElement),
      true,
    );
    assert.equal(
      await viewport.locator('button[tabindex="0"]').count(),
      1,
      "Context action uses one host-controlled graph tab stop",
    );
    await page.keyboard.press("Enter");
    const inspector = page.getByRole("dialog", { name: "Details" });
    await inspector.waitFor();
    const geometry = await inspector.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return {
        mode: el.dataset.mode,
        left: r.left,
        right: r.right,
        top: r.top,
        bottom: r.bottom,
        width: r.width,
      };
    });
    if (width === 1440) {
      assert.equal(geometry.mode, "split");
      near(geometry.width, 336, "Split width");
      near(geometry.right, width, "Split edge");
      near(geometry.top, 0, "Split top");
      near(geometry.bottom, height, "Split bottom");
      near(
        (await measure(page)).viewport.right,
        width - 336,
        "Remaining graph width",
      );
    } else if (width === 1100) {
      assert.equal(geometry.mode, "overlay");
      near(geometry.width, 336, "Overlay width");
      near(geometry.right, width - 14, "Overlay inset");
      near(geometry.top, 76, "Overlay top");
      near(geometry.bottom, height - 14, "Overlay bottom");
    } else {
      assert.equal(geometry.mode, "sheet");
      near(geometry.left, 12, "Sheet left");
      near(geometry.right, width - 12, "Sheet right");
      near(geometry.bottom, height - 12, "Sheet bottom");
    }
    assert.equal(
      (await measure(page)).documentOverflow,
      false,
      "Inspector does not grow document",
    );
    assert.deepEqual((await new AxeBuilder({ page }).analyze()).violations, []);
    await page.screenshot({ path: `${shots}/${width}-inspector.png` });
    await page.keyboard.press("Escape");
    await inspector.waitFor({ state: "detached" });
    assert.equal(
      await page
        .locator("[data-context-action]")
        .evaluate((el) => el === document.activeElement),
      true,
      "Inspector returns to exact action",
    );
    await page.screenshot({ path: `${shots}/${width}-graph.png` });
    await context.close();
  }
} finally {
  await browser.close();
}
console.log("Graph edge browser checks passed.");
