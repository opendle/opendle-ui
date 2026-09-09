import { strict as assert } from "node:assert";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import AxeBuilder from "@axe-core/playwright";
import { chromium } from "@playwright/test";
import { build } from "esbuild";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));
const fixtureSource = String.raw`
import React, { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { DataTable, EditableTable, StatusPill } from "./dist/index.js";

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

function ReadabilityFixture() {
  const [selected, setSelected] = useState([]);
  const [expanded, setExpanded] = useState([]);
  const [actionCount, setActionCount] = useState(0);
  const [rows, setRows] = useState([{
    id: "edit", label: "Editable record", draft: { name: "Original value" },
    committedDraft: { name: "Original value" }, editing: false, dirty: false,
  }]);
  const density = document.getElementById("root").dataset.density;
  return <>
    <DataTable ariaLabel="Readable records" density={density}
      columns={[
        { key: "dimension", header: "Complete record description", render: () => "A complete record description with several ordinary words and a long identifier: " + "continuous".repeat(12) },
        { key: "label", header: "Unbroken".repeat(8), render: ({ presentation }) => <a href={"#record-target-" + presentation}>Read the complete record details</a> },
        { key: "state", header: "State", align: "center", render: () => <StatusPill tone="green">Ready for review</StatusPill> },
        { key: "spaced-state", header: "Complete state", align: "start", render: () => <StatusPill tone="green">A record with a longer review state label</StatusPill> },
        { key: "unbroken-state", header: "Unbroken state", align: "end", render: () => <StatusPill tone="green">{"Unbroken".repeat(12)}</StatusPill> },
      ]}
      rows={[{ id: "record" }]} getRowId={(row) => row.id}
      getRowLabel={() => "Record with complete details"}
      selection={{ selectedRowIds: selected, onChange: setSelected }}
      expansion={{ expandedRowIds: expanded, onChange: setExpanded, detail: ({ presentation }) => <p id={"record-target-" + presentation}>Complete expanded record details.</p> }}
      actions={[{ key: "run", label: () => "Run the selected record action", onAction: () => setActionCount((count) => count + 1) }]}
    />
    <output aria-label="Readability action count">{actionCount}</output>
    <EditableTable ariaLabel="Readable editable records" density={density} rows={rows}
      columns={[{ key: "name", header: "Editable record name", renderRead: ({ row }) => row.draft.name,
        renderEdit: ({ row, update }) => <input aria-label="Record name" value={row.draft.name} onChange={(event) => update({ name: event.target.value })} /> }]}
      onEdit={(id) => setRows((current) => current.map((row) => row.id === id ? { ...row, editing: true } : row))}
      onDraftChange={(id, patch) => setRows((current) => current.map((row) => row.id === id ? { ...row, draft: { ...row.draft, ...patch }, dirty: true } : row))}
      onCancel={() => setRows((current) => current.map((row) => ({ ...row, editing: false, dirty: false, draft: row.committedDraft })))}
      onSave={() => setRows((current) => current.map((row) => ({ ...row, editing: false, dirty: false, committedDraft: row.draft })))}
    />
  </>;
}

function ContrastFixture() {
  const rows = Array.from({ length: 8 }, (_, index) => ({
    id: String(index),
    disabled: Boolean(index & 1),
    pending: Boolean(index & 2),
    selected: Boolean(index & 4),
    name: [index & 1 ? "Disabled" : "Enabled", index & 2 ? "pending" : "ready", index & 4 ? "selected" : "unselected"].join(" "),
  }));
  return (
    <DataTable
      ariaLabel="State contrast records"
      columns={[
        { key: "name", header: "Name", render: ({ row }) => <strong>{row.name}</strong> },
        { key: "value", header: "Value", render: () => "Record value" },
      ]}
      getRowId={(row) => row.id}
      getRowLabel={(row) => row.name}
      isRowDisabled={(row) => row.disabled}
      isRowPending={(row) => row.pending}
      minimumWidth="0"
      rows={rows}
      selection={{ selectedRowIds: rows.filter((row) => row.selected).map((row) => row.id), onChange: () => {} }}
    />
  );
}

function Fixture() {
  const [rows, setRows] = useState(initialRows);
  const [selected, setSelected] = useState(["off-page", "record-1"]);
  const [expanded, setExpanded] = useState([]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState({ columnKey: "name", direction: "ascending" });
  const [actionCount, setActionCount] = useState(0);
  const [loadCount, setLoadCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [syncLoadCount, setSyncLoadCount] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [failureCount, setFailureCount] = useState(0);
  const [focusCaptureCount, setFocusCaptureCount] = useState(0);

  return (
    <>
      <output aria-label="Sort state">{sort.columnKey}:{sort.direction}</output>
      <output aria-label="Action count">{actionCount}</output>
      <output aria-label="Load count">{loadCount}</output>
      <output aria-label="Synchronous load count">{syncLoadCount}</output>
      <output aria-label="Retry count">{retryCount}</output>
      <output aria-label="Failure count">{failureCount}</output>
      <output aria-label="Selected rows">{selected.join(",")}</output>
      <output aria-label="Focus capture count">{focusCaptureCount}</output>
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
          {
            key: "fail",
            label: (row) => "Fail " + row.name,
            pendingLabel: (row) => "Failing " + row.name + "…",
            onAction: () => {
              setFailureCount((count) => count + 1);
              if (failureCount === 0) throw new Error("Expected contained action failure");
              return new Promise((resolve, reject) => {
                setTimeout(() => reject(new Error("Expected contained action rejection")), 120);
              });
            },
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
        onFocusCapture={() => setFocusCaptureCount((count) => count + 1)}
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
      <FocusFallbackFixture />
      <SingleSelectionFixture />
      <div style={{ maxWidth: "100%", width: "30rem" }}>
        <DataTable
          ariaLabel="Container records"
          columns={syncColumns}
          getRowId={(row) => row.id}
          getRowLabel={(row) => row.name}
          rows={initialRows}
        />
      </div>
      <UnmountFixtures />
    </>
  );
}

function SingleSelectionFixture() {
  const [singleSelection, setSingleSelection] = useState(["record-1"]);
  return (
    <>
      <output aria-label="Single selected row">{singleSelection.join(",")}</output>
      <DataTable
        ariaLabel="Single selection records"
        columns={syncColumns}
        getRowId={(row) => row.id}
        getRowLabel={(row) => row.name}
        rows={initialRows}
        selection={{
          mode: "single",
          onChange: setSingleSelection,
          selectedRowIds: singleSelection,
        }}
      />
    </>
  );
}

function FocusFallbackFixture() {
  const [fallbackRows, setFallbackRows] = useState(initialRows);
  const [disabled, setDisabled] = useState(false);
  return (
    <DataTable
      actions={[{
        key: "remove",
        label: (row) => "Delete fallback " + row.name,
        onAction: (row) => {
          setFallbackRows((current) => current.filter((item) => item.id !== row.id));
          setDisabled(true);
        },
      }]}
      ariaLabel="Focus fallback records"
      columns={syncColumns}
      getRowId={(row) => row.id}
      getRowLabel={(row) => row.name}
      isRowDisabled={() => disabled}
      rows={fallbackRows}
    />
  );
}

function UnmountFixtures() {
  const [showAction, setShowAction] = useState(true);
  const [showLoad, setShowLoad] = useState(true);
  return (
    <>
      {showAction ? (
        <DataTable
          actions={[{
            key: "unmount",
            label: () => "Unmount during action",
            onAction: () => {
              setShowAction(false);
              return new Promise((resolve, reject) => {
                setTimeout(() => reject(new Error("Expected contained unmounted action rejection")), 40);
              });
            },
          }]}
          ariaLabel="Unmount action records"
          columns={syncColumns}
          getRowId={(row) => row.id}
          getRowLabel={(row) => row.name}
          rows={[initialRows[0]]}
        />
      ) : <output aria-label="Unmount action result">Action table removed</output>}
      {showLoad ? (
        <DataTable
          ariaLabel="Unmount load records"
          columns={syncColumns}
          getRowId={(row) => row.id}
          getRowLabel={(row) => row.name}
          loadMore={{
            hasMore: true,
            onLoadMore: () => {
              setShowLoad(false);
              return new Promise((resolve, reject) => {
                setTimeout(() => reject(new Error("Expected contained unmounted load rejection")), 40);
              });
            },
          }}
          rows={[initialRows[0]]}
        />
      ) : <output aria-label="Unmount load result">Load table removed</output>}
    </>
  );
}

const root = document.getElementById("root");
createRoot(root).render(<StrictMode>{root.dataset.fixture === "readability" ? <ReadabilityFixture /> : root.dataset.fixture === "contrast" ? <ContrastFixture /> : <Fixture />}</StrictMode>);
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
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Data table test</title><style>${css}*{box-sizing:border-box}body{margin:0;background:var(--od-color-background)}main{width:min(100%,45rem);padding:1rem;margin:0 auto}#root>output{display:block;max-width:100%;overflow-wrap:anywhere}</style></head><body><main><h1>Data table browser check</h1><div id="root"></div></main></body></html>`;
const systemChrome = "/usr/bin/google-chrome";
const browser = await chromium.launch({
  executablePath: existsSync(systemChrome) ? systemChrome : undefined,
  headless: true,
});

