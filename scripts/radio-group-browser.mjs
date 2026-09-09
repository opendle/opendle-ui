/* global document, FormData, getComputedStyle, innerHeight, innerWidth, requestAnimationFrame, window */
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
const evidence = await mkdtemp(join(tmpdir(), "opendle-radio-group-"));
const css = await readFile(
  new URL("../styles/tokens.css", import.meta.url),
  "utf8",
);
const fixture = String.raw`
import React, {StrictMode, useLayoutEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ApplicationShell, AdvancedFieldsDisclosure, Button, Icon, MobileNavigation, PageSurface, RadioGroup, SelectControl, TextControl} from '@opendle/ui';
const options = [{value:'',label:'All call actors'}, {value:'service',label:'Service calls'}, {value:'administrator',label:'Administrator playground calls'}];
function Fixture() {
 const [state,setState] = useState({value:'',options,disabled:false,error:null,help:'Choose one call source.', legacy:false, external:false, reflow:true});
 const [other,setOther] = useState('service');
 const [changes,setChanges] = useState([]);
 const groupRef = useRef(null);
 useLayoutEffect(()=>{window.configureRadio = patch => setState(current=>({...current,...patch})); window.radioRef=groupRef; return ()=>{delete window.configureRadio; delete window.radioRef}},[]);
 const changed = value => {setChanges(current=>[...current,value]);setState(current=>({...current,value}))};
 return <ApplicationShell sidebar={<aside className="od-application-sidebar" aria-label="Desktop navigation">Example</aside>} mobileNavigation={<MobileNavigation aria-label="Phone navigation" items={[{id:'home',label:'Application overview',icon:<Icon name="grid"/>},{id:'settings',label:'Settings and account tools',icon:<Icon name="settings"/>}]} onSelect={()=>{}}/>}>
 <PageSurface><h1>Report options</h1><p>Choose the report fields and call source.</p>
 <p id="host-help">This setting applies to the current report.</p>
 <form id="report" aria-label="Report form" onSubmit={event=>event.preventDefault()}>
 <TextControl label="Report title" value="Example report" onChange={()=>{}}/>
 <TextControl label="From" type="date" value="2026-03-01" onChange={()=>{}}/>
 <TextControl label="Through" type="date" value="2026-03-30" onChange={()=>{}}/>
 <SelectControl label="Service" value="" onChange={()=>{}}><option value="">All services</option></SelectControl>
 <TextControl label="Workspace" value="" onChange={()=>{}}/>
 <AdvancedFieldsDisclosure summary={state.value ? "Advanced filters (1 active)" : "Advanced filters"}>
 {!state.reflow && <Button>Before choices</Button>}
 {state.legacy ? <SelectControl label="Call actor" value={state.value} onChange={event=>changed(event.currentTarget.value)}>{state.options.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}</SelectControl> :
 <RadioGroup ref={groupRef} label="Call actor" name="actor" options={state.options} value={state.value} onChange={changed} disabled={state.disabled} error={state.error} help={state.reflow ? undefined : state.help} aria-describedby="host-help" form={state.external?'external-report':undefined}/>}
 <Button>After choices</Button>
 <RadioGroup label="Independent source" options={options} value={other} onChange={setOther}/>
 <RadioGroup label="Another source" options={options} value="service" onChange={()=>{}}/>
 </AdvancedFieldsDisclosure>
 <Button type="submit">Run report</Button>
 </form><form id="external-report" aria-label="External report"/>
 <output aria-label="Changes">{JSON.stringify(changes)}</output>
 </PageSurface></ApplicationShell>;
}
createRoot(document.getElementById('root')).render(<StrictMode><Fixture/></StrictMode>);
`;
const bundle = await build({
  bundle: true,
  format: "iife",
  jsx: "automatic",
  logLevel: "silent",
  stdin: {
    contents: fixture,
    loader: "jsx",
    resolveDir: root,
    sourcefile: "radio-group-fixture.jsx",
  },
  write: false,
});
const browser = await chromium.launch({
  headless: true,
  ...(existsSync("/usr/bin/google-chrome")
    ? { executablePath: "/usr/bin/google-chrome" }
    : {}),
});
const errors = [],
  results = [],
  screenshots = [];
const settle = (page) =>
  page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
