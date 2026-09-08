import { strict as assert } from "node:assert";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const source = String.raw`
import React, {StrictMode, useRef, useState} from 'react';
import {flushSync} from 'react-dom';
import {createRoot} from 'react-dom/client';
import {Button, ConfirmationDialog, FormField, PageSurface, GraphWorkspace, GraphViewport, GraphNode, GraphEdges, GraphEdge, GraphInspector} from './dist/index.js';
function Fixture() {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [showOpener, setShowOpener] = useState(true);
  const [activationKey, setActivationKey] = useState(0);
  const [, refresh] = useState(0);
  const returnFocusRef = useRef(null);
  const draftRef = useRef(null);
  window.acceptClose = () => setOpen(false);
  window.removeOpener = () => setShowOpener(false);
  window.activateThenClose = () => {
    flushSync(() => setActivationKey(value => value + 1));
    returnFocusRef.current = document.querySelector('[aria-label="Other edge"]');
    flushSync(() => setOpen(false));
  };
  window.changeReturn = (target, render) => {
    returnFocusRef.current = document.querySelector('[aria-label="' + target + '"]');
    if (render) refresh(value => value + 1);
  };
  const requestClose = () => {
    window.closeRequests = (window.closeRequests ?? 0) + 1;
    if (window.closePolicy === 'accept') setOpen(false);
    if (window.closePolicy === 'confirm') setConfirm(true);
  };
  const inspector = open ? <GraphInspector activationKey={activationKey} title="Guarded record" returnFocusRef={returnFocusRef} onClose={requestClose}><FormField label="Draft"><input ref={draftRef} defaultValue="Keep this draft"/></FormField><Button>Last inspector action</Button></GraphInspector> : null;
  return <main><PageSurface edgeToEdge style={{height:'100%'}}><GraphWorkspace fullPage inspector={inspector}><GraphViewport aria-label="Guarded graph" canvasWidth={600} canvasHeight={500}>{showOpener ? <GraphNode aria-label="Original opener" title="Original opener" x={20} y={20} onClick={event => {returnFocusRef.current = event.currentTarget; setOpen(true);}}/> : null}<GraphNode aria-label="Other node" title="Other node" x={20} y={200} selected/><GraphEdges width={600} height={500}><GraphEdge aria-label="Other edge" path="M 20 340 L 300 340" onSelect={() => {}}/></GraphEdges></GraphViewport></GraphWorkspace></PageSurface><ConfirmationDialog open={confirm} title="Discard draft?" description="The draft has changes." confirmLabel="Discard" returnFocusRef={draftRef} onCancel={() => setConfirm(false)} onConfirm={() => {setConfirm(false); setOpen(false);}}/></main>;
}
createRoot(document.getElementById('root')).render(<StrictMode><Fixture/></StrictMode>);
`;

