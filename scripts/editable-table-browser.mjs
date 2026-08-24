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
import { EditableTable } from "./dist/index.js";

const columns = [
  {
    key: "name",
    header: "Name",
    width: "18rem",
    renderRead: ({ row }) => <strong>{row.draft.name}</strong>,
    renderEdit: ({ row, update, disabled, validation, error, validationId, errorId }) => (
      <input
        aria-describedby={[validation ? validationId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined}
        aria-invalid={Boolean(validation) || undefined}
        aria-label={"Name for " + row.label}
        disabled={disabled}
        onChange={(event) => update({ name: event.target.value })}
        value={row.draft.name}
      />
    ),
  },
  {
    key: "provider",
    header: "Provider",
    phoneLabel: "Connected provider",
    width: "14rem",
    renderRead: ({ row }) => row.draft.provider,
    renderEdit: ({ row, update, disabled }) => (
      <select
        aria-label={"Provider for " + row.label}
        disabled={disabled}
        onChange={(event) => update({ provider: event.target.value })}
        value={row.draft.provider}
      >
        <option>North</option>
        <option>South</option>
      </select>
    ),
  },
];

const record = (id, name, provider = "North") => ({
  id,
  label: name,
  draft: { name, provider },
  committedDraft: { name, provider },
  editing: false,
  dirty: false,
});

function ExplicitFixture() {
  const [rows, setRows] = useState([
    record("route-1", "Primary route"),
    record("route-2", "Backup route"),
    { ...record("route-3", "Locked route"), locked: true },
  ]);
  const [saveCount, setSaveCount] = useState(0);
  const [createCount, setCreateCount] = useState(0);
  const [deleteCount, setDeleteCount] = useState(0);
  const [failedDeleteOnce, setFailedDeleteOnce] = useState(false);
  const [reorderCount, setReorderCount] = useState(0);
  const [createRow, setCreateRow] = useState({
    id: "create-route",
    label: "New route",
    draft: { name: "", provider: "North" },
    editing: true,
    dirty: false,
    isNew: true,
  });
  const allRows = [...rows, createRow];
  const patchRow = (rowId, patch) => {
    if (rowId === createRow.id) {
      setCreateRow((row) => ({ ...row, draft: { ...row.draft, ...patch }, dirty: true }));
      return;
    }
    setRows((current) => current.map((row) => row.id === rowId
      ? { ...row, draft: { ...row.draft, ...patch }, dirty: true }
      : row));
  };
  return (
    <section aria-label="Explicit fixture">
      <output aria-label="Explicit save count">{saveCount}</output>
      <output aria-label="Create count">{createCount}</output>
      <output aria-label="Delete count">{deleteCount}</output>
      <output aria-label="Reorder count">{reorderCount}</output>
      <button
        type="button"
        onClick={async () => {
          await new Promise((resolve) => setTimeout(resolve, 40));
          setRows((current) => current.map((row) => row.id === "route-1"
            ? { ...row, stale: true, label: "Server primary route" }
            : row));
        }}
      >
        Apply stale refresh
      </button>
      <button
        type="button"
        onClick={() => setRows((current) => current.filter((row) => row.id !== "route-1"))}
      >
        Remove external target
      </button>
      <button
        type="button"
        onClick={() => setRows((current) => current.some((row) => row.id === "route-1")
          ? current
          : [record("route-1", "Reappeared route"), ...current])}
      >
        Restore external target
      </button>
      <EditableTable
        ariaLabel="Explicit routes"
        columns={columns}
        getDeleteConfirmation={(row) => ({
          title: "Delete route?",
          description: "Delete " + row.label + " and its assignment.",
          confirmLabel: "Confirm delete " + row.label,
        })}
        onCancel={(rowId) => {
          if (rowId === createRow.id) {
            setCreateRow((row) => ({ ...row, draft: { name: "", provider: "North" }, dirty: false }));
            return;
          }
          setRows((current) => current.map((row) => row.id === rowId
            ? { ...row, draft: row.committedDraft, dirty: false, editing: false }
            : row));
        }}
        onCreate={async (_, draft) => {
          setCreateCount((count) => count + 1);
          await new Promise((resolve) => setTimeout(resolve, 80));
          setRows((current) => [...current, record("route-created", draft.name, draft.provider)]);
          setCreateRow((row) => ({ ...row, draft: { name: "", provider: "North" }, dirty: false }));
          return "route-created";
        }}
        onDelete={async (rowId) => {
          setDeleteCount((count) => count + 1);
          if (rowId === "route-1" && !failedDeleteOnce) {
            setFailedDeleteOnce(true);
            throw new Error("Expected contained delete failure");
          }
          await new Promise((resolve) => setTimeout(resolve, 80));
          setRows((current) => current.filter((row) => row.id !== rowId));
        }}
        onDraftChange={patchRow}
        onEdit={(rowId) => setRows((current) => current.map((row) => row.id === rowId
          ? { ...row, editing: true }
          : row))}
        onSave={async (rowId) => {
          setSaveCount((count) => count + 1);
          await new Promise((resolve) => setTimeout(resolve, 80));
          setRows((current) => current.map((row) => row.id === rowId
            ? { ...row, committedDraft: row.draft, dirty: false, editing: false, stale: false }
            : row));
        }}
        reorder={{
          getScope: (row) => row.draft.provider,
          onReorder: async ({ orderedRowIds }) => {
            setReorderCount((count) => count + 1);
            await new Promise((resolve) => setTimeout(resolve, 80));
            setRows((current) => {
              const byId = new Map(current.map((row) => [row.id, row]));
              const scoped = orderedRowIds.map((id) => byId.get(id)).filter(Boolean);
              let index = 0;
              return current.map((row) => orderedRowIds.includes(row.id) ? scoped[index++] : row);
            });
          },
        }}
        rows={allRows}
        saveMode="explicit"
        validate={(row) => row.draft.name.trim() ? null : "Name is required."}
      />
    </section>
  );
}

function AutomaticFixture() {
  const [row, setRow] = useState({ ...record("automatic-1", "Automatic route"), editing: true, dirty: true });
  const [saveCount, setSaveCount] = useState(0);
  const [cancelCount, setCancelCount] = useState(0);
  return (
    <section aria-label="Automatic fixture">
      <output aria-label="Automatic save count">{saveCount}</output>
      <output aria-label="Automatic cancel count">{cancelCount}</output>
      <button type="button">Outside automatic table</button>
      <EditableTable
        ariaLabel="Automatic routes"
        columns={columns}
        onCancel={() => {
          setCancelCount((count) => count + 1);
          setRow((current) => ({ ...current, editing: false, dirty: false }));
        }}
        onDraftChange={(_, patch) => setRow((current) => ({ ...current, draft: { ...current.draft, ...patch }, dirty: true }))}
        onEdit={() => setRow((current) => ({ ...current, editing: true }))}
        onSave={async () => {
          setSaveCount((count) => count + 1);
          await new Promise((resolve) => setTimeout(resolve, 80));
          setRow((current) => ({ ...current, editing: false, dirty: false, committedDraft: current.draft }));
        }}
        rows={[row]}
        saveMode="automatic"
      />
    </section>
  );
}

function BatchFixture() {
  const [rows, setRows] = useState([
    { ...record("batch-1", "Batch one"), editing: true, dirty: true },
    { ...record("batch-2", "Batch two"), editing: true, dirty: true },
  ]);
  const [count, setCount] = useState(0);
  return (
    <section aria-label="Batch fixture">
      <output aria-label="Batch save count">{count}</output>
      <EditableTable
        ariaLabel="Batch routes"
        columns={columns}
        onCancel={(rowId) => setRows((current) => current.map((row) => row.id === rowId ? { ...row, dirty: false } : row))}
        onDraftChange={() => undefined}
        onSave={async (rowId) => {
          setCount((value) => value + 1);
          await new Promise((resolve) => setTimeout(resolve, 60));
          setRows((current) => current.map((row) => row.id === rowId ? { ...row, dirty: false } : row));
        }}
        rows={rows}
        saveMode="batch"
      />
    </section>
  );
}

function FailureFixture() {
  const [row, setRow] = useState({ ...record("failure-1", "Failure route"), editing: true, dirty: true });
  const [count, setCount] = useState(0);
  const [cancelCount, setCancelCount] = useState(0);
  return (
    <section aria-label="Failure fixture">
      <output aria-label="Failure save count">{count}</output>
      <output aria-label="Failure cancel count">{cancelCount}</output>
      <EditableTable
        ariaLabel="Failure routes"
        columns={columns}
        onCancel={() => {
          setCancelCount((value) => value + 1);
          setRow((current) => ({ ...current, draft: current.committedDraft, editing: false, dirty: false }));
        }}
        onDraftChange={(_, patch) => setRow((current) => ({ ...current, draft: { ...current.draft, ...patch }, dirty: true }))}
        onSave={async () => {
          setCount((value) => value + 1);
          if (count === 0) throw new Error("Expected contained save failure");
          setRow((current) => ({ ...current, committedDraft: current.draft, editing: false, dirty: false }));
        }}
        rows={[row]}
        saveMode="explicit"
      />
    </section>
  );
}

function Fixture() {
  return <><ExplicitFixture /><AutomaticFixture /><BatchFixture /><FailureFixture /></>;
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
    sourcefile: "editable-table-browser-fixture.jsx",
  },
  write: false,
});
const browserScript = bundle.outputFiles[0]?.text;
assert.ok(
  browserScript,
  "The editable-table browser fixture must build one script.",
);
const css = await readFile(
  new URL("../styles/tokens.css", import.meta.url),
  "utf8",
);
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Editable table test</title><style>${css}*{box-sizing:border-box}body{margin:0;background:var(--od-color-background)}main{width:min(100%,72rem);padding:1rem;margin:0 auto}#root{display:grid;gap:2rem}output{display:block}</style></head><body><main><h1>Editable table browser check</h1><div id="root"></div></main></body></html>`;
const systemChrome = "/usr/bin/google-chrome";
const browser = await chromium.launch({
  executablePath: existsSync(systemChrome) ? systemChrome : undefined,
  headless: true,
});

