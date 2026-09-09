import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import AxeBuilder from "@axe-core/playwright";
import { chromium, expect } from "@playwright/test";
import { build } from "esbuild";

assert.equal(process.argv.length, 2, "This check accepts no arguments.");
const root = fileURLToPath(new URL("..", import.meta.url));
const css = await readFile(
  new URL("../styles/tokens.css", import.meta.url),
  "utf8",
);
const evidence = await mkdtemp(join(tmpdir(), "opendle-modal-order-"));
const source = String.raw`
import React, {StrictMode, useRef, useState} from 'react';
import {flushSync} from 'react-dom';
import {createRoot} from 'react-dom/client';
import {Button, Dialog, ConfirmationDialog, FormField, GraphInspector, GraphNode, GraphViewport, GraphWorkspace} from '@opendle/ui';
function Fixture() {
 const [state, setState] = useState({inspector:false,modal:false,pending:false,nested:false,generic:false,activation:0});
 const draftRef=useRef(null), openerRef=useRef(null);
 window.configure = patch => flushSync(()=>setState(value=>({...value,...patch})));
 const cancel=()=>{window.cancels++;setState(value=>({...value,modal:false}));};
 const modal=state.generic ? <Dialog open={state.modal} title="Review record" onClose={cancel} returnFocusRef={draftRef} closeDisabled={state.pending} actions={<Button onClick={cancel} disabled={state.pending}>Cancel</Button>}><FormField label="Review note"><input defaultValue="Keep review" disabled={state.pending}/></FormField></Dialog> : <ConfirmationDialog open={state.modal} title="Discard record?" description="This removes the entered draft." confirmLabel="Discard" impactStatement="discard this draft" pending={state.pending} returnFocusRef={draftRef} onCancel={cancel} onConfirm={()=>{window.confirms++;setState(value=>({...value,pending:true}));}}/>;
 const inspector=state.inspector ? <GraphInspector activationKey={state.activation} title="Record draft" returnFocusRef={openerRef} closeDisabled={state.pending} onClose={()=>{window.closes++;setState(value=>({...value,inspector:false}));}} actions={<Button onClick={()=>setState(value=>({...value,modal:true}))}>Review changes</Button>}><FormField label="Draft"><input ref={draftRef} defaultValue="Keep draft"/></FormField><p>{'Long record content. '.repeat(300)}</p>{state.nested ? modal : null}</GraphInspector> : null;
 return <main aria-label="Modal order fixture"><h1 className="od-visually-hidden">Modal order fixture</h1><GraphWorkspace fullPage style={{height:'100dvh'}} inspector={inspector}><GraphViewport aria-label="Record graph" canvasWidth={240} canvasHeight={180}><GraphNode ref={openerRef} title="Open record" aria-label="Open record" selected x={20} y={20} onClick={()=>setState(value=>({...value,inspector:true}))}/></GraphViewport></GraphWorkspace>{state.nested ? null : modal}</main>;
}
window.cancels=0;window.closes=0;window.confirms=0;
createRoot(document.getElementById('root')).render(<StrictMode><Fixture/></StrictMode>);
`;
const bundle = await build({
  bundle: true,
  format: "iife",
  platform: "browser",
  write: false,
  logLevel: "silent",
  stdin: { contents: source, loader: "jsx", resolveDir: root },
});
const browser = await chromium.launch({
  headless: true,
  ...(existsSync("/usr/bin/google-chrome")
    ? { executablePath: "/usr/bin/google-chrome" }
    : {}),
});
const results = [];
const errors = [];
const settle = (page) =>
  page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        ),
      ),
  );
