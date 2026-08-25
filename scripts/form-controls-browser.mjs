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
import {
  AdvancedFieldsDisclosure,
  Button,
  DateTime,
  FileDropZone,
  FormActions,
  FormField,
  FormSection,
  InlineAlert,
  SearchableSelect,
  SecretRevealPanel,
} from "./dist/index.js";

const options = [
  { value: "alpha", label: "Alpha model", description: "Fast text model" },
  { value: "beta", label: "Beta model", description: "Not available", disabled: true },
  { value: "gamma", label: "Gamma vision", description: "Image input" },
];

function Fixture() {
  const [model, setModel] = useState("alpha");
  const [files, setFiles] = useState([]);
  const [fileEvents, setFileEvents] = useState(0);
  const [copied, setCopied] = useState("");
  const [secret, setSecret] = useState("router-secret-value");
  return <main>
    <h1>Shared form controls</h1>
    <FormSection
      actions={<Button>Save settings</Button>}
      columns={2}
      description="Use shared controls for current service settings."
      legend="Service settings"
    >
      <FormField
        error="Use a unique provider name."
        help="This name is part of the public API."
        label="Provider name"
        requirement="required"
      >
        <input defaultValue="provider-a" name="provider" required />
      </FormField>
      <SearchableSelect
        help="Search by model name or capability."
        label="Model"
        maxVisibleOptions={2}
        name="model"
        onChange={(value) => setModel(value)}
        options={options}
        required
        value={model}
      />
      <AdvancedFieldsDisclosure
        description="Only set a limit when the provider requires one."
        summary="Advanced provider fields"
      >
        <FormField label="Token limit" requirement="optional">
          <input min="1" type="number" />
        </FormField>
      </AdvancedFieldsDisclosure>
      <FileDropZone
        accept="text/plain"
        description="Text files, up to the host limit."
        inputLabel="Local text files"
        multiple
        onFiles={(nextFiles) => {
          setFiles(nextFiles.map((file) => file.name));
          setFileEvents((value) => value + 1);
        }}
        title="Drop files here"
      />
    </FormSection>
    <output aria-label="Selected model">{model}</output>
    <output aria-label="Selected files">{files.join(", ")}</output>
    <output aria-label="File selection events">{fileEvents}</output>
    <InlineAlert title="Review needed" tone="warning">
      Check the provider limit before you save.
    </InlineAlert>
    <h2>Credentials</h2>
    {secret ? <SecretRevealPanel
      copySecret={async (value) => setCopied(value)}
      headingLevel="h3"
      onDismiss={() => setSecret("")}
      secret={secret}
      secretLabel="Service key"
      title="Store this key now"
    /> : null}
    {secret ? <Button onClick={() => setSecret("replacement-secret-value")}>
      Replace secret
    </Button> : null}
    <output aria-label="Copied secret">{copied}</output>
    <p>Created <DateTime
      format={{ dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }}
      locale="en-GB"
      value="2026-08-25T13:45:00Z"
    /></p>
    <FormActions alignment="between">
      <Button variant="quiet">Cancel</Button>
      <Button>Continue</Button>
    </FormActions>
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
    sourcefile: "form-controls-browser-fixture.jsx",
  },
  write: false,
});
const browserScript = bundle.outputFiles[0]?.text;
assert.ok(browserScript, "The form controls fixture must build one script.");
const css = await readFile(
  new URL("../styles/tokens.css", import.meta.url),
  "utf8",
);
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Form control checks</title><style>${css}main{display:grid;width:min(100% - 2rem,64rem);margin:2rem auto;gap:1rem}</style></head><body><div id="root"></div></body></html>`;
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
  await page.getByRole("heading", { name: "Shared form controls" }).waitFor();
  return errors;
}

try {
  const desktopContext = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });
  const desktop = await desktopContext.newPage();
  const desktopErrors = await loadFixture(desktop);

  assert.equal(
    await desktop
      .getByRole("textbox", { name: "Provider name", exact: true })
      .count(),
    1,
    "The visual requirement must not change the control accessible name.",
  );

  const combobox = desktop.getByRole("combobox", { name: "Model" });
  await combobox.focus();
  const listbox = desktop.getByRole("listbox", { name: "Model" });
  await listbox.waitFor();
  assert.equal(await listbox.getByRole("option").count(), 3);
  assert.equal(
    await listbox.getByRole("option", { name: /Beta model/ }).isDisabled(),
    true,
  );

  await combobox.fill("vision");
  assert.equal(await listbox.getByRole("option").count(), 1);
  await desktop.keyboard.press("Enter");
  assert.equal(
    await desktop.getByRole("status", { name: "Selected model" }).textContent(),
    "gamma",
  );
  assert.equal(await combobox.inputValue(), "Gamma vision");
  assert.equal(await listbox.count(), 0);

  await desktop.getByRole("button", { name: "Save settings" }).focus();
  await combobox.focus();
  await combobox.fill("no match");
  assert.equal(
    await desktop.getByText("No matching options").isVisible(),
    true,
  );
  await desktop.keyboard.press("Escape");
  assert.equal(await combobox.inputValue(), "Gamma vision");
  assert.equal(await listbox.count(), 0);

  await desktop.getByRole("button", { name: "Save settings" }).focus();
  await combobox.focus();
  await listbox.waitFor();
  assert.match(
    (await combobox.getAttribute("aria-activedescendant")) ?? "",
    /-option-1$/,
    "A reopened list must activate the selected unfiltered option.",
  );
  await desktop.keyboard.press("Escape");

  const disclosure = desktop.getByText("Advanced provider fields", {
    exact: true,
  });
  await disclosure.click();
  assert.equal(
    await desktop
      .locator(".od-advanced-fields")
      .evaluate((element) => element.open),
    true,
  );

  const dropZone = desktop.locator(".od-file-drop-zone");
  await dropZone.evaluate((element) => {
    const transfer = new DataTransfer();
    transfer.items.add(
      new File(["shared"], "shared.txt", { type: "text/plain" }),
    );
    element.dispatchEvent(
      new DragEvent("dragenter", { bubbles: true, dataTransfer: transfer }),
    );
  });
  await desktop.waitForFunction(
    () =>
      document
        .querySelector(".od-file-drop-zone")
        ?.getAttribute("data-drag-active") === "true",
  );
  assert.equal(await dropZone.getAttribute("data-drag-active"), "true");
  await dropZone.evaluate((element) => {
    const transfer = new DataTransfer();
    transfer.items.add(
      new File(["shared"], "shared.txt", { type: "text/plain" }),
    );
    element.dispatchEvent(
      new DragEvent("drop", { bubbles: true, dataTransfer: transfer }),
    );
  });
  await desktop.waitForFunction(
    () =>
      document.querySelector('[aria-label="Selected files"]')?.textContent ===
      "shared.txt",
  );
  assert.equal(
    await desktop.getByRole("status", { name: "Selected files" }).textContent(),
    "shared.txt",
  );
  assert.equal(await dropZone.getAttribute("data-drag-active"), null);

  const fileInput = desktop.getByLabel("Local text files");
  const selectionEvents = desktop.getByRole("status", {
    name: "File selection events",
  });
  await fileInput.setInputFiles({
    name: "repeat.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("repeat"),
  });
  await fileInput.setInputFiles({
    name: "repeat.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("repeat"),
  });
  assert.equal(await selectionEvents.textContent(), "3");

  const copyButton = desktop.getByRole("button", { name: "Copy secret" });
  await copyButton.click();
  assert.equal(
    await desktop.getByRole("status", { name: "Copied secret" }).textContent(),
    "router-secret-value",
  );
  await desktop.getByRole("button", { name: "Copied" }).waitFor();
  assert.equal(
    await desktop.getByRole("button", { name: "Copied" }).isVisible(),
    true,
  );
  await desktop.getByRole("button", { name: "Replace secret" }).click();
  assert.equal(
    await desktop.getByRole("button", { name: "Copy secret" }).isVisible(),
    true,
  );
  assert.equal(
    await desktop.getByRole("status", { name: "Service key" }).textContent(),
    "replacement-secret-value",
  );
  await desktop.getByRole("button", { name: "I stored the secret" }).click();
  assert.equal(
    await desktop.getByRole("heading", { name: "Store this key now" }).count(),
    0,
  );

  const desktopAxe = await new AxeBuilder({ page: desktop }).analyze();
  assert.deepEqual(desktopAxe.violations, []);
  assert.deepEqual(desktopErrors, []);
  await desktopContext.close();

  const phoneContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const phone = await phoneContext.newPage();
  const phoneErrors = await loadFixture(phone);
  const sectionWidth = await phone
    .locator(".od-form-section")
    .evaluate((section) => section.getBoundingClientRect().width);
  const fieldWidths = await phone
    .locator(".od-form-section-fields > *")
    .evaluateAll((fields) =>
      fields.map((field) => field.getBoundingClientRect().width),
    );
  assert.equal(
    fieldWidths.every((width) => Math.abs(width - sectionWidth + 32) < 3),
    true,
    "Phone form controls must use one column inside the section padding.",
  );
  const phoneAxe = await new AxeBuilder({ page: phone }).analyze();
  assert.deepEqual(phoneAxe.violations, []);
  assert.deepEqual(phoneErrors, []);
  await phoneContext.close();
} finally {
  await browser.close();
}
