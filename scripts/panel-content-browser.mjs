/* global document, getComputedStyle, innerHeight, innerWidth, requestAnimationFrame, window */
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
  join(tmpdir(), "opendle-panel-content-"),
);
const css = await readFile(
  new URL("../styles/tokens.css", import.meta.url),
  "utf8",
);
const source = String.raw`
import React, {StrictMode, useLayoutEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Panel, PanelContent, PanelHeader} from '@opendle/ui';

const longValue = 'SyntheticUnbrokenIdentifier'.repeat(28);
const image = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="180"><rect width="1200" height="180" fill="#233e50"/><text x="24" y="100" font-size="40" fill="white">Synthetic media preview</text></svg>');
function MixedContent({revision}) {
  return <>
    <p data-revision={revision}>Current revision: {revision}</p>
    <label>Draft<input aria-label="Draft" defaultValue="Initial draft" /></label>
    <button type="button">Apply draft</button>
    <dl>{Array.from({length:8}, (_, i) => <React.Fragment key={i}><dt>Fact {i + 1}</dt><dd>{longValue}</dd></React.Fragment>)}</dl>
    <h3>Error details</h3><p>{('SyntheticErrorWithoutBreaks').repeat(100)}</p>
    <h3>Content</h3><pre>{Array.from({length:60}, (_, i) => 'Synthetic content line ' + i + ': ' + longValue).join('\n')}</pre>
    <h3>Media</h3><img src={image} alt="Synthetic media preview" />
    <button type="button" data-final-action>Inspect media</button>
    <p>End of mixed content</p>
  </>;
}
function Fixture() {
  const [options, setOptions] = useState({mode:'bounded', open:true, revision:0});
  const opener = useRef(null);
  const content = useRef(null);
  useLayoutEffect(() => {
    window.configurePanel = patch => setOptions(value => ({...value, ...patch}));
    window.panelContentRef = content;
    return () => {delete window.configurePanel; delete window.panelContentRef;};
  }, []);
  const close = () => {setOptions(value => ({...value, open:false})); opener.current?.focus();};
  return <main aria-label="Panel fixture">
    <h1 className="od-visually-hidden">Panel content fixture</h1>
    <button ref={opener} onClick={() => setOptions(value => ({...value, open:true}))}>Open details</button>
    {options.open ? <Panel aria-label="Detail panel" onKeyDown={event => {if(event.key === 'Escape') {event.preventDefault(); close();}}}>
      <PanelHeader title={<span id="detail-heading">Details</span>} actions={<button onClick={close}>Close</button>} />
      {options.mode === 'bounded'
        ? <PanelContent aria-labelledby="detail-heading" ref={content} data-content><MixedContent revision={options.revision}/></PanelContent>
        : <div data-content className="fixture-prior-content"><MixedContent revision={options.revision}/></div>}
    </Panel> : null}
    <button type="button">After panel</button>
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
    sourcefile: "panel-content-fixture.jsx",
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
const results = [];
const screenshots = [];

async function settle(page) {
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
}
async function configure(page, patch) {
  await page.evaluate((value) => window.configurePanel(value), patch);
  await settle(page);
}
async function geometry(page) {
  return page.locator("[data-content]").evaluate((element) => ({
    height: element.getBoundingClientRect().height,
    viewportHeight: innerHeight,
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
    scrollTop: element.scrollTop,
    documentOverflow: document.documentElement.scrollWidth > innerWidth,
  }));
}
function assertBounded(metrics) {
  assert.ok(
    metrics.height <= metrics.viewportHeight * 0.65 + 1,
    "Complete mixed panel content must fit its viewport height bound",
  );
  assert.ok(
    metrics.scrollHeight > metrics.clientHeight,
    "Long mixed content scrolls inside the panel content",
  );
}
async function focused(locator) {
  assert.equal(
    await locator.evaluate((element) => element === document.activeElement),
    true,
  );
}

try {
  for (const width of [1440, 390]) {
    for (const scale of [1, 2]) {
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
        await page.setContent(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Panel content check</title><style>${css}
html{font-size:${scale * 100}%}body{margin:0}main{padding:0.5rem}main>button{margin-block:0.25rem}main label{display:block}main input{display:block;max-inline-size:100%;min-inline-size:0}main dd{margin-inline-start:0}main dt{font-weight:700}main img{display:block;max-inline-size:100%;block-size:auto}main pre{white-space:pre-wrap}main h3{margin-block-start:1rem}.fixture-prior-content{overflow-wrap:anywhere}.fixture-prior-content pre{max-block-size:420px;overflow:auto}
</style></head><body><div id="root"></div></body></html>`);
        await page.addScriptTag({ content: bundle.outputFiles[0].text });
        await page.waitForFunction(
          () => typeof window.configurePanel === "function",
        );
        const content = page.getByRole("region", {
          name: "Details",
          exact: true,
        });
        const close = page.getByRole("button", { name: "Close", exact: true });
        const opener = page.getByRole("button", {
          name: "Open details",
          exact: true,
        });
        const input = page.getByRole("textbox", { name: "Draft", exact: true });
        const header = page.locator(".od-panel-header");
        const initial = await geometry(page);
        assertBounded(initial);
        assert.equal(
          initial.documentOverflow,
          false,
          "Long values do not widen the document",
        );
        assert.equal(
          await content.evaluate(
            (element) => element === window.panelContentRef.current,
          ),
          true,
          "The public ref reaches the native content section",
        );
        assert.equal(
          await content.locator(".od-panel-header").count(),
          0,
          "The host header is outside the scroll region",
        );
        for (const locator of [header, close]) {
          assert.equal(
            await locator.evaluate((element) => {
              const box = element.getBoundingClientRect();
              return (
                box.top >= 0 &&
                box.bottom <= innerHeight &&
                box.left >= 0 &&
                box.right <= innerWidth
              );
            }),
            true,
            "Header and Close fit inside the visible viewport",
          );
        }
        await close.click({ trial: true });
        assert.equal(
          await content
            .locator("pre")
            .evaluate(
              (element) =>
                element.scrollHeight <= element.clientHeight &&
                getComputedStyle(element).overflowY === "visible",
            ),
          true,
          "Preformatted content uses the complete body scroll region",
        );

        await opener.focus();
        await page.keyboard.press("Tab");
        await focused(close);
        await page.keyboard.press("Tab");
        await focused(content);
        const focusStyle = await content.evaluate((element) => {
          const style = getComputedStyle(element);
          return {
            width: parseFloat(style.outlineWidth),
            style: style.outlineStyle,
          };
        });
        assert.ok(
          focusStyle.width > 0 && focusStyle.style !== "none",
          "Keyboard entry has a visible focus outline",
        );
        const headerBefore = await header.boundingBox();
        const closeBefore = await close.boundingBox();
        const documentBefore = await page.evaluate(() => window.scrollY);
        await page.keyboard.press("PageDown");
        await page.waitForFunction(
          () => document.querySelector("[data-content]").scrollTop > 0,
        );
        await page.waitForTimeout(180);
        assert.deepEqual(
          await header.boundingBox(),
          headerBefore,
          "Local scrolling keeps the header in place",
        );
        assert.deepEqual(
          await close.boundingBox(),
          closeBefore,
          "Local scrolling keeps Close in place",
        );
        assert.equal(
          await page.evaluate(() => window.scrollY),
          documentBefore,
          "PageDown scrolls the content only",
        );
        await page.keyboard.press("Tab");
        await focused(input);
        await page.keyboard.press("ControlOrMeta+A");
        await page.keyboard.type("Retained keyboard draft");
        const originalInput = await input.elementHandle();
        const originalContent = await content.elementHandle();
        await configure(page, { revision: 1 });
        await focused(input);
        assert.equal(await input.inputValue(), "Retained keyboard draft");
        assert.equal(
          await input.evaluate(
            (element, original) => element === original,
            originalInput,
          ),
          true,
          "A host content update keeps the input DOM node",
        );
        assert.equal(
          await content.evaluate(
            (element, original) => element === original,
            originalContent,
          ),
          true,
          "A host content update keeps the region DOM node",
        );
        await page.keyboard.press("Tab");
        await focused(
          page.getByRole("button", { name: "Apply draft", exact: true }),
        );
        await page.keyboard.press("Tab");
        const finalAction = page.getByRole("button", {
          name: "Inspect media",
          exact: true,
        });
        await focused(finalAction);
        assert.equal(
          await finalAction.evaluate((element) => {
            const box = element.getBoundingClientRect();
            const region = element
              .closest("[data-content]")
              .getBoundingClientRect();
            return box.top >= region.top && box.bottom <= region.bottom;
          }),
          true,
          "Tab reaches the final media action inside the local viewport",
        );
        assert.deepEqual(
          (await new AxeBuilder({ page }).analyze()).violations,
          [],
          `${width}px ${scale * 100}% text at media: strict Axe`,
        );
        const mediaScreenshot = join(
          screenshotDirectory,
          `${width}-${scale * 100}-percent-media.png`,
        );
        await page.screenshot({ path: mediaScreenshot });
        screenshots.push(mediaScreenshot);
        await page.keyboard.press("Tab");
        await focused(
          page.getByRole("button", { name: "After panel", exact: true }),
        );
        await input.focus();
        await page.keyboard.press("Escape");
        assert.equal(
          await content.count(),
          0,
          "Escape reaches the host close handler",
        );
        await focused(opener);
        await opener.click();
        await content.waitFor();
        await close.click();
        assert.equal(await content.count(), 0);
        await focused(opener);
        await opener.click();
        await content.waitFor();
        await opener.focus();
        await page.keyboard.press("Tab");
        await page.keyboard.press("Tab");
        await focused(content);
        await content.evaluate((element) => {
          element.scrollTop = 0;
        });
        await page.evaluate(() => window.scrollTo(0, 0));
        assertBounded(await geometry(page));
        assert.equal((await geometry(page)).documentOverflow, false);
        assert.deepEqual(
          (await new AxeBuilder({ page }).analyze()).violations,
          [],
          `${width}px ${scale * 100}% text: strict Axe`,
        );
        const screenshot = join(
          screenshotDirectory,
          `${width}-${scale * 100}-percent.png`,
        );
        await page.screenshot({ path: screenshot });
        screenshots.push(screenshot);

        await configure(page, { mode: "prior" });
        const prior = await geometry(page);
        assert.throws(
          () => assertBounded(prior),
          /Complete mixed panel content must fit its viewport height bound/,
          "A pre-only bound must fail the complete-body check",
        );
        const normal = await page.locator(".od-panel").evaluate((element) => ({
          maxHeight: getComputedStyle(element).maxHeight,
          height: element.getBoundingClientRect().height,
          contentHeight: element
            .querySelector("[data-content]")
            .getBoundingClientRect().height,
        }));
        assert.equal(
          normal.maxHeight,
          "none",
          "An existing Panel remains unbounded",
        );
        assert.ok(
          normal.height >= normal.contentHeight,
          "An existing Panel grows with its host content",
        );
        results.push({
          width,
          textPercent: scale * 100,
          boundedHeight: initial.height,
          priorHeight: prior.height,
          priorFailure: true,
        });
      } finally {
        await context.close();
      }
    }
  }
  assert.deepEqual(errors, [], "No browser or console errors");
} finally {
  await browser.close();
}
const report = {
  axeCases: results.length * 2,
  cases: results,
  screenshotDirectory,
  screenshots,
};
await writeFile(
  join(screenshotDirectory, "results.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);
process.stdout.write(`${JSON.stringify(report)}\n`);