async function loadFixture(page) {
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setContent(html);
  await page.addScriptTag({ content: browserScript });
  await page
    .getByRole("region", { name: "Explicit routes", exact: true })
    .waitFor();
  return errors;
}

try {
  const desktopContext = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });
  const desktop = await desktopContext.newPage();
  const desktopErrors = await loadFixture(desktop);
  const explicit = desktop.getByRole("region", {
    name: "Explicit routes",
    exact: true,
  });
  const explicitTable = explicit.getByRole("region", {
    name: "Explicit routes scrollable table",
  });

  await explicitTable
    .getByRole("button", { name: "Edit Primary route" })
    .first()
    .press("Enter");
  const primaryName = explicitTable.getByRole("textbox", {
    name: "Name for Primary route",
  });
  await primaryName.fill("Draft primary route");
  await desktop
    .getByRole("button", { name: "Apply stale refresh" })
    .evaluate((button) => button.click());
  const stalePrimaryName = explicitTable.getByRole("textbox", {
    name: "Name for Server primary route",
  });
  assert.equal(
    await stalePrimaryName.inputValue(),
    "Draft primary route",
    "A stale refresh must preserve the controlled draft.",
  );
  assert.equal(
    await stalePrimaryName.evaluate(
      (element) => element === document.activeElement,
    ),
    true,
    "An async host row replacement must preserve the active draft control.",
  );
  assert.equal(
    (await explicit
      .getByText("Source data changed. Your draft is preserved.")
      .count()) > 0,
    true,
  );

  await stalePrimaryName.evaluate((input) => {
    input.dispatchEvent(
      new KeyboardEvent("keydown", { bubbles: true, key: "Enter" }),
    );
    input.dispatchEvent(
      new KeyboardEvent("keydown", { bubbles: true, key: "Enter" }),
    );
  });
  assert.equal(
    await desktop
      .getByRole("status", { name: "Explicit save count" })
      .textContent(),
    "1",
    "Same-tick saves must use one synchronous row lock.",
  );
  const savingPrimary = explicitTable.getByRole("button", {
    name: "Saving Server primary route…",
  });
  await savingPrimary.waitFor();
  assert.equal(await savingPrimary.isDisabled(), true);
  await explicitTable
    .getByRole("button", { name: "Edit Server primary route" })
    .waitFor();

  const createName = explicitTable.getByRole("textbox", {
    name: "Name for New route",
  });
  await createName.press("Enter");
  assert.equal(
    (await explicit.getByText("Name is required.").count()) > 0,
    true,
  );
  await createName.fill("Created route");
  await createName.evaluate((input) => {
    input.dispatchEvent(
      new KeyboardEvent("keydown", { bubbles: true, key: "Enter" }),
    );
    input.dispatchEvent(
      new KeyboardEvent("keydown", { bubbles: true, key: "Enter" }),
    );
  });
  assert.equal(
    await desktop.getByRole("status", { name: "Create count" }).textContent(),
    "1",
    "Same-tick create must run once.",
  );
  const creatingRoute = explicitTable.getByRole("button", {
    name: "Creating New route…",
  });
  await creatingRoute.waitFor();
  assert.equal(await creatingRoute.isDisabled(), true);
  const createdEdit = explicitTable.getByRole("button", {
    name: "Edit Created route",
  });
  await createdEdit.waitFor();
  assert.equal(
    await createdEdit.evaluate((element) => element === document.activeElement),
    true,
    "Async create replacement must focus the created row.",
  );

  await explicitTable
    .getByRole("button", { name: "Edit Server primary route" })
    .press("Delete");
  const failedDialog = desktop.getByRole("dialog", { name: "Delete route?" });
  await failedDialog
    .getByRole("button", { name: "Confirm delete Server primary route" })
    .click();
  assert.equal(
    await failedDialog.getByRole("alert").textContent(),
    "The row could not be deleted. The row is unchanged.",
    "A failed delete must keep its corrective error inside the active dialog.",
  );
  assert.equal(
    (await explicitTable
      .getByText("Draft primary route", { exact: true })
      .count()) > 0,
    true,
  );
  await desktop
    .getByRole("button", { name: "Remove external target" })
    .evaluate((button) => button.click());
  await failedDialog.waitFor({ state: "hidden" });
  const backupEditAfterExternalRemoval = explicitTable.getByRole("button", {
    name: "Edit Backup route",
  });
  assert.equal(
    await backupEditAfterExternalRemoval.evaluate(
      (element) => element === document.activeElement,
    ),
    true,
    "An externally removed dialog target must focus the nearest row.",
  );
  await desktop
    .getByRole("button", { name: "Restore external target" })
    .evaluate((button) => button.click());
  await explicitTable
    .getByRole("button", { name: "Edit Reappeared route" })
    .waitFor();
  assert.equal(await failedDialog.isVisible(), false);
  assert.equal(
    await explicit
      .getByText("The row could not be deleted. The row is unchanged.")
      .count(),
    0,
    "A reappeared row ID must not receive the prior record's error.",
  );

  const backupDelete = explicitTable.getByRole("button", {
    name: "Delete Backup route",
  });
  await backupDelete.click();
  const dialog = desktop.getByRole("dialog", { name: "Delete route?" });
  assert.equal(
    await dialog
      .getByText("Delete Backup route and its assignment.")
      .isVisible(),
    true,
  );
  const confirmDelete = dialog.getByRole("button", {
    name: "Confirm delete Backup route",
  });
  await confirmDelete.evaluate((button) => {
    button.click();
    button.click();
    const cancel = [
      ...button.closest("dialog").querySelectorAll("button"),
    ].find((candidate) => candidate.textContent === "Cancel");
    cancel.click();
  });
  await desktop.waitForTimeout(10);
  assert.equal(
    await dialog.isVisible(),
    true,
    "Same-tick cancel must not close an in-flight delete.",
  );
  assert.equal(
    await desktop.getByRole("status", { name: "Delete count" }).textContent(),
    "2",
    "Same-tick delete must run once.",
  );
  await dialog.waitFor({ state: "hidden" });
  await explicitTable
    .getByText("Backup route", { exact: true })
    .waitFor({ state: "detached" });
  assert.equal(
    await explicitTable
      .getByRole("button", { name: "Edit Created route" })
      .evaluate((element) => element === document.activeElement),
    true,
    "Delete must focus the nearest available row control.",
  );

  const moveCreatedUp = explicitTable.getByRole("button", {
    name: "Move Created route up",
  });
  await moveCreatedUp.evaluate((button) => {
    button.click();
    button.click();
  });
  assert.equal(
    await desktop.getByRole("status", { name: "Reorder count" }).textContent(),
    "1",
    "Same-tick reorder must run once.",
  );

  const automatic = desktop.getByRole("region", {
    name: "Automatic routes",
    exact: true,
  });
  const automaticName = automatic.getByRole("textbox", {
    name: "Name for Automatic route",
  });
  await automaticName.fill("Canceled with keyboard");
  await automaticName.press("Tab");
  await automatic
    .getByRole("combobox", { name: "Provider for Automatic route" })
    .press("Tab");
  const automaticCancel = automatic.getByRole("button", {
    name: "Cancel Automatic route",
  });
  assert.equal(
    await automaticCancel.evaluate(
      (element) => element === document.activeElement,
    ),
    true,
    "Tab must move from the edit controls to the same row action.",
  );
  await automaticCancel.press("Enter");
  assert.equal(
    await desktop
      .getByRole("status", { name: "Automatic save count" })
      .textContent(),
    "0",
    "Cancel-caused blur must not autosave.",
  );
  assert.equal(
    await desktop
      .getByRole("status", { name: "Automatic cancel count" })
      .textContent(),
    "1",
  );
  await automatic
    .getByRole("button", { name: "Edit Automatic route" })
    .first()
    .click();
  await automatic
    .getByRole("textbox", { name: "Name for Automatic route" })
    .fill("Automatic draft");
  await desktop
    .getByRole("button", { name: "Outside automatic table" })
    .click();
  assert.equal(
    await desktop
      .getByRole("status", { name: "Automatic save count" })
      .textContent(),
    "1",
    "Outside blur must autosave a dirty row.",
  );
  await automatic
    .getByRole("button", { name: "Edit Automatic route" })
    .first()
    .click();
  const escapeDraft = automatic.getByRole("textbox", {
    name: "Name for Automatic route",
  });
  await escapeDraft.fill("Canceled automatic draft");
  await escapeDraft.press("Escape");
  await desktop.waitForTimeout(40);
  assert.equal(
    await desktop
      .getByRole("status", { name: "Automatic save count" })
      .textContent(),
    "1",
    "Escape-caused blur must not autosave the canceled draft.",
  );
  assert.equal(
    await automatic
      .getByRole("button", { name: "Edit Automatic route" })
      .first()
      .evaluate((element) => element === document.activeElement),
    true,
    "Escape must restore focus to the row edit control.",
  );
  assert.equal(
    await desktop
      .getByRole("status", { name: "Automatic cancel count" })
      .textContent(),
    "2",
  );

  const batch = desktop.getByRole("region", { name: "Batch routes editor" });
  await batch
    .getByRole("textbox", { name: "Name for Batch one" })
    .press("Enter");
  assert.equal(
    await desktop
      .getByRole("status", { name: "Batch save count" })
      .textContent(),
    "0",
    "Enter must not bypass the batch commit action.",
  );
  await batch.getByRole("button", { name: "Save 2 changes" }).click();
  assert.equal(
    await desktop
      .getByRole("status", { name: "Batch save count" })
      .textContent(),
    "2",
  );

  const failure = desktop.getByRole("region", {
    name: "Failure routes",
    exact: true,
  });
  const failureInput = failure.getByRole("textbox", {
    name: "Name for Failure route",
  });
  await failureInput.fill("Preserved retry draft");
  await failure
    .getByRole("button", { name: "Save Failure route" })
    .evaluate((button) => {
      button.click();
      const row = button.closest("[data-data-table-row]");
      row.querySelector('[data-data-table-control="action:cancel"]').click();
    });
  assert.equal(
    await desktop
      .getByRole("status", { name: "Failure cancel count" })
      .textContent(),
    "0",
    "Same-tick cancel must not close an in-flight save.",
  );
  assert.equal(
    await failure.getByRole("alert").first().textContent(),
    "The row could not be saved. Your draft is preserved.",
  );
  assert.equal(await failureInput.inputValue(), "Preserved retry draft");
  await failure.getByRole("button", { name: "Save Failure route" }).click();
  assert.equal(
    await desktop
      .getByRole("status", { name: "Failure save count" })
      .textContent(),
    "2",
  );
  assert.equal(
    await failure
      .getByRole("button", { name: "Save Failure route" })
      .isDisabled(),
    true,
  );

  assert.deepEqual(
    (await new AxeBuilder({ page: desktop }).analyze()).violations,
    [],
  );
  assert.deepEqual(desktopErrors, []);

  const phoneContext = await browser.newContext({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  });
  const phone = await phoneContext.newPage();
  const phoneErrors = await loadFixture(phone);
  const phoneExplicit = phone.getByRole("region", {
    name: "Explicit routes",
    exact: true,
  });
  assert.equal(
    await phoneExplicit
      .getByRole("list", { name: "Explicit routes cards" })
      .isVisible(),
    true,
  );
  assert.equal(
    await phoneExplicit
      .getByText("Connected provider", { exact: true })
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
    "Phone cards must not cause page-level overflow.",
  );
  await phone.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });
  assert.equal(
    await phone.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
    true,
    "Phone cards must reflow at 200% text.",
  );
  assert.deepEqual(
    (await new AxeBuilder({ page: phone }).analyze()).violations,
    [],
  );
  assert.deepEqual(phoneErrors, []);

  await desktopContext.close();
  await phoneContext.close();
} finally {
  await browser.close();
}

process.stdout.write("Editable table browser checks passed.\n");