async function loadFixture(page) {
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(message.text());
    }
  });
  page.on("pageerror", (error) => {
    errors.push(error.message);
  });
  await page.setContent(html);
  await page.addScriptTag({ content: browserScript });
  await page
    .getByRole("region", { name: "Browser records", exact: true })
    .waitFor();
  return errors;
}

async function checkStateContrast() {
  const shots = new URL("../tmp/data-table-contrast/", import.meta.url);
  await mkdir(shots, { recursive: true });
  for (const width of [390, 1440]) {
    for (const textSize of [100, 200]) {
      for (const forcedColors of ["none", "active"]) {
        const context = await browser.newContext({
          viewport: { width, height: 900 },
          forcedColors,
        });
        try {
          const page = await context.newPage();
          const errors = [];
          page.on("pageerror", (error) => errors.push(error.message));
          page.on("console", (message) => {
            if (message.type() === "error") errors.push(message.text());
          });
          await page.setContent(html);
          await page.evaluate((size) => {
            document.getElementById("root").dataset.fixture = "contrast";
            document.querySelector("main").style.width = "100%";
            document.documentElement.style.fontSize = `${size}%`;
          }, textSize);
          await page.addScriptTag({ content: browserScript });
          const root = page.getByRole("region", {
            name: "State contrast records",
            exact: true,
          });
          await root.waitFor();
          const cards = width === 390;
          assert.equal(await root.getByRole("table").isVisible(), !cards);
          assert.equal(await root.getByRole("list").isVisible(), cards);
          const rows = root.locator(cards ? ".od-data-table-card" : "tbody tr");
          assert.equal(await rows.count(), 8);
          for (let index = 0; index < 8; index += 1) {
            const row = rows.nth(index);
            assert.equal(
              await row.getAttribute(cards ? "data-disabled" : "aria-disabled"),
              index & 1 ? "true" : null,
            );
            assert.equal(
              await row.getAttribute("aria-busy"),
              index & 2 ? "true" : null,
            );
            assert.equal(
              await row.getAttribute("data-selected"),
              index & 4 ? "true" : null,
            );
            const selection = row.getByRole("checkbox");
            assert.equal(await selection.isDisabled(), Boolean(index & 3));
            assert.equal(await selection.isChecked(), Boolean(index & 4));
            if (cards) {
              assert.equal(await row.getByRole("article").count(), 1);
              assert.equal(await row.locator("dt").count(), 2);
              assert.equal(await row.locator("dd").count(), 2);
              const description = await row
                .getByRole("article")
                .getAttribute("aria-describedby");
              assert.equal(Boolean(description), Boolean(index & 1));
            } else {
              assert.equal(await row.getByRole("cell").count(), 3);
            }
          }
          const firstSelection = rows.nth(0).getByRole("checkbox");
          await firstSelection.focus();
          await firstSelection.press("Tab");
          const selectedControl = rows.nth(4).getByRole("checkbox");
          assert.equal(
            await selectedControl.evaluate(
              (element) => element === document.activeElement,
            ),
            true,
            "Tab must skip disabled and pending row controls.",
          );
          assert.equal(
            await selectedControl.evaluate((element) => {
              const style = getComputedStyle(element);
              return (
                style.outlineStyle !== "none" &&
                parseFloat(style.outlineWidth) > 0
              );
            }),
            true,
            "The available row control must have visible keyboard focus.",
          );
          const samples = await rows
            .locator(
              cards
                ? ".od-data-table-card-title, dt, dd"
                : ".od-data-table-cell",
            )
            .evaluateAll((elements) => {
              const luminance = (color) => {
                const channels = color.match(/[\d.]+/g).map(Number);
                const linear = channels.slice(0, 3).map((channel) => {
                  const value = channel / 255;
                  return value <= 0.04045
                    ? value / 12.92
                    : ((value + 0.055) / 1.055) ** 2.4;
                });
                return (
                  linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722
                );
              };
              return elements.map((element) => {
                let ancestor = element;
                let background;
                do {
                  background = getComputedStyle(ancestor).backgroundColor;
                  ancestor = ancestor.parentElement;
                } while (
                  background.startsWith("rgba(") &&
                  Number(background.match(/[\d.]+/g)[3]) === 0 &&
                  ancestor
                );
                const foreground = getComputedStyle(element).color;
                const values = [luminance(foreground), luminance(background)];
                return {
                  row: element.closest("[data-data-table-row]").dataset
                    .dataTableRow,
                  text: element.textContent,
                  foreground,
                  background,
                  ratio:
                    (Math.max(...values) + 0.05) / (Math.min(...values) + 0.05),
                };
              });
            });
          assert.equal(samples.length, cards ? 40 : 16);
          assert.equal(
            await page.evaluate(
              () =>
                document.documentElement.scrollWidth <=
                document.documentElement.clientWidth,
            ),
            true,
            "State text must not cause page-level overflow.",
          );
          const label = `${width}-${textSize}-${forcedColors}`;
          await root.screenshot({
            path: fileURLToPath(new URL(`${label}.png`, shots)),
          });
          const axe = await new AxeBuilder({ page }).analyze();
          process.stdout.write(
            `${label}: ${JSON.stringify({ minimumContrast: Math.min(...samples.map((sample) => sample.ratio)), pendingDisabled: samples.filter((sample) => sample.row === "3"), violations: axe.violations })}\n`,
          );
          assert.deepEqual(
            axe.violations,
            [],
            `${label}: Axe must pass in every row state.`,
          );
          assert.deepEqual(
            samples.filter(
              (sample) => !Number.isFinite(sample.ratio) || sample.ratio < 4.5,
            ),
            [],
            `${label}: all record text must meet 4.5:1, including disabled desktop rows that Axe excludes.`,
          );
          assert.deepEqual(errors, []);
        } finally {
          await context.close();
        }
      }
    }
  }
}

