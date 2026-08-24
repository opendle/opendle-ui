import { strict as assert } from "node:assert";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import AxeBuilder from "@axe-core/playwright";
import { chromium } from "@playwright/test";
import { build } from "esbuild";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));
const fixtureSource = String.raw`
import React, { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { DataTable } from "./dist/index.js";

const initialRows = [
  {
    id: "record-1",
    name: "First record",
    state: "Ready",
    detail: "First record detail",
    value: "https://example.invalid/" + "one-continuous-value-".repeat(20),
  },
  {
    id: "record-2",
    name: "Second record",
    state: "Waiting",
    detail: "Second record detail",
    value: "Short value",
  },
];

const columns = [
  {
    key: "name",
    header: "Name",
    width: "20rem",
    sortable: true,
    render: ({ row }) => <strong>{row.name}</strong>,
  },
  {
    key: "state",
    header: "State",
    phoneLabel: "Current state",
    width: "12rem",
    render: ({ row }) => row.state,
  },
  {
    key: "value",
    header: "Long value",
    width: "28rem",
    render: ({ row }) => <code>{row.value}</code>,
  },
];
const syncColumns = [{
  key: "name", header: "Name", width: "10rem", render: ({ row }) => row.name,
}];

function Fixture() {
  const [rows, setRows] = useState(initialRows);
  const [selected, setSelected] = useState(["record-1"]);
  const [expanded, setExpanded] = useState([]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState({ columnKey: "name", direction: "ascending" });
  const [actionCount, setActionCount] = useState(0);
  const [loadCount, setLoadCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [syncLoadCount, setSyncLoadCount] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  return (
    <>
      <output aria-label="Sort state">{sort.columnKey}:{sort.direction}</output>
      <output aria-label="Action count">{actionCount}</output>
      <output aria-label="Load count">{loadCount}</output>
      <output aria-label="Synchronous load count">{syncLoadCount}</output>
      <output aria-label="Retry count">{retryCount}</output>
      <DataTable
        actions={[
          {
            key: "run",
            label: (row) => "Run " + row.name,
            pendingLabel: (row) => "Running " + row.name + "…",
            onAction: async () => {
              setActionCount((count) => count + 1);
              await new Promise((resolve) => setTimeout(resolve, 120));
            },
          },
          {
            key: "remove",
            label: (row) => "Remove " + row.name,
            onAction: (row) => setRows((current) => current.filter((item) => item.id !== row.id)),
          },
        ]}
        ariaLabel="Browser records"
        columns={columns}
        density="compact"
        expansion={{
          expandedRowIds: expanded,
          onChange: setExpanded,
          detail: ({ row }) => <p>{row.detail}</p>,
        }}
        filters={<button type="button">Ready only</button>}
        getRowId={(row) => row.id}
        getRowLabel={(row) => row.name}
        loadMore={{
          hasMore,
          loadedLabel: rows.length + " loaded",
          onLoadMore: async () => {
            setLoadCount((count) => count + 1);
            await new Promise((resolve) => setTimeout(resolve, 120));
            setRows((current) => [...current, {
              id: "record-3", name: "Third record", state: "Ready",
              detail: "Third record detail", value: "Loaded value",
            }]);
            setHasMore(false);
          },
        }}
        minimumWidth="60rem"
        rows={rows.filter((row) => row.name.toLowerCase().includes(query.toLowerCase()))}
        search={<label>Search records <input value={query} onChange={(event) => setQuery(event.target.value)} type="search" /></label>}
        selection={{ selectedRowIds: selected, onChange: setSelected }}
        sort={{ ...sort, onChange: (columnKey, direction) => setSort({ columnKey, direction }) }}
        state={{ kind: "stale", message: "The current rows can be out of date." }}
      />
      <DataTable
        ariaLabel="Synchronous load records"
        columns={syncColumns}
        getRowId={(row) => row.id}
        getRowLabel={(row) => row.name}
        loadMore={{
          hasMore: true,
          onLoadMore: () => setSyncLoadCount((count) => count + 1),
        }}
        rows={[initialRows[0]]}
      />
      <DataTable
        ariaLabel="Retry records"
        columns={syncColumns}
        getRowId={(row) => row.id}
        getRowLabel={(row) => row.name}
        rows={[]}
        state={{
          kind: "error",
          message: "Retry test error",
          retryLabel: "Retry test",
          onRetry: () => {
            setRetryCount((count) => count + 1);
            if (retryCount === 0) throw new Error("Expected synchronous retry failure");
            return new Promise((resolve) => setTimeout(resolve, 120));
          },
        }}
      />
    </>
  );
}

createRoot(document.getElementById("root")).render(<StrictMode><Fixture /></StrictMode>);
`;