export async function checkInspectorCloseRetention(browser, css) {
  const bundle = await build({
    bundle: true,
    format: "iife",
    platform: "browser",
    write: false,
    logLevel: "silent",
    stdin: {
      contents: source,
      loader: "jsx",
      resolveDir: fileURLToPath(new URL("../..", import.meta.url)),
    },
  });
  let cases = 0;
  for (const [width, mode] of [
    [1440, "split"],
    [1000, "overlay"],
    [390, "sheet"],
  ]) {
    const context = await browser.newContext({
      viewport: { width, height: 800 },
    });
    const page = await context.newPage();
    try {
      const settle = () =>
        page.evaluate(
          () =>
            new Promise((resolve) =>
              requestAnimationFrame(() =>
                requestAnimationFrame(() => requestAnimationFrame(resolve)),
              ),
            ),
        );
      const load = async () => {
        await page.setContent(
          `<!doctype html><html lang="en"><head><title>Inspector guard</title><style>${css}body{margin:0}main{height:100dvh}</style></head><body><div id="root"></div></body></html>`,
        );
        await page.evaluate(() => {
          window.closePolicy = "retain";
          window.closeRequests = 0;
        });
        await page.addScriptTag({ content: bundle.outputFiles[0].text });
        await page.getByRole("button", { name: "Original opener" }).click();
        await page.waitForFunction(
          (mode) =>
            document.querySelector(".od-graph-inspector")?.dataset.mode ===
            mode,
          mode,
        );
        await settle();
      };
      const inspector = page.locator(".od-graph-inspector");
      const draft = page.getByRole("textbox", { name: "Draft", exact: true });
      const close = inspector.getByRole("button", { name: "Close inspector" });
      const exactFocus = async (label) => {
        await page.waitForFunction(
          (label) =>
            document.activeElement?.getAttribute("aria-label") === label,
          label,
          { timeout: 1000 },
        );
      };
      for (const method of ["Close", "Escape"]) {
        for (const nextTarget of [
          "Original opener",
          "Other node",
          "Other edge",
          "removed",
        ]) {
          await load();
          await draft.fill("Retain entered value");
          if (method === "Close") await close.focus();
          else await draft.focus();
          await inspector.evaluate((element) => {
            window.retainedInspector = element;
            window.retainedDraft = element.querySelector("input");
            window.retainedFocus = document.activeElement;
          });
          if (method === "Close") await close.click();
          else await page.keyboard.press("Escape");
          await settle();
          assert.deepEqual(
            await inspector.evaluate((element) => ({
              sameInspector: element === window.retainedInspector,
              sameDraft:
                element.querySelector("input") === window.retainedDraft,
              sameFocus: document.activeElement === window.retainedFocus,
              value: element.querySelector("input").value,
              open: element.open,
              modal: element.matches(":modal"),
              requests: window.closeRequests,
              selected: document
                .querySelector("[data-selected='true']")
                ?.getAttribute("aria-label"),
            })),
            {
              sameInspector: true,
              sameDraft: true,
              sameFocus: true,
              value: "Retain entered value",
              open: true,
              modal: mode === "sheet",
              requests: 1,
              selected: "Other node",
            },
            `${mode} ${method}: a retained callback keeps DOM, values, selection, focus and native modal state`,
          );
          if (mode === "sheet") {
            await page
              .getByRole("button", { name: "Other node" })
              .evaluate((element) => element.focus());
            assert.equal(
              await inspector.evaluate((element) =>
                element.contains(document.activeElement),
              ),
              true,
              "The modal background cannot receive focus",
            );
            await inspector
              .getByRole("button", { name: "Last inspector action" })
              .focus();
            await page.keyboard.press("Tab");
            assert.equal(
              await close.evaluate(
                (element) => element === document.activeElement,
              ),
              true,
              "Tab stays in the retained sheet",
            );
          }
          if (nextTarget === "removed")
            await page.evaluate(() => window.removeOpener());
          else if (nextTarget !== "Original opener") {
            await page.evaluate(
              ({ target, render }) => window.changeReturn(target, render),
              { target: nextTarget, render: method === "Close" },
            );
          }
          // The host accepts later, without a second close request.
          await page.evaluate(() => window.acceptClose());
          await inspector.waitFor({ state: "detached" });
          await exactFocus(
            nextTarget === "removed" ? "Other node" : nextTarget,
          );
          cases++;
        }
        await load();
        await page.evaluate(() => {
          window.closePolicy = "accept";
        });
        if (method === "Close") await close.click();
        else await page.keyboard.press("Escape");
        await inspector.waitFor({ state: "detached" });
        await exactFocus("Original opener");
        cases++;

        await load();
        await draft.fill("Unsaved draft");
        await page.evaluate(() => {
          window.closePolicy = "confirm";
        });
        if (method === "Close") await close.click();
        else await page.keyboard.press("Escape");
        const confirmation = page.getByRole("dialog", {
          name: "Discard draft?",
        });
        await confirmation
          .getByRole("button", { name: "Cancel", exact: true })
          .click();
        await settle();
        assert.equal(
          await inspector.evaluate(
            (element) =>
              element.open &&
              (element.dataset.mode !== "sheet" || element.matches(":modal")),
          ),
          true,
          "Cancelling discard keeps the inspector modal state",
        );
        assert.equal(await draft.inputValue(), "Unsaved draft");
        assert.equal(
          await draft.evaluate((element) => document.activeElement === element),
          true,
          "Cancelling discard returns focus inside the retained inspector",
        );
        if (method === "Close") await close.click();
        else await page.keyboard.press("Escape");
        await confirmation
          .getByRole("button", { name: "Discard", exact: true })
          .click();
        await inspector.waitFor({ state: "detached" });
        await exactFocus("Original opener");
        cases++;
      }
      await load();
      await page.evaluate(() => window.activateThenClose());
      await inspector.waitFor({ state: "detached" });
      await exactFocus("Other edge");
      cases++;
    } finally {
      await context.close();
    }
  }
  console.log(`Inspector close retention: ${cases} browser cases passed.`);
}
