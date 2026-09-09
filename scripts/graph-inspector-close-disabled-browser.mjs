import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import AxeBuilder from "@axe-core/playwright";
import { chromium } from "@playwright/test";
import { build } from "esbuild";

assert.equal(process.argv.length, 2, "This check accepts no arguments.");
const root = fileURLToPath(new URL("..", import.meta.url));
const css = await readFile(
  new URL("../styles/tokens.css", import.meta.url),
  "utf8",
);
const screenshotDirectory = await mkdtemp(
  join(tmpdir(), "opendle-inspector-close-disabled-"),
);
const source = String.raw`
import React, {StrictMode, useState} from 'react';
import {flushSync} from 'react-dom';
import {createRoot} from 'react-dom/client';
import {Button, FormField, GraphInspector, GraphNode, GraphViewport, GraphWorkspace} from '@opendle/ui';
function Fixture() {
  const [options, setOptions] = useState({open:false, locked:undefined, fieldsDisabled:false, retain:false, cancel:false, cancelHandler:true});
  window.configureInspector = patch => flushSync(() => setOptions(value => ({...value,...patch})));
  const lock = options.locked === undefined ? {} : {closeDisabled:options.locked};
  const cancel = options.cancelHandler ? {onCancel:event => {window.cancelRequests++; if(options.cancel) event.preventDefault();}} : {};
  return <main aria-label="Inspector close fixture"><h1 className="od-visually-hidden">Inspector close fixture</h1>
    <GraphWorkspace fullPage style={{height:'100dvh'}} inspector={options.open ?
      <GraphInspector {...lock} {...cancel} title="Record draft" onClose={() => {window.closeRequests++; if(!options.retain) setOptions(value => ({...value,open:false}));}}
        actions={<Button disabled={options.fieldsDisabled} onClick={() => setOptions(value => ({...value,locked:true,fieldsDisabled:true}))}>Save record</Button>}>
        <FormField label="Display name"><input defaultValue="Record" disabled={options.fieldsDisabled}/></FormField>
        <p>Keep the entered name until the operation is complete.</p>
      </GraphInspector> : null}>
      <GraphViewport aria-label="Record graph" canvasWidth={240} canvasHeight={180}>
        <GraphNode title="Open record" aria-label="Open record" x={20} y={20} onClick={() => setOptions(value => ({...value,open:true}))}/>
      </GraphViewport>
    </GraphWorkspace>
  </main>;
}
window.closeRequests = 0;
window.cancelRequests = 0;
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
  executablePath: existsSync("/usr/bin/google-chrome")
    ? "/usr/bin/google-chrome"
    : undefined,
  headless: true,
});
const cases = [];
const screenshots = [];
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
  for (const scale of [1, 2]) {
    for (const [baseWidth, mode] of [
      [1200, "split"],
      [1000, "overlay"],
      [412, "sheet"],
    ]) {
      const width = mode === "sheet" ? baseWidth : baseWidth * scale;
      const context = await browser.newContext({
        viewport: { width, height: 1000 },
      });
      const page = await context.newPage();
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      try {
        await page.setContent(
          `<!doctype html><html lang="en" style="font-size:${scale * 100}%"><head><title>Inspector close fixture</title><style>${css}body{margin:0}</style></head><body><div id="root"></div></body></html>`,
        );
        await page.addScriptTag({ content: bundle.outputFiles[0].text });
        const inspector = page.locator(".od-graph-inspector");
        const opener = page.getByRole("button", {
          name: "Open record",
          exact: true,
        });
        const heading = inspector.getByRole("heading", {
          name: "Record draft",
        });
        const close = inspector.getByRole("button", {
          name: "Close inspector",
        });
        const draft = page.getByRole("textbox", {
          name: "Display name",
          exact: true,
        });
        const configure = async (patch) => {
          await page.evaluate(
            (patch) => window.configureInspector(patch),
            patch,
          );
          await settle(page);
        };
        const open = async (patch) => {
          await configure({
            locked: undefined,
            fieldsDisabled: false,
            retain: false,
            cancel: false,
            cancelHandler: true,
            ...patch,
          });
          await opener.click();
          await page.waitForFunction(
            (mode) =>
              document.querySelector(".od-graph-inspector")?.dataset.mode ===
              mode,
            mode,
          );
          await settle(page);
          assert.equal(
            await heading.evaluate(
              (element) => element === document.activeElement,
            ),
            true,
          );
          await page.evaluate(() => {
            window.closeRequests = 0;
            window.cancelRequests = 0;
          });
        };
        const remember = () =>
          inspector.evaluate((element) => {
            window.retainedInspector = element;
            window.retainedInput = element.querySelector("input");
            window.retainedFocus = document.activeElement;
          });
        const retained = async (requests = 0, focus = true) => {
          assert.deepEqual(
            await inspector.evaluate((element) => ({
              same: element === window.retainedInspector,
              input: element.querySelector("input") === window.retainedInput,
              focus: document.activeElement === window.retainedFocus,
              value: element.querySelector("input").value,
              open: element.open,
              mode: element.dataset.mode,
              modal: element.matches(":modal"),
              requests: window.closeRequests,
            })),
            {
              same: true,
              input: true,
              focus,
              value: "Entered draft",
              open: true,
              mode,
              modal: mode === "sheet",
              requests,
            },
          );
        };
        const nativeCancel = async () => {
          assert.equal(
            await inspector.evaluate((element) =>
              element.dispatchEvent(new Event("cancel", { cancelable: true })),
            ),
            false,
            "Native cancel is prevented before the browser can remove the inspector",
          );
          await settle(page);
        };
        const closed = async () => {
          await inspector.waitFor({ state: "detached" });
          await settle(page);
          assert.equal(
            await opener.evaluate(
              (element) => element === document.activeElement,
            ),
            true,
            "Close returns focus to the exact opener",
          );
          assert.equal(await page.evaluate(() => window.closeRequests), 1);
        };
        await open({ locked: true });
        assert.equal(
          await close.evaluate(
            (element) => element.disabled && element.matches(":disabled"),
          ),
          true,
          "closeDisabled sets native disabled state",
        );
        assert.equal(
          await inspector.getAttribute("closedisabled"),
          null,
          "The prop does not leak into dialog attributes",
        );
        await draft.fill("Entered draft");
        await remember();
        await close.evaluate((element) => {
          element.focus();
          element.click();
        });
        await retained();
        await heading.focus();
        await page.keyboard.press("Tab");
        assert.equal(
          await draft.evaluate((element) => element === document.activeElement),
          true,
          "Tab skips disabled Close and reaches the first enabled field",
        );
        const bounds = await close.boundingBox();
        assert.ok(bounds && bounds.width >= 44 && bounds.height >= 44);
        await page.mouse.click(
          bounds.x + bounds.width / 2,
          bounds.y + bounds.height / 2,
        );
        assert.deepEqual(
          await close.evaluate((element) => ({
            background: getComputedStyle(element).backgroundColor,
            cursor: getComputedStyle(element).cursor,
            opacity: getComputedStyle(element).opacity,
          })),
          {
            background: "rgba(0, 0, 0, 0)",
            cursor: "not-allowed",
            opacity: "0.45",
          },
          "Disabled Close keeps its disabled presentation under the pointer",
        );
        await heading.focus();
        await close.evaluate((element) => element.focus());
        assert.equal(
          await heading.evaluate(
            (element) => element === document.activeElement,
          ),
          true,
        );
        await page.keyboard.press("Enter");
        await page.keyboard.press("Space");
        await draft.focus();
        await page.keyboard.press("Escape");
        await nativeCancel();
        await retained();
        assert.equal(
          await page.evaluate(() => window.cancelRequests),
          mode === "sheet" ? 2 : 1,
          "Host cancel handler still receives cancel events",
        );
        await configure({ locked: false });
        await retained();
        assert.equal(await close.isEnabled(), true);
        await configure({ locked: true });
        await retained();
        await configure({ fieldsDisabled: true });
        if (mode === "sheet") {
          assert.equal(
            await heading.evaluate(
              (element) => element === document.activeElement,
            ),
            true,
            "Disabling the focused field recovers modal focus without test intervention",
          );
        } else {
          await heading.focus();
        }
        await remember();
        if (mode === "sheet") {
          assert.equal(
            await inspector.locator("button:enabled, input:enabled").count(),
            0,
          );
          for (const key of ["Tab", "Shift+Tab", "Tab"]) {
            await page.keyboard.press(key);
            assert.equal(
              await inspector.evaluate((element) =>
                element.contains(document.activeElement),
              ),
              true,
              "An empty modal tab order keeps focus inside",
            );
          }
          await opener.evaluate((element) => element.focus());
          assert.equal(
            await inspector.evaluate((element) =>
              element.contains(document.activeElement),
            ),
            true,
          );
        }
        await page.keyboard.press("Escape");
        await nativeCancel();
        await retained();
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          true,
          "No page width overflow",
        );
        assert.equal(
          await inspector.evaluate(
            (element) => element.scrollWidth <= element.clientWidth + 1,
          ),
          true,
          "No inspector width overflow",
        );
        const axe = await new AxeBuilder({ page }).analyze();
        assert.deepEqual(axe.violations, [], `${mode} ${scale}: strict Axe`);
        const path = join(screenshotDirectory, `${mode}-${scale * 100}.png`);
        await page.screenshot({ path, fullPage: true });
        screenshots.push(path);
        await configure({ locked: false, fieldsDisabled: false });
        await retained();
        await close.click();
        await closed();

        if (mode === "sheet") {
          for (const method of ["pointer", "Enter", "Space"]) {
            await open();
            await draft.fill("Entered draft");
            await remember();
            const save = inspector.getByRole("button", {
              name: "Save record",
            });
            if (method === "pointer") await save.click();
            else {
              await save.focus();
              await page.keyboard.press(method);
            }
            await settle(page);
            assert.equal(
              await heading.evaluate(
                (element) => element === document.activeElement,
              ),
              true,
              `${method} pending action recovers focus without test intervention`,
            );
            await retained(0, false);
            await page.keyboard.press("Tab");
            await page.keyboard.press("Shift+Tab");
            assert.equal(
              await heading.evaluate(
                (element) => element === document.activeElement,
              ),
              true,
            );
            await configure({ locked: false, fieldsDisabled: false });
            await close.focus();
            await configure({ locked: true });
            assert.equal(
              await heading.evaluate(
                (element) => element === document.activeElement,
              ),
              true,
              "Disabling focused Close recovers focus with other controls enabled",
            );
            await configure({ locked: false });
            await close.click();
            await closed();
          }
        }

        for (const lock of [undefined, false, true]) {
          for (const method of [
            "pointer",
            "Enter",
            "Space",
            "Escape",
            "cancel",
          ]) {
            await open({ locked: lock });
            if (lock === true) await configure({ locked: false });
            if (method === "pointer") await close.click();
            else if (method === "cancel") await nativeCancel();
            else if (method === "Escape") await page.keyboard.press(method);
            else {
              await close.focus();
              await page.keyboard.press(method);
            }
            await closed();
          }
        }
        for (const locked of [false, true]) {
          await open({ locked, cancel: true });
          await draft.fill("Entered draft");
          await remember();
          await nativeCancel();
          await retained();
          assert.equal(await page.evaluate(() => window.cancelRequests), 1);
          await configure({ locked: false, cancel: false });
          await nativeCancel();
          await closed();
        }
        await open({ locked: true, cancelHandler: false });
        await nativeCancel();
        assert.equal(await page.evaluate(() => window.closeRequests), 0);
        await configure({ locked: false });
        await nativeCancel();
        await closed();
        await open({ retain: true });
        await draft.fill("Entered draft");
        await remember();
        await page.keyboard.press("Escape");
        await settle(page);
        await retained(1);
        await configure({ open: false });
        await closed();
        cases.push({
          mode,
          scale,
          width,
          closeMethods: 5,
          defaultAndExplicitFalse: true,
          reenabled: true,
          retained: true,
          noEnabledControls: mode === "sheet",
        });
      } finally {
        await context.close();
      }
    }
  }
  assert.deepEqual(errors, []);
  const report = {
    cases,
    axeCases: cases.length,
    screenshotDirectory,
    screenshots,
  };
  await writeFile(
    join(screenshotDirectory, "results.json"),
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(JSON.stringify(report));
} finally {
  await browser.close();
}
