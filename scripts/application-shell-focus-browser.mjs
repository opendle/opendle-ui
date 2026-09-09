import { strict as assert } from "node:assert";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import AxeBuilder from "@axe-core/playwright";
import { chromium } from "@playwright/test";
import { build } from "esbuild";

assert.equal(process.argv.length, 2, "This check accepts no arguments.");
const root = fileURLToPath(new URL("..", import.meta.url));
const evidence =
  process.env.OPENDLE_UI_FOCUS_EVIDENCE ?? "/tmp/opendle-ui-shell-focus";
const fixture = String.raw`
import React, {StrictMode, useState, useRef, useLayoutEffect} from "react";
import {createRoot} from "react-dom/client";
import {ApplicationShell, MobileNavigation, Button, Icon, Dialog, FormField, Panel, PanelContent, GraphWorkspace, GraphInspector, GraphViewport, GraphNode, PageSurface, AdvancedFieldsDisclosure, TextControl} from "./dist/index.js";
function Fixture(){
 const [mounted,mount]=useState(true), [long,setLong]=useState(false), [route,setRoute]=useState(0), [modal,setModal]=useState(false), [inspector,setInspector]=useState(false), [fullPage,setFullPage]=useState(false), [tailType,setTailType]=useState(null), [form,setForm]=useState(false);
 const heading=useRef(null), opener=useRef(null);
 useLayoutEffect(()=>{if(route) heading.current?.focus()},[route]);
 window.fixture={inspector:setInspector, mount, long:setLong, route:setRoute, modal:setModal, fullPage:setFullPage, tail:setTailType, form:setForm};
 if(!mounted)return <main><h1>Shell removed</h1><Button>Outside shell</Button></main>;
 const items=[{id:"home",label:long?"Home and application overview with further destinations and account tools":"Home",icon:<Icon name="grid"/>},{id:"route",label:long?"Open another application destination with related pages and account tools":"Next page",icon:<Icon name="grid"/>}];
 return <ApplicationShell mainProps={fullPage?{style:{height:"calc(100dvh - var(--od-application-navigation-height, 0px))",flex:"none",overflow:"hidden"}}:undefined} sidebar={<aside className="od-application-sidebar" aria-label="Desktop sidebar">Desktop navigation</aside>} mobileNavigation={<MobileNavigation aria-label="Phone destinations" items={items} onSelect={()=>setRoute(route+1)}/> }>
 {form?<PageSurface><h1>Native form focus</h1><form onSubmit={event=>event.preventDefault()}><TextControl label="Form start" value="" onChange={()=>{}}/><AdvancedFieldsDisclosure summary="Advanced filters" open>{Array.from({length:14},(_,index)=><TextControl key={index} label={index===4?"Provider route":"Report field "+(index+1)} help="Choose a value for this report field." value="" onChange={()=>{}}/>)}</AdvancedFieldsDisclosure><Button>Form end</Button></form></PageSurface>:fullPage?<PageSurface edgeToEdge style={{height:"100%"}}><h1 className="od-visually-hidden">Full page graph</h1><GraphWorkspace fullPage inspector={inspector?<GraphInspector title="Full page inspector" onClose={()=>setInspector(false)} actions={<Button>Save record</Button>}><FormField label="Record name"><input defaultValue="Retained draft"/></FormField><p>{"Long record details. ".repeat(80)}</p></GraphInspector>:null}><GraphViewport aria-label="Full page local graph" canvasWidth={240} canvasHeight={1800}><GraphNode title="First graph control" x={20} y={20}/><GraphNode title="Last graph control" x={20} y={1500}/></GraphViewport></GraphWorkspace></PageSurface>:<PageSurface className="fixture-content"><h1 tabIndex={-1} ref={heading}>Page {route}</h1>
 <Button>First control</Button><div className="fixture-gap"/>
 <Button>Before target</Button><Button>Target action</Button><Button>After target</Button>
 <div className="fixture-gap"/>
 <Panel><PanelContent aria-label="Nested content"><div className="fixture-local-gap"/><Button>Nested target</Button><Button>Nested next</Button></PanelContent></Panel>
 <Button ref={opener} onClick={()=>setModal(true)}>Open dialog</Button>
 <Dialog open={modal} title="Focus owner" onClose={()=>setModal(false)} returnFocusRef={opener}><FormField label="Dialog value"><input defaultValue="Retained value"/></FormField><div className="fixture-local-gap"/><Button>Dialog target</Button></Dialog>
 <GraphWorkspace style={{height:"600px"}} inspector={inspector?<GraphInspector title="Inspector owner" onClose={()=>setInspector(false)}><FormField label="Inspector value"><input defaultValue="Inspector value"/></FormField><Button>Inspector action</Button></GraphInspector>:null}><GraphViewport aria-label="Fixture graph" canvasWidth={240} canvasHeight={180}><GraphNode title="Open inspector" x={20} y={20} onClick={()=>setInspector(true)}/></GraphViewport></GraphWorkspace>
 <svg aria-label="Graph control area" height="100"><g role="button" tabIndex={0} aria-label="SVG target"><rect x="10" y="10" width="100" height="60" fill="currentColor"/></g></svg><Button>After SVG</Button>
 <div className="fixture-gap"/><label>Tall content<textarea className="fixture-tall-control" defaultValue="Tall editable content"/></label>{tailType?<FormField label="Last input"><input type={tailType} style={{overflow:"hidden"}}/></FormField>:<Button>Last control</Button>}</PageSurface>}</ApplicationShell>;
}
createRoot(document.getElementById("root")).render(<StrictMode><Fixture/></StrictMode>);
`;
const bundle = await build({
  bundle: true,
  format: "iife",
  stdin: {
    contents: fixture,
    loader: "jsx",
    resolveDir: root,
    sourcefile: "shell-focus-fixture.jsx",
  },
  write: false,
});
const css = await readFile(
  new URL("../styles/tokens.css", import.meta.url),
  "utf8",
);
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>Shell focus checks</title><style>${css}
.fixture-content{display:flex;flex-direction:column;gap:1rem;padding-block:1rem 0}.fixture-gap{height:700px;flex:none}.fixture-local-gap{height:900px}.fixture-content .od-panel-content{padding:1rem}.fixture-content h1{margin:0}.fixture-tall-control{display:block;width:100%;height:1000px}
</style></head><body><div id="root"></div><script>${bundle.outputFiles[0].text}</script></body></html>`;
await mkdir(evidence, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ...(existsSync("/usr/bin/google-chrome")
    ? { executablePath: "/usr/bin/google-chrome" }
    : {}),
});
const results = [];
const settle = (page) =>
  page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
const button = (page, name) => page.getByRole("button", { name, exact: true });
async function visibleFocus(page, name, scene) {
  await settle(page);
  const geometry = await button(page, name).evaluate((node) => {
    const box = node.getBoundingClientRect(),
      nav = document
        .querySelector(".od-application-mobile-navigation")
        .getBoundingClientRect(),
      style = getComputedStyle(node);
    return {
      active: node === document.activeElement,
      visible: node.matches(":focus-visible"),
      top: box.top,
      bottom: box.bottom,
      left: box.left,
      right: box.right,
      navigationTop: nav.height ? nav.top : innerHeight,
      outline: parseFloat(style.outlineWidth) + parseFloat(style.outlineOffset),
      width: innerWidth,
      pageWidth: document.documentElement.scrollWidth,
    };
  });
  results.push({ scene, ...geometry });
  await page.screenshot({ path: `${evidence}/${scene}.png` });
  assert.equal(geometry.active, true, scene);
  assert.equal(geometry.visible, true, scene);
  assert.ok(geometry.outline >= 3, JSON.stringify(geometry));
  assert.ok(
    geometry.bottom + geometry.outline <= geometry.navigationTop + 1,
    scene + JSON.stringify(geometry),
  );
  assert.ok(
    geometry.top - geometry.outline >= -1,
    scene + JSON.stringify(geometry),
  );
  assert.ok(
    geometry.left - geometry.outline >= 0 &&
      geometry.right + geometry.outline <= geometry.width,
    scene + JSON.stringify(geometry),
  );
  assert.ok(geometry.pageWidth <= geometry.width, scene);
}

async function nativeFormFocus(page, scene) {
  await page.evaluate(() => window.fixture.form(true));
  await page.getByLabel("Form start", { exact: true }).waitFor();
  await page.getByLabel("Form start", { exact: true }).focus();
  const measurements = [];
  for (const direction of ["Tab", "Shift+Tab"]) {
    let reachedEnd = false;
    for (let index = 0; index < 20; index++) {
      await page.keyboard.press(direction);
      await settle(page);
      const geometry = await page.evaluate(() => {
        const node = document.activeElement,
          box = node.getBoundingClientRect(),
          style = getComputedStyle(node);
        const nav = document
          .querySelector(".od-application-mobile-navigation")
          .getBoundingClientRect();
        const extent =
          parseFloat(style.outlineWidth) + parseFloat(style.outlineOffset);
        return {
          tag: node.tagName,
          name: node.labels?.[0]?.textContent ?? node.textContent,
          visible: node.matches(":focus-visible"),
          extent,
          top: box.top - extent,
          bottom: box.bottom + extent,
          left: box.left - extent,
          right: box.right + extent,
          end: nav.height ? nav.top : innerHeight,
          width: innerWidth,
        };
      });
      measurements.push({ direction, ...geometry });
      results.push({ scene, ...measurements.at(-1) });
      if (
        geometry.tag === "SUMMARY" ||
        geometry.name === "Provider route" ||
        geometry.top < -1
      )
        await page.screenshot({
          path: `${evidence}/${scene}-${direction === "Tab" ? "forward" : "reverse"}-${index}.png`,
        });
      assert.equal(geometry.visible, true, JSON.stringify(geometry));
      assert.ok(geometry.extent > 0, JSON.stringify(geometry));
      assert.ok(
        geometry.top >= -1 && geometry.bottom <= geometry.end + 1,
        JSON.stringify(geometry),
      );
      assert.ok(
        geometry.left >= -1 && geometry.right <= geometry.width + 1,
        JSON.stringify(geometry),
      );
      if (
        (direction === "Tab" && geometry.name === "Form end") ||
        (direction === "Shift+Tab" && geometry.name === "Form start")
      ) {
        reachedEnd = true;
        break;
      }
    }
    assert.equal(
      reachedEnd,
      true,
      `Native ${direction} must traverse the complete form`,
    );
  }
  assert.ok(
    measurements.some(
      (item) => item.direction === "Shift+Tab" && item.tag === "SUMMARY",
    ),
  );
  assert.ok(
    measurements.some(
      (item) =>
        item.direction === "Shift+Tab" && item.name === "Provider route",
    ),
  );
  assert.deepEqual((await new AxeBuilder({ page }).analyze()).violations, []);
  await page.evaluate(() => window.fixture.form(false));
}
try {
  for (const width of [1440, 1100, 320, 390])
    for (const scale of [100, 200]) {
      const context = await browser.newContext({
        viewport: {
          width,
          height: width === 1440 ? 1000 : width === 1100 ? 800 : 844,
        },
      });
      try {
        const page = await context.newPage(),
          errors = [];
        page.on("pageerror", (e) => errors.push(e.message));
        page.on("console", (message) => {
          if (message.type() === "error") errors.push(message.text());
        });
        await page.exposeFunction("recordWindowError", (message) =>
          errors.push(message),
        );
        await page.addInitScript(() => {
          window.addEventListener("error", (event) =>
            window.recordWindowError(event.message),
          );
        });
        await page.route("**/*", (route) =>
          route.fulfill({ contentType: "text/html", body: html }),
        );
        await page.goto("http://127.0.0.1:5174");
        await button(page, "First control").waitFor();
        await page.evaluate(
          (scale) => (document.documentElement.style.fontSize = scale + "%"),
          scale,
        );
        await nativeFormFocus(page, `${width}-${scale}-native-form`);
        // Enter with native keyboard movement. Do not center the target.
        await button(page, "Before target").focus();
        if (width < 1000)
          await page.evaluate(() => {
            const b = document.activeElement.getBoundingClientRect();
            const n = document
              .querySelector(".od-application-mobile-navigation")
              .getBoundingClientRect();
            window.scrollBy(0, b.bottom - n.top + 10);
          });
        await page.keyboard.press("Tab");
        await visibleFocus(page, "Target action", `${width}-${scale}-tab`);
        await page.keyboard.press("Tab");
        if (width < 1000)
          await page.evaluate(() => {
            const b = document.activeElement.getBoundingClientRect();
            const n = document
              .querySelector(".od-application-mobile-navigation")
              .getBoundingClientRect();
            window.scrollBy(0, b.top - n.top - 20);
          });
        await page.keyboard.press("Shift+Tab");
        await visibleFocus(
          page,
          "Target action",
          `${width}-${scale}-shift-tab`,
        );
        if (width < 1000) {
          // Put active focus at the old safe boundary, then grow navigation around it.
          const navigationHeight = await page
            .locator(".od-application-mobile-navigation")
            .evaluate((node) => node.getBoundingClientRect().height);
          await page.evaluate(() => {
            const target = document.activeElement,
              nav = document.querySelector(".od-application-mobile-navigation");
            window.scrollBy(
              0,
              target.getBoundingClientRect().bottom +
                5 -
                nav.getBoundingClientRect().top,
            );
            window.fixture.long(true);
          });
          await visibleFocus(
            page,
            "Target action",
            `${width}-${scale}-wrapped`,
          );
          assert.ok(
            (await page
              .locator(".od-application-mobile-navigation")
              .evaluate((node) => node.getBoundingClientRect().height)) >
              navigationHeight,
            "The fixture must grow the navigation.",
          );
          await page.setViewportSize({ width, height: 680 });
          await visibleFocus(page, "Target action", `${width}-${scale}-resize`);
          const cdp = await context.newCDPSession(page);
          await cdp.send("Emulation.setSafeAreaInsetsOverride", {
            insets: { bottom: 24 },
          });
          await visibleFocus(
            page,
            "Target action",
            `${width}-${scale}-safe-area`,
          );
          await cdp.detach();
          const navButton = page
            .getByRole("navigation", { name: "Phone destinations" })
            .getByRole("button")
            .first();
          await navButton.focus();
          await settle(page);
          const navScroll = await page.evaluate(() => scrollY);
          await page.evaluate(() => window.fixture.long(false));
          await settle(page);
          assert.equal(await page.evaluate(() => scrollY), navScroll);
          assert.equal(
            await navButton.evaluate((node) => node === document.activeElement),
            true,
          );
          await button(page, "Target action").focus();
          await page.setViewportSize({ width: 1440, height: 844 });
          await settle(page);
          assert.equal(
            await button(page, "Target action").evaluate(
              (node) => node === document.activeElement,
            ),
            true,
          );
          await page.setViewportSize({ width, height: 844 });
        }
        const nested = page.getByRole("region", { name: "Nested content" });
        await nested.focus();
        await page.keyboard.press("Tab");
        await visibleFocus(page, "Nested target", `${width}-${scale}-nested`);
        assert.ok((await nested.evaluate((node) => node.scrollTop)) > 0);
        const nestedBox = await nested.boundingBox(),
          targetBox = await button(page, "Nested target").boundingBox();
        assert.ok(
          targetBox.y >= nestedBox.y &&
            targetBox.y + targetBox.height <= nestedBox.y + nestedBox.height,
        );
        await button(page, "Open dialog").click();
        const input = page.getByLabel("Dialog value");
        await input.fill("Retained edited value");
        await page.keyboard.press("Tab");
        await settle(page);
        assert.equal(
          await button(page, "Dialog target").evaluate(
            (node) => node === document.activeElement,
          ),
          true,
        );
        const scroll = await page.evaluate(() => scrollY);
        await page.evaluate(() => window.fixture.long(false));
        await settle(page);
        assert.equal(
          await page.evaluate(() => scrollY),
          scroll,
          "The dialog owns focus and scrolling.",
        );
        assert.equal(await input.inputValue(), "Retained edited value");
        assert.deepEqual(
          (await new AxeBuilder({ page }).analyze()).violations,
          [],
        );
        await page.keyboard.press("Escape");
        await settle(page);
        assert.equal(
          await button(page, "Open dialog").evaluate(
            (node) => node === document.activeElement,
          ),
          true,
        );
        await button(page, "Open inspector").click();
        const inspectorInput = page.getByLabel("Inspector value", {
          exact: true,
        });
        await inspectorInput.fill("Kept inspector value");
        await page.keyboard.press("Tab");
        await settle(page);
        const inspectorScroll = await page.evaluate(() => scrollY);
        await page.evaluate(() => window.fixture.long(true));
        await settle(page);
        assert.equal(
          await button(page, "Inspector action").evaluate(
            (node) => node === document.activeElement,
          ),
          true,
        );
        assert.equal(await inspectorInput.inputValue(), "Kept inspector value");
        assert.ok(
          await inspectorInput.evaluate((node) => {
            const box = node.getBoundingClientRect(),
              owner = node.closest("dialog").getBoundingClientRect();
            return box.left >= owner.left && box.right <= owner.right;
          }),
        );
        assert.equal(await page.evaluate(() => scrollY), inspectorScroll);
        assert.deepEqual(
          (await new AxeBuilder({ page }).analyze()).violations,
          [],
        );
        await page.screenshot({
          path: evidence + "/" + width + "-" + scale + "-inspector.png",
        });
        await page.keyboard.press("Escape");
        await settle(page);
        await button(page, "After SVG").focus();
        if (width < 1000)
          await page.evaluate(() => {
            const b = document.activeElement.getBoundingClientRect();
            const n = document
              .querySelector(".od-application-mobile-navigation")
              .getBoundingClientRect();
            window.scrollBy(0, b.top - n.top - 20);
          });
        await page.keyboard.press("Shift+Tab");
        await visibleFocus(page, "SVG target", width + "-" + scale + "-svg");
        await page.evaluate(() => window.fixture.route(1));
        await settle(page);
        assert.equal(
          await page
            .getByRole("heading", { name: "Page 1" })
            .evaluate((node) => node === document.activeElement),
          true,
        );
        await page.keyboard.press("Tab");
        await visibleFocus(page, "First control", `${width}-${scale}-route`);
        assert.deepEqual(
          (await new AxeBuilder({ page }).analyze()).violations,
          [],
        );
        // PageSurface has no block-end inset. Native Tab must expose the last
        // control and its outline even at the document scroll limit.
        await page.getByLabel("Tall content").focus();
        await page.keyboard.press("Tab");
        await visibleFocus(page, "Last control", width + "-" + scale + "-last");
        if (width < 1000) {
          assert.ok(
            (await page
              .locator(".od-application-shell")
              .evaluate((node) =>
                parseFloat(
                  node.style.getPropertyValue(
                    "--od-application-focus-clearance",
                  ),
                ),
              )) > 0,
          );
          await page.keyboard.press("Tab");
          await settle(page);
          assert.equal(
            await page
              .locator(".od-application-shell")
              .evaluate((node) =>
                node.style.getPropertyValue("--od-application-focus-clearance"),
              ),
            "",
          );
          await page.keyboard.press("Shift+Tab");
          await visibleFocus(
            page,
            "Last control",
            width + "-" + scale + "-last-reverse",
          );
          await page.evaluate(() => window.fixture.modal(true));
          await input.waitFor();
          await settle(page);
          assert.equal(
            await page
              .locator(".od-application-shell")
              .evaluate((node) =>
                node.style.getPropertyValue("--od-application-focus-clearance"),
              ),
            "",
          );
          await page.keyboard.press("Escape");
          await settle(page);
        }
        await button(page, "Last control").focus();
        await page.keyboard.press("Shift+Tab");
        await settle(page);
        const tall = page.getByLabel("Tall content");
        const tallBefore = await tall.boundingBox();
        await page.evaluate(() => window.fixture.long(true));
        await settle(page);
        const tallAfter = await tall.boundingBox();
        assert.equal(
          await tall.evaluate((node) => node === document.activeElement),
          true,
        );
        assert.ok(
          tallAfter.y >= Math.min(tallBefore.y, 5) - 1,
          "An oversized control must keep its top position.",
        );
        for (const type of ["text", "date"]) {
          await page.evaluate((type) => window.fixture.tail(type), type);
          const lastInput = page.getByLabel("Last input", { exact: true });
          await lastInput.waitFor();
          await tall.focus();
          await page.keyboard.press("Tab");
          await settle(page);
          const inputBounds = await lastInput.evaluate((node) => {
            const box = node.getBoundingClientRect(),
              nav = document
                .querySelector(".od-application-mobile-navigation")
                .getBoundingClientRect(),
              style = getComputedStyle(node);
            return {
              active: document.activeElement === node,
              visible: node.matches(":focus-visible"),
              top: box.top,
              bottom: box.bottom,
              navTop: nav.height ? nav.top : innerHeight,
              outline:
                parseFloat(style.outlineWidth) +
                parseFloat(style.outlineOffset),
            };
          });
          results.push({
            scene: width + "-" + scale + "-last-" + type,
            ...inputBounds,
          });
          assert.equal(inputBounds.active, true);
          assert.equal(inputBounds.visible, true);
          assert.ok(
            inputBounds.top - inputBounds.outline >= -1,
            JSON.stringify(inputBounds),
          );
          assert.ok(
            inputBounds.bottom + inputBounds.outline <= inputBounds.navTop + 1,
            JSON.stringify(inputBounds),
          );
          await page.screenshot({
            path:
              evidence + "/" + width + "-" + scale + "-last-" + type + ".png",
          });
        }
        await page.evaluate(() => window.fixture.tail(null));
        await button(page, "Last control").focus();
        await settle(page);
        const removedShell = await page
          .locator(".od-application-shell")
          .elementHandle();
        const globalStyle = await page.evaluate(() => [
          document.documentElement.getAttribute("style"),
          document.body.getAttribute("style"),
        ]);
        await page.evaluate(() => window.fixture.mount(false));
        assert.equal(
          await removedShell.evaluate((node) =>
            node.style.getPropertyValue("--od-application-focus-clearance"),
          ),
          "",
        );
        await removedShell.dispose();
        await button(page, "Outside shell").focus();
        await page.setViewportSize({ width, height: 800 });
        await settle(page);
        assert.deepEqual(
          await page.evaluate(() => [
            document.documentElement.getAttribute("style"),
            document.body.getAttribute("style"),
          ]),
          globalStyle,
        );
        await page.evaluate(() => window.fixture.mount(true));
        await button(page, "Before target").focus();
        await page.keyboard.press("Tab");
        await visibleFocus(page, "Target action", `${width}-${scale}-remount`);
        await page.evaluate(() => window.fixture.fullPage(true));
        await button(page, "First graph control").focus();
        await page.keyboard.press("Tab");
        await settle(page);
        const graphBounds = await page.evaluate(() => {
          const main = document
              .querySelector(".od-application-main")
              .getBoundingClientRect(),
            nav = document
              .querySelector(".od-application-mobile-navigation")
              .getBoundingClientRect(),
            shell = document.querySelector(".od-application-shell"),
            local = document
              .querySelector(".od-graph-viewport")
              .getBoundingClientRect(),
            active = document.activeElement.getBoundingClientRect(),
            style = getComputedStyle(document.activeElement);
          return {
            top: main.top,
            bottom: main.bottom,
            navTop: nav.height ? nav.top : innerHeight,
            height: document.documentElement.scrollHeight,
            viewport: innerHeight,
            extra: shell.style.getPropertyValue(
              "--od-application-focus-clearance",
            ),
            focused: document.activeElement.textContent,
            activeTop: active.top,
            activeBottom: active.bottom,
            localTop: local.top,
            localBottom: local.bottom,
            outline:
              parseFloat(style.outlineWidth) + parseFloat(style.outlineOffset),
          };
        });
        assert.ok(
          Math.abs(graphBounds.bottom - graphBounds.navTop) <= 1,
          JSON.stringify(graphBounds),
        );
        assert.ok(
          graphBounds.height <= graphBounds.viewport,
          JSON.stringify(graphBounds),
        );
        assert.equal(graphBounds.extra, "");
        assert.equal(graphBounds.focused, "Last graph control");
        assert.ok(
          graphBounds.activeTop - graphBounds.outline >=
            graphBounds.localTop - 1,
          JSON.stringify(graphBounds),
        );
        assert.ok(
          graphBounds.activeBottom + graphBounds.outline <=
            Math.min(graphBounds.localBottom, graphBounds.navTop) + 1,
          JSON.stringify(graphBounds),
        );
        results.push({
          scene: width + "-" + scale + "-full-page",
          ...graphBounds,
        });
        assert.deepEqual(
          (await new AxeBuilder({ page }).analyze()).violations,
          [],
        );
        await page.screenshot({
          path: evidence + "/" + width + "-" + scale + "-full-page.png",
        });
        assert.deepEqual(errors, []);
      } finally {
        await context.close();
      }
    }
  // A navigation measurement must not resize an observed host during delivery.
  for (const isMobile of [false, true]) {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile,
    });
    try {
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      await page.exposeFunction("recordWindowError", (message) =>
        errors.push(message),
      );
      await page.addInitScript(() => {
        window.addEventListener("error", (event) =>
          window.recordWindowError(event.message),
        );
        const NativeObserver = window.ResizeObserver;
        const statistics = (window.resizeStatistics = {
          deliveries: 0,
          targets: 0,
        });
        window.ResizeObserver = class extends NativeObserver {
          targets = new Set();
          constructor(callback) {
            super((entries, observer) => {
              statistics.deliveries++;
              callback(entries, observer);
            });
          }
          observe(target, options) {
            if (!this.targets.has(target)) {
              this.targets.add(target);
              statistics.targets++;
            }
            super.observe(target, options);
          }
          unobserve(target) {
            if (this.targets.delete(target)) statistics.targets--;
            super.unobserve(target);
          }
          disconnect() {
            statistics.targets -= this.targets.size;
            this.targets.clear();
            super.disconnect();
          }
        };
      });
      await page.route("**/*", (route) =>
        route.fulfill({ contentType: "text/html", body: html }),
      );
      await page.goto("http://127.0.0.1:5174");
      await page.evaluate(() => window.fixture.fullPage(true));
      await button(page, "First graph control").waitFor();
      for (const open of [false, true, false, true]) {
        await page.evaluate((open) => window.fixture.inspector(open), open);
        for (const scale of [200, 100]) {
          await page.evaluate((scale) => {
            document.documentElement.style.fontSize = scale + "%";
          }, scale);
          await page.waitForTimeout(100);
          const frames = await page.evaluate(
            () =>
              new Promise((resolve) => {
                const samples = [];
                const sample = () => {
                  const host = document
                    .querySelector(".od-graph-workspace")
                    .getBoundingClientRect();
                  const nav = document
                    .querySelector(".od-application-mobile-navigation")
                    .getBoundingClientRect();
                  const inspector = document.querySelector(
                    ".od-graph-inspector",
                  );
                  samples.push({
                    height: host.height,
                    bottom: host.bottom,
                    navigationTop: nav.top,
                    pageHeight: document.documentElement.scrollHeight,
                    pageWidth: document.documentElement.scrollWidth,
                    deliveries: window.resizeStatistics.deliveries,
                    mode: inspector?.dataset.mode ?? null,
                  });
                  if (samples.length < 12) requestAnimationFrame(sample);
                  else resolve(samples);
                };
                requestAnimationFrame(sample);
              }),
          );
          assert.ok(
            frames.every(
              (value) => JSON.stringify(value) === JSON.stringify(frames[0]),
            ),
            "Layout and ResizeObserver delivery must become quiet: " +
              JSON.stringify(frames),
          );
          const value = frames[0];
          assert.ok(
            Math.abs(value.bottom - value.navigationTop) <= 1,
            JSON.stringify(value),
          );
          assert.ok(
            value.pageHeight <= 844 && value.pageWidth <= 390,
            JSON.stringify(value),
          );
          assert.equal(value.mode, open ? "sheet" : null);
          if (open) {
            assert.equal(
              await page.getByLabel("Record name").inputValue(),
              "Retained draft",
            );
            assert.equal(
              await page
                .getByRole("heading", { name: "Full page inspector" })
                .evaluate((node) => node === document.activeElement),
              true,
            );
          }
          assert.deepEqual(
            (await new AxeBuilder({ page }).analyze()).violations,
            [],
          );
          results.push({
            scene: `observer-${isMobile}-${open}-${scale}`,
            ...value,
          });
          await page.screenshot({
            path: `${evidence}/observer-${isMobile}-${open}-${scale}.png`,
          });
        }
      }
      // Queue a navigation resize and remove the shell before its scheduled work.
      await page.evaluate(() => {
        const navigation = document.querySelector(
          ".od-application-mobile-navigation",
        );
        const removeAfterDelivery = new ResizeObserver(() => {
          window.fixture.mount(false);
          removeAfterDelivery.disconnect();
        });
        removeAfterDelivery.observe(navigation);
        window.fixture.long(true);
      });
      await button(page, "Outside shell").waitFor();
      await page.waitForTimeout(100);
      assert.equal(
        await page.evaluate(() => window.resizeStatistics.targets),
        0,
        "All resize targets must be released on unmount",
      );
      const count = await page.evaluate(
        () => window.resizeStatistics.deliveries,
      );
      await page.waitForTimeout(100);
      assert.equal(
        await page.evaluate(() => window.resizeStatistics.deliveries),
        count,
        "No resize delivery after unmount",
      );
      assert.deepEqual(
        errors,
        [],
        "No window, console, or runtime error during navigation resize",
      );
    } finally {
      await context.close();
    }
  }
  console.log("Application shell focus browser checks passed.");
} finally {
  await browser.close();
  await writeFile(
    `${evidence}/results.json`,
    JSON.stringify(results, null, 2) + "\n",
  );
}
