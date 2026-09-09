/* global document, FormData, getComputedStyle, innerHeight, innerWidth, requestAnimationFrame, window */
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import process from "node:process";
import { fileURLToPath, URL } from "node:url";
import AxeBuilder from "@axe-core/playwright";
import { chromium } from "@playwright/test";
import { build } from "esbuild";

assert.equal(process.argv.length, 2, "This check accepts no arguments.");
const root = fileURLToPath(new URL("..", import.meta.url));
const screenshotDirectory = await mkdtemp(
  join(tmpdir(), "opendle-compact-checkbox-"),
);
const css = await readFile(
  new URL("../styles/tokens.css", import.meta.url),
  "utf8",
);
const source = String.raw`
import React, {StrictMode, useLayoutEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {CompactCheckboxGroup} from '@opendle/ui';
const baseOptions = [
  {value:'alpha', label:'Alpha choice'},
  {value:'beta', label:'Beta choice'},
  {value:'gamma', label:'Gamma choice', disabled:true},
  {value:'delta', label:'Delta choice'}
];
function Fixture() {
  const [settings, setSettings] = useState({options:baseOptions, value:['gamma','alpha'], disabled:false, limit:null, custom:false, revision:0, external:false});
  const fieldset = useRef(null);
  const [escapeCount, setEscapeCount] = useState(0);
  const [lastChange, setLastChange] = useState([]);
  useLayoutEffect(() => {
    window.configureGroup = patch => setSettings(current => ({...current, ...patch}));
    window.groupRef = fieldset;
    return () => {delete window.configureGroup; delete window.groupRef;};
  }, []);
  const options = settings.options.map(option => ({...option, disabled:option.disabled || (settings.limit !== null && settings.value.length >= settings.limit && !settings.value.includes(option.value))}));
  return <main aria-label="Checkbox group fixture">
    <h1>Compact checkbox group</h1>
    <p id="choices-help">Choose the items to include.</p>
    <form id="host-form" aria-label="Choices form" onSubmit={event => event.preventDefault()} onKeyDown={event => {if(event.key === 'Escape') setEscapeCount(count => count + 1);}}>
      <button type="button">Before group</button>
      <CompactCheckboxGroup
        label="Choices" name="choice" options={options} value={settings.value}
        disabled={settings.disabled} ref={fieldset} aria-describedby="choices-help"
        form={settings.external ? 'external-form' : undefined}
        summary={settings.custom ? count => <span>Choices: {count} chosen items</span> : undefined}
        onChange={value => {setLastChange(value); setSettings(current => ({...current, value}));}}
      />
      <button type="button">After group</button>
    </form>
    <form id="external-form" aria-label="External form" />
    <p className="fixture-change-values" data-last-change>{JSON.stringify(lastChange)}</p>
    <p data-escape-count>{escapeCount}</p>
    <p data-revision>{settings.revision}</p>
  </main>;
}
createRoot(document.getElementById('root')).render(<StrictMode><Fixture /></StrictMode>);
`;
const bundle = await build({
  bundle: true,
  format: "iife",
  jsx: "automatic",
  logLevel: "silent",
  platform: "browser",
  stdin: {
    contents: source,
    loader: "jsx",
    resolveDir: root,
    sourcefile: "compact-checkbox-fixture.jsx",
  },
  write: false,
});
const browser = await chromium.launch({
  executablePath: existsSync("/usr/bin/google-chrome")
    ? "/usr/bin/google-chrome"
    : undefined,
  headless: true,
});
const errors = [];
const cases = [];
const screenshots = [];
let axeCases = 0;
async function settle(page) {
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
}
async function configure(page, patch) {
  await page.evaluate((value) => window.configureGroup(value), patch);
  await settle(page);
}
async function focused(locator) {
  assert.equal(
    await locator.evaluate((element) => element === document.activeElement),
    true,
    "The expected native control has focus",
  );
}
async function visibleFocus(locator) {
  const focus = await locator.evaluate((element) => {
    const style = getComputedStyle(element);
    const box = element.getBoundingClientRect();
    const viewport = element.closest(".od-compact-checkbox-group-options");
    const bounds = viewport?.getBoundingClientRect();
    const extent =
      parseFloat(style.outlineWidth) + parseFloat(style.outlineOffset);
    return {
      box: {
        left: box.left,
        right: box.right,
        top: box.top,
        bottom: box.bottom,
      },
      bounds: bounds && {
        left: bounds.left,
        right: bounds.right,
        top: bounds.top,
        bottom: bounds.bottom,
      },
      extent,
      visible:
        element.matches(":focus-visible") &&
        parseFloat(style.outlineWidth) > 0 &&
        style.outlineStyle !== "none",
      contained:
        !bounds ||
        (box.left - extent >= bounds.left &&
          box.right + extent <= bounds.right &&
          box.top - extent >= bounds.top &&
          box.bottom + extent <= bounds.bottom),
    };
  });
  assert.equal(focus.visible, true, "Keyboard focus has a visible outline");
  assert.equal(
    focus.contained,
    true,
    `The local viewport does not clip the focus outline: ${JSON.stringify(focus)}`,
  );
}
async function formValues(page, id = "host-form") {
  return page.evaluate(
    (formId) => new FormData(document.getElementById(formId)).getAll("choice"),
    id,
  );
}
async function audit(page, caseName) {
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
    `${caseName}: no page width overflow`,
  );
  assert.deepEqual(
    (await new AxeBuilder({ page }).analyze()).violations,
    [],
    `${caseName}: strict Axe`,
  );
  axeCases += 1;
}
async function capture(page, name) {
  const path = join(screenshotDirectory, `${name}.png`);
  await page.screenshot({ path });
  screenshots.push(path);
}
const baseOptions = [
  { value: "alpha", label: "Alpha choice" },
  { value: "beta", label: "Beta choice" },
  { value: "gamma", label: "Gamma choice", disabled: true },
  { value: "delta", label: "Delta choice" },
];
try {
  for (const width of [1440, 390]) {
    for (const scale of [1, 2]) {
      const name = `${width}-${scale * 100}-percent`;
      const context = await browser.newContext({
        viewport: { width, height: 900 },
        deviceScaleFactor: 1,
      });
      try {
        const page = await context.newPage();
        page.on("pageerror", (error) => errors.push(error.message));
        page.on("console", (message) => {
          if (message.type() === "error") errors.push(message.text());
        });
        await page.setContent(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Compact checkbox group check</title><style>${css}
html{font-size:${scale * 100}%}body{margin:0}main{padding:0.5rem}main h1{font-size:1.5rem}main form>button{margin-block:0.5rem}.fixture-change-values{overflow-wrap:anywhere}
</style></head><body><div id="root"></div></body></html>`);
        await page.addScriptTag({ content: bundle.outputFiles[0].text });
        await page.waitForFunction(
          () => typeof window.configureGroup === "function",
        );
        const group = page.getByRole("group", { name: "Choices", exact: true });
        const summary = group.locator("summary");
        const details = group.locator("details");
        const inputs = group.locator('input[type="checkbox"]');
        const alpha = group.locator('input[value="alpha"]');
        const beta = group.locator('input[value="beta"]');
        const gamma = group.locator('input[value="gamma"]');
        const delta = group.locator('input[value="delta"]');
        const before = page.getByRole("button", {
          name: "Before group",
          exact: true,
        });
        const after = page.getByRole("button", {
          name: "After group",
          exact: true,
        });
        assert.equal(
          await group.evaluate((element) => element.tagName),
          "FIELDSET",
        );
        assert.equal(
          await group.evaluate(
            (element) => element === window.groupRef.current,
          ),
          true,
          "The ref reaches the native fieldset",
        );
        assert.equal(await summary.textContent(), "Choices (2 selected)");
        assert.equal(await details.getAttribute("open"), null);
        assert.equal(await inputs.count(), 4, "Closed controls remain mounted");
        assert.equal(await alpha.isVisible(), false);
        assert.equal(await alpha.isChecked(), true);
        assert.equal(await gamma.isChecked(), true);
        assert.deepEqual(
          await formValues(page),
          ["alpha"],
          "Closed form data omits disabled selections",
        );
        await audit(page, `${name} closed`);
        await capture(page, `${name}-closed`);
        await before.focus();
        await page.keyboard.press("Tab");
        await focused(summary);
        await visibleFocus(summary);
        await page.keyboard.press("Tab");
        await focused(after);
        await page.keyboard.press("Shift+Tab");
        await focused(summary);
        await page.keyboard.press("Enter");
        assert.equal(await details.getAttribute("open"), "");
        assert.deepEqual(await formValues(page), ["alpha"]);
        assert.equal(
          await page
            .getByRole("checkbox", { name: "Alpha choice", exact: true })
            .count(),
          1,
        );
        await page.keyboard.press("Tab");
        await focused(alpha);
        await page.keyboard.press("Tab");
        await focused(beta);
        await page.keyboard.press("Space");
        assert.equal(await beta.isChecked(), true);
        assert.equal(
          await page.locator("[data-last-change]").textContent(),
          '["alpha","beta","gamma"]',
          "Change values use option order and keep disabled selections",
        );
        await page.keyboard.press("Tab");
        await focused(delta);
        await page.keyboard.press("Tab");
        await focused(after);
        await page.keyboard.press("Shift+Tab");
        await focused(delta);
        await page.keyboard.press("Shift+Tab");
        await focused(beta);
        const originalBeta = await beta.elementHandle();
        const originalGroup = await group.elementHandle();
        await configure(page, {
          value: ["gamma", "beta", "alpha", "unavailable"],
          revision: 1,
        });
        await focused(beta);
        assert.equal(
          await beta.evaluate(
            (element, original) => element === original,
            originalBeta,
          ),
          true,
          "A controlled update keeps the checkbox node",
        );
        assert.equal(
          await group.evaluate(
            (element, original) => element === original,
            originalGroup,
          ),
          true,
          "A controlled update keeps the fieldset node",
        );
        assert.equal(await summary.textContent(), "Choices (3 selected)");
        await page.keyboard.press("Space");
        assert.equal(
          await page.locator("[data-last-change]").textContent(),
          '["alpha","gamma"]',
          "Change values omit unavailable selections",
        );
        await page.keyboard.press("Escape");
        assert.equal(await details.getAttribute("open"), null);
        await focused(summary);
        assert.equal(
          await page.locator("[data-escape-count]").textContent(),
          "0",
          "Escape closes this group before the enclosing surface",
        );
        assert.equal(
          await beta.evaluate(
            (element, original) => element === original,
            originalBeta,
          ),
          true,
          "Closing keeps the checkbox node",
        );
        assert.deepEqual(await formValues(page), ["alpha"]);
        await page.keyboard.press("Space");
        assert.equal(await details.getAttribute("open"), "");
        await group.locator("label").filter({ hasText: "Beta choice" }).click();
        assert.equal(
          await beta.isChecked(),
          true,
          "Pointer activation on the label selects its checkbox",
        );
        await summary.focus();
        await page.keyboard.press("Space");
        assert.equal(
          await details.getAttribute("open"),
          null,
          "Space also closes the disclosure",
        );
        await configure(page, {
          options: [
            baseOptions[1],
            baseOptions[0],
            baseOptions[2],
            baseOptions[3],
          ],
          value: ["alpha", "gamma", "beta"],
        });
        assert.deepEqual(
          await formValues(page),
          ["beta", "alpha"],
          "Native form values follow the current displayed order while closed",
        );
        await configure(page, { external: true });
        assert.deepEqual(
          await formValues(page),
          [],
          "External association removes controls from the enclosing form",
        );
        assert.deepEqual(await formValues(page, "external-form"), [
          "beta",
          "alpha",
        ]);
        await configure(page, {
          options: baseOptions,
          value: ["alpha"],
          disabled: true,
          external: false,
        });
        await summary.focus();
        await page.keyboard.press("Enter");
        assert.equal(
          await details.getAttribute("open"),
          "",
          "A disabled fieldset can still disclose its options",
        );
        for (const input of await inputs.all())
          assert.equal(await input.isDisabled(), true);
        assert.deepEqual(await formValues(page), []);
        await page.keyboard.press("Tab");
        await focused(after);
        await audit(page, `${name} disabled`);
        await configure(page, {
          disabled: false,
          options: baseOptions.map((option) => ({ ...option, disabled: true })),
          value: ["alpha", "gamma"],
        });
        for (const input of await inputs.all())
          assert.equal(await input.isDisabled(), true);
        assert.equal(await summary.textContent(), "Choices (2 selected)");
        await configure(page, {
          options: baseOptions.map((option) => ({
            ...option,
            disabled: false,
          })),
          value: ["alpha", "beta"],
          limit: 2,
        });
        assert.equal(await alpha.isDisabled(), false);
        assert.equal(await beta.isDisabled(), false);
        assert.equal(await gamma.isDisabled(), true);
        assert.equal(await delta.isDisabled(), true);
        await alpha.focus();
        await page.keyboard.press("Space");
        assert.equal(
          await delta.isDisabled(),
          false,
          "The host can apply a limit and keep selected choices enabled",
        );
        await delta.check();
        assert.equal(await alpha.isDisabled(), true);
        assert.equal(await beta.isDisabled(), false);
        assert.equal(await delta.isDisabled(), false);
        await configure(page, {
          options: [],
          value: ["unavailable"],
          limit: null,
          custom: true,
        });
        assert.equal(await inputs.count(), 0);
        assert.equal(await summary.textContent(), "Choices: 0 chosen items");
        assert.deepEqual(await formValues(page), []);
        await audit(page, `${name} empty`);
        const longOptions = Array.from({ length: 30 }, (_, index) => ({
          value: `item-${index}`,
          label: `Choice ${index + 1}: ${"SyntheticUnbrokenIdentifier".repeat(index === 0 ? 7 : 1)}`,
        }));
        await configure(page, {
          options: longOptions,
          value: ["item-0"],
          custom: false,
        });
        const viewport = group.locator(".od-compact-checkbox-group-options");
        const metrics = await viewport.evaluate((element) => ({
          height: element.getBoundingClientRect().height,
          clientHeight: element.clientHeight,
          scrollHeight: element.scrollHeight,
          viewportHeight: innerHeight,
          overflowY: getComputedStyle(element).overflowY,
        }));
        assert.ok(
          metrics.scrollHeight > metrics.clientHeight,
          "Long options scroll in the local viewport",
        );
        assert.ok(
          metrics.height <= metrics.viewportHeight / 2 + 1,
          "The option viewport uses at most half the visible height",
        );
        assert.equal(metrics.overflowY, "auto");
        await page.evaluate(() => window.scrollTo(0, 0));
        await group.scrollIntoViewIfNeeded();
        await summary.focus();
        const summaryBefore = await summary.boundingBox();
        const pageBefore = await page.evaluate(() => window.scrollY);
        for (let index = 0; index < longOptions.length; index += 1)
          await page.keyboard.press("Tab");
        const last = group.locator('input[value="item-29"]');
        await focused(last);
        await visibleFocus(last);
        assert.ok(
          (await viewport.evaluate((element) => element.scrollTop)) > 0,
          "Tab reaches the final option through local scrolling",
        );
        assert.equal(
          await last.evaluate((element) => {
            const box = element.getBoundingClientRect();
            const parent = element
              .closest(".od-compact-checkbox-group-options")
              .getBoundingClientRect();
            return box.top >= parent.top && box.bottom <= parent.bottom;
          }),
          true,
        );
        assert.deepEqual(
          await summary.boundingBox(),
          summaryBefore,
          "Local scrolling keeps the summary in place",
        );
        assert.equal(
          await page.evaluate(() => window.scrollY),
          pageBefore,
          "Checkbox keyboard access scrolls the local options only",
        );
        await page.keyboard.press("Space");
        assert.deepEqual(await formValues(page), ["item-0", "item-29"]);
        await audit(page, `${name} long end`);
        await capture(page, `${name}-long-end`);
        await viewport.evaluate((element) => {
          element.scrollTop = 0;
        });
        const first = group.locator('input[value="item-0"]');
        await first.focus();
        await visibleFocus(first);
        await audit(page, `${name} long start`);
        await capture(page, `${name}-long-start`);
        await last.focus();
        await page.keyboard.press("Escape");
        await focused(summary);
        assert.equal(await details.getAttribute("open"), null);
        assert.equal(
          await page.locator("[data-escape-count]").textContent(),
          "0",
        );
        assert.deepEqual(await formValues(page), ["item-0", "item-29"]);
        await originalBeta.dispose();
        await originalGroup.dispose();
        cases.push({
          width,
          textPercent: scale * 100,
          optionHeight: metrics.height,
          optionScrollHeight: metrics.scrollHeight,
        });
      } catch (error) {
        const page = context.pages()[0];
        if (page) {
          await capture(page, `${name}-failure`);
          process.stderr.write(`Failure screenshot: ${screenshots.at(-1)}\n`);
        }
        throw error;
      } finally {
        await context.close();
      }
    }
  }
  assert.deepEqual(errors, [], "No browser or console errors");
} finally {
  await browser.close();
}
const report = { axeCases, cases, screenshotDirectory, screenshots };
await writeFile(
  join(screenshotDirectory, "results.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);
process.stdout.write(`${JSON.stringify(report)}\n`);
