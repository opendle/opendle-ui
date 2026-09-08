import { strict as assert } from "node:assert";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const source = String.raw`
import React, {useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Button, FormField, PageSurface, GraphWorkspace, GraphViewport, GraphNode, GraphInspector, SecretRevealPanel} from './dist/index.js';
function Fixture() {
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(true);
  const opener = useRef(null);
  const secret = 'SyntheticOnly0123456789'.repeat(100);
  const inspector = open ? <GraphInspector title="Synthetic record details" returnFocusRef={opener} onClose={() => {window.closeRequests++; if (!shown) setOpen(false);}} actions={<Button>Save record</Button>}>
    <p>Store the synthetic value before closing these details.</p>
    <section>{Array.from({length:12}, (_, index) => <p key={index}>Synthetic record detail {index + 1}.</p>)}</section>
    {shown ? <SecretRevealPanel secret={secret} title={'Store this synthetic value with a long descriptive title '.repeat(3)} copyLabel="Copy this synthetic value for the selected record" copiedLabel="Synthetic value copied" dismissLabel="Clear this synthetic value from the selected record" copySecret={async value => {window.copyCount++; window.copyMatches = value === secret;}} onDismiss={() => {window.clearCount++; setShown(false);}}/> : null}
    <form>{Array.from({length:12}, (_, index) => <FormField key={index} label={'Record field ' + index}><input defaultValue="Keep the entered value"/></FormField>)}</form>
  </GraphInspector> : null;
  return <main><PageSurface edgeToEdge style={{height:'100%'}}><GraphWorkspace fullPage inspector={inspector}><GraphViewport aria-label="Synthetic graph" canvasWidth={600} canvasHeight={500}><GraphNode ref={opener} title="Open record" aria-label="Open record" x={20} y={20} onClick={() => setOpen(true)}/></GraphViewport></GraphWorkspace></PageSurface></main>;
}
createRoot(document.getElementById('root')).render(<Fixture/>);
`;

async function reachable(control) {
  await control.scrollIntoViewIfNeeded();
  assert.equal(
    await control.evaluate((element) => {
      const r = element.getBoundingClientRect();
      const hit = document.elementFromPoint(
        r.x + r.width / 2,
        r.y + r.height / 2,
      );
      const inspector = element
        .closest(".od-graph-inspector")
        .getBoundingClientRect();
      const range = document.createRange();
      range.selectNodeContents(element);
      const textFits = [...range.getClientRects()].every(
        (line) =>
          line.left >= r.left &&
          line.right <= r.right &&
          line.top >= r.top &&
          line.bottom <= r.bottom,
      );
      return (
        textFits &&
        element.contains(hit) &&
        r.width >= 44 &&
        r.height >= 44 &&
        r.top >= inspector.top &&
        r.bottom <= inspector.bottom &&
        r.left >= inspector.left &&
        r.right <= inspector.right
      );
    }),
    true,
    "The complete control is inside the inspector and receives pointer hits",
  );
}