async function checkCardReadability() {
  const shots = new URL("../tmp/data-table-readability/", import.meta.url);
  await mkdir(shots, { recursive: true });
  const measurements = [];
  const cases = [
    { width: 320, textSize: 100, stacked: true },
    { width: 320, textSize: 200, stacked: true },
    { width: 390, textSize: 100, stacked: false },
    { width: 390, textSize: 200, stacked: true },
    { width: 600, textSize: 100, stacked: false },
    { width: 600, textSize: 200, stacked: true },
    { width: 1440, container: 300, textSize: 100, stacked: true },
    { width: 1440, container: 300, textSize: 200, stacked: true },
    { width: 1440, textSize: 100, desktop: true },
    { width: 1440, textSize: 200, desktop: true },
  ];
  async function checkFocus(control) {
    await control.scrollIntoViewIfNeeded();
    await control.evaluate((element) =>
      element.scrollIntoView({ block: "center", inline: "nearest" }),
    );
    assert.equal(
      await control.evaluate((element) => {
        const box = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        const outline =
          parseFloat(style.outlineWidth) +
          Math.max(0, parseFloat(style.outlineOffset));
        const card = element.closest(".od-data-table-card");
        const bounds = card?.getBoundingClientRect();
        return (
          element === document.activeElement &&
          style.outlineStyle !== "none" &&
          parseFloat(style.outlineWidth) > 0 &&
          box.left - outline >= 0 &&
          box.right + outline <= document.documentElement.clientWidth &&
          box.top - outline >= 0 &&
          box.bottom + outline <= window.innerHeight &&
          (!bounds ||
            (box.left - outline >= bounds.left &&
              box.right + outline <= bounds.right &&
              box.top - outline >= bounds.top &&
              box.bottom + outline <= bounds.bottom))
        );
      }),
      true,
      "The complete keyboard focus outline must remain inside the card and page.",
    );
  }
  for (const density of ["default", "compact"]) {
    for (const sample of cases) {
      const { width, textSize, container, desktop, stacked } = sample;
      const label = `${density}-${width}-${container ?? "page"}-${textSize}`;
      const context = await browser.newContext({
        viewport: { width, height: 900 },
      });
      try {
        const page = await context.newPage();
        const errors = [];
        page.on("pageerror", (error) => errors.push(error.message));
        page.on("console", (message) => {
          if (message.type() === "error") errors.push(message.text());
        });
        await page.setContent(html);
        await page.evaluate(
          ({ textSize, container, density }) => {
            document.documentElement.style.fontSize = `${textSize}%`;
            document.querySelector("h1").textContent = "Rows";
            const main = document.querySelector("main");
            main.style.width = "100%";
            const root = document.getElementById("root");
            root.dataset.fixture = "readability";
            root.dataset.density = density;
            if (container) root.style.width = `${container}px`;
          },
          { textSize, container, density },
        );
        await page.addScriptTag({ content: browserScript });
        const table = page.getByRole("region", {
          name: "Readable records",
          exact: true,
        });
        await table.waitFor();
        assert.equal(
          await table.getByRole("table").isVisible(),
          Boolean(desktop),
        );
        const card = table.locator(".od-data-table-card");
        if (!desktop) {
          const geometry = await card.evaluate((element) => {
            const rect = (node) => {
              const box = node.getBoundingClientRect();
              return {
                x: box.x,
                y: box.y,
                width: box.width,
                height: box.height,
                right: box.right,
                bottom: box.bottom,
              };
            };
            return {
              card: rect(element),
              heading: rect(element.querySelector(".od-data-table-card-title")),
              rows: [
                ...element.querySelectorAll(".od-data-table-card-value"),
              ].map((row) => ({
                row: rect(row),
                term: rect(row.querySelector("dt")),
                value: rect(row.querySelector("dd")),
                padding: parseFloat(getComputedStyle(row).paddingInlineStart),
                termOverflow:
                  row.querySelector("dt").scrollWidth >
                  row.querySelector("dt").clientWidth,
              })),
            };
          });
          measurements.push({ label, ...geometry });
          await writeFile(
            new URL("geometry.json", shots),
            JSON.stringify(measurements, null, 2),
          );
          await card
            .locator(".od-data-table-card-value")
            .first()
            .scrollIntoViewIfNeeded();
          await page.screenshot({
            path: fileURLToPath(new URL(`${label}-values.png`, shots)),
          });
          for (const row of geometry.rows) {
            assert.equal(
              row.termOverflow,
              false,
              `${label}: a complete label must wrap inside its region.`,
            );
            const available = row.row.width - 2 * row.padding;
            if (stacked) {
              assert.ok(
                row.value.width >= available - 1,
                `${label}: narrow values need the full content width; received ${row.value.width}px of ${available}px.`,
              );
              assert.ok(
                row.term.width >= available - 1,
                `${label}: narrow labels need the full content width.`,
              );
              assert.ok(
                row.value.y >= row.term.bottom,
                `${label}: the value must follow its complete label.`,
              );
            } else {
              assert.ok(
                row.value.x >= row.term.right,
                `${label}: wide cards keep labels beside values.`,
              );
              assert.ok(
                row.value.width >= available * 0.6,
                `${label}: wide values must retain useful reading width.`,
              );
            }
          }
          if (stacked)
            assert.ok(
              geometry.heading.width >=
                geometry.card.width - 2 * geometry.rows[0].padding - 3,
              `${label}: the heading must retain full reading width beside row controls.`,
            );
          assert.equal(await card.locator("dt").count(), 5);
          assert.equal(await card.locator("dd").count(), 5);
        }
        const pills = await table
          .locator(".od-status-pill:visible")
          .evaluateAll((elements) =>
            elements.map((element) => {
              const box = element.getBoundingClientRect();
              const region = element.closest("dd, td");
              const area = region.getBoundingClientRect();
              const regionStyle = getComputedStyle(region);
              const style = getComputedStyle(element);
              const dot = element.querySelector(".od-status-dot");
              const dotBox = dot.getBoundingClientRect();
              const dotStyle = getComputedStyle(dot);
              const rootText = parseFloat(
                getComputedStyle(document.documentElement).fontSize,
              );
              const labelRange = document.createRange();
              labelRange.selectNode(element.lastChild);
              const textBounds = [...labelRange.getClientRects()];
              const before =
                box.left - area.left - parseFloat(regionStyle.paddingLeft);
              const after =
                area.right - box.right - parseFloat(regionStyle.paddingRight);
              return {
                text: element.textContent,
                align: regionStyle.textAlign,
                before,
                after,
                width: box.width,
                regionWidth: area.width,
                padding: [
                  parseFloat(style.paddingLeft),
                  parseFloat(style.paddingRight),
                ],
                expectedPadding: rootText * 0.5,
                borderBox: style.boxSizing,
                inside:
                  before >= -1 &&
                  after >= -1 &&
                  textBounds.every(
                    (text) =>
                      text.left >=
                        box.left + parseFloat(style.paddingLeft) - 1 &&
                      text.right <=
                        box.right - parseFloat(style.paddingRight) + 1,
                  ),
                dotVisible:
                  dot.getAttribute("aria-hidden") === "true" &&
                  Math.abs(dotBox.width - rootText * 0.4) <= 0.1 &&
                  dotBox.left >= box.left &&
                  dotBox.right <= box.right &&
                  dotBox.top >= box.top &&
                  dotBox.bottom <= box.bottom &&
                  dotStyle.backgroundColor !== style.backgroundColor,
              };
            }),
          );
        assert.equal(pills.length, 3);
        assert.deepEqual(
          pills.map((pill) => pill.align),
          ["center", "start", "end"],
        );
        for (const pill of pills) {
          assert.equal(
            pill.inside,
            true,
            `${label}: complete pill text must stay in its padded value region: ${JSON.stringify(pill)}`,
          );
          assert.equal(
            pill.dotVisible,
            true,
            `${label}: each decorative status dot must stay visible at its full size.`,
          );
          assert.equal(pill.borderBox, "border-box");
          assert.deepEqual(pill.padding, [
            pill.expectedPadding,
            pill.expectedPadding,
          ]);
          if (pill.align === "center")
            assert.ok(
              Math.abs(pill.before - pill.after) <= 1,
              `${label}: center alignment must use the value region.`,
            );
          if (pill.align === "start")
            assert.ok(
              pill.before <= 1,
              `${label}: start alignment must use the value region.`,
            );
          if (pill.align === "end")
            assert.ok(
              pill.after <= 1,
              `${label}: end alignment must use the value region.`,
            );
        }
        const selection = table.getByRole("checkbox", {
          name: "Select Record with complete details",
          exact: true,
        });
        await selection.focus();
        await selection.press("Space");
        assert.equal(await selection.isChecked(), true);
        await checkFocus(selection);
        await selection.press("Tab");
        const expansion = table.getByRole("button", {
          name: /^(Show|Hide) details for Record with complete details$/,
        });
        await checkFocus(expansion);
        await expansion.press("Enter");
        assert.equal(
          await table.locator(".od-data-table-detail:visible").textContent(),
          "Complete expanded record details.",
        );
        await expansion.press("Tab");
        const link = table.getByRole("link", {
          name: "Read the complete record details",
        });
        await checkFocus(link);
        await link.press("Tab");
        const action = table.getByRole("button", {
          name: "Run the selected record action",
        });
        await checkFocus(action);
        await action.press("Enter");
        assert.equal(
          await page
            .getByRole("status", { name: "Readability action count" })
            .textContent(),
          "1",
        );
        const editable = page.getByRole("region", {
          name: "Readable editable records",
          exact: true,
        });
        await editable
          .getByRole("button", { name: "Edit Editable record" })
          .press("Enter");
        const input = editable.getByRole("textbox", { name: "Record name" });
        await input.fill("A changed record name");
        await checkFocus(input);
        if (!desktop) {
          const inputWidth = await input.evaluate((element) => ({
            width: element.getBoundingClientRect().width,
            area: element.closest("dd").getBoundingClientRect().width,
          }));
          assert.ok(
            inputWidth.width >= inputWidth.area - 2 &&
              inputWidth.width <= inputWidth.area + 1,
            `${label}: editable input must use its available width.`,
          );
        }
        await page.screenshot({
          path: fileURLToPath(new URL(`${label}-edit-focus.png`, shots)),
        });
        // Reflow the same card DOM in both directions without replacing the focused input.
        if (!desktop) {
          const handle = await input.elementHandle();
          for (const size of [
            600,
            300,
            600,
            container ?? width - 2 * (textSize / 100) * 16,
          ]) {
            await page.locator("#root").evaluate((element, size) => {
              element.style.width = `${size}px`;
            }, size);
            await page.setViewportSize({ width: 1440, height: 900 });
            await checkFocus(input);
            assert.equal(
              await handle.evaluate(
                (element) => element === document.activeElement,
              ),
              true,
              "Card reflow must keep the same focused input.",
            );
            assert.equal(await input.inputValue(), "A changed record name");
          }
          await handle.dispose();
          await page.setViewportSize({ width, height: 900 });
        }
        assert.equal(
          await page.evaluate(
            () =>
              document.documentElement.scrollWidth <=
              document.documentElement.clientWidth,
          ),
          true,
          `${label}: no page horizontal overflow. ${JSON.stringify(await page.evaluate(() => [...document.querySelectorAll("body *")].filter((element) => element.getBoundingClientRect().width && element.scrollWidth > element.clientWidth).map((element) => ({ tag: element.tagName, class: element.className, text: element.textContent.slice(0, 80), width: element.clientWidth, scroll: element.scrollWidth }))))}`,
        );
        assert.deepEqual(
          (await new AxeBuilder({ page }).analyze()).violations,
          [],
          `${label}: strict Axe must pass with selection, expansion, and editing.`,
        );
        await input.press("Enter");
        await editable
          .getByRole("button", { name: "Edit Editable record" })
          .waitFor();
        assert.equal(
          await editable
            .getByText("A changed record name", { exact: true })
            .filter({ visible: true })
            .isVisible(),
          true,
        );
        assert.deepEqual(errors, []);
      } finally {
        await context.close();
      }
    }
  }
  process.stdout.write(
    `Data table readability: ${cases.length * 2} cases passed. Images and geometry: ${fileURLToPath(shots)}\n`,
  );
}

