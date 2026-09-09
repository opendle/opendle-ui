/* global window, document, innerWidth, innerHeight, getComputedStyle, requestAnimationFrame */
import assert from "node:assert/strict";
import console from "node:console";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, URL } from "node:url";
import process from "node:process";
import AxeBuilder from "@axe-core/playwright";
import { chromium, expect } from "@playwright/test";
import { build } from "esbuild";

assert.equal(process.argv.length, 2, "This check accepts no arguments.");
const root = fileURLToPath(new URL("..", import.meta.url));
const directory = await mkdtemp(join(tmpdir(), "opendle-column-headers-"));
const source = String.raw`
import React, {StrictMode, useLayoutEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Button, PageSurface, RelationshipGraph} from '@opendle/ui';
function Fixture() {
  const [options,setOptions]=useState({actions:2,long:false,minimum:false});
  const [clicks,setClicks]=useState(0);
  useLayoutEffect(()=>{window.configure=patch=>setOptions(value=>({...value,...patch}));},[]);
  const labels=options.long ? ['Sources','Records with a long readable column heading','UnbrokenHeadingIdentifierForExternalRecords'] : ['Sources','Canonical models','Targets'];
  const columns=labels.map((label,index)=>({id:String(index),label,countLabel:index===1?'1 models · 12 routes':options.long?'12345678901234567890 records':'1 item',nodes:[{id:'record-'+index,label:'Record '+index}],actions:options.actions ? <span className="fixture-actions">{Array.from({length:options.actions},(_,i)=><Button key={i} variant="secondary" onClick={()=>setClicks(value=>value+1)}>Create {i===0?'record':'record route'} {index}</Button>)}</span>:undefined}));
  return <main aria-label="Column header fixture" className={options.minimum?'fixture-minimum':undefined}>
    <h1 className="od-visually-hidden">Column header fixture</h1>
    <PageSurface edgeToEdge style={{height:'100%'}}>
      <RelationshipGraph aria-label="Records workspace" viewportLabel="Records viewport" columns={columns} relationships={[]} fullPage/>
    </PageSurface><output hidden data-clicks={clicks}/>
  </main>;
}
createRoot(document.getElementById('root')).render(<StrictMode><Fixture/></StrictMode>);
`;
const bundle = await build({
  stdin: { contents: source, loader: "jsx", resolveDir: root },
  bundle: true,
  platform: "browser",
  format: "iife",
  jsx: "automatic",
  write: false,
  logLevel: "silent",
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
const measurements = [];
const errors = [];
async function configure(page, options) {
  await page.evaluate((value) => window.configure(value), options);
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
}
async function measure(page) {
  return page
    .locator(".od-relationship-graph-column-header")
    .evaluateAll((headers) =>
      headers.map((header) => {
        const heading = header.querySelector("h2");
        const box = heading.getBoundingClientRect();
        const style = getComputedStyle(heading);
        const headerStyle = getComputedStyle(header);
        const available =
          header.clientWidth -
          parseFloat(headerStyle.paddingLeft) -
          parseFloat(headerStyle.paddingRight);
        const probe = document.createElement("span");
        probe.style.cssText = `position:fixed;white-space:pre;font:${style.font};letter-spacing:${style.letterSpacing}`;
        header.append(probe);
        const words = heading.textContent.split(/\s+/);
        const wordWidth = Math.max(
          ...words.map((word) => {
            probe.textContent = word;
            return probe.getBoundingClientRect().width;
          }),
        );
        probe.remove();
        const range = document.createRange();
        range.selectNodeContents(heading);
        const lines = new Set([...range.getClientRects()].map((r) => r.top))
          .size;
        return {
          label: heading.textContent,
          width: box.width,
          height: box.height,
          lines,
          available,
          wordWidth,
          columnWidth: header.parentElement.getBoundingClientRect().width,
          headerWidth: header.getBoundingClientRect().width,
          overflow: header.scrollWidth > header.clientWidth,
        };
      }),
    );
}
try {
  for (const [width, height] of [
    [1100, 800],
    [1440, 1000],
    [390, 844],
  ]) {
    for (const scale of [1, 2]) {
      const context = await browser.newContext({
        viewport: { width, height },
        deviceScaleFactor: 1,
      });
      const page = await context.newPage();
      page.on("pageerror", (error) => errors.push(error.message));
      await context.route("**/*", (request) => request.abort());
      await page.setContent(
        `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Column header fixture</title><style>${css}html{font-size:${scale * 100}%}body{margin:0}main{height:100dvh;margin-inline-start:14rem;min-width:0}.fixture-actions{display:flex;flex-wrap:wrap;gap:0.5rem}.fixture-minimum .od-relationship-graph-column{width:13rem}@media(max-width:48rem){main{margin-inline-start:0}}</style></head><body><div id="root"></div></body></html>`,
      );
      await page.addScriptTag({ content: bundle.outputFiles[0].text });
      await page.waitForFunction(() => typeof window.configure === "function");
      for (const variant of [
        { name: "actions", actions: 2, long: false, minimum: false },
        { name: "no-actions", actions: 0, long: true, minimum: false },
        { name: "minimum", actions: 1, long: true, minimum: true },
      ]) {
        await configure(page, variant);
        const viewport = page.getByRole("region", {
          name: "Records viewport",
          exact: true,
        });
        await viewport.evaluate((e) => {
          e.scrollLeft = 0;
          e.scrollTop = 0;
        });
        const name = `${width}-${scale}-${variant.name}`;
        const values = await measure(page);
        measurements.push({ name, values });
        await page.screenshot({ path: join(directory, `${name}.png`) });
        for (const value of values) {
          assert.ok(
            value.width >= Math.min(value.wordWidth, value.available) - 1,
            `${name}: readable heading width: ${JSON.stringify(value)}`,
          );
          assert.equal(
            value.overflow,
            false,
            `${name}: header contents stay inside column`,
          );
          assert.ok(
            Math.abs(value.headerWidth - value.columnWidth) <= 1,
            `${name}: header width follows column`,
          );
          if (variant.minimum)
            assert.ok(
              Math.abs(value.columnWidth - 13 * 16 * scale) <= 1,
              "13rem minimum column fixture",
            );
        }
        await expect(
          page.locator('.od-relationship-graph-node[tabindex="0"]'),
        ).toHaveCount(1);
        for (const heading of await page
          .locator(".od-relationship-graph-column-header h2")
          .all()) {
          await expect(heading).toHaveAccessibleName(
            await heading.textContent(),
          );
          const section = heading.locator("xpath=../..").locator("xpath=..");
          await expect(section).toHaveAccessibleName(
            await heading.textContent(),
          );
        }
        for (const action of await page
          .locator(".od-relationship-graph-column-actions button")
          .all()) {
          await action.scrollIntoViewIfNeeded();
          await action.focus();
          await expect(action).toBeFocused();
          assert.ok(
            await action.evaluate((e) => {
              const b = e.getBoundingClientRect();
              return e.contains(
                document.elementFromPoint(
                  b.left + b.width / 2,
                  b.top + b.height / 2,
                ),
              );
            }),
            "Header action is not covered",
          );
          const before = Number(
            await page
              .locator("output[data-clicks]")
              .getAttribute("data-clicks"),
          );
          await action.click();
          await expect(page.locator("output[data-clicks]")).toHaveAttribute(
            "data-clicks",
            String(before + 1),
          );
        }
        await viewport.evaluate((e) => {
          e.scrollLeft = 0;
          e.scrollTop = 0;
        });
        const overflow = await page.evaluate(() => [
          document.documentElement.scrollWidth > innerWidth,
          document.documentElement.scrollHeight > innerHeight,
        ]);
        assert.deepEqual(overflow, [false, false], "No document overflow");
        assert.deepEqual(
          (await new AxeBuilder({ page }).analyze()).violations,
          [],
          `${name}: strict Axe`,
        );
      }
      await context.close();
    }
  }
  assert.deepEqual(errors, [], "No browser errors");
  console.log(
    `Column header checks passed: ${measurements.length} cases. Evidence: ${directory}`,
  );
} finally {
  await writeFile(
    join(directory, "measurements.json"),
    JSON.stringify(measurements, null, 2),
  );
  await browser.close();
  console.log(`Column header evidence: ${directory}`);
}
