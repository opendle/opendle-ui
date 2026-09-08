import { strict as assert } from "node:assert";
import { existsSync } from "node:fs";
import { mkdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import AxeBuilder from "@axe-core/playwright";
import { chromium } from "@playwright/test";
import { build } from "esbuild";
import { checkInspectorCloseRetention } from "./tests/graph-inspector-close-retention.mjs";
import { checkSecretPanelFit } from "./tests/secret-panel-fit.mjs";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));
const source = String.raw`
import React, {useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Button, FormField, SearchableSelect, Toast, PageSurface, GraphWorkspace, GraphToolbar, GraphViewport, GraphNode, GraphNodeAction, GraphEdges, GraphEdge, GraphEmptyState, GraphInspector, RelationshipGraph} from './dist/index.js';
function WrappedControlsFixture() {
 const config = window.fixture;
 const [count, setCount] = useState(config.controls ?? 1);
 const [detailMode, setDetailMode] = useState("text");
 window.setWrappedDetailMode = setDetailMode;
 window.setWrappedControls = setCount;
 const selectedControlRef = useRef(null);
 const actions = Array.from({length: typeof count === 'number' ? count : 0}, (_, i) => <Button key={i} onClick={e => {e.currentTarget.dataset.activations = String(Number(e.currentTarget.dataset.activations ?? 0) + 1)}}>Graph action {i + 1}</Button>);
 const inspector = <GraphInspector title="Wrapped controls" onClose={() => {}}>{detailMode.startsWith("plain") ? (detailMode === "plain-short" ? "Short details." : "Long details. ".repeat(800)) : <><p>Selected record details.</p>{detailMode === "form" ? <Button>Detail action</Button> : null}{Array.from({length:detailMode === "short" ? 0 : 25}, (_, i) => <p key={i}>Detail row {i + 1}</p>)}</>}</GraphInspector>;
 const graph = config.graphKind === 'relationship' ? <RelationshipGraph aria-label="Wrapped relationships" fullPage={config.fullPage ?? true} columns={['Sources','Records','Targets'].map((id, i) => ({id,label:id,nodes:Array.from({length:25},(_, n)=>({id:i+'-'+n,label:id+' '+n}))}))} relationships={[]} selectedNodeId="2-0" toolbar={count === 'search' ? undefined : {leading:<Button>Context</Button>,actions}} inspector={inspector}/> : <GraphWorkspace aria-label="Wrapped workspace" fullPage={config.fullPage ?? true} toolbar={count === 0 ? undefined : <GraphToolbar leading={<Button>Context</Button>} center={<input aria-label="Search records"/>} actions={actions}/>} inspector={inspector} selectedControlRef={selectedControlRef}><GraphViewport aria-label="Wrapped viewport" canvasWidth={2200} canvasHeight={1800}><GraphNode ref={selectedControlRef} aria-label="Selected record" title="Selected record" x={900} y={240} selected/></GraphViewport></GraphWorkspace>;
 return <main data-controls={count} data-detail-mode={detailMode}><h1 className="od-visually-hidden">Wrapped controls fixture</h1><PageSurface edgeToEdge={config.edge} style={{height:'100%'}}><PageSurface edgeToEdge={config.edge} style={{height:'100%'}}>{graph}</PageSurface></PageSurface></main>;
}
function SvgInspectorFixture() {
 const config = window.fixture;
 const [open, setOpen] = useState(config.initiallyOpen ?? false);
 const [selected, setSelected] = useState(config.initiallyOpen ? 'edge' : 'node-a');
 const [activationKey, setActivationKey] = useState(config.initiallyOpen ? 'edge' : 'node-a');
 const [edgeConnected, setEdgeConnected] = useState(true);
 const [, refresh] = useState(0);
 const selectedControlRef = useRef(null);
 const returnFocusRef = useRef(null);
 const nodeARef = useRef(null);
 const nodeBRef = useRef(null);
 const edgeRef = useRef(null);
 const secondEdgeRef = useRef(null);
 window.svgFixtureRefs = {nodeARef, nodeBRef, edgeRef, secondEdgeRef};
 const bind = (ref, id) => element => {
   ref.current = element;
   if (element && selected === id) selectedControlRef.current = element;
 };
 const select = (id, ref) => {
   setSelected(id);
   setActivationKey(id);
   selectedControlRef.current = ref.current;
 };
 const openFrom = (id, ref) => {
   returnFocusRef.current = config.explicitReturn ? ref.current : null;
   select(id, ref);
   setOpen(true);
 };
 const removeOpener = () => {
   setEdgeConnected(false);
   select('node-b', nodeBRef);
 };
 const trackEdgeWithoutActivation = () => {
   returnFocusRef.current = edgeRef.current;
   refresh(value => value + 1);
 };
 const inspector = open ? <GraphInspector activationKey={activationKey} returnFocusRef={config.explicitReturn ? returnFocusRef : undefined} title={selected === 'edge' ? 'Edge details' : selected === 'node-b' ? 'Second node details' : 'First node details'} onClose={() => setOpen(false)}><Button onClick={() => select('node-b', nodeBRef)}>Inspect second node</Button><Button onClick={() => select('edge', edgeRef)}>Inspect edge internally</Button><Button onClick={trackEdgeWithoutActivation}>Track edge without activation</Button><Button onClick={removeOpener}>Remove opening edge</Button></GraphInspector> : undefined;
 return <main><h1 className="od-visually-hidden">SVG focus fixture</h1><PageSurface edgeToEdge style={{height:'100%'}}><PageSurface edgeToEdge style={{height:'100%'}}><GraphWorkspace aria-label="SVG focus workspace" fullPage inspector={inspector} selectedControlRef={selectedControlRef}><GraphViewport aria-label="SVG graph viewport" canvasWidth={1600} canvasHeight={600}><GraphEdges width={1600} height={600}>{edgeConnected ? <GraphEdge ref={bind(edgeRef, 'edge')} aria-label="First connection" path={config.farEdge ? "M 1120 120 L 1200 120" : "M 260 120 L 720 120"} label="Connects" labelX={config.farEdge ? 1160 : 490} labelY={110} selected={selected === 'edge'} tabIndex={selected === 'edge' ? 0 : -1} onFocus={() => setSelected('edge')} onSelect={() => openFrom('edge', edgeRef)}/> : null}<GraphEdge ref={secondEdgeRef} aria-label="Second connection" path="M 260 240 L 720 240" label="Also connects" labelX={490} labelY={230} selected={selected === 'edge-two'} tabIndex={selected === 'edge-two' ? 0 : -1} onFocus={() => setSelected('edge-two')} onSelect={() => openFrom('edge-two', secondEdgeRef)}/></GraphEdges><GraphNode ref={nodeARef} aria-label="First focus node" title="First focus node" x={100} y={80} selected={selected === 'node-a'} tabIndex={selected === 'node-a' ? 0 : -1} onFocus={() => setSelected('node-a')} onClick={() => openFrom('node-a', nodeARef)}/><GraphNode ref={bind(nodeBRef, 'node-b')} aria-label="Second focus node" title="Second focus node" x={1300} y={80} selected={selected === 'node-b'} tabIndex={selected === 'node-b' ? 0 : -1} onFocus={() => setSelected('node-b')} onClick={() => openFrom('node-b', nodeBRef)}/></GraphViewport></GraphWorkspace></PageSurface></PageSurface></main>;
}
function Fixture() {
 const config = window.fixture;
 const [open, setOpen] = useState(false);
 const [selected, setSelected] = useState('a');
 const [choice, setChoice] = useState('first');
 const [inspectorTitle, setInspectorTitle] = useState(config.inspectorTitle ?? "Details");
 const [details, setDetails] = useState(config.details ?? "form");
 window.setInspectorTitle = setInspectorTitle;
 window.setInspectorDetails = setDetails;
 const action = <Button onClick={() => setOpen(true)}>Inspect graph</Button>;
 const toolbar = <GraphToolbar leading={<Button>Graph context</Button>} actions={action}/>;
 const inspector = open ? <GraphInspector title={inspectorTitle} icon={config.inspectorIcon ? <span aria-hidden="true">◇</span> : undefined} eyebrow={config.inspectorEyebrow} actions={config.inspectorActions ? <><Button onClick={e => e.currentTarget.dataset.used = "true"}>{config.wrappedActions ? "Save all record changes" : "Save"}</Button><Button onClick={e => e.currentTarget.dataset.used = "true"}>{config.wrappedActions ? "Delete selected record" : "Delete"}</Button></> : undefined} onClose={() => setOpen(false)}>{details === "empty" ? null : details === "text" ? "Long text details. ".repeat(800) : config.inspectorTitle ? <><FormField label="Draft"><input defaultValue="Keep this value"/></FormField>{config.inspectorSelect ? <SearchableSelect label="Record type" value={choice} onChange={setChoice} options={[{value:"first",label:"First type"},{value:"second",label:"Second type"}]}/> : null}{Array.from({length:20}, (_, i) => <p key={i}>Record detail {i + 1}.</p>)}</> : <><p>Selected graph record.</p><Button>Inspector action</Button></>}</GraphInspector> : undefined;
 const columns = ['Sources','Records','Targets'].map((label, index) => ({id: label, label, nodes: config.state ? [] : Array.from({length:30}, (_, n) => ({id: index + '-' + n, label: label + ' ' + n}))}));
 const relationship = <RelationshipGraph aria-label="Relationships" fullPage columns={columns} relationships={[]} toolbar={config.standaloneSearch ? undefined : {leading: <Button>Graph context</Button>, actions:action}} auxiliaryInspector={inspector} invalidState={config.state === 'error' ? <Button>Retry graph</Button> : undefined} emptyState={<Button>Load graph</Button>}/>;
 const workspace = <GraphWorkspace aria-label="Workspace" fullPage toolbar={toolbar} inspector={config.kind === 'nested' ? undefined : inspector}>
 {config.kind === 'nested' ? relationship : <GraphViewport aria-label="Graph viewport" viewport={config.zoom ? {x:0,y:0,zoom:config.zoom} : undefined} canvasWidth={config.state ? undefined : 2200} canvasHeight={config.state ? undefined : 1800}>
 {config.state ? <GraphEmptyState icon="○" title={config.state === 'error' ? 'Graph error' : 'Graph loading'} description="Graph state details" actions={<Button>Retry graph</Button>}/> : <><GraphNode aria-label="First node" title="First node" x={40} y={40} tabIndex={selected === 'a' ? 0 : -1} onFocus={() => setSelected('a')} onKeyDown={e => {if(e.key === 'ArrowDown'){e.preventDefault(); document.querySelector('[data-context-action]').focus()}}}/><GraphNodeAction variant={config.textAction ? "text" : undefined} viewportZoom={config.zoom ?? 1} aria-label={config.textAction ? config.textAction + " below First node" : "Add below first node"} data-context-action x={40} y={130} tabIndex={selected === 'action' ? 0 : -1} onFocus={() => setSelected('action')} onKeyDown={e => {if(e.key === 'ArrowUp'){e.preventDefault();document.querySelector('.od-graph-node').focus()}}} onClick={() => setOpen(true)}>{config.textAction ?? "+"}</GraphNodeAction><GraphNode aria-label="Last node" title="Last node" x={1950} y={1650} tabIndex={-1}/></>}
 </GraphViewport>}
 </GraphWorkspace>;
 const graph = config.kind === 'relationship' ? relationship : config.kind === 'toolbar' ? toolbar : workspace;
 return <main><h1 className="od-visually-hidden">Graph fixture</h1><PageSurface edgeToEdge={config.outerEdge} style={{height:'100%'}}><PageSurface edgeToEdge={config.edge} style={{height:'100%'}}>{graph}</PageSurface></PageSurface>{config.inspectorToast && open ? <Toast style={{position:'fixed',right:8,bottom:8}}>Record saved</Toast> : null}</main>;
}
createRoot(document.getElementById('root')).render(window.fixture.kind === 'wrapped-controls' ? <WrappedControlsFixture/> : window.fixture.kind === 'svg-focus' ? <SvgInspectorFixture/> : <Fixture/>);
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
async function checkTextAction(page) {
  const textActionWidths = [];
  const label = "+ New item";
  const longLabel =
    "+ Create a new item with a long visible name " +
    "LongUnbrokenName".repeat(6);
  for (const zoom of [0.5, 1, 2]) {
    for (const fontSize of ["100%", "200%"]) {
      for (const text of [label, longLabel, "+"]) {
        await load(page, {
          kind: "workspace",
          edge: true,
          outerEdge: true,
          textAction: text,
          zoom,
        });
        await page.evaluate((value) => {
          document.documentElement.style.fontSize = value;
        }, fontSize);
        const action = page.getByRole("button", {
          name: text + " below First node",
          exact: true,
        });
        await action.scrollIntoViewIfNeeded();
        const m = await action.evaluate((el) => {
          const r = el.getBoundingClientRect();
          const range = document.createRange();
          range.selectNodeContents(el);
          return {
            width: r.width,
            height: r.height,
            left: r.left,
            top: r.top,
            right: r.right,
            bottom: r.bottom,
            clientWidth: el.clientWidth,
            scrollWidth: el.scrollWidth,
            clientHeight: el.clientHeight,
            scrollHeight: el.scrollHeight,
            font: parseFloat(getComputedStyle(el).fontSize),
            textRects: Array.from(range.getClientRects(), (r) => ({
              left: r.left,
              top: r.top,
              right: r.right,
              bottom: r.bottom,
            })),
          };
        });
        assert.ok(
          m.width >= 44 && m.height >= 44,
          "Text action keeps a 44px target at each graph zoom",
        );
        assert.ok(
          m.scrollWidth <= m.clientWidth && m.scrollHeight <= m.clientHeight,
          "Long text stays inside the action",
        );
        for (const r of m.textRects)
          assert.ok(
            r.left >= m.left - 1 &&
              r.right <= m.right + 1 &&
              r.top >= m.top - 1 &&
              r.bottom <= m.bottom + 1,
            "Every visible text line stays inside the action",
          );
        near(
          m.font,
          fontSize === "200%" ? 32 : 16,
          "Text follows the user font size",
        );
        assert.equal(
          (await measure(page)).documentOverflow,
          false,
          "Text action keeps local graph scrolling",
        );
        if (text === longLabel && fontSize === "200%" && zoom === 1) {
          await action.screenshot({
            path: `${shots}/text-action-long-200-${page.viewportSize().width}.png`,
          });
        }
        if (text === label && fontSize === "100%") {
          textActionWidths.push(m.width);
        }
      }
    }
  }
  for (const width of textActionWidths)
    near(
      width,
      textActionWidths[0],
      "Inverse scaling keeps visible text width",
    );
  await load(page, {
    kind: "workspace",
    edge: true,
    outerEdge: true,
    textAction: label,
    zoom: 1,
  });
  const node = page.getByRole("button", { name: "First node", exact: true });
  const action = page.getByRole("button", {
    name: label + " below First node",
    exact: true,
  });
  const viewport = page.locator(".od-graph-viewport");
  await node.focus();
  await page.keyboard.press("ArrowDown");
  assert.equal(
    await action.evaluate((el) => el === document.activeElement),
    true,
  );
  assert.equal(await viewport.locator('button[tabindex="0"]').count(), 1);
  await page.keyboard.press("ArrowUp");
  assert.equal(
    await node.evaluate((el) => el === document.activeElement),
    true,
  );
  await page.keyboard.press("ArrowDown");
  for (const activation of ["Enter", "Space", "pointer", "touch"]) {
    if (activation === "pointer") await action.click();
    else if (activation === "touch") await action.tap();
    else await page.keyboard.press(activation);
    const inspector = page.getByRole("dialog", { name: "Details" });
    await inspector.waitFor();
    await page.keyboard.press("Escape");
    await inspector.waitFor({ state: "detached" });
    assert.equal(
      await action.evaluate((el) => el === document.activeElement),
      true,
      "Each activation returns focus to the exact text action",
    );
  }
  await page.keyboard.press("Tab");
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        ),
      ),
  );
  assert.equal(
    await page.evaluate(() => document.hasFocus()),
    false,
    "Delayed close restoration keeps focus outside the document",
  );
  assert.equal(
    await viewport.evaluate((el) => el.contains(document.activeElement)),
    false,
    "Tab leaves the host-controlled graph focus group",
  );
  await action.focus();
  assert.equal(
    await action.evaluate((el) => getComputedStyle(el).outlineStyle),
    "solid",
    "Keyboard focus is visible",
  );
  assert.deepEqual((await new AxeBuilder({ page }).analyze()).violations, []);
  await page.screenshot({
    path: `${shots}/text-action-${page.viewportSize().width}.png`,
  });
}
async function inspectorFrame(page) {
  return page.locator(".od-graph-inspector").evaluate((el) => {
    const rect = (node) => {
      if (!node) return null;
      const r = node.getBoundingClientRect();
      return {
        top: r.top,
        bottom: r.bottom,
        left: r.left,
        right: r.right,
        width: r.width,
        height: r.height,
      };
    };
    const content = el.querySelector(".od-graph-inspector-content");
    const heading = el.querySelector("h2");
    const titleRange = document.createRange();
    titleRange.selectNodeContents(heading);
    return {
      mode: el.dataset.mode,
      modal: el.matches(":modal"),
      dialog: rect(el),
      header: rect(el.querySelector("header")),
      title: rect(heading),
      text: rect(titleRange),
      footer: rect(el.querySelector("footer")),
      close: rect(el.querySelector(".od-graph-inspector-close")),
      content: rect(content),
      titleText: heading.textContent,
      rootPadding: getComputedStyle(el).padding,
      titleOverflow: getComputedStyle(heading).textOverflow,
      scrollHeight: content.scrollHeight,
      clientHeight: content.clientHeight,
      horizontalOverflow:
        el.scrollWidth > el.clientWidth ||
        content.scrollWidth > content.clientWidth,
      documentOverflow: document.documentElement.scrollWidth > innerWidth,
      controls: [...el.querySelectorAll("button,input")].map(rect),
    };
  });
}
function assertInspectorFrame(m, title, height, rem) {
  assert.ok(
    m.dialog.top >= -1 && m.dialog.bottom <= height + 1,
    "Inspector stays in the browser",
  );
  assert.ok(
    m.header.top >= m.dialog.top && m.header.bottom <= m.dialog.bottom,
    "Header stays in the frame",
  );
  assert.ok(
    !m.footer || m.footer.bottom <= m.dialog.bottom + 1,
    "The footer stays inside the inspector frame",
  );
  assert.ok(
    m.close.bottom <= m.header.bottom + 1,
    "The close control stays inside the header",
  );
  assert.ok(
    m.content.height >= 2.75 * rem,
    "The body has room for one control",
  );
  assert.ok(
    m.scrollHeight > m.clientHeight,
    "Long content has local scrolling",
  );
  assert.equal(
    m.rootPadding,
    "0px",
    "Native dialog padding does not duplicate shared padding",
  );
  assert.equal(m.titleText, title, "The complete title stays in the h2");
  assert.notEqual(m.titleOverflow, "ellipsis", "Title does not use ellipsis");
  assert.ok(
    m.text.left >= m.title.left - 1 && m.text.right <= m.title.right + 1,
    "Title text wraps inside its width",
  );
  assert.ok(
    m.text.bottom <= m.title.bottom + 1,
    "All title lines stay inside the heading",
  );
  assert.equal(
    m.horizontalOverflow,
    false,
    "Inspector and content have no horizontal overflow",
  );
  assert.equal(
    m.documentOverflow,
    false,
    "Inspector does not grow the page width",
  );
  for (const control of m.controls)
    assert.ok(
      control.width >= 44 && control.height >= 44,
      "Controls keep their minimum target",
    );
}

async function checkExtremeInspectorTitle() {
  const context = await browser.newContext();
  const page = await context.newPage();
  const title = "W".repeat(200);
  const inspector = page.locator(".od-graph-inspector");
  const body = inspector.locator(".od-graph-inspector-body");
  const content = inspector.locator(".od-graph-inspector-content");
  const close = page.getByRole("button", {
    name: "Close inspector",
    exact: true,
  });
  const waitFit = async (expected) => {
    await page.waitForFunction(
      (expected) =>
        (document.querySelector(".od-graph-inspector")?.dataset.scrollTitle ===
          "true") ===
        expected,
      expected,
    );
    await page.evaluate(
      () =>
        new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        ),
    );
  };
  const anchorOffset = () =>
    inspector.evaluate((el) => {
      const region =
        el.dataset.scrollTitle === "true"
          ? el.querySelector(".od-graph-inspector-body")
          : el.querySelector(".od-graph-inspector-content");
      return (
        el
          .querySelector(".od-graph-inspector-content p")
          .getBoundingClientRect().top - region.getBoundingClientRect().top
      );
    });
  const fixedControls = async () =>
    inspector.evaluate((el) => {
      const frame = el.getBoundingClientRect();
      return [
        ...el.querySelectorAll(".od-graph-inspector-close, footer button"),
      ].map((control) => {
        const r = control.getBoundingClientRect();
        const hit = document.elementFromPoint(
          r.x + r.width / 2,
          r.y + r.height / 2,
        );
        return {
          reachable:
            r.top >= frame.top &&
            r.bottom <= frame.bottom &&
            r.left >= frame.left &&
            r.right <= frame.right &&
            control.contains(hit),
          top: r.top,
          bottom: r.bottom,
        };
      });
    });
  try {
    for (const kind of ["workspace", "relationship"]) {
      for (const [mode, width] of [
        ["sheet", 412],
        ["overlay", 1792],
        ["split", 2400],
      ]) {
        await page.setViewportSize({ width, height: 1000 });
        await load(page, {
          kind,
          edge: true,
          outerEdge: true,
          inspectorTitle: title,
          inspectorIcon: true,
          inspectorEyebrow: "Record",
          inspectorActions: true,
          wrappedActions: true,
        });
        await page.evaluate(
          () => (document.documentElement.style.fontSize = "200%"),
        );
        const opener = page.getByRole("button", {
          name: "Inspect graph",
          exact: true,
        });
        await opener.click();
        await waitFit(true);
        if (kind === "relationship") {
          await body.evaluate((el) => (el.style.scrollbarGutter = "stable"));
          await waitFit(true);
        }
        assert.equal(await inspector.getAttribute("data-mode"), mode);
        assert.equal(
          await inspector
            .locator("h2")
            .evaluate((el) => document.activeElement === el),
          true,
          "Opening focuses the heading",
        );
        assert.equal(
          await body.evaluate((el) => el.scrollTop),
          0,
          "Opening shows the title start",
        );
        assert.equal(await inspector.locator("h2").textContent(), title);
        const lastTitleLine = await body.evaluate((el) => {
          const heading = el.querySelector("h2");
          const range = document.createRange();
          range.setStart(heading.firstChild, heading.textContent.length - 1);
          range.setEnd(heading.firstChild, heading.textContent.length);
          const text = range.getBoundingClientRect();
          el.scrollTop += Math.max(
            0,
            text.bottom - el.getBoundingClientRect().bottom,
          );
          const visible = range.getBoundingClientRect();
          const frame = el.getBoundingClientRect();
          return (
            visible.top >= frame.top - 1 && visible.bottom <= frame.bottom + 1
          );
        });
        assert.equal(
          lastTitleLine,
          true,
          "The last title character is reachable in the same scroll region",
        );
        await body.evaluate((el) => (el.scrollTop = 0));
        const before = await fixedControls();
        assert.ok(
          before.every((control) => control.reachable),
          "Close and wrapped footer actions are visible and hit targets",
        );
        await page.keyboard.press("Tab");
        assert.equal(
          await close.evaluate((el) => el === document.activeElement),
          true,
          "Tab from heading reaches Close",
        );
        await page.keyboard.press("Tab");
        const draft = page.getByRole("textbox", { name: "Draft" });
        assert.equal(
          await draft.evaluate((el) => el === document.activeElement),
          true,
        );
        await draft.fill("Retained draft");
        await inspector.evaluate((el) => {
          window.retainedInspector = el;
          window.retainedContent = el.querySelector(
            ".od-graph-inspector-content",
          );
          window.retainedInput = el.querySelector("input");
        });
        await body.evaluate((el) => (el.scrollTop = el.scrollHeight));
        const end = await page
          .getByText("Record detail 20.", { exact: true })
          .boundingBox();
        const viewport = await body.boundingBox();
        assert.ok(
          end.y >= viewport.y &&
            end.y + end.height <= viewport.y + viewport.height + 1,
          "The last detail is visible at the shared scroll end",
        );
        assert.deepEqual(
          await fixedControls(),
          before,
          "Close and footer stay fixed while title and details scroll",
        );
        await body.evaluate((el) => (el.scrollTop = 0));
        await page.screenshot({
          path: `${shots}/extreme-title-${kind}-${mode}-top.png`,
        });
        await body.evaluate((el) => (el.scrollTop = el.scrollHeight));
        await page.screenshot({
          path: `${shots}/extreme-title-${kind}-${mode}-end.png`,
        });
        assert.deepEqual(
          (await new AxeBuilder({ page }).analyze()).violations,
          [],
        );
        assert.equal(
          await inspector.evaluate(
            (el) =>
              el.scrollWidth > el.clientWidth ||
              document.documentElement.scrollWidth > innerWidth,
          ),
          false,
        );
        // A fit change retains the host form and its focus, without an activation change.
        await draft.focus();
        await page.evaluate(() => window.setInspectorTitle("Short title"));
        await waitFit(false);
        assert.equal(
          await inspector.evaluate(
            (el) =>
              el === window.retainedInspector &&
              el.querySelector(".od-graph-inspector-content") ===
                window.retainedContent &&
              el.querySelector("input") === window.retainedInput &&
              document.activeElement === window.retainedInput,
          ),
          true,
        );
        assert.equal(await draft.inputValue(), "Retained draft");
        await page.evaluate(() => window.setInspectorTitle("W".repeat(200)));
        await waitFit(true);
        assert.equal(
          await draft.evaluate(
            (el) =>
              el === document.activeElement && el === window.retainedInput,
          ),
          true,
        );
        // Keep the logical details offset when a new title changes the header height.
        await body.evaluate(
          (el) =>
            (el.scrollTop =
              el.querySelector("header").getBoundingClientRect().height + 180),
        );
        const beforeTitleAnchor = await anchorOffset();
        await page.evaluate(() => window.setInspectorTitle("Short title"));
        await waitFit(false);
        near(
          await anchorOffset(),
          beforeTitleAnchor,
          "A visible details anchor stays at the same position",
        );
        near(
          await content.evaluate((el) => el.scrollTop),
          180,
          "Title shrink keeps the details offset",
        );
        await page.evaluate(() => window.setInspectorTitle("W".repeat(200)));
        await waitFit(true);
        near(
          await body.evaluate(
            (el) =>
              el.scrollTop -
              el.querySelector("header").getBoundingClientRect().height,
          ),
          180,
          "Title expansion keeps the details offset",
        );
        // A reader still within the title has not scrolled into the details.
        await body.evaluate(
          (el) =>
            (el.scrollTop =
              el.querySelector("header").getBoundingClientRect().height / 2),
        );
        await page.evaluate(() => window.setInspectorTitle("Short title"));
        await waitFit(false);
        near(
          await content.evaluate((el) => el.scrollTop),
          0,
          "Title-only scrolling does not jump into details",
        );
        await page.evaluate(() => window.setInspectorTitle("W".repeat(200)));
        await waitFit(true);
        // All mode changes retain the same inspector, content, form, and focus.
        for (const nextWidth of [2400, 1792, 412, width]) {
          await body.evaluate(
            (el) =>
              (el.scrollTop =
                el.querySelector("header").getBoundingClientRect().height +
                180),
          );
          const beforeModeAnchor = await anchorOffset();
          await page.setViewportSize({ width: nextWidth, height: 1000 });
          await page.waitForFunction(
            (width) =>
              document.querySelector(".od-graph-inspector")?.dataset.mode ===
              (width >= 2208 ? "split" : width > 1536 ? "overlay" : "sheet"),
            nextWidth,
          );
          await waitFit(true);
          assert.equal(
            await inspector.evaluate(
              (el) =>
                el === window.retainedInspector &&
                el.querySelector(".od-graph-inspector-content") ===
                  window.retainedContent &&
                document.activeElement === window.retainedInput,
            ),
            true,
          );
          assert.equal(await draft.inputValue(), "Retained draft");
          near(
            await body.evaluate(
              (el) =>
                el.scrollTop -
                el.querySelector("header").getBoundingClientRect().height,
            ),
            180,
            "Mode changes keep the visible details offset",
          );
          near(
            await anchorOffset(),
            beforeModeAnchor,
            "The details anchor survives header wrapping in a mode change",
          );
          assert.ok(
            (await fixedControls()).every((control) => control.reachable),
          );
        }
        // Text-only details keep one usable keyboard scroll stop after Close.
        await page.evaluate(() => window.setInspectorDetails("text"));
        await page.waitForFunction(
          () =>
            document.querySelector(".od-graph-inspector-content").tabIndex ===
            0,
        );
        await close.focus();
        await page.keyboard.press("Tab");
        assert.equal(
          await content.evaluate((el) => el === document.activeElement),
          true,
        );
        await body.evaluate((el) => (el.scrollTop = 0));
        await page.keyboard.press("PageDown");
        await page.waitForFunction(
          () =>
            document.querySelector(".od-graph-inspector-body").scrollTop > 0,
        );
        await page.evaluate(() => {
          window.setInspectorDetails("empty");
          window.setInspectorTitle("Short title");
        });
        await waitFit(false);
        await page.waitForFunction(
          () =>
            document.querySelector(".od-graph-inspector-content").tabIndex ===
            -1,
        );
        assert.equal(
          await content.evaluate((el) => el === document.activeElement),
          true,
          "Removing an extra Tab stop preserves focus",
        );
        await page.evaluate(() => window.setInspectorTitle("W".repeat(200)));
        await waitFit(true);
        await page
          .getByRole("button", { name: "Save all record changes", exact: true })
          .focus();
        await page.keyboard.press("Enter");
        assert.equal(
          await page
            .getByRole("button", {
              name: "Save all record changes",
              exact: true,
            })
            .getAttribute("data-used"),
          "true",
        );
        const deleteAction = page.getByRole("button", {
          name: "Delete selected record",
          exact: true,
        });
        await deleteAction.focus();
        await page.keyboard.press("Enter");
        assert.equal(await deleteAction.getAttribute("data-used"), "true");
        await close.click();
        await inspector.waitFor({ state: "detached" });
        await page.waitForFunction(
          () => document.activeElement?.textContent === "Inspect graph",
        );
      }
    }
    for (const details of ["empty", "text"]) {
      await page.setViewportSize({ width: 412, height: 1000 });
      await load(page, {
        kind: "workspace",
        edge: true,
        outerEdge: true,
        inspectorTitle: "Short title",
        details,
      });
      await page
        .getByRole("button", { name: "Inspect graph", exact: true })
        .click();
      await page.waitForFunction(
        () =>
          document.querySelector(".od-graph-inspector")?.dataset.mode ===
          "sheet",
      );
      await waitFit(false);
      assert.equal(await inspector.locator("footer").count(), 0);
      assert.equal(
        await inspector.evaluate((el) => el.dataset.scrollTitle === "true"),
        false,
        "Short content does not use the intrinsic sheet height as its fit limit",
      );
      await page.evaluate(
        () => (document.documentElement.style.fontSize = "200%"),
      );
      await page.evaluate(() => window.setInspectorTitle("W".repeat(200)));
      await waitFit(true);
      assert.ok((await fixedControls()).every((control) => control.reachable));
      await page.keyboard.press("Escape");
      await inspector.waitFor({ state: "detached" });
      await page.waitForFunction(
        () => document.activeElement?.textContent === "Inspect graph",
      );
    }
    // Exact fit threshold, including borders, content padding, and wrapped footer.
    for (const [mode, width] of [
      ["split", 1400],
      ["overlay", 1000],
      ["sheet", 412],
    ]) {
      await page.setViewportSize({ width, height: 1000 });
      await load(page, {
        kind: "workspace",
        edge: true,
        outerEdge: true,
        inspectorTitle: "W".repeat(150),
        inspectorIcon: true,
        inspectorActions: true,
        wrappedActions: true,
      });
      await page
        .getByRole("button", { name: "Inspect graph", exact: true })
        .click();
      await page.waitForFunction(
        (mode) =>
          document.querySelector(".od-graph-inspector")?.dataset.mode === mode,
        mode,
      );
      await body.evaluate((el) => (el.style.scrollbarGutter = "stable"));
      const threshold = await inspector.evaluate((el) => {
        const content = el.querySelector(".od-graph-inspector-content");
        const style = getComputedStyle(content);
        const frame = getComputedStyle(el);
        return (
          el.querySelector("header").getBoundingClientRect().height +
          el.querySelector("footer").getBoundingClientRect().height +
          parseFloat(style.paddingTop) +
          parseFloat(style.paddingBottom) +
          44 +
          parseFloat(frame.borderTopWidth) +
          parseFloat(frame.borderBottomWidth)
        );
      });
      for (const delta of [1, 0, -1, 0, 1, -1, 1]) {
        await inspector.evaluate(
          (el, { height, mode }) => {
            if (mode === "sheet") el.style.maxHeight = height + "px";
            else el.style.height = height + "px";
          },
          { height: threshold + delta, mode },
        );
        await waitFit(delta < 0);
        assert.equal(
          await inspector.evaluate((el) => el.dataset.scrollTitle === "true"),
          delta < 0,
          `${mode}: fit boundary ${delta}`,
        );
      }
    }
    console.log(
      "Extreme title, fit boundary, retained DOM, focus, and keyboard scroll checks passed.",
    );
  } finally {
    await context.close();
  }
}

async function checkInspectorFrame() {
  const context = await browser.newContext();
  const page = await context.newPage();
  const variants = [
    {
      inspectorTitle: "Service with a long title ".repeat(7).trim(),
      inspectorIcon: true,
      inspectorEyebrow: "Service",
      inspectorActions: true,
    },
    {
      inspectorTitle: "Record with a long title ".repeat(10).slice(0, 200),
      inspectorIcon: true,
      inspectorEyebrow: "Record",
      inspectorActions: true,
    },
    {
      inspectorTitle: "record_identifier_".repeat(12).slice(0, 200),
      inspectorActions: true,
    },
    {
      inspectorTitle: "Record details",
      inspectorIcon: true,
      inspectorActions: true,
    },
    { inspectorTitle: "Create record", inspectorEyebrow: "New record" },
  ];
  try {
    for (const kind of ["workspace", "relationship"]) {
      for (const rem of [16, 32]) {
        for (const [mode, width] of [
          ["sheet", 412],
          ["overlay", 56 * rem],
          ["split", 75 * rem],
        ]) {
          await page.setViewportSize({ width, height: 1000 });
          for (const [index, variant] of variants.entries()) {
            await load(page, { kind, edge: true, outerEdge: true, ...variant });
            await page.evaluate((rem) => {
              document.documentElement.style.fontSize = rem + "px";
            }, rem);
            const opener = page.getByRole("button", {
              name: "Inspect graph",
              exact: true,
            });
            await opener.click();
            const inspector = page.locator(".od-graph-inspector");
            await page.waitForFunction(
              (mode) =>
                document.querySelector(".od-graph-inspector")?.dataset.mode ===
                mode,
              mode,
            );
            const m = await inspectorFrame(page);
            assert.equal(m.modal, mode === "sheet");
            assertInspectorFrame(m, variant.inspectorTitle, 1000, rem);
            if (index === 0) {
              console.log(
                "Inspector frame:",
                kind,
                mode,
                rem,
                JSON.stringify(m),
              );
              assert.deepEqual(
                (await new AxeBuilder({ page }).analyze()).violations,
                [],
              );
              await page.screenshot({
                path:
                  shots +
                  "/inspector-frame-" +
                  kind +
                  "-" +
                  mode +
                  "-" +
                  rem +
                  ".png",
              });
            }
            assert.equal(
              await inspector
                .locator("h2")
                .evaluate((el) => el === document.activeElement),
              true,
              "Opening focuses the h2",
            );
            await page.keyboard.press("Tab");
            assert.equal(
              await inspector
                .getByRole("button", { name: "Close inspector" })
                .evaluate((el) => el === document.activeElement),
              true,
              "Tab reaches the close control",
            );
            const before = await inspectorFrame(page);
            await inspector
              .locator(".od-graph-inspector-content")
              .evaluate((el) => {
                el.scrollTop = el.scrollHeight;
              });
            assert.ok(
              (await inspector
                .locator(".od-graph-inspector-content")
                .evaluate((el) => el.scrollTop)) > 0,
            );
            const after = await inspectorFrame(page);
            near(after.header.top, before.header.top, "Header does not scroll");
            near(
              after.close.top,
              before.close.top,
              "Close control does not scroll",
            );
            if (before.footer)
              near(
                after.footer.bottom,
                before.footer.bottom,
                "Footer does not scroll",
              );
            await inspector
              .getByRole("button", { name: "Close inspector" })
              .click();
            await inspector.waitFor({ state: "detached" });
            assert.equal(
              await opener.evaluate((el) => el === document.activeElement),
              true,
              "Close returns to the exact opener",
            );
          }
        }
      }
    }
    await page.setViewportSize({ width: 2400, height: 1000 });
    await load(page, {
      kind: "workspace",
      edge: true,
      outerEdge: true,
      ...variants[0],
    });
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    const opener = page.getByRole("button", {
      name: "Inspect graph",
      exact: true,
    });
    await opener.click();
    const input = page.getByRole("textbox", { name: "Draft", exact: true });
    await input.fill("Retained draft");
    await input.evaluate((el) => {
      window.retainedInput = el;
      window.retainedInspector = el.closest("dialog");
    });
    for (const [mode, width] of [
      ["overlay", 1800],
      ["sheet", 412],
      ["split", 2400],
    ]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.waitForFunction(
        (mode) =>
          document.querySelector(".od-graph-inspector")?.dataset.mode === mode,
        mode,
      );
      assert.equal(
        await input.evaluate(
          (el) =>
            el === window.retainedInput &&
            el.closest("dialog") === window.retainedInspector &&
            el === document.activeElement,
        ),
        true,
        "Mode changes keep DOM and focus",
      );
      assert.equal(await input.inputValue(), "Retained draft");
      assertInspectorFrame(
        await inspectorFrame(page),
        variants[0].inspectorTitle,
        1000,
        32,
      );
    }
    await page.keyboard.press("Escape");
    await page.locator(".od-graph-inspector").waitFor({ state: "detached" });
    assert.equal(
      await opener.evaluate((el) => el === document.activeElement),
      true,
      "Escape returns focus after mode changes",
    );
  } finally {
    await context.close();
  }
}
async function checkInspectorPopup() {
  const context = await browser.newContext({
    viewport: { width: 412, height: 1000 },
  });
  const page = await context.newPage();
  try {
    await load(page, {
      kind: "workspace",
      edge: true,
      outerEdge: true,
      inspectorTitle: "Record details",
      inspectorSelect: true,
      inspectorToast: true,
      inspectorActions: true,
    });
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    await page
      .getByRole("button", { name: "Inspect graph", exact: true })
      .click();
    const inspector = page.locator(".od-graph-inspector");
    const toast = inspector.locator("[data-od-toast-portal-host] .od-toast");
    await toast.waitFor();
    const bounds = await toast.boundingBox();
    near(
      bounds.x + bounds.width,
      404,
      "A portal keeps its fixed browser right edge",
    );
    near(
      bounds.y + bounds.height,
      992,
      "A portal keeps its fixed browser bottom edge",
    );
    const combo = page.getByRole("combobox", {
      name: "Record type",
      exact: true,
    });
    await combo.focus();
    await page.keyboard.press("ArrowDown");
    const listbox = inspector.getByRole("listbox");
    await listbox.waitFor();
    const inputBounds = await combo.boundingBox();
    const popupBounds = await listbox.boundingBox();
    near(popupBounds.x, inputBounds.x, "Selector popup keeps its input anchor");
    near(
      popupBounds.width,
      inputBounds.width,
      "Selector popup keeps its input width",
    );
    assert.ok(
      popupBounds.y >= inputBounds.y + inputBounds.height,
      "Popup stays below its input",
    );
    assert.ok(
      popupBounds.y + popupBounds.height <=
        (await inspector.locator(".od-graph-inspector-content").boundingBox())
          .y +
          (await inspector.locator(".od-graph-inspector-content").boundingBox())
            .height,
      "Options remain in the content region",
    );
    await page.keyboard.press("End");
    await page.keyboard.press("Enter");
    assert.equal(
      await combo.inputValue(),
      "Second type",
      "Keyboard selection commits the value",
    );
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Escape");
    assert.equal(
      await inspector.count(),
      1,
      "Selector Escape keeps the inspector open",
    );
    assert.equal(
      await combo.evaluate((el) => el === document.activeElement),
      true,
    );
    await inspector.getByRole("button", { name: "Close inspector" }).click();
    await inspector.waitFor({ state: "detached" });
  } finally {
    await context.close();
  }
}
async function checkSvgInspectorFocus() {
  const context = await browser.newContext({
    viewport: { width: 1100, height: 800 },
  });
  const page = await context.newPage();
  try {
    const loadFocusFixture = async (config = {}) => {
      await load(page, {
        kind: "svg-focus",
        edge: true,
        outerEdge: true,
        ...config,
      });
    };
    const waitForExactFocus = async (locator, message) => {
      await page.waitForFunction(
        (element) => element === document.activeElement,
        await locator.elementHandle(),
        { timeout: 1000 },
      );
      assert.equal(
        await locator.evaluate((element) => element === document.activeElement),
        true,
        message,
      );
    };
    const closeInspector = async (name) => {
      const inspector = page.getByRole("dialog", { name });
      await inspector.getByRole("button", { name: "Close inspector" }).click();
      await inspector.waitFor({ state: "detached" });
      return inspector;
    };

    await loadFocusFixture();
    let firstNode = page.getByRole("button", {
      name: "First focus node",
      exact: true,
    });
    let edge = page.getByRole("button", {
      name: "First connection",
      exact: true,
    });
    assert.deepEqual(
      await page.evaluate(() => ({
        callbackEdge:
          window.svgFixtureRefs.edgeRef.current instanceof SVGGElement,
        callbackNode:
          window.svgFixtureRefs.nodeBRef.current instanceof HTMLButtonElement,
        objectEdge:
          window.svgFixtureRefs.secondEdgeRef.current instanceof SVGGElement,
        objectNode:
          window.svgFixtureRefs.nodeARef.current instanceof HTMLButtonElement,
      })),
      {
        callbackEdge: true,
        callbackNode: true,
        objectEdge: true,
        objectNode: true,
      },
      "Graph node and edge refs expose their native DOM controls",
    );
    await firstNode.focus();
    await page.keyboard.press("Enter");
    await page.getByRole("dialog", { name: "First node details" }).waitFor();
    await edge.focus();
    await page.keyboard.press("Enter");
    let inspector = page.getByRole("dialog", { name: "Edge details" });
    await inspector.waitFor();
    await closeInspector("Edge details");
    await waitForExactFocus(
      edge,
      "An internal SVG activation returns focus to the exact edge",
    );

    await loadFocusFixture({ explicitReturn: true });
    firstNode = page.getByRole("button", {
      name: "First focus node",
      exact: true,
    });
    edge = page.getByRole("button", {
      name: "First connection",
      exact: true,
    });
    await edge.focus();
    await page.keyboard.press("Enter");
    inspector = page.getByRole("dialog", { name: "Edge details" });
    await inspector
      .getByRole("button", { name: "Inspect second node" })
      .click();
    await page.getByRole("dialog", { name: "Second node details" }).waitFor();
    await closeInspector("Second node details");
    await waitForExactFocus(
      edge,
      "Internal navigation retains the explicit SVG opener",
    );

    await firstNode.focus();
    await page.keyboard.press("Enter");
    await closeInspector("First node details");
    await waitForExactFocus(
      firstNode,
      "HTML node focus return remains compatible",
    );

    await firstNode.focus();
    await page.keyboard.press("Enter");
    inspector = page.getByRole("dialog", { name: "First node details" });
    await inspector
      .getByRole("button", { name: "Inspect edge internally" })
      .click();
    await page.getByRole("dialog", { name: "Edge details" }).waitFor();
    await closeInspector("Edge details");
    await waitForExactFocus(
      firstNode,
      "Internal SVG selection retains the HTML opener",
    );

    await firstNode.focus();
    await page.keyboard.press("Enter");
    inspector = page.getByRole("dialog", { name: "First node details" });
    await inspector
      .getByRole("button", { name: "Track edge without activation" })
      .click();
    await closeInspector("First node details");
    await waitForExactFocus(
      edge,
      "A supplied SVG ref change is tracked without an activation-key change",
    );

    await loadFocusFixture({ initiallyOpen: true });
    edge = page.getByRole("button", {
      name: "First connection",
      exact: true,
    });
    await page.getByRole("dialog", { name: "Edge details" }).waitFor();
    await closeInspector("Edge details");
    await waitForExactFocus(
      edge,
      "Body focus falls back to the connected selected SVG edge",
    );

    await loadFocusFixture({ explicitReturn: true });
    edge = page.getByRole("button", {
      name: "First connection",
      exact: true,
    });
    await edge.focus();
    await page.keyboard.press("Enter");
    inspector = page.getByRole("dialog", { name: "Edge details" });
    await inspector
      .getByRole("button", { name: "Remove opening edge" })
      .click();
    const secondNode = page.getByRole("button", {
      name: "Second focus node",
      exact: true,
    });
    await closeInspector("Second node details");
    await waitForExactFocus(
      secondNode,
      "A disconnected SVG opener falls back to the connected selected node",
    );

    await loadFocusFixture({ farEdge: true });
    edge = page.getByRole("button", {
      name: "First connection",
      exact: true,
    });
    const viewport = page.locator(".od-graph-viewport");
    await edge.focus();
    await viewport.evaluate((element) => {
      element.scrollLeft = 0;
    });
    await page.keyboard.press("Enter");
    inspector = page.getByRole("dialog", { name: "Edge details" });
    await page.waitForFunction(() => {
      const edge = document.querySelector("[aria-label='First connection']");
      const inspector = document.querySelector(".od-graph-inspector");
      return (
        edge &&
        inspector &&
        edge.getBoundingClientRect().right <=
          inspector.getBoundingClientRect().left + 1
      );
    });
    assert.ok(
      (await viewport.evaluate((element) => element.scrollLeft)) > 0,
      "The overlay scrolls to keep a selected SVG edge reachable",
    );
    await closeInspector("Edge details");

    await loadFocusFixture({ explicitReturn: true });
    edge = page.getByRole("button", {
      name: "First connection",
      exact: true,
    });
    const secondEdge = page.getByRole("button", {
      name: "Second connection",
      exact: true,
    });
    await edge.focus();
    await page.keyboard.press("Enter");
    inspector = page.getByRole("dialog", { name: "Edge details" });
    await page.evaluate(
      ({ close, next }) => {
        close.click();
        next.focus();
      },
      {
        close: await inspector
          .getByRole("button", { name: "Close inspector" })
          .elementHandle(),
        next: await secondEdge.elementHandle(),
      },
    );
    await inspector.waitFor({ state: "detached" });
    await page.evaluate(
      () =>
        new Promise((resolve) =>
          requestAnimationFrame(() =>
            requestAnimationFrame(() => requestAnimationFrame(resolve)),
          ),
        ),
    );
    await waitForExactFocus(
      secondEdge,
      "Delayed focus restore does not replace active SVG focus",
    );

    await page.setViewportSize({ width: 1440, height: 800 });
    await loadFocusFixture({ explicitReturn: true });
    edge = page.getByRole("button", {
      name: "First connection",
      exact: true,
    });
    await edge.focus();
    await page.keyboard.press("Enter");
    inspector = page.getByRole("dialog", { name: "Edge details" });
    for (const [mode, width] of [
      ["split", 1440],
      ["overlay", 1100],
      ["sheet", 390],
      ["overlay", 1100],
      ["split", 1440],
    ]) {
      await page.setViewportSize({ width, height: 800 });
      await page.waitForFunction(
        (expected) =>
          document.querySelector(".od-graph-inspector")?.dataset.mode ===
          expected,
        mode,
      );
      assert.deepEqual(
        (await new AxeBuilder({ page }).analyze()).violations,
        [],
      );
    }
    await closeInspector("Edge details");
    await waitForExactFocus(
      edge,
      "SVG focus return survives split, overlay, and sheet transitions",
    );

    for (const closeMethod of ["button", "Escape"]) {
      await page.setViewportSize({ width: 390, height: 800 });
      await loadFocusFixture({ explicitReturn: true });
      edge = page.getByRole("button", {
        name: "First connection",
        exact: true,
      });
      await edge.focus();
      await page.keyboard.press("Enter");
      inspector = page.getByRole("dialog", { name: "Edge details" });
      await page.waitForFunction(
        () =>
          document.querySelector(".od-graph-inspector")?.dataset.mode ===
          "sheet",
      );
      if (closeMethod === "Escape") await page.keyboard.press("Escape");
      else
        await inspector
          .getByRole("button", { name: "Close inspector" })
          .click();
      await inspector.waitFor({ state: "detached" });
      await waitForExactFocus(
        edge,
        `SVG ${closeMethod} close returns focus in sheet mode`,
      );
    }
  } finally {
    await context.close();
  }
}
async function checkWrappedControls() {
  const context = await browser.newContext({
    viewport: { width: 1100, height: 800 },
  });
  const page = await context.newPage();
  try {
    const changeControls = async (value) => {
      await page.evaluate((value) => window.setWrappedControls(value), value);
      await page.waitForFunction(
        (value) =>
          document.querySelector("main").dataset.controls === String(value),
        value,
      );
    };
    const geometry = () =>
      page.evaluate(() => {
        const host = document.querySelector(
          ".od-page-surface .od-page-surface",
        ).firstElementChild;
        const inspector = host.querySelector(".od-graph-inspector");
        const row = host.querySelector(
          ":scope > .od-graph-toolbar, :scope > .od-relationship-graph-search",
        );
        const viewport = host.querySelector(
          ".od-graph-viewport, .od-relationship-graph-viewport",
        );
        const rect = (el) => {
          const r = el.getBoundingClientRect();
          return {
            top: r.top,
            bottom: r.bottom,
            left: r.left,
            right: r.right,
            width: r.width,
            height: r.height,
          };
        };
        const hostRect = rect(host);
        const rowRect = row ? rect(row) : null;
        const rem = parseFloat(
          getComputedStyle(document.documentElement).fontSize,
        );
        return {
          host: hostRect,
          inspector: rect(inspector),
          row: rowRect,
          viewport: rect(viewport),
          boardWidth:
            host
              .querySelector(".od-relationship-graph-board")
              ?.getBoundingClientRect().width ?? null,
          mode: inspector.dataset.mode,
          rem,
          borderTop: host.clientTop,
          borderLeft: host.clientLeft,
          borderBottom: parseFloat(getComputedStyle(host).borderBottomWidth),
          rowLeft: row ? parseFloat(getComputedStyle(row).paddingLeft) : 0,
          rowRight: row ? parseFloat(getComputedStyle(row).paddingRight) : 0,
          expectedTop: Math.max(
            hostRect.top + host.clientTop + 4.75 * rem,
            (rowRect?.bottom ?? hostRect.top) + 0.875 * rem,
          ),
          overflow:
            document.scrollingElement.scrollHeight >
              document.scrollingElement.clientHeight ||
            document.scrollingElement.scrollWidth >
              document.scrollingElement.clientWidth,
        };
      });
    const checkOverlay = async () => {
      await page.waitForFunction(() => {
        const host = document.querySelector(
          ".od-page-surface .od-page-surface",
        ).firstElementChild;
        const inspector = host.querySelector(".od-graph-inspector");
        const row = host.querySelector(
          ":scope > .od-graph-toolbar, :scope > .od-relationship-graph-search",
        );
        const rem = parseFloat(
          getComputedStyle(document.documentElement).fontSize,
        );
        const expected = Math.max(
          host.getBoundingClientRect().top + host.clientTop + 4.75 * rem,
          (row?.getBoundingClientRect().bottom ??
            host.getBoundingClientRect().top) +
            0.875 * rem,
        );
        return (
          inspector.dataset.mode === "overlay" &&
          Math.abs(inspector.getBoundingClientRect().top - expected) <= 1
        );
      });
      const m = await geometry();
      near(
        m.inspector.top,
        m.expectedTop,
        "Overlay starts after the complete rendered controls",
      );
      near(
        m.inspector.bottom,
        m.host.bottom - m.borderBottom - 0.875 * m.rem,
        "Overlay keeps its bottom inset",
      );
      near(m.inspector.width, 21 * m.rem, "Overlay keeps its width");
      assert.equal(
        m.overflow,
        false,
        "Control wrapping does not grow the document",
      );
      return m;
    };
    const checkActions = async () => {
      const buttons = page.locator(".od-graph-toolbar button");
      for (const button of await buttons.all()) {
        assert.equal(
          await button.evaluate((el) => {
            const r = el.getBoundingClientRect();
            return el.contains(
              document.elementFromPoint(
                r.left + r.width / 2,
                r.top + r.height / 2,
              ),
            );
          }),
          true,
          "Each toolbar action is pointer reachable",
        );
        await button.focus();
        assert.equal(
          await button.evaluate((el) => document.activeElement === el),
          true,
          "Each toolbar action accepts keyboard focus",
        );
        if ((await button.textContent()).startsWith("Graph action")) {
          const before = Number(
            (await button.getAttribute("data-activations")) ?? 0,
          );
          await page.keyboard.press("Enter");
          await button.click();
          assert.equal(
            Number(await button.getAttribute("data-activations")),
            before + 2,
            "Keyboard and pointer activate the same action",
          );
        }
      }
    };
    for (const graphKind of ["workspace", "relationship"]) {
      for (const edge of [true, false]) {
        for (const fullPage of [true, false]) {
          await page.setViewportSize({ width: 1100, height: 800 });
          await load(page, {
            kind: "wrapped-controls",
            graphKind,
            edge,
            fullPage,
            controls: 1,
          });
          const initial = await checkOverlay();
          await changeControls(4);
          const wrapped = await checkOverlay();
          assert.ok(
            wrapped.row.height > initial.row.height,
            "Actions wrap into more rows",
          );
          if (graphKind === "relationship" && !fullPage) {
            near(
              wrapped.host.height - initial.host.height,
              wrapped.row.height - initial.row.height,
              "Standalone relationship controls retain natural flow height",
            );
            near(
              wrapped.inspector.height,
              initial.inspector.height,
              "The overlay adds no standalone height",
            );
          } else {
            assert.ok(
              wrapped.inspector.height < initial.inspector.height,
              "Wrapped controls leave less inspector height",
            );
            near(
              wrapped.host.height,
              initial.host.height,
              "Wrapping keeps the host height",
            );
          }
          near(
            wrapped.viewport.width,
            initial.viewport.width,
            "Wrapping keeps the graph width",
          );
          if (wrapped.boardWidth !== null)
            near(
              wrapped.boardWidth,
              initial.boardWidth,
              "Overlay scroll space keeps the board width",
            );
          await checkActions();
          if (edge && fullPage) {
            const selected = page
              .locator(
                ".od-graph-viewport [data-selected='true'], .od-relationship-graph-viewport [data-selected='true']",
              )
              .first();
            const selectedBounds = await selected.boundingBox();
            assert.ok(
              selectedBounds.x + selectedBounds.width <=
                wrapped.inspector.left + 1,
              `${graphKind}: selected control stays beside the overlay`,
            );
            assert.equal(
              await selected.evaluate((el) => {
                const r = el.getBoundingClientRect();
                return el.contains(
                  document.elementFromPoint(
                    r.left + r.width / 2,
                    r.top + r.height / 2,
                  ),
                );
              }),
              true,
              "The selected control is pointer reachable after local scrolling",
            );
            await page.screenshot({
              path: `${shots}/wrapped-${graphKind}-1100.png`,
            });
            const viewport = page.locator(
              ".od-graph-viewport, .od-relationship-graph-viewport",
            );
            const scroll = await viewport.evaluate((el) => {
              el.scrollTop = 200;
              return el.scrollTop;
            });
            assert.ok(
              scroll > 0,
              "The graph keeps local scroll below wrapped controls",
            );
          }
          await page.setViewportSize({ width: 950, height: 800 });
          await checkOverlay();
          await changeControls(1);
          await checkOverlay();
          await page.setViewportSize({ width: 1100, height: 800 });
          const restored = await checkOverlay();
          near(
            restored.inspector.top,
            initial.inspector.top,
            "Removing actions restores the original inset",
          );
          await changeControls(graphKind === "workspace" ? 0 : "search");
          const withoutActions = await checkOverlay();
          if (graphKind === "workspace")
            near(
              withoutActions.inspector.top,
              withoutActions.host.top +
                withoutActions.borderTop +
                4.75 * withoutActions.rem,
              "Absent controls keep the default inset",
            );
          else
            assert.ok(withoutActions.row, "Standalone search remains measured");
          await changeControls(4);
          await checkOverlay();
        }
      }
      await page.setViewportSize({ width: 2200, height: 1400 });
      await load(
        page,
        { kind: "wrapped-controls", graphKind, edge: true, controls: 4 },
        [90, 120],
      );
      await page.evaluate(() => {
        document.documentElement.style.fontSize = "200%";
      });
      await checkOverlay();
      await checkActions();
      for (const direction of ["ltr", "rtl", "ltr", "rtl"]) {
        await page.evaluate((value) => {
          document.documentElement.dir = value;
        }, direction);
        const m = await checkOverlay();
        near(m.rowLeft, 90, "Physical left safe area stays on the left");
        near(m.rowRight, 120, "Physical right safe area stays on the right");
        const selected = page
          .locator(
            ".od-graph-viewport [data-selected='true'], .od-relationship-graph-viewport [data-selected='true']",
          )
          .first();
        await page.waitForFunction(
          (control) => {
            const viewport = control
              .closest(".od-graph-viewport, .od-relationship-graph-viewport")
              .getBoundingClientRect();
            const inspector = document
              .querySelector(".od-graph-inspector")
              .getBoundingClientRect();
            const node = control.getBoundingClientRect();
            const overlayOnLeft =
              inspector.left < viewport.left + viewport.width / 2;
            return (
              node.left >=
                (overlayOnLeft ? inspector.right : viewport.left) - 1 &&
              node.right <=
                (overlayOnLeft ? viewport.right : inspector.left) + 1
            );
          },
          await selected.elementHandle(),
          { timeout: 1000 },
        );
        assert.equal(
          await selected.evaluate((el) => {
            const r = el.getBoundingClientRect();
            return el.contains(
              document.elementFromPoint(
                r.left + r.width / 2,
                r.top + r.height / 2,
              ),
            );
          }),
          true,
          `${graphKind}: selected control stays pointer reachable after changing to ${direction}`,
        );
      }
      await page.screenshot({ path: `${shots}/wrapped-${graphKind}-200.png` });
      await page.evaluate(() => {
        document.documentElement.style.fontSize = "100%";
        document.documentElement.dir = "ltr";
      });
      for (const [mode, width] of [
        ["split", 1440],
        ["sheet", 390],
        ["overlay", 1100],
      ]) {
        await page.setViewportSize({ width, height: 800 });
        await page.waitForFunction(
          (expected) =>
            document.querySelector(".od-graph-inspector").dataset.mode ===
            expected,
          mode,
        );
        const m = await geometry();
        if (mode === "overlay") await checkOverlay();
        else if (mode === "split") {
          near(
            m.inspector.top,
            m.host.top,
            "Split inspector keeps its top edge",
          );
          near(
            m.inspector.bottom,
            m.host.bottom,
            "Split inspector keeps full height",
          );
        } else {
          near(m.inspector.left, 12, "Sheet keeps its left inset");
          near(m.inspector.right, width - 12, "Sheet keeps its right inset");
        }
        assert.equal(
          m.overflow,
          false,
          "Mode changes keep the document bounded",
        );
        const content = page.locator(".od-graph-inspector-content");
        await page.waitForFunction(
          () =>
            document.querySelector(".od-graph-inspector-content").tabIndex ===
            0,
        );
        await page.getByRole("button", { name: "Close inspector" }).focus();
        await page.keyboard.press("Tab");
        assert.equal(
          await content.evaluate((el) => el === document.activeElement),
          true,
          "Text-only scrolling follows Close in keyboard order",
        );
        await page.keyboard.press("PageDown");
        await page.waitForFunction(
          () =>
            document.querySelector(".od-graph-inspector-content").scrollTop > 0,
        );
        assert.deepEqual(
          (await new AxeBuilder({ page }).analyze()).violations,
          [],
        );
      }
      for (const detailMode of [
        "short",
        "form",
        "text",
        "plain-short",
        "plain-long",
        "plain-short",
      ]) {
        const content = page.locator(".od-graph-inspector-content");
        if (
          detailMode === "plain-short" &&
          (await content.getAttribute("tabindex")) === "0"
        )
          await content.focus();
        const hadContentFocus = await content.evaluate(
          (el) => document.activeElement === el,
        );
        await page.evaluate(
          (value) => window.setWrappedDetailMode(value),
          detailMode,
        );
        await page.waitForFunction(
          (value) =>
            document.querySelector("main").dataset.detailMode === value,
          detailMode,
        );
        await page.waitForFunction(
          (value) =>
            (document.querySelector(".od-graph-inspector-content").tabIndex ===
              0) ===
            ["text", "plain-long"].includes(value),
          detailMode,
        );
        if (hadContentFocus)
          assert.equal(
            await content.evaluate((el) => document.activeElement === el),
            true,
            "Removing a content tab stop preserves current focus",
          );
        if (detailMode === "form") {
          await page.getByRole("button", { name: "Close inspector" }).focus();
          await page.keyboard.press("Tab");
          assert.equal(
            await page
              .getByRole("button", { name: "Detail action" })
              .evaluate((el) => el === document.activeElement),
            true,
            "Form controls keep their original Tab order",
          );
        }
      }
    }
  } finally {
    await context.close();
  }
}
try {
  await checkSecretPanelFit(browser, css);
  await checkInspectorCloseRetention(browser, css);
  await checkExtremeInspectorTitle();
  await checkWrappedControls();
  await checkSvgInspectorFocus();
  await checkInspectorPopup();
  await checkInspectorFrame();
  for (const [width, height] of [
    [1440, 1000],
    [1100, 800],
    [390, 844],
  ]) {
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 1,
      hasTouch: true,
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
      near(
        geometry.top,
        Math.max(76, (await measure(page)).toolbar.bottom + 14),
        "Overlay top follows the rendered controls",
      );
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
    await checkTextAction(page);
    await context.close();
  }
} finally {
  await browser.close();
}
console.log("Graph edge browser checks passed.");