export async function checkSecretPanelFit(browser, css) {
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
  for (const fontSize of [16, 32]) {
    for (const [mode, baseWidth] of [
      ["split", 1440],
      ["overlay", 1000],
      ["sheet", 390],
    ]) {
      for (const method of ["pointer", "keyboard"]) {
        const context = await browser.newContext({
          viewport: {
            width: mode === "sheet" ? baseWidth : (baseWidth * fontSize) / 16,
            height: 1000,
          },
        });
        const page = await context.newPage();
        try {
          await page.setContent(
            `<!doctype html><html lang="en"><head><title>Secret panel fit</title><style>${css}html{font-size:${fontSize}px}body{margin:0}main{height:100dvh}</style></head><body><div id="root"></div></body></html>`,
          );
          await page.evaluate(() => {
            window.copyCount = 0;
            window.clearCount = 0;
            window.closeRequests = 0;
          });
          await page.addScriptTag({ content: bundle.outputFiles[0].text });
          const opener = page.getByRole("button", {
            name: "Open record",
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
          const panel = page.locator(".od-secret-reveal-panel");
          const fit = await panel.evaluate((element) => ({
            height: element.getBoundingClientRect().height,
            clientHeight: element.clientHeight,
            scrollHeight: element.scrollHeight,
            clientWidth: element.clientWidth,
            scrollWidth: element.scrollWidth,
          }));
          assert.ok(
            fit.clientHeight >= fit.scrollHeight &&
              fit.clientWidth >= fit.scrollWidth,
            `${mode} ${fontSize}px ${method}: the panel contains its content: ${JSON.stringify(fit)}`,
          );
          assert.equal(
            await panel.locator("h2").evaluate((element) => {
              const panel = element
                .closest(".od-secret-reveal-panel")
                .getBoundingClientRect();
              const range = document.createRange();
              range.selectNodeContents(element);
              return [...range.getClientRects()].every(
                (r) =>
                  r.left >= panel.left &&
                  r.right <= panel.right &&
                  r.top >= panel.top &&
                  r.bottom <= panel.bottom,
              );
            }),
            true,
            "The long title stays inside the panel",
          );
          const value = panel.locator("output");
          assert.equal(
            await value.evaluate(
              (element) =>
                element.scrollHeight > element.clientHeight &&
                element.scrollWidth <= element.clientWidth,
            ),
            true,
            "The long unbroken value wraps and has bounded local scrolling",
          );
          await value.scrollIntoViewIfNeeded();
          await value.hover();
          await page.mouse.wheel(0, 600);
          await page.waitForFunction(
            () =>
              document.querySelector(".od-secret-reveal-value").scrollTop > 0,
          );
          const close = inspector.getByRole("button", {
            name: "Close inspector",
            exact: true,
          });
          await reachable(close);
          await close.click();
          assert.equal(
            await inspector.evaluate(
              (element) =>
                element.open &&
                element.matches(":modal") ===
                  (element.dataset.mode === "sheet"),
            ),
            true,
            "A denied close keeps the same native modal state",
          );
          assert.equal(
            await close.evaluate(
              (element) => document.activeElement === element,
            ),
            true,
            "A denied close keeps focus",
          );
          const copy = panel.getByRole("button", {
            name: "Copy this synthetic value for the selected record",
            exact: true,
          });
          const clear = panel.getByRole("button", {
            name: "Clear this synthetic value from the selected record",
            exact: true,
          });
          if (method === "keyboard") {
            await page.keyboard.press("Tab");
            // Chromium can include the scrollable output in the Tab order.
            if (
              !(await copy.evaluate(
                (element) => document.activeElement === element,
              ))
            )
              await page.keyboard.press("Tab");
            assert.equal(
              await copy.evaluate(
                (element) => document.activeElement === element,
              ),
              true,
              "Tab reaches Copy",
            );
          }
          await reachable(copy);
          if (method === "pointer") await copy.click();
          else await page.keyboard.press("Enter");
          await panel
            .getByRole("button", {
              name: "Synthetic value copied",
              exact: true,
            })
            .waitFor();
          assert.deepEqual(
            await page.evaluate(() => [window.copyCount, window.copyMatches]),
            [1, true],
          );
          if (method === "keyboard") {
            await page.keyboard.press("Tab");
            assert.equal(
              await clear.evaluate(
                (element) => document.activeElement === element,
              ),
              true,
              "Tab reaches Clear",
            );
          }
          await reachable(clear);
          assert.equal(
            await inspector
              .locator(".od-graph-inspector-content")
              .evaluate((element) => element.scrollTop > 0),
            true,
            "Actions are reached through local inspector scrolling",
          );
          assert.equal(
            await page.evaluate(() => {
              const element = document.scrollingElement;
              return (
                element.scrollWidth <= element.clientWidth &&
                element.scrollHeight <= element.clientHeight
              );
            }),
            true,
            "Long content does not make the document overflow",
          );
          await page.screenshot({
            path: `/tmp/opendle-ui-secret-panel-${mode}-${fontSize}-${method}.png`,
          });
          if (method === "pointer") await clear.click();
          else await page.keyboard.press("Space");
          await panel.waitFor({ state: "detached" });
          assert.equal(await page.evaluate(() => window.clearCount), 1);
          assert.equal(
            await page
              .getByRole("textbox", { name: "Record field 0", exact: true })
              .inputValue(),
            "Keep the entered value",
          );
          await reachable(
            inspector.getByRole("button", { name: "Save record", exact: true }),
          );
          if (method === "pointer") await close.click();
          else {
            await close.focus();
            await page.keyboard.press("Escape");
          }
          await inspector.waitFor({ state: "detached" });
          assert.equal(
            await opener.evaluate(
              (element) => document.activeElement === element,
            ),
            true,
            "Accepted close returns focus to the exact opener",
          );
          cases++;
        } finally {
          await context.close();
        }
      }
    }
  }
  console.log(`Secret panel fit: ${cases} browser cases passed.`);
}