try {
  for (const nested of [false, true])
    for (const generic of [false, true])
      for (const start of [1440, 1100, 390]) {
        const context = await browser.newContext({
          viewport: { width: start, height: 1000 },
        });
        const page = await context.newPage();
        page.on("pageerror", (error) => errors.push(error.message));
        try {
          await page.setContent(
            `<!doctype html><html lang="en"><head><title>Modal order</title><style>${css}body{margin:0}</style></head><body><div id="root"></div></body></html>`,
          );
          await page.addScriptTag({ content: bundle.outputFiles[0].text });
          const configure = async (patch) => {
            await page.evaluate((patch) => window.configure(patch), patch);
            await settle(page);
          };
          await configure({ nested, generic });
          await page
            .getByRole("button", { name: "Open record", exact: true })
            .click();
          const inspector = page.locator(".od-graph-inspector");
          const draft = inspector.getByRole("textbox", {
            name: "Draft",
            exact: true,
          });
          await draft.fill("Preserve entered draft");
          await inspector.evaluate((element) => {
            window.inspector = element;
            window.draft = element.querySelector("input");
            const content = element.querySelector(
              ".od-graph-inspector-content",
            );
            content.scrollTop = 140;
            window.scrollTop = content.scrollTop;
          });
          await page
            .getByRole("button", { name: "Review changes", exact: true })
            .click();
          const modal = page.locator(".od-dialog[open]");
          const input = modal.locator("input");
          await input.fill(generic ? "Preserve review note" : "discard this");
          await modal.evaluate((element) => {
            window.modal = element;
            window.impact = element.querySelector("input");
            window.foregroundFocus = document.activeElement;
          });
          const prove = async () => {
            assert.equal(
              await inspector
                .locator(".od-graph-inspector-content")
                .evaluate((element) => element.scrollTop),
              140,
              "Each mode retains the covered inspector scroll position",
            );
            assert.deepEqual(
              await page.evaluate(() => ({
                sameInspector:
                  window.inspector ===
                  document.querySelector(".od-graph-inspector"),
                sameDraft:
                  window.draft === window.inspector.querySelector("input"),
                sameModal:
                  window.modal === document.querySelector(".od-dialog[open]"),
                sameImpact:
                  window.impact === window.modal.querySelector("input"),
                draft: window.draft.value,
                focus: window.foregroundFocus === document.activeElement,
                modal: window.modal.matches(":modal"),
                closes: window.closes,
                cancels: window.cancels,
                confirms: window.confirms,
                overflow:
                  document.documentElement.scrollWidth > innerWidth ||
                  document.documentElement.scrollHeight > innerHeight,
              })),
              {
                sameInspector: true,
                sameDraft: true,
                sameModal: true,
                sameImpact: true,
                draft: "Preserve entered draft",
                focus: true,
                modal: true,
                closes: 0,
                cancels: 0,
                confirms: 0,
                overflow: false,
              },
            );
            await expect(input).toHaveValue(
              generic ? "Preserve review note" : "discard this",
            );
            const cancel = modal.getByRole("button", {
              name: "Cancel",
              exact: true,
            });
            assert.equal(
              await cancel.evaluate((button) => {
                const r = button.getBoundingClientRect();
                return button.contains(
                  document.elementFromPoint(
                    r.x + r.width / 2,
                    r.y + r.height / 2,
                  ),
                );
              }),
              true,
              "Cancel receives pointer input",
            );
            await cancel.click({ trial: true });
            for (const key of [
              "Tab",
              "Tab",
              "Tab",
              "Shift+Tab",
              "Shift+Tab",
              "Shift+Tab",
            ]) {
              await page.keyboard.press(key);
              assert.equal(
                await modal.evaluate((element) =>
                  element.contains(document.activeElement),
                ),
                true,
                "Foreground contains keyboard focus",
              );
            }
            await input.focus();
          };
          for (const width of [1440, 390, 1100, 1440, 1100, 390, 1440]) {
            await page.setViewportSize({ width, height: 1000 });
            await settle(page);
            await prove();
          }
          for (const scale of [2, 1, 2, 1]) {
            await page.evaluate(
              (scale) =>
                (document.documentElement.style.fontSize = `${scale * 100}%`),
              scale,
            );
            await settle(page);
            await prove();
          }
          await configure({ activation: 1 });
          await prove();
          assert.deepEqual(
            (await new AxeBuilder({ page }).analyze()).violations,
            [],
          );
          await page.screenshot({
            path: join(evidence, `${nested}-${generic}-${start}.png`),
          });
          await modal
            .getByRole("button", { name: "Cancel", exact: true })
            .click();
          await settle(page);
          await expect(modal).toHaveCount(0);
          await expect(draft).toBeFocused();
          assert.equal(
            await inspector.evaluate((element) => element.matches(":modal")),
            false,
          );
          assert.equal(
            await inspector
              .locator(".od-graph-inspector-content")
              .evaluate((element) => element.scrollTop),
            140,
            "Scroll survives a round trip",
          );
          // A modal can remain pending with every control disabled, then close on Escape.
          await page
            .getByRole("button", { name: "Review changes", exact: true })
            .click();
          await page.setViewportSize({ width: 390, height: 844 });
          await settle(page);
          await configure({ pending: true });
          for (const width of [1440, 1100, 390]) {
            await page.setViewportSize({ width, height: 844 });
            await settle(page);
            await page.keyboard.press("Tab");
            assert.equal(
              await modal.evaluate((element) =>
                element.contains(document.activeElement),
              ),
              true,
            );
            await page.keyboard.press("Escape");
            await expect(modal).toHaveCount(1);
          }
          assert.equal(await page.evaluate(() => window.cancels), 1);
          await configure({ pending: false });
          await page.keyboard.press("Escape");
          await settle(page);
          await expect(modal).toHaveCount(0);
          await expect(draft).toBeFocused();
          assert.equal(
            await inspector.evaluate((element) => element.matches(":modal")),
            true,
          );
          assert.equal(await page.evaluate(() => window.closes), 0);
          if (!generic) {
            await page
              .getByRole("button", { name: "Review changes", exact: true })
              .click();
            await input.fill("discard this draft");
            await page.setViewportSize({ width: 1440, height: 1000 });
            await settle(page);
            await modal
              .getByRole("button", { name: "Discard", exact: true })
              .dblclick();
            await settle(page);
            assert.equal(await page.evaluate(() => window.confirms), 1);
            await expect(
              modal.getByRole("button", { name: "Working…", exact: true }),
            ).toBeDisabled();
          } else {
            await page
              .getByRole("button", { name: "Review changes", exact: true })
              .click();
          }
          // Removal during a deferred transition must not run a stale modal promotion.
          await page.setViewportSize({ width: 390, height: 844 });
          await settle(page);
          await configure({ inspector: false, modal: false, pending: false });
          await expect(page.locator("dialog:modal")).toHaveCount(0);
          await expect(
            page.getByRole("button", { name: "Open record", exact: true }),
          ).toBeFocused();
          await page
            .getByRole("button", { name: "Open record", exact: true })
            .click();
          await settle(page);
          assert.equal(
            await inspector.evaluate((element) => element.matches(":modal")),
            true,
          );
          await page.keyboard.press("Escape");
          await settle(page);
          await expect(page.locator("dialog:modal")).toHaveCount(0);
          await page
            .getByRole("button", { name: "Open record", exact: true })
            .click({ trial: true });
          results.push({ nested, generic, start, axe: true });
        } finally {
          await context.close();
        }
      }
  for (const nested of [false, true]) {
    const nativeSource = String.raw`
import React, {useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {flushSync} from 'react-dom';
import {Dialog,Button,FormField} from '@opendle/ui';
function Fixture(){
 const [state,setState]=useState({outer:false,inner:false,outerDisabled:false,innerDisabled:false,removeInput:false});
 const outerInput=useRef(null),innerInput=useRef(null),trigger=useRef(null);
 window.configure=patch=>flushSync(()=>setState(value=>({...value,...patch})));
 const child=<Dialog open={state.inner} title="Inner review" closeDisabled={state.innerDisabled} showCloseButton={false} initialFocusRef={innerInput} returnFocusRef={trigger} onClose={()=>setState(value=>({...value,inner:false}))} actions={<Button disabled={state.innerDisabled} onClick={()=>setState(value=>({...value,inner:false}))}>Finish review</Button>}>{state.removeInput?<p>Review pending.</p>:<FormField label="Inner note"><input ref={innerInput} disabled={state.innerDisabled}/></FormField>}</Dialog>;
 return <main><h1>Native dialog ownership</h1><Button onClick={()=>setState(value=>({...value,outer:true}))}>Open review</Button><Dialog open={state.outer} title="Outer review" initialFocusRef={outerInput} closeDisabled={state.outerDisabled} onClose={()=>setState(value=>({...value,outer:false}))} actions={<Button ref={trigger} disabled={state.outerDisabled} onClick={()=>setState(value=>({...value,inner:true}))}>Open inner review</Button>}><FormField label="Outer note"><input ref={outerInput} disabled={state.outerDisabled}/></FormField>${nested ? "{child}" : ""}</Dialog>${nested ? "" : "{child}"}</main>;
}
createRoot(document.getElementById('root')).render(<Fixture/>);
`;
    const nativeBundle = await build({
      bundle: true,
      format: "iife",
      platform: "browser",
      write: false,
      logLevel: "silent",
      stdin: { contents: nativeSource, loader: "jsx", resolveDir: root },
    });
    const context = await browser.newContext({
      viewport: { width: 1100, height: 1000 },
    });
    const page = await context.newPage();
    page.on("pageerror", (error) => errors.push(error.message));
    try {
      await page.setContent(
        `<!doctype html><html lang="en"><head><title>Dialog ownership</title><style>${css}</style></head><body><div id="root"></div></body></html>`,
      );
      await page.addScriptTag({ content: nativeBundle.outputFiles[0].text });
      await page
        .getByRole("button", { name: "Open review", exact: true })
        .click();
      await page
        .getByRole("textbox", { name: "Outer note", exact: true })
        .fill("Keep outer note");
      await page
        .getByRole("button", { name: "Open inner review", exact: true })
        .click();
      const inner = page.getByRole("dialog", {
        name: "Inner review",
        exact: true,
      });
      const innerInput = inner.getByRole("textbox", {
        name: "Inner note",
        exact: true,
      });
      await innerInput.fill("Keep inner note");
      await page.evaluate(() => window.configure({ outerDisabled: true }));
      await settle(page);
      await expect(innerInput).toBeFocused();
      await page.evaluate(() =>
        window.configure({ innerDisabled: true, removeInput: true }),
      );
      await settle(page);
      await expect(inner).toBeFocused();
      for (const key of ["Tab", "Shift+Tab", "Escape"]) {
        await page.keyboard.press(key);
        await expect(inner).toBeFocused();
      }
      assert.deepEqual(
        (await new AxeBuilder({ page }).analyze()).violations,
        [],
      );
      await page.screenshot({
        path: join(evidence, `native-ownership-${nested}.png`),
      });
      await page.evaluate(() =>
        window.configure({ outerDisabled: false, innerDisabled: false }),
      );
      await inner
        .getByRole("button", { name: "Finish review", exact: true })
        .click();
      await settle(page);
      await expect(
        page.getByRole("button", { name: "Open inner review", exact: true }),
      ).toBeFocused();
      await page
        .getByRole("button", { name: "Open inner review", exact: true })
        .click();
      await page.evaluate(() => {
        window.configure({ inner: false });
        window.configure({ inner: true, removeInput: false });
      });
      await settle(page);
      await expect(innerInput).toBeFocused();
      await page.evaluate(() =>
        window.configure({ inner: false, outer: false }),
      );
      await settle(page);
      await expect(page.locator("dialog:modal")).toHaveCount(0);
      await page
        .getByRole("button", { name: "Open review", exact: true })
        .click({ trial: true });
      results.push({ nativeDialogOwnership: true, nested, axe: true });
    } finally {
      await context.close();
    }
  }

  assert.deepEqual(errors, []);
} finally {
  await browser.close();
}
await writeFile(
  join(evidence, "results.json"),
  JSON.stringify(results, null, 2) + "\n",
);
console.log(JSON.stringify({ cases: results.length, evidence }));
