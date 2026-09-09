/* global document, getComputedStyle, innerHeight, innerWidth, MutationObserver, requestAnimationFrame, window */
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
  join(tmpdir(), "opendle-inspector-facts-"),
);
const css = await readFile(
  new URL("../styles/tokens.css", import.meta.url),
  "utf8",
);
const source = String.raw`
import React, {StrictMode, useLayoutEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {GraphInspector, GraphInspectorFact, GraphInspectorFacts, GraphNode, GraphViewport, GraphWorkspace} from '@opendle/ui';

const longValue = 'workspaceCredentialProviderIdentifierWithoutBreakOpportunity'.repeat(3);
const localizedLabel = 'Authentifizierungsberechtigungsnachweiskennzeichnung';

function Fixture() {
  const [options, setOptions] = useState({
    mounted: true,
    hostWidth: 1200,
    factsWidth: 18,
    labelKind: 'plain',
    labelText: 'Name',
    labelScale: 1,
    labelFamily: 'Arial',
    valueLong: false,
    extreme: false,
  });
  useLayoutEffect(() => {
    window.configureFacts = patch => setOptions(value => ({...value, ...patch}));
    return () => { delete window.configureFacts; };
  }, []);
  const label = options.labelKind === 'localized'
    ? localizedLabel
    : options.labelKind === 'mixed'
      ? <><span className="fixture-label-mark" aria-hidden="true">◆</span><span>Credential</span></>
      : options.labelText;
  if (!options.mounted)
    return <main aria-label="Inspector facts fixture"><h1>Inspector facts fixture</h1></main>;
  const inspector = <GraphInspector title="Record details" onClose={() => undefined}>
    <GraphInspectorFacts data-group="short">
      <GraphInspectorFact data-fact="name" label="Name" value="Alpha" />
      <GraphInspectorFact data-fact="wrapped" label="Current route type" value="Active" />
    </GraphInspectorFacts>
    <GraphInspectorFacts
      data-group="adaptive"
      style={{fontFamily: options.labelFamily, fontSize: options.labelScale + 'rem', inlineSize: options.factsWidth + 'rem', maxInlineSize: '100%'}}
    >
      <GraphInspectorFact
        data-fact="adaptive"
        label={label}
        value={options.valueLong ? longValue : 'OK'}
      />
    </GraphInspectorFacts>
    <GraphInspectorFacts data-group="narrow" style={{inlineSize: '90px'}}>
      <GraphInspectorFact data-fact="narrow" label="ID" value="" />
    </GraphInspectorFacts>
    <GraphInspectorFacts data-group="retained" style={{inlineSize: options.factsWidth + 'rem', maxInlineSize: '100%'}}>
      <GraphInspectorFact
        data-fact="retained"
        label="Draft"
        value={<input aria-label="Retained fact value" className="fixture-input" defaultValue="Saved draft" />}
      />
    </GraphInspectorFacts>
    {options.extreme ? <GraphInspectorFacts data-group="extreme">
      {Array.from({length: 16}, (_, index) => <GraphInspectorFact
        key={index}
        data-fact={'extreme-' + index}
        label={'ExtremelyLongUnbrokenLocalizedInspectorLabel' + index + localizedLabel}
        value={'Value ' + index}
      />)}
    </GraphInspectorFacts> : null}
  </GraphInspector>;
  return <main aria-label="Inspector facts fixture">
    <h1 className="od-visually-hidden">Inspector facts fixture</h1>
    <GraphWorkspace
      aria-label="Inspector facts workspace"
      fullPage
      inspector={inspector}
      style={{height: '100dvh', width: options.hostWidth + 'px'}}
    >
      <GraphViewport aria-label="Inspector facts graph" canvasWidth={240} canvasHeight={180}>
        <GraphNode title="Fixture record" x={20} y={20} />
      </GraphViewport>
    </GraphWorkspace>
  </main>;
}

const fixtureRoot = createRoot(document.getElementById('root'));
window.unmountFactsFixture = () => fixtureRoot.unmount();
fixtureRoot.render(<StrictMode><Fixture /></StrictMode>);
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
    sourcefile: "graph-inspector-facts-fixture.jsx",
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
        requestAnimationFrame(() =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        ),
      ),
  );
}

async function configure(page, patch) {
  await page.evaluate((value) => window.configureFacts(value), patch);
  await settle(page);
}

async function groupMetrics(page, groupName) {
  return page.locator(`[data-group="${groupName}"]`).evaluate((facts) => {
    const naturalWidth = (element, size) => {
      const copy = element.cloneNode(true);
      const style = getComputedStyle(element);
      copy.style.cssText = [
        "position:fixed",
        "inset:auto auto 0 0",
        "display:block",
        `inline-size:${size}`,
        `width:${size}`,
        "max-inline-size:none",
        "max-width:none",
        "overflow-wrap:normal",
        "white-space:normal",
        "visibility:hidden",
        `font:${style.font}`,
        `font-kerning:${style.fontKerning}`,
        `letter-spacing:${style.letterSpacing}`,
        `text-transform:${style.textTransform}`,
      ].join(";");
      document.body.append(copy);
      const width = copy.getBoundingClientRect().width;
      copy.remove();
      return width;
    };
    const box = (element) => {
      const value = element.getBoundingClientRect();
      return {
        bottom: value.bottom,
        height: value.height,
        left: value.left,
        right: value.right,
        top: value.top,
        width: value.width,
      };
    };
    return {
      box: box(facts),
      rows: [
        ...facts.querySelectorAll(":scope > .od-graph-inspector-fact"),
      ].map((row) => {
        const term = row.querySelector(":scope > dt");
        const description = row.querySelector(":scope > dd");
        const style = getComputedStyle(row);
        const rowBox = box(row);
        const termBox = box(term);
        const descriptionBox = box(description);
        const range = document.createRange();
        range.selectNodeContents(term);
        const termLines = new Set(
          [...range.getClientRects()].map(
            (line) => Math.round(line.top * 2) / 2,
          ),
        ).size;
        return {
          id: row.dataset.fact,
          columns: style.gridTemplateColumns
            .split(/\s+/u)
            .map(Number.parseFloat),
          gap: Number.parseFloat(style.columnGap),
          padding: [
            Number.parseFloat(style.paddingTop),
            Number.parseFloat(style.paddingRight),
            Number.parseFloat(style.paddingBottom),
            Number.parseFloat(style.paddingLeft),
          ],
          row: rowBox,
          term: termBox,
          description: descriptionBox,
          termLines,
          termMin: naturalWidth(term, "min-content"),
          termMax: naturalWidth(term, "max-content"),
          descriptionMin: naturalWidth(description, "min-content"),
          contained:
            termBox.left >= rowBox.left - 0.5 &&
            termBox.right <= rowBox.right + 0.5 &&
            descriptionBox.left >= rowBox.left - 0.5 &&
            descriptionBox.right <= rowBox.right + 0.5,
          overflow:
            row.scrollWidth > row.clientWidth ||
            term.scrollWidth > term.clientWidth ||
            description.scrollWidth > description.clientWidth,
        };
      }),
    };
  });
}

function oneColumn(row, message) {
  assert.equal(row.columns.length, 1, `${message}: ${JSON.stringify(row)}`);
}

function twoColumns(row, message) {
  assert.equal(row.columns.length, 2, `${message}: ${JSON.stringify(row)}`);
}

function near(actual, expected, message) {
  assert.ok(
    Math.abs(actual - expected) <= 1,
    `${message}: ${String(actual)} != ${String(expected)}`,
  );
}

try {
  const cases = [
    { mode: "split", scale: 1, width: 1440, hostWidth: 1200, height: 850 },
    { mode: "overlay", scale: 1, width: 1000, hostWidth: 1000, height: 800 },
    { mode: "sheet", scale: 1, width: 390, hostWidth: 390, height: 844 },
    { mode: "split", scale: 2, width: 2300, hostWidth: 2300, height: 1000 },
    { mode: "overlay", scale: 2, width: 1800, hostWidth: 1800, height: 1000 },
    { mode: "sheet", scale: 2, width: 1200, hostWidth: 1200, height: 1000 },
    {
      mode: "sheet",
      scale: 2,
      width: 412,
      hostWidth: 412,
      height: 1000,
      phone: true,
    },
  ];
  for (const item of cases) {
    const context = await browser.newContext({
      deviceScaleFactor: 1,
      viewport: { width: item.width, height: item.height },
    });
    const page = await context.newPage();
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    await page.setContent(
      `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Inspector facts fit</title><style>${css}html{font-size:${String(item.scale * 100)}%}body{margin:0}.fixture-input{box-sizing:border-box;inline-size:3rem;min-inline-size:0!important;min-width:0!important}.fixture-label-mark{margin-inline-end:0.2em}#root,main{min-height:100dvh}</style></head><body><div id="root"></div></body></html>`,
    );
    await page.evaluate(() => {
      const NativeResizeObserver = window.ResizeObserver;
      const statistics = {
        activeFacts: 0,
        callbacks: 0,
        measuringMutations: 0,
      };
      window.__factsObserverStatistics = statistics;
      window.ResizeObserver = class extends NativeResizeObserver {
        constructor(callback) {
          let instance;
          super((entries, observer) => {
            if (instance?.tracksFacts) statistics.callbacks += 1;
            callback(entries, observer);
          });
          instance = this;
          this.tracksFacts = false;
          this.disconnected = false;
        }
        observe(target, options) {
          if (
            !this.tracksFacts &&
            target.matches?.(".od-graph-inspector-facts")
          ) {
            this.tracksFacts = true;
            statistics.activeFacts += 1;
          }
          return super.observe(target, options);
        }
        disconnect() {
          if (this.tracksFacts && !this.disconnected)
            statistics.activeFacts -= 1;
          this.disconnected = true;
          return super.disconnect();
        }
      };
      new MutationObserver((records) => {
        statistics.measuringMutations += records.filter(
          (record) => record.attributeName === "data-measuring-fit",
        ).length;
      }).observe(document.documentElement, { attributes: true, subtree: true });
    });
    await page.addScriptTag({ content: bundle.outputFiles[0].text });
    await page.waitForFunction(
      () => typeof window.configureFacts === "function",
    );
    await configure(page, {
      hostWidth: item.hostWidth,
      mounted: true,
      factsWidth: 18,
      labelKind: "plain",
      labelText: "Name",
      labelScale: 1,
      labelFamily: "Arial",
      valueLong: false,
      extreme: false,
    });
    const inspector = page.getByRole("dialog", { name: "Record details" });
    await page.waitForFunction(
      (mode) =>
        document.querySelector(".od-graph-inspector")?.dataset.mode === mode,
      item.mode,
    );

    const rem = 16 * item.scale;
    const short = await groupMetrics(page, "short");
    for (const row of short.rows) {
      if (!item.phone) {
        twoColumns(row, `${item.mode} ${item.scale} short labels use columns`);
        near(row.columns[0], 5 * rem, "Short label track is exactly 5rem");
      } else {
        assert.ok(
          row.columns.length === 1 || row.columns.length === 2,
          "Phone facts resolve to one or two actual grid tracks",
        );
        if (row.columns.length === 2)
          near(row.columns[0], 5 * rem, "Phone label track is exactly 5rem");
      }
      near(row.gap, 0.5 * rem, "Fact column gap is 0.5rem");
      assert.deepEqual(
        row.padding,
        [0.5 * rem, 0.625 * rem, 0.5 * rem, 0.625 * rem],
        "Fact padding keeps the compact shared inset",
      );
      assert.equal(row.contained, true, "Short fact cells stay in their row");
    }
    const wrapped = short.rows.find((row) => row.id === "wrapped");
    assert.ok(
      wrapped.termMax > 5 * rem,
      "Multiword label exceeds 5rem as one line",
    );
    assert.ok(
      wrapped.termMin <= 5 * rem,
      "Each normal word fits the 5rem track",
    );
    if (!item.phone)
      assert.ok(
        wrapped.termLines > 1,
        "Normal spaces wrap the label compactly",
      );

    const narrow = (await groupMetrics(page, "narrow")).rows[0];
    oneColumn(narrow, "A 90px group stacks before fixed tracks overflow");
    assert.equal(
      narrow.overflow,
      false,
      "The narrow empty-value fact does not overflow",
    );

    await configure(page, {
      labelKind: "plain",
      labelText: "Endpoint",
      labelScale: 1.25,
      valueLong: false,
    });
    let adaptive = (await groupMetrics(page, "adaptive")).rows[0];
    assert.ok(
      adaptive.termMin > 5 * rem,
      "Endpoint is wider than 5rem at 1.25rem text",
    );
    assert.ok(
      adaptive.termMin <=
        adaptive.row.width - adaptive.padding[1] - adaptive.padding[3],
      "Endpoint fits the one-column content width",
    );
    oneColumn(adaptive, "Endpoint selects one column from its actual text fit");
    assert.equal(
      adaptive.termLines,
      1,
      "Endpoint does not break inside the word",
    );

    await configure(page, { labelText: "Credential" });
    adaptive = (await groupMetrics(page, "adaptive")).rows[0];
    assert.ok(adaptive.termMin > 5 * rem, "Credential is wider than 5rem");
    oneColumn(adaptive, "Credential selects one column");
    assert.equal(
      adaptive.termLines,
      1,
      "Credential does not break inside the word",
    );

    for (const labelKind of ["localized", "mixed"]) {
      await configure(page, { labelKind, labelScale: 1.25 });
      adaptive = (await groupMetrics(page, "adaptive")).rows[0];
      assert.ok(adaptive.termMin > 5 * rem, `${labelKind} label exceeds 5rem`);
      oneColumn(adaptive, `${labelKind} React label selects one column`);
      assert.equal(
        adaptive.contained,
        true,
        `${labelKind} label stays in its row`,
      );
    }

    await configure(page, {
      labelKind: "plain",
      labelText: "Name",
      labelScale: 1,
      valueLong: false,
    });
    adaptive = (await groupMetrics(page, "adaptive")).rows[0];
    twoColumns(
      adaptive,
      "Short content returns to columns after text and font changes",
    );
    const valueTrack = adaptive.columns[1];
    await configure(page, { valueLong: true });
    adaptive = (await groupMetrics(page, "adaptive")).rows[0];
    assert.ok(
      adaptive.descriptionMin > valueTrack,
      "Long value exceeds its natural value track",
    );
    oneColumn(adaptive, "Long unbroken value selects one column");

    await configure(page, { valueLong: false, factsWidth: 8 });
    adaptive = (await groupMetrics(page, "adaptive")).rows[0];
    oneColumn(adaptive, "Facts width changes independently from the viewport");
    near(adaptive.row.width, 8 * rem, "Narrow facts width is 8rem");
    assert.deepEqual(
      await page.evaluate(() => [innerWidth, innerHeight]),
      [item.width, item.height],
      "Facts resizing does not resize the browser viewport",
    );
    await configure(page, { factsWidth: 18 });
    twoColumns(
      (await groupMetrics(page, "adaptive")).rows[0],
      "Facts return to columns after their width returns",
    );

    await configure(page, { labelScale: 2, labelText: "Endpoint" });
    oneColumn(
      (await groupMetrics(page, "adaptive")).rows[0],
      "A live font-size change selects one column",
    );
    await configure(page, { labelScale: 1, labelText: "Name" });
    twoColumns(
      (await groupMetrics(page, "adaptive")).rows[0],
      "A reverted font-size and label restore columns",
    );
    await configure(page, {
      labelFamily: "Arial",
      labelScale: 1,
      labelText: "Credential",
    });
    adaptive = (await groupMetrics(page, "adaptive")).rows[0];
    assert.ok(
      adaptive.termMin <= 5 * rem,
      "Arial Credential fits the 5rem track",
    );
    twoColumns(adaptive, "Arial Credential uses columns");
    await configure(page, { labelFamily: "monospace" });
    adaptive = (await groupMetrics(page, "adaptive")).rows[0];
    assert.ok(
      adaptive.termMin > 5 * rem,
      "Monospace Credential exceeds the 5rem track",
    );
    oneColumn(adaptive, "A same-label font-family change selects one column");
    await configure(page, { labelFamily: "Arial" });
    twoColumns(
      (adaptive = (await groupMetrics(page, "adaptive")).rows[0]),
      "The reverted font family restores columns",
    );
    const independentShort = (await groupMetrics(page, "short")).rows;
    assert.equal(
      independentShort.every((row) =>
        item.phone ? row.contained && !row.overflow : row.columns.length === 2,
      ),
      true,
      "Independent short group keeps its own valid layout",
    );
    oneColumn(
      (await groupMetrics(page, "narrow")).rows[0],
      "Independent narrow group remains stacked",
    );

    const input = page.getByLabel("Retained fact value");
    const retainedTerm = page.locator('[data-fact="retained"] > dt');
    const retainedDescription = page.locator('[data-fact="retained"] > dd');
    twoColumns(
      (await groupMetrics(page, "retained")).rows[0],
      "Retained input starts in columns",
    );
    await input.fill("Unsaved retained value");
    await input.focus();
    const originalInput = await input.elementHandle();
    const originalTerm = await retainedTerm.elementHandle();
    const originalDescription = await retainedDescription.elementHandle();
    await configure(page, {
      factsWidth: 8,
      labelKind: "localized",
      labelScale: 1.25,
    });
    assert.equal(
      await input.evaluate(
        (element, original) => element === original,
        originalInput,
      ),
      true,
      "Fact layout changes keep the input DOM node",
    );
    assert.equal(await input.inputValue(), "Unsaved retained value");
    assert.equal(
      await input.evaluate((element) => element === document.activeElement),
      true,
    );
    oneColumn(
      (await groupMetrics(page, "retained")).rows[0],
      "The focused input group changes to one column",
    );
    assert.equal(
      await retainedTerm.evaluate(
        (element, original) => element === original,
        originalTerm,
      ),
      true,
      "Fact layout changes keep the term DOM node",
    );
    assert.equal(
      await retainedDescription.evaluate(
        (element, original) => element === original,
        originalDescription,
      ),
      true,
      "Fact layout changes keep the description DOM node",
    );
    await configure(page, {
      factsWidth: 18,
      labelKind: "plain",
      labelText: "Name",
      labelScale: 1,
    });
    assert.equal(await input.inputValue(), "Unsaved retained value");
    assert.equal(
      await input.evaluate((element) => element === document.activeElement),
      true,
    );
    twoColumns(
      (await groupMetrics(page, "retained")).rows[0],
      "The focused input group returns to columns",
    );

    await configure(page, { extreme: true });
    const extreme = await groupMetrics(page, "extreme");
    assert.ok(extreme.rows.length === 16, "Extreme localized facts render");
    assert.equal(
      extreme.rows.every(
        (row) => row.columns.length === 1 && row.contained && !row.overflow,
      ),
      true,
      "Extreme labels break safely inside one-column rows",
    );
    assert.equal(
      await inspector
        .locator(".od-graph-inspector-content")
        .evaluate((content) => content.scrollHeight > content.clientHeight),
      true,
      "Extreme facts use the inspector local scroll region",
    );
    assert.equal(
      await inspector
        .locator(".od-graph-inspector-content")
        .evaluate((content) => {
          const previous = content.scrollTop;
          content.scrollTop = content.scrollHeight;
          const last = content.querySelector('[data-fact="extreme-15"] > dd');
          const region = content.getBoundingClientRect();
          const value = last.getBoundingClientRect();
          const reached =
            content.scrollTop > 0 &&
            value.top >= region.top &&
            value.bottom <= region.bottom;
          content.scrollTop = previous;
          return reached;
        }),
      true,
      "The local scroll region reaches the final extreme fact value",
    );
    assert.deepEqual(
      await page.evaluate(() => [
        document.documentElement.scrollWidth > innerWidth,
        document.documentElement.scrollHeight > innerHeight,
      ]),
      [false, false],
      "Facts do not create document overflow",
    );
    assert.deepEqual(
      (await new AxeBuilder({ page }).analyze()).violations,
      [],
      `${item.mode} ${item.scale}: strict Axe`,
    );
    const screenshot = join(
      screenshotDirectory,
      `${item.phone ? "phone-" : ""}${item.mode}-${String(item.scale * 100)}-percent.png`,
    );
    await page.screenshot({ path: screenshot });
    screenshots.push(screenshot);

    await page.waitForTimeout(120);
    const quietBefore = await page.evaluate(() => ({
      ...window.__factsObserverStatistics,
    }));
    await page.waitForTimeout(120);
    const quietAfter = await page.evaluate(() => ({
      ...window.__factsObserverStatistics,
    }));
    assert.equal(
      quietAfter.callbacks,
      quietBefore.callbacks,
      "Resize observers stop after layout settles",
    );
    assert.equal(
      quietAfter.measuringMutations,
      quietBefore.measuringMutations,
      "The temporary measurement attribute does not churn after settling",
    );
    await page.evaluate(() => {
      document.querySelector('[data-group="adaptive"]').style.inlineSize =
        "11rem";
      window.unmountFactsFixture();
    });
    await settle(page);
    await page.waitForTimeout(80);
    const cleaned = await page.evaluate(() => ({
      ...window.__factsObserverStatistics,
    }));
    await page.waitForTimeout(120);
    const afterCleanup = await page.evaluate(() => ({
      ...window.__factsObserverStatistics,
    }));
    assert.equal(
      cleaned.activeFacts,
      0,
      "All facts ResizeObservers disconnect on unmount",
    );
    assert.equal(
      cleaned.measuringMutations,
      quietAfter.measuringMutations,
      "Queued facts measurement work is canceled on unmount",
    );
    assert.equal(
      afterCleanup.callbacks,
      cleaned.callbacks,
      "ResizeObserver delivery becomes quiet after cleanup",
    );
    results.push({
      callbacks: cleaned.callbacks,
      measuringMutations: quietAfter.measuringMutations,
      mode: item.mode,
      phone: item.phone ?? false,
      scale: item.scale,
    });
    await context.close();
  }
  assert.deepEqual(errors, [], "No browser, console, or ResizeObserver errors");
} finally {
  await browser.close();
}

const report = {
  axeCases: results.length,
  cases: results,
  screenshotDirectory,
  screenshots,
};
await writeFile(
  join(screenshotDirectory, "results.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);
process.stdout.write(`${JSON.stringify(report)}\n`);