async function configure(page, patch) {
  await page.evaluate((patch) => window.configureRadio(patch), patch);
  await settle(page);
}
async function focused(locator) {
  assert.equal(
    await locator.evaluate((node) => node === document.activeElement),
    true,
  );
}
async function focusVisible(page, locator) {
  await settle(page);
  const geometry = await locator.evaluate((node) => {
    const box = node.getBoundingClientRect(),
      style = getComputedStyle(node),
      nav = document
        .querySelector(".od-application-mobile-navigation")
        .getBoundingClientRect();
    const bounds = node
      .closest(".od-radio-group-options")
      .getBoundingClientRect();
    const row = node.closest("label").getBoundingClientRect();
    const extent =
      parseFloat(style.outlineWidth) + parseFloat(style.outlineOffset);
    return {
      row: { top: row.top, bottom: row.bottom, height: row.height },
      visible:
        node === document.activeElement &&
        node.matches(":focus-visible") &&
        parseFloat(style.outlineWidth) > 0 &&
        style.outlineStyle !== "none",
      top: box.top - extent,
      bottom: box.bottom + extent,
      left: box.left - extent,
      right: box.right + extent,
      navTop: nav.height ? nav.top : innerHeight,
      bounds: {
        top: bounds.top,
        bottom: bounds.bottom,
        left: bounds.left,
        right: bounds.right,
      },
    };
  });
  assert.equal(geometry.visible, true, JSON.stringify(geometry));
  assert.ok(
    geometry.top >= 0 && geometry.bottom <= geometry.navTop,
    `Focus is above measured phone navigation: ${JSON.stringify(geometry)}`,
  );
  if (
    geometry.row.height <=
    Math.min(geometry.navTop, geometry.bounds.bottom - geometry.bounds.top) - 12
  )
    assert.ok(
      geometry.row.top >= Math.max(0, geometry.bounds.top) &&
        geometry.row.bottom <=
          Math.min(geometry.navTop, geometry.bounds.bottom),
      `The complete focused label is visible: ${JSON.stringify(geometry)}`,
    );
  assert.ok(
    geometry.left >= geometry.bounds.left &&
      geometry.right <= geometry.bounds.right &&
      geometry.top >= geometry.bounds.top &&
      geometry.bottom <= geometry.bounds.bottom,
    `The local viewport contains the focus outline: ${JSON.stringify(geometry)}`,
  );
}
async function labelsReadable(group) {
  const measurements = await group
    .locator(".od-radio-group-choice-label")
    .evaluateAll((nodes) =>
      nodes.map((node) => {
        const box = node.getBoundingClientRect(),
          row = node.parentElement.getBoundingClientRect();
        const range = document.createRange();
        range.selectNodeContents(node);
        const lines = [...range.getClientRects()];
        const canvas = document.createElement("canvas"),
          context = canvas.getContext("2d");
        context.font = getComputedStyle(node).font;
        const fragmentedWords = [...node.textContent.matchAll(/\S+/g)]
          .filter((match) => {
            if (context.measureText(match[0]).width > box.width) return false;
            const wordRange = document.createRange();
            wordRange.setStart(node.firstChild, match.index);
            wordRange.setEnd(node.firstChild, match.index + match[0].length);
            return wordRange.getClientRects().length > 1;
          })
          .map((match) => match[0]);
        return {
          text: node.textContent,
          fragmentedWords,
          width: box.width,
          wrap: getComputedStyle(node).whiteSpace,
          contained: lines.every(
            (line) =>
              line.left >= box.left - 1 &&
              line.right <= box.right + 1 &&
              line.top >= box.top - 1 &&
              line.bottom <= box.bottom + 1 &&
              line.right <= row.right &&
              line.left >= row.left,
          ),
          lines: lines.length,
          overflow:
            node.scrollWidth > node.clientWidth + 1 ||
            node.scrollHeight > node.clientHeight + 1,
        };
      }),
    );
  assert.ok(measurements.length > 0);
  for (const item of measurements)
    assert.ok(
      item.contained && !item.overflow && item.fragmentedWords.length === 0,
      `Complete label must fit: ${JSON.stringify(item)}`,
    );
  return measurements;
}
async function audit(page, scene) {
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
    scene,
  );
  assert.deepEqual(
    (await new AxeBuilder({ page }).analyze()).violations,
    [],
    scene,
  );
}
async function capture(page, name) {
  const path = join(evidence, `${name}.png`);
  await page.screenshot({ path });
  screenshots.push(path);
}
async function formValues(page, id = "report") {
  return page.evaluate(
    (id) => new FormData(document.getElementById(id)).getAll("actor"),
    id,
  );
}
try {
  for (const width of [320, 390, 1100, 1440])
    for (const scale of [1, 2]) {
      const scene = `${width}-${scale * 100}`;
      const context = await browser.newContext({
        viewport: {
          width,
          height: width === 1440 ? 1000 : width === 1100 ? 800 : 844,
        },
        deviceScaleFactor: 1,
      });
      try {
        const page = await context.newPage();
        page.on("pageerror", (error) => errors.push(error.message));
        page.on("console", (message) => {
          if (message.type() === "error") errors.push(message.text());
        });
        await page.setContent(
          `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Radio group check</title><style>${css}\nhtml{font-size:${scale * 100}%}body{margin:0}h1{font-size:1.5rem}form{display:grid;gap:1rem}output{overflow-wrap:anywhere}</style></head><body><div id="root"></div></body></html>`,
        );
        await page.addScriptTag({ content: bundle.outputFiles[0].text });
        await page.waitForFunction(
          () => typeof window.configureRadio === "function",
        );
        const group = page.getByRole("group", {
          name: "Call actor",
          exact: true,
        });
        const first = () => group.locator("input").nth(0),
          second = () => group.locator("input").nth(1),
          last = () => group.locator("input").nth(2);
        const before = page.getByRole("button", {
            name: "Before choices",
            exact: true,
          }),
          after = page.getByRole("button", {
            name: "After choices",
            exact: true,
          });
        assert.equal(
          await first().isVisible(),
          false,
          "The host disclosure starts closed",
        );
        await audit(page, `${scene} closed`);
        await page.locator("summary").click();
        const labels = await labelsReadable(group);
        assert.deepEqual(
          labels.map((item) => item.text),
          [
            "All call actors",
            "Service calls",
            "Administrator playground calls",
          ],
        );
        for (const label of labels)
          assert.equal(
            await group
              .getByRole("radio", { name: label.text, exact: true })
              .count(),
            1,
            "Each radio has its full visible accessible name",
          );
        if (scale === 2 && width < 1000)
          assert.ok(labels[2].lines > 1, "The complete long label wraps");
        if (scale === 2)
          assert.ok(
            labels[2].width >= 180,
            "Narrow choices give labels enough width for complete accepted words",
          );
        assert.equal(
          await group.evaluate((node) => node === window.radioRef.current),
          true,
        );
        assert.equal(
          await group
            .locator(".od-radio-group-options")
            .evaluate((node) => node.scrollHeight <= node.clientHeight + 1),
          true,
          "Three choices have no local clipping or scroll",
        );
        await page.getByLabel("Report title", { exact: true }).focus();
        let reachedFirst = false;
        for (let step = 0; step < 16; step++) {
          await page.keyboard.press("Tab");
          await settle(page);
          if (
            await first().evaluate((node) => node === document.activeElement)
          ) {
            reachedFirst = true;
            break;
          }
        }
        assert.equal(
          reachedFirst,
          true,
          "Native Tab reaches the first radio from the report start",
        );
        await focused(first());
        await focusVisible(page, first());
        const summaryHeight = await page
          .locator("summary")
          .evaluate((node) => node.getBoundingClientRect().height);
        await page.keyboard.press("ArrowDown");
        await focused(second());
        await settle(page);
        const countedSummaryHeight = await page
          .locator("summary")
          .evaluate((node) => node.getBoundingClientRect().height);
        assert.equal(
          await page.locator("summary").textContent(),
          "Advanced filters (1 active)",
        );
        if (width < 1000 && scale === 2)
          assert.ok(
            countedSummaryHeight > summaryHeight,
            "The active-count summary must wrap after native selection",
          );
        await capture(page, `${scene}-active-count-reflow`);
        results.push({
          scene: `${scene}-active-count-reflow`,
          summaryHeight,
          countedSummaryHeight,
        });
        assert.equal(await second().isChecked(), true);
        await focusVisible(page, second());
        await page.keyboard.press("ArrowRight");
        await focused(last());
        assert.equal(await last().isChecked(), true);
        await focusVisible(page, last());
        await capture(page, `${scene}-selected`);
        await audit(page, `${scene} selected`);
        assert.equal(
          await page.getByRole("status", { name: "Changes" }).textContent(),
          '["service","administrator"]',
        );
        await configure(page, { reflow: false });
        await page.keyboard.press("Tab");
        await focused(after);
        await page.keyboard.press("Shift+Tab");
        await focused(last());
        await focusVisible(page, last());
        await page.keyboard.press("ArrowLeft");
        await focused(second());
        await page.keyboard.press("ArrowUp");
        await focused(first());
        await page.keyboard.press("ArrowUp");
        await focused(last());
        await page.keyboard.press("Tab");
        await page.keyboard.press("Tab");
        const independent = page.getByRole("group", {
          name: "Independent source",
          exact: true,
        });
        await focused(independent.locator("input").nth(1));
        await page.keyboard.press("ArrowRight");
        assert.equal(await last().isChecked(), true);
        assert.equal(
          await page
            .getByRole("group", { name: "Another source", exact: true })
            .locator("input")
            .nth(1)
            .isChecked(),
          true,
          "Automatic native names isolate groups",
        );
        await configure(page, { value: "missing" });
        await first().focus();
        await page.keyboard.press("Space");
        assert.equal(await first().isChecked(), true);
        await group.locator("label").nth(2).click();
        assert.equal(
          await last().isChecked(),
          true,
          "A full label click selects",
        );
        assert.deepEqual(await formValues(page), ["administrator"]);
        const original = await last().elementHandle(),
          originalId = await last().getAttribute("id");
        await configure(page, {
          value: "service",
          options: [
            { value: "administrator", label: "Administrator playground calls" },
            { value: "", label: "All call actors" },
            { value: "service", label: "Service calls", disabled: true },
          ],
        });
        assert.equal(
          await first().evaluate(
            (node, original) => node === original,
            original,
          ),
          true,
          "Reordering preserves the input node",
        );
        assert.equal(await first().getAttribute("id"), originalId);
        await first().focus();
        await page.keyboard.press("ArrowUp");
        await focused(second());
        assert.equal(
          await second().isChecked(),
          true,
          "Arrows skip a disabled option",
        );
        await configure(page, { disabled: true });
        for (const input of await group.locator("input").all())
          assert.equal(await input.isDisabled(), true);
        await before.focus();
        await page.keyboard.press("Tab");
        await focused(after);
        assert.deepEqual(await formValues(page), []);
        await audit(page, `${scene} disabled`);
        await configure(page, {
          disabled: false,
          error: "Select a valid call source.",
          help: "Choose one available source.",
          external: true,
        });
        assert.deepEqual(await formValues(page), []);
        assert.deepEqual(await formValues(page, "external-report"), [""]);
        assert.equal(await group.getAttribute("aria-invalid"), "true");
        for (const input of [group, ...(await group.locator("input").all())]) {
          const descriptions = await input.evaluate((node) =>
            node
              .getAttribute("aria-describedby")
              .split(" ")
              .map((id) => document.getElementById(id)?.textContent),
          );
          assert.deepEqual(descriptions, [
            "This setting applies to the current report.",
            "Choose one available source.",
            "Select a valid call source.",
          ]);
        }
        await audit(page, `${scene} error`);
        const longOptions = Array.from({ length: 3 }, (_, index) => ({
          value: String(index),
          label: `Choice ${index + 1} with a complete long synthetic label and an unbrokenvalue012345678901234567890123456789`,
        }));
        await configure(page, {
          options: longOptions,
          value: "0",
          error: null,
          external: false,
        });
        await labelsReadable(group);
        await before.focus();
        await page.keyboard.press("Tab");
        await focusVisible(page, first());
        await capture(page, `${scene}-long-labels`);
        const clipped = await page.addStyleTag({
          content:
            ".od-radio-group-choice-label{max-width:8rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
        });
        await assert.rejects(
          () => labelsReadable(group),
          /Complete label must fit/,
          "The readability check rejects clipped text",
        );
        await clipped.evaluate((node) => node.remove());
        await configure(page, {
          options: Array.from({ length: 20 }, (_, index) => ({
            value: String(index),
            label: `Choice ${index + 1} with a complete descriptive label`,
          })),
          value: "0",
        });
        const list = group.locator(".od-radio-group-options");
        assert.equal(
          await list.evaluate((node) => node.scrollHeight > node.clientHeight),
          true,
          "Long lists scroll locally",
        );
        await before.focus();
        await page.keyboard.press("Tab");
        for (let index = 0; index < 20; index++) {
          await focusVisible(page, group.locator("input").nth(index));
          if (index < 19) await page.keyboard.press("ArrowDown");
        }
        assert.equal(await group.locator("input").last().isChecked(), true);
        assert.ok((await list.evaluate((node) => node.scrollTop)) > 0);
        await capture(page, `${scene}-long-list`);
        await audit(page, `${scene} long list`);
        for (let index = 18; index >= 0; index--) {
          await page.keyboard.press("ArrowUp");
          await focusVisible(page, group.locator("input").nth(index));
        }
        await labelsReadable(group);
        results.push({
          scene,
          labels,
          keyboard: true,
          focus: true,
          strictAxe: true,
          longList: true,
          negativeClippingCheck: true,
        });
      } finally {
        await context.close();
      }
    }
  const boundedFixture = fixture
    .replace(
      /<TextControl label="Report title"[\s\S]*?(?=<AdvancedFieldsDisclosure)/,
      '<div className="fixture-bounded-disclosure">',
    )
    .replace("</AdvancedFieldsDisclosure>", "</AdvancedFieldsDisclosure></div>")
    .replace(
      "setState(current=>({...current,value}))",
      "setState(current=>({...current,value:current.reject?current.value:value}))",
    );
  const boundedBundle = await build({
    bundle: true,
    format: "iife",
    jsx: "automatic",
    logLevel: "silent",
    stdin: {
      contents: boundedFixture,
      loader: "jsx",
      resolveDir: root,
      sourcefile: "bounded-radio-fixture.jsx",
    },
    write: false,
  });
  for (const width of [1100, 1440]) {
    const context = await browser.newContext({
      viewport: { width, height: width === 1100 ? 800 : 1000 },
      deviceScaleFactor: 1,
    });
    try {
      const page = await context.newPage();
      page.on("pageerror", (error) => errors.push(error.message));
      await page.setContent(
        `<!doctype html><html lang="en"><head><title>Bounded radio focus</title><style>${css}\nhtml{font-size:200%}h1{font-size:1.5rem}form{display:grid;gap:1rem}.fixture-bounded-disclosure{height:400px;width:256px;overflow:auto}</style></head><body><div id="root"></div></body></html>`,
      );
      await page.addScriptTag({ content: boundedBundle.outputFiles[0].text });
      await page.waitForFunction(
        () => typeof window.configureRadio === "function",
      );
      await page.locator("summary").click();
      const group = page.getByRole("group", {
        name: "Call actor",
        exact: true,
      });
      const first = group.locator("input").first();
      await first.focus();
      await settle(page);
      const documentScroll = await page.evaluate(() => window.scrollY);
      for (const reject of [false, true]) {
        await configure(page, { value: "", reject });
        await first.focus();
        for (const key of ["ArrowDown", "ArrowDown", "ArrowUp", "ArrowUp"]) {
          await page.keyboard.press(key);
          const active = group.locator("input:focus");
          await focusVisible(page, active);
          const geometry = await active.evaluate((node) => {
            const row = node.closest("label").getBoundingClientRect();
            const local = node
              .closest(".fixture-bounded-disclosure")
              .getBoundingClientRect();
            return {
              top: row.top,
              bottom: row.bottom,
              localTop: local.top,
              localBottom: local.bottom,
            };
          });
          assert.ok(
            geometry.top >= geometry.localTop &&
              geometry.bottom <= geometry.localBottom,
            `Complete row after bounded summary reflow: ${JSON.stringify(geometry)}`,
          );
          assert.equal(
            await page.evaluate(() => window.scrollY),
            documentScroll,
          );
          if (reject) assert.equal(await first.isChecked(), true);
        }
        await audit(page, `bounded-${width}-${reject}`);
        await capture(page, `bounded-${width}-${reject}`);
      }
      await page
        .getByRole("button", { name: "After choices", exact: true })
        .focus();
      await page.keyboard.press("Shift+Tab");
      await focusVisible(page, first);
      results.push({
        scene: `bounded-${width}`,
        accepted: true,
        rejected: true,
        reverseTab: true,
        documentScroll,
        strictAxe: true,
      });
    } finally {
      await context.close();
    }
  }
  assert.deepEqual(errors, []);
  await writeFile(
    join(evidence, "results.json"),
    JSON.stringify({ results, screenshots }, null, 2) + "\n",
  );
  console.log(
    JSON.stringify({ passed: true, evidence, results, screenshots }, null, 2),
  );
} finally {
  await browser.close();
}
