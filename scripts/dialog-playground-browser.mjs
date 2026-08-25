import { strict as assert } from "node:assert";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import AxeBuilder from "@axe-core/playwright";
import { chromium } from "@playwright/test";
import { build } from "esbuild";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));
const fixtureSource = String.raw`
import React, { StrictMode, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Button, ConfirmationDialog, Dialog, EditableTable, GraphInspector, OperationPlayground } from "./dist/index.js";

const emptyState = { status: "empty" };
const errorState = { status: "error", error: {
  title: "Target call failed", message: "The target rejected the request.",
  correction: "Review the complete request and retry.", code: "target_rejected",
} };
const initialRequest = {
  operation: "model", input: "Preserved request", systemPrompt: "Be concise",
  temperature: 0.2, outputLimit: 80,
};
const editableRows = [{
  id: "workspace-a", label: "Workspace Alpha", draft: { name: "Workspace Alpha" },
}];
const editableColumns = [{
  key: "name", header: "Name",
  renderRead: ({ row }) => row.draft.name,
  renderEdit: ({ row }) => <input aria-label={"Name " + row.label} readOnly value={row.draft.name} />,
}];

function Fixture() {
  const [dialog, setDialog] = useState(null);
  const [pending, setPending] = useState(false);
  const [request, setRequest] = useState(initialRequest);
  const [lastRun, setLastRun] = useState("none");
  const [changes, setChanges] = useState(0);
  const [providerUnavailable, setProviderUnavailable] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [inspectorCloseCount, setInspectorCloseCount] = useState(0);
  const initialFocusRef = useRef(null);
  const inspectorTriggerRef = useRef(null);
  return <main>
    <GraphInspector
      onClose={() => setInspectorCloseCount((value) => value + 1)}
      onKeyDownCapture={(event) => {
        if (event.key === "Escape") event.stopPropagation();
      }}
      open
      title="Assignment inspector"
    >
      <Button ref={inspectorTriggerRef} onClick={() => setDialog("wide")}>Open wide dialog</Button>
      <Button onClick={() => setConfirmationOpen(true)}>Delete exact assignment</Button>
      <ConfirmationDialog
        confirmLabel="Delete assignment"
        description="Delete the exact inspected assignment."
        onCancel={() => setConfirmationOpen(false)}
        onConfirm={() => undefined}
        open={confirmationOpen}
        title="Confirm assignment deletion"
      />
      <EditableTable
        ariaLabel="Inspector workspaces"
        columns={editableColumns}
        onDelete={() => undefined}
        onDraftChange={() => undefined}
        rows={editableRows}
      />
    </GraphInspector>
    <output aria-label="Inspector close count">{inspectorCloseCount}</output>
    <div className="fixture-openers">
      <Button onClick={() => setDialog("narrow")}>Open narrow dialog</Button>
      <Button onClick={() => setDialog("default")}>Open default dialog</Button>
      <Button onClick={() => { setPending(true); setDialog("pending"); }}>Open pending dialog</Button>
    </div>
    <Dialog
      actions={<Button disabled={pending} onClick={() => setDialog(null)}>Save and close</Button>}
      closeDisabled={pending}
      description="The header and actions stay fixed while this body scrolls."
      initialFocusRef={initialFocusRef}
      onClose={() => setDialog(null)}
      open={dialog !== null}
      returnFocusRef={dialog === "wide" ? inspectorTriggerRef : undefined}
      size={dialog === "pending" || dialog === null ? "default" : dialog}
      title="General dialog"
    >
      <label>Initial field<input ref={initialFocusRef} defaultValue="Current value" /></label>
      <details><summary>Extra options</summary><input aria-label="Extra value" /></details>
      {Array.from({length: 32}, (_, index) => <p key={index}>Scrollable dialog row {index + 1}</p>)}
      {pending ? <Button onClick={() => setPending(false)}>Finish pending work</Button> : null}
    </Dialog>
    <output aria-label="Last exact run">{lastRun}</output>
    <output aria-label="Target changes">{changes}</output>
    <Button onClick={() => setProviderUnavailable(true)}>Make provider target unavailable</Button>
    <OperationPlayground
      fixedTarget={{
        selection: { kind: "assignment", id: "assignment/support" },
        label: "Support assignment", detail: "Ordered route",
        context: { label: "Service context", value: "Service Alpha" },
        operations: [{ operation: "model", controls: ["system-prompt", "output-limit"] }],
      }}
      id="assignment-playground"
      onChangeTarget={() => setChanges((value) => value + 1)}
      onRun={(value, target) => setLastRun(target.kind + ":" + target.id + ":" + value.input)}
      onValueChange={setRequest}
      runState={errorState}
      title="Assignment operation"
      value={request}
    />
    <OperationPlayground
      fixedTarget={{
        selection: { kind: "provider-model", id: "provider/model" },
        label: "Provider model", operations: [{ operation: "image", controls: ["input-images"] }],
        state: providerUnavailable
          ? { status: "unavailable", message: "The model was removed after this view opened." }
          : { status: "available" },
      }}
      id="provider-playground"
      inputImages={[{ id: "image-a", name: "preserved.png" }]}
      onAddInputImages={() => undefined}
      onRun={(value, target) => setLastRun(target.kind + ":" + target.id + ":" + value.input)}
      onValueChange={() => undefined}
      runState={emptyState}
      title="Exact provider-model operation"
      value={{ ...initialRequest, operation: "image", input: "Preserved image request" }}
    />
  </main>;
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
    sourcefile: "dialog-playground-browser-fixture.jsx",
  },
  write: false,
});
const browserScript = bundle.outputFiles[0]?.text;
assert.ok(browserScript, "The dialog fixture must build one script.");
const css = await readFile(
  new URL("../styles/tokens.css", import.meta.url),
  "utf8",
);
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Dialog checks</title><style>${css}.fixture-openers{display:flex;gap:1rem;margin:2rem}.od-playground{margin:2rem}</style></head><body><div id="root"></div></body></html>`;
const browser = await chromium.launch({
  executablePath: existsSync("/usr/bin/google-chrome")
    ? "/usr/bin/google-chrome"
    : undefined,
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
  await page.getByRole("heading", { name: "Assignment inspector" }).waitFor();
  return errors;
}

try {
  const desktopContext = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const desktop = await desktopContext.newPage();
  const desktopErrors = await loadFixture(desktop);
  const dialog = desktop.getByRole("dialog", { name: "General dialog" });
  const deleteOpener = desktop.getByRole("button", {
    name: "Delete exact assignment",
  });
  await deleteOpener.click();
  const confirmation = desktop.getByRole("dialog", {
    name: "Confirm assignment deletion",
  });
  assert.equal(
    await confirmation
      .getByRole("button", { name: "Cancel" })
      .evaluate((element) => element === document.activeElement),
    true,
  );
  await desktop.keyboard.press("Escape");
  await desktop.waitForFunction(
    () =>
      document.activeElement?.textContent?.trim() === "Delete exact assignment",
  );
  assert.equal(await confirmation.isVisible(), false);
  assert.equal(
    await deleteOpener.evaluate(
      (element) => element === document.activeElement,
    ),
    true,
    "A keyed confirmation must restore the exact opener inside an inspector.",
  );
  assert.equal(
    await desktop
      .getByRole("status", { name: "Inspector close count" })
      .textContent(),
    "0",
  );
  const rowDeleteOpener = desktop.getByRole("button", {
    name: "Delete Workspace Alpha",
  });
  const rowDeleteElement = await rowDeleteOpener.elementHandle();
  assert.ok(rowDeleteElement, "The visible row Delete opener must exist.");
  await rowDeleteOpener.click();
  const rowConfirmation = desktop.getByRole("dialog", {
    name: "Delete Workspace Alpha?",
  });
  assert.equal(
    await rowConfirmation
      .getByRole("button", { name: "Cancel" })
      .evaluate((element) => element === document.activeElement),
    true,
  );
  await desktop.keyboard.press("Escape");
  await desktop.waitForFunction(
    () =>
      document.activeElement?.matches(
        '[data-data-table-control="action:delete"]',
      ) === true &&
      document.activeElement.textContent?.trim() === "Delete Workspace Alpha",
  );
  assert.equal(await rowConfirmation.isVisible(), false);
  assert.equal(
    await rowDeleteElement.evaluate(
      (element) => element.isConnected && element === document.activeElement,
    ),
    true,
    "An EditableTable confirmation must restore its exact row action opener.",
  );
  assert.equal(
    await desktop
      .getByRole("status", { name: "Inspector close count" })
      .textContent(),
    "0",
  );
  const sizeCases = [
    ["Open narrow dialog", 544],
    ["Open default dialog", 832],
    ["Open wide dialog", 1152],
  ];
  for (const [name, expectedWidth] of sizeCases) {
    const opener = desktop.getByRole("button", { name });
    await opener.click();
    assert.equal(await dialog.evaluate((element) => element.open), true);
    assert.equal(
      await dialog
        .getByRole("textbox", { name: "Initial field" })
        .evaluate((element) => element === document.activeElement),
      true,
      "The explicit initial control must receive focus in Strict Mode.",
    );
    assert.equal(Math.round((await dialog.boundingBox()).width), expectedWidth);
    for (let index = 0; index < 6; index += 1)
      await desktop.keyboard.press("Tab");
    const focusState = await dialog.evaluate((element) => ({
      contained:
        element === document.activeElement ||
        element.contains(document.activeElement),
      active: `${document.activeElement?.tagName ?? "none"} ${
        document.activeElement?.getAttribute("aria-label") ?? ""
      }`.trim(),
    }));
    assert.equal(
      focusState.contained,
      true,
      `Tab focus must stay in the native modal. Active: ${focusState.active}`,
    );
    const frameBefore = await dialog.evaluate((element) => ({
      header: element.querySelector(".od-dialog-header").getBoundingClientRect()
        .top,
      footer: element
        .querySelector(".od-dialog-actions")
        .getBoundingClientRect().bottom,
    }));
    await dialog.locator(".od-dialog-body").evaluate((element) => {
      element.scrollTop = element.scrollHeight;
    });
    const frameAfter = await dialog.evaluate((element) => ({
      header: element.querySelector(".od-dialog-header").getBoundingClientRect()
        .top,
      footer: element
        .querySelector(".od-dialog-actions")
        .getBoundingClientRect().bottom,
    }));
    assert.deepEqual(
      frameAfter,
      frameBefore,
      "Only the dialog body can scroll.",
    );
    await desktop.keyboard.press("Escape");
    assert.equal(await dialog.isVisible(), false);
    assert.equal(
      await opener.evaluate((element) => element === document.activeElement),
      true,
    );
  }

  const pendingOpener = desktop.getByRole("button", {
    name: "Open pending dialog",
  });
  await pendingOpener.click();
  await desktop.keyboard.press("Escape");
  assert.equal(await dialog.isVisible(), true);
  await desktop.mouse.click(1, 1);
  assert.equal(await dialog.isVisible(), true);
  assert.equal(
    await dialog.getByRole("button", { name: "Close dialog" }).isDisabled(),
    true,
  );
  await dialog.getByRole("button", { name: "Finish pending work" }).click();
  await desktop.mouse.click(1, 1);
  assert.equal(await dialog.isVisible(), false);
  assert.equal(
    await pendingOpener.evaluate(
      (element) => element === document.activeElement,
    ),
    true,
  );

  assert.equal(await desktop.getByLabel(/target:/).count(), 2);
  assert.equal(
    await desktop.getByText("Support assignment", { exact: true }).count(),
    1,
  );
  assert.equal(
    await desktop.getByText("Service Alpha", { exact: true }).count(),
    1,
  );
  assert.equal(
    await desktop.locator("#assignment-playground-target").count(),
    0,
  );
  assert.equal(
    await desktop.locator("#assignment-playground-operation").count(),
    0,
  );
  assert.equal(
    await desktop.locator("#assignment-playground-system-prompt").count(),
    1,
  );
  assert.equal(
    await desktop.locator("#assignment-playground-temperature").count(),
    0,
  );
  assert.equal(
    await desktop.getByText("Review the complete request and retry.").count(),
    1,
  );
  await desktop.getByRole("button", { name: "Run operation" }).first().click();
  assert.equal(
    await desktop.getByRole("status", { name: "Last exact run" }).textContent(),
    "assignment:assignment/support:Preserved request",
  );
  await desktop.getByRole("button", { name: "Change target" }).click();
  assert.equal(
    await desktop.getByRole("status", { name: "Target changes" }).textContent(),
    "1",
  );

  await desktop.getByRole("button", { name: "Run operation" }).nth(1).click();
  assert.equal(
    await desktop.getByRole("status", { name: "Last exact run" }).textContent(),
    "provider-model:provider/model:Preserved image request",
  );
  await desktop
    .getByRole("button", { name: "Make provider target unavailable" })
    .click();

  const stale = desktop
    .getByRole("heading", { name: "Exact provider-model operation" })
    .locator("xpath=ancestor::section[@data-target-mode='fixed']");
  assert.equal(await stale.getByText("Target unavailable").count(), 1);
  assert.equal(
    await stale.getByRole("textbox", { name: "Prompt" }).inputValue(),
    "Preserved image request",
  );
  assert.equal(await stale.getByText("preserved.png").count(), 1);
  assert.equal(
    await stale.getByRole("button", { name: "Run operation" }).isDisabled(),
    true,
  );
  assert.equal(
    await stale.getByRole("textbox", { name: "Prompt" }).isEnabled(),
    true,
  );
  assert.deepEqual(
    (await new AxeBuilder({ page: desktop }).analyze()).violations,
    [],
  );
  assert.deepEqual(desktopErrors, []);
  await desktopContext.close();

  const phoneContext = await browser.newContext({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  });
  const phone = await phoneContext.newPage();
  const phoneErrors = await loadFixture(phone);
  await phone.getByRole("button", { name: "Open narrow dialog" }).tap();
  const phoneDialog = phone.getByRole("dialog", { name: "General dialog" });
  assert.deepEqual(
    await phoneDialog.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      return { width: bounds.width, height: bounds.height };
    }),
    { width: 390, height: 844 },
  );
  assert.equal(
    await phoneDialog
      .locator(".od-dialog-body")
      .evaluate((element) => getComputedStyle(element).overflowY),
    "auto",
  );
  assert.deepEqual(
    (await new AxeBuilder({ page: phone }).analyze()).violations,
    [],
  );
  await phone.keyboard.press("Escape");
  assert.deepEqual(phoneErrors, []);
  await phoneContext.close();
} finally {
  await browser.close();
}

process.stdout.write("Dialog and playground browser checks passed.\n");