const bundle = await build({
  bundle: true,
  format: "iife",
  jsx: "automatic",
  logLevel: "silent",
  platform: "browser",
  stdin: {
    contents: fixtureSource,
    loader: "jsx",
    resolveDir: repositoryRoot,
    sourcefile: "data-table-browser-fixture.jsx",
  },
  write: false,
});
const browserScript = bundle.outputFiles[0]?.text;
assert.ok(
  browserScript,
  "The data-table browser fixture must build one script.",
);
const css = await readFile(
  new URL("../styles/tokens.css", import.meta.url),
  "utf8",
);
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Data table test</title><style>${css}*{box-sizing:border-box}body{margin:0;background:var(--od-color-background)}main{width:min(100%,45rem);padding:1rem;margin:0 auto}</style></head><body><main><h1>Data table browser check</h1><div id="root"></div></main></body></html>`;
const systemChrome = "/usr/bin/google-chrome";
const browser = await chromium.launch({
  executablePath: existsSync(systemChrome) ? systemChrome : undefined,
  headless: true,
});

async function loadFixture(page) {
  const errors = [];
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      !message.text().includes("Expected synchronous retry failure")
    ) {
      errors.push(message.text());
    }
  });
  page.on("pageerror", (error) => {
    if (!error.message.includes("Expected synchronous retry failure"))
      errors.push(error.message);
  });
  await page.setContent(html);
  await page.addScriptTag({ content: browserScript });
  await page
    .getByRole("region", { name: "Browser records", exact: true })
    .waitFor();
  return errors;
}

try {
  const desktopContext = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const desktop = await desktopContext.newPage();
  const desktopErrors = await loadFixture(desktop);
  const tableRoot = desktop.getByRole("region", {
    name: "Browser records",
    exact: true,
  });
  const tableRegion = desktop.getByRole("region", {
    name: "Browser records scrollable table",
  });
  assert.equal(
    await desktop.getByRole("table", { name: "Browser records" }).count(),
    1,
  );
  assert.equal(
    await desktop
      .getByRole("list", { name: "Browser records cards" })
      .isVisible(),
    false,
  );
  assert.equal(
    await tableRegion.evaluate(
      (element) => element.scrollWidth > element.clientWidth,
    ),
    true,
    "Wide table content must stay in the labelled local scroll region.",
  );
  const scrollRight = desktop.getByRole("button", {
    name: "Scroll Browser records right",
  });
  await scrollRight.focus();
  await scrollRight.press("Enter");
  await desktop.waitForTimeout(200);
  assert.equal(
    await tableRegion.evaluate((element) => element.scrollLeft > 0),
    true,
    "The labelled overflow region must support keyboard scrolling.",
  );
  const desktopOverflow = await desktop.evaluate(() => {
    const region = document.querySelector(".od-data-table-desktop");
    const bounds = region?.getBoundingClientRect();
    return {
      bodyClientWidth: document.body.clientWidth,
      bodyScrollWidth: document.body.scrollWidth,
      documentClientWidth: document.documentElement.clientWidth,
      documentScrollWidth: document.documentElement.scrollWidth,
      regionClientWidth: region?.clientWidth,
      regionOverflowX: region ? getComputedStyle(region).overflowX : null,
      regionRight: bounds?.right,
      regionScrollWidth: region?.scrollWidth,
    };
  });
  assert.equal(
    desktopOverflow.documentScrollWidth <= desktopOverflow.documentClientWidth,
    true,
    `The table must not cause page-level horizontal overflow: ${JSON.stringify(desktopOverflow)}`,
  );
  assert.deepEqual(
    (await new AxeBuilder({ page: desktop }).analyze()).violations,
    [],
    "The desktop data table must have no automated accessibility violations.",
  );

  const synchronousLoad = desktop
    .getByRole("button", {
      name: "Load more rows",
    })
    .nth(1);
  await synchronousLoad.evaluate((button) => {
    button.click();
    button.click();
  });
  assert.equal(
    await desktop
      .getByRole("status", { name: "Synchronous load count" })
      .textContent(),
    "1",
    "A synchronous load callback must run once for duplicate calls in one task.",
  );

  const retry = desktop.getByRole("button", { name: "Retry test" });
  await retry.click();
  assert.equal(
    await desktop.getByRole("status", { name: "Retry count" }).textContent(),
    "1",
  );
  assert.equal(
    await retry.isEnabled(),
    true,
    "A synchronous throw must release the load lock.",
  );
  await retry.click();
  assert.equal(
    await desktop.getByRole("button", { name: "Retrying…" }).isDisabled(),
    true,
    "An asynchronous retry must use controlled pending state.",
  );
  await desktop.getByRole("button", { name: "Retry test" }).waitFor();
  assert.equal(
    await desktop.getByRole("status", { name: "Retry count" }).textContent(),
    "2",
  );

  const sortButton = desktop.getByRole("button", {
    name: "Sort by Name descending",
  });
  await sortButton.focus();
  await sortButton.press("Enter");
  assert.equal(
    await desktop.getByRole("status", { name: "Sort state" }).textContent(),
    "name:descending",
  );
  assert.equal(
    await tableRegion
      .getByRole("columnheader", { name: /Name/ })
      .getAttribute("aria-sort"),
    "descending",
  );

  const firstSelection = tableRegion.getByRole("checkbox", {
    name: "Select First record",
  });
  assert.equal(await firstSelection.isChecked(), true);
  await firstSelection.uncheck();
  assert.equal(await firstSelection.isChecked(), false);
  await tableRegion
    .getByRole("checkbox", { name: "Select all visible rows" })
    .check();
  assert.equal(await firstSelection.isChecked(), true);
  assert.equal(
    await tableRegion
      .getByRole("checkbox", { name: "Select Second record" })
      .isChecked(),
    true,
  );

  const expandFirst = tableRegion.getByRole("button", {
    name: "Show details for First record",
  });
  await expandFirst.click();
  assert.equal(
    await tableRegion.getByText("First record detail").isVisible(),
    true,
  );
  assert.equal(
    await tableRegion
      .getByRole("button", { name: "Hide details for First record" })
      .getAttribute("aria-expanded"),
    "true",
  );

  const runSecond = tableRegion.getByRole("button", {
    name: "Run Second record",
  });
  await runSecond.evaluate((button) => {
    button.click();
    button.click();
  });
  assert.equal(
    await desktop.getByRole("status", { name: "Action count" }).textContent(),
    "1",
  );
  assert.equal(
    await tableRegion
      .getByRole("button", { name: "Running Second record…" })
      .isDisabled(),
    true,
  );

  const removeFirst = tableRegion.getByRole("button", {
    name: "Remove First record",
  });
  await removeFirst.focus();
  await removeFirst.click();
  const removeSecond = tableRegion.getByRole("button", {
    name: "Remove Second record",
  });
  assert.equal(
    await removeSecond.evaluate(
      (element) => element === document.activeElement,
    ),
    true,
    "Removing a row must restore focus to the same action in the nearest row.",
  );

  const loadMore = tableRoot.getByRole("button", { name: "Load more rows" });
  await loadMore.evaluate((button) => {
    button.click();
    button.click();
  });
  assert.equal(
    await desktop
      .getByRole("status", { name: "Load count", exact: true })
      .textContent(),
    "1",
  );
  await desktop.getByText("All rows loaded").waitFor();
  assert.match(
    await tableRoot.locator("output").last().textContent(),
    /2 rows loaded\./,
  );
  await removeSecond.click();
  const removeThird = tableRegion.getByRole("button", {
    name: "Remove Third record",
  });
  assert.equal(
    await removeThird.evaluate((element) => element === document.activeElement),
    true,
    "Focus must continue to the final row.",
  );
  await removeThird.click();
  assert.equal(
    await tableRoot.evaluate((element) => element === document.activeElement),
    true,
    "Removing the final row must return focus to the labelled table region.",
  );
  assert.deepEqual(desktopErrors, []);

  const phoneContext = await browser.newContext({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  });
  const phone = await phoneContext.newPage();
  const phoneErrors = await loadFixture(phone);
  const phoneTableRoot = phone.getByRole("region", {
    name: "Browser records",
    exact: true,
  });
  const phoneCards = phoneTableRoot.getByRole("list", {
    name: "Browser records cards",
  });
  assert.equal(
    await phoneTableRoot
      .locator(".od-data-table-desktop")
      .evaluate((element) => getComputedStyle(element).display),
    "none",
  );
  assert.equal(await phoneCards.isVisible(), true);
  assert.equal(
    await phoneCards.getByRole("article", { name: "First record" }).count(),
    1,
  );
  assert.equal(
    await phoneCards
      .getByText("Current state", { exact: true })
      .first()
      .isVisible(),
    true,
  );
  assert.equal(
    await phone.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
    true,
    "Phone cards and long content must not cause page-level overflow.",
  );
  assert.deepEqual(
    (await new AxeBuilder({ page: phone }).analyze()).violations,
    [],
    "The phone data table must have no automated accessibility violations.",
  );
  await phone.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });
  const phoneOverflow = await phone.evaluate(() =>
    [...document.querySelectorAll("*")].flatMap((element) => {
      const bounds = element.getBoundingClientRect();
      return bounds.right > document.documentElement.clientWidth + 0.5
        ? [
            {
              className: element.className,
              tagName: element.tagName,
              right: bounds.right,
            },
          ]
        : [];
    }),
  );
  assert.deepEqual(
    phoneOverflow,
    [],
    "Phone cards must reflow at 200% text size.",
  );
  const phoneSelection = phoneTableRoot.getByRole("checkbox", {
    name: "Select First record",
  });
  await phoneSelection.tap();
  assert.equal(await phoneSelection.isChecked(), false);
  assert.deepEqual(phoneErrors, []);

  await desktopContext.close();
  await phoneContext.close();
} finally {
  await browser.close();
}

process.stdout.write("Data table browser checks passed.\n");