try {
  await checkCardReadability();
  await checkStateContrast();
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

  const failFirst = tableRegion.getByRole("button", {
    name: "Fail First record",
  });
  await failFirst.click();
  assert.equal(
    await desktop.getByRole("status", { name: "Failure count" }).textContent(),
    "1",
  );
  assert.equal(
    await failFirst.isEnabled(),
    true,
    "A synchronous action throw must stay contained and release its lock.",
  );
  await failFirst.click();
  assert.equal(
    await tableRegion
      .getByRole("button", { name: "Failing First record…" })
      .isDisabled(),
    true,
    "A rejected row action must stay locked until it settles.",
  );
  await tableRegion
    .getByRole("button", { name: "Fail First record" })
    .waitFor();
  assert.equal(
    await desktop.getByRole("status", { name: "Failure count" }).textContent(),
    "2",
  );

  const sortButton = desktop.getByRole("button", {
    name: "Sort by Name descending",
  });
  await sortButton.focus();
  await sortButton.press("Enter");
  assert.equal(
    Number(
      await desktop
        .getByRole("status", { name: "Focus capture count" })
        .textContent(),
    ) > 0,
    true,
    "The shared focus tracker must preserve the host focus-capture handler.",
  );
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
  assert.equal(
    await desktop.getByRole("status", { name: "Selected rows" }).textContent(),
    "off-page",
    "A visible selection change must preserve controlled off-page selection.",
  );
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
  assert.equal(
    await desktop.getByRole("status", { name: "Selected rows" }).textContent(),
    "off-page,record-1,record-2",
    "Select all must preserve controlled off-page selection.",
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

  const fallbackTable = desktop.getByRole("region", {
    name: "Focus fallback records scrollable table",
  });
  const fallbackDelete = fallbackTable.getByRole("button", {
    name: "Delete fallback First record",
  });
  await fallbackDelete.focus();
  await fallbackDelete.click();
  assert.equal(
    await fallbackTable.evaluate(
      (element) => element === document.activeElement,
    ),
    true,
    "Focus must move to the table viewport when the nearest matching row control is disabled.",
  );

  const singleSelectionTable = desktop.getByRole("region", {
    name: "Single selection records scrollable table",
  });
  await singleSelectionTable
    .getByRole("radio", { name: "Select Second record" })
    .check();
  assert.equal(
    await singleSelectionTable
      .getByRole("radio", { name: "Select First record" })
      .isChecked(),
    false,
  );
  assert.equal(
    await desktop
      .getByRole("status", { name: "Single selected row" })
      .textContent(),
    "record-2",
    "Single selection must replace the previous selected row.",
  );

  const containerRoot = desktop.getByRole("region", {
    name: "Container records",
    exact: true,
  });
  assert.equal(
    await containerRoot
      .getByRole("list", { name: "Container records cards" })
      .isVisible(),
    true,
    "A narrow host container must use phone cards on a wide viewport.",
  );
  assert.equal(
    await containerRoot
      .locator(".od-data-table-desktop")
      .evaluate((element) => getComputedStyle(element).display),
    "none",
  );

  await desktop.getByRole("button", { name: "Unmount during action" }).click();
  await desktop.getByRole("button", { name: "Load more rows" }).last().click();
  await desktop
    .getByRole("status", { name: "Unmount action result" })
    .waitFor();
  await desktop.getByRole("status", { name: "Unmount load result" }).waitFor();
  await desktop.waitForTimeout(80);
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
