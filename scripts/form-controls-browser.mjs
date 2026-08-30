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
  AsyncSearchableSelect,
  Button,
  CheckboxControl,
  DateTime,
  FileDropZone,
  FormActions,
  FormField,
  FormSection,
  InlineAlert,
  NumberControl,
  SearchableSelect,
  SelectControl,
  SecretRevealPanel,
  SwitchControl,
  TextareaControl,
  TextControl,
} from "./dist/index.js";

const options = [
  { value: "alpha", label: "Alpha model", description: "Fast text model" },
  { value: "beta", label: "Beta model", description: "Not available", disabled: true },
  { value: "gamma", label: "Gamma vision", description: "Image input" },
];

const asyncSelectorEvents = [];
const asyncSelectorAttempts = new Map();
window.asyncSelectorEvents = asyncSelectorEvents;

function waitForAsyncResult(delay, signal, event, ignoreAbort = false) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const timer = window.setTimeout(() => {
      settled = true;
      resolve();
    }, delay);
    signal.addEventListener("abort", () => {
      if (settled) return;
      event.aborted = true;
      if (ignoreAbort) return;
      window.clearTimeout(timer);
      reject(new DOMException("The request was cancelled.", "AbortError"));
    }, { once: true });
  });
}

async function loadAsyncOptions({ cursor, query, signal }) {
  const event = {
    aborted: false,
    cursor,
    query,
    startedAt: performance.now(),
  };
  asyncSelectorEvents.push(event);
  const key = query + ":" + (cursor ?? "initial");
  const attempt = (asyncSelectorAttempts.get(key) ?? 0) + 1;
  asyncSelectorAttempts.set(key, attempt);
  const staleRequest =
    query === "slow-resolve" ||
    query === "slow-reject" ||
    (query === "selection-loading" && cursor === "selection-page-2");
  const cursorRequest = query === "cursor" && cursor === "page-2";
  await waitForAsyncResult(
    staleRequest ? 550 : cursorRequest ? 120 : 35,
    signal,
    event,
    staleRequest,
  );

  if (query === "slow-reject") throw new Error("Late search failure");
  if (query === "fail" && attempt === 1) throw new Error("Search failure");
  if (cursorRequest && attempt === 1) throw new Error("Cursor failure");
  if (query === "empty") return { options: [] };
  if (query === "invalid-cursor") {
    return {
      nextCursor: " ",
      options: [{ value: "invalid-cursor-result", label: "Invalid cursor result" }],
    };
  }
  if (query === "cursor-cycle" && cursor === null) {
    return {
      nextCursor: "cycle-a",
      options: [{ value: "cycle-one", label: "Cycle one" }],
    };
  }
  if (query === "cursor-cycle" && cursor === "cycle-a") {
    return {
      nextCursor: "cycle-b",
      options: [{ value: "cycle-two", label: "Cycle two" }],
    };
  }
  if (query === "cursor-cycle" && cursor === "cycle-b") {
    return {
      nextCursor: "cycle-a",
      options: [{ value: "cycle-three", label: "Cycle three" }],
    };
  }
  if (query === "selection-loading" && cursor === null) {
    return {
      nextCursor: "selection-page-2",
      options: [{ value: "selection-one", label: "Selection one" }],
    };
  }
  if (query === "selection-loading" && cursor === "selection-page-2") {
    return {
      options: [{ value: "selection-two", label: "Selection two" }],
    };
  }
  if (query === "cursor" && cursor === null) {
    return {
      nextCursor: "page-2",
      options: [{ value: "page-one", label: "Page one" }],
    };
  }
  if (cursorRequest) {
    return {
      options: [
        { value: "page-one", label: "Page one duplicate" },
        { value: "page-two", label: "Page two" },
      ],
    };
  }
  if (query === "slow-resolve") {
    return { options: [{ value: "stale", label: "Stale resolve" }] };
  }
  if (query === "fail") {
    return { options: [{ value: "recovered", label: "Recovered result" }] };
  }
  if (query === "") {
    return {
      options: [
        { value: "alpha-service", label: "Alpha service" },
        { value: "beta-service", label: "Beta service" },
      ],
    };
  }
  return {
    options: [{ value: query, label: "Result for " + query }],
  };
}

function Fixture() {
  const [model, setModel] = useState("alpha");
  const [files, setFiles] = useState([]);
  const [fileEvents, setFileEvents] = useState(0);
  const [copied, setCopied] = useState("");
  const [secret, setSecret] = useState("router-secret-value");
  const [textValue, setTextValue] = useState("Initial text");
  const [numberValue, setNumberValue] = useState(2);
  const [selectValue, setSelectValue] = useState("alpha");
  const [textareaValue, setTextareaValue] = useState("Initial details");
  const [checkboxValue, setCheckboxValue] = useState(false);
  const [switchValue, setSwitchValue] = useState(false);
  const [asyncSelection, setAsyncSelection] = useState({
    value: "alpha-service",
    label: "Alpha service",
  });
  const [immediateSelection, setImmediateSelection] = useState(null);
  const [showUnmountSelector, setShowUnmountSelector] = useState(true);
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
    <FormSection legend="Asynchronous selector">
      <AsyncSearchableSelect
        allowNoSelection
        help="Search one bounded host source."
        label="Asynchronous service"
        loadOptions={loadAsyncOptions}
        name="async-service"
        noSelectionLabel="No service"
        onChange={setAsyncSelection}
        value={asyncSelection}
      />
      <output aria-label="Selected asynchronous service">
        {asyncSelection?.value ?? ""}
      </output>
      <AsyncSearchableSelect
        debounceMs={0}
        label="Immediate asynchronous service"
        loadOptions={loadAsyncOptions}
        onChange={setImmediateSelection}
        value={immediateSelection}
      />
      {showUnmountSelector ? <AsyncSearchableSelect
        debounceMs={0}
        label="Unmounted asynchronous service"
        loadOptions={loadAsyncOptions}
        onChange={() => undefined}
        value={null}
      /> : null}
      <Button onClick={() => setShowUnmountSelector(false)}>
        Unmount asynchronous selector
      </Button>
    </FormSection>
    <FormSection columns={2} legend="Controlled fields">
      <TextControl
        error="Review the text."
        help="Enter shared text."
        label="Shared text"
        onChange={(event) => setTextValue(event.currentTarget.value)}
        required
        value={textValue}
      />
      <NumberControl
        error="Review the number."
        help="Enter a shared number."
        label="Shared number"
        min={0}
        onChange={(event) => setNumberValue(Number(event.currentTarget.value))}
        required
        value={numberValue}
      />
      <SelectControl
        error="Review the choice."
        help="Select one shared choice."
        label="Shared choice"
        onChange={(event) => setSelectValue(event.currentTarget.value)}
        required
        value={selectValue}
      >
        <option value="alpha">Alpha</option>
        <option value="gamma">Gamma</option>
      </SelectControl>
      <TextareaControl
        error="Review the details."
        help="Enter shared details."
        label="Shared details"
        onChange={(event) => setTextareaValue(event.currentTarget.value)}
        required
        value={textareaValue}
      />
      <CheckboxControl
        checked={checkboxValue}
        error="Review the checkbox."
        help="Select the shared checkbox."
        label="Shared checkbox"
        onChange={(event) => setCheckboxValue(event.currentTarget.checked)}
        required
      />
      <SwitchControl
        checked={switchValue}
        error="Review the switch."
        help="Enable the shared switch."
        label="Shared switch"
        onChange={(event) => setSwitchValue(event.currentTarget.checked)}
        required
      />
      <TextControl disabled label="Disabled text" onChange={() => undefined} value="Text" />
      <NumberControl disabled label="Disabled number" onChange={() => undefined} value={1} />
      <SelectControl disabled label="Disabled choice" onChange={() => undefined} value="alpha">
        <option value="alpha">Alpha</option>
      </SelectControl>
      <TextareaControl disabled label="Disabled details" onChange={() => undefined} value="Details" />
      <CheckboxControl checked disabled label="Disabled checkbox" onChange={() => undefined} />
      <SwitchControl checked disabled label="Disabled switch" onChange={() => undefined} />
    </FormSection>
    <output aria-label="Shared text value">{textValue}</output>
    <output aria-label="Shared number value">{numberValue}</output>
    <output aria-label="Shared choice value">{selectValue}</output>
    <output aria-label="Shared details value">{textareaValue}</output>
    <output aria-label="Shared checkbox value">{String(checkboxValue)}</output>
    <output aria-label="Shared switch value">{String(switchValue)}</output>
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

  const asyncCombobox = desktop.getByRole("combobox", {
    name: "Asynchronous service",
    exact: true,
  });
  const asyncRoot = asyncCombobox.locator(
    "xpath=ancestor::div[contains(concat(' ', normalize-space(@class), ' '), ' od-async-searchable-select ')][1]",
  );
  await asyncCombobox.focus();
  assert.equal(
    await desktop
      .locator(".od-async-searchable-select-state")
      .getByText("Loading options…", { exact: true })
      .isVisible(),
    true,
    "The initial request must have a visible loading state.",
  );
  await desktop.getByRole("option", { name: "Alpha service" }).waitFor();
  assert.equal(
    await asyncRoot.locator("output.od-visually-hidden").textContent(),
    "2 options available.",
    "A completed search must announce its result count.",
  );
  assert.match(
    (await asyncCombobox.getAttribute("aria-activedescendant")) ?? "",
    /-choice-1$/,
    "The controlled selection must become the active descendant.",
  );
  await desktop.keyboard.press("ArrowDown");
  await desktop.keyboard.press("Enter");
  assert.equal(
    await desktop
      .getByRole("status", { name: "Selected asynchronous service" })
      .textContent(),
    "beta-service",
    "Arrow keys and Enter must commit the controlled selection.",
  );
  await asyncCombobox.click();
  await desktop.keyboard.press("ArrowDown");
  await desktop.keyboard.press("Enter");
  assert.equal(
    await desktop
      .getByRole("status", { name: "Selected asynchronous service" })
      .textContent(),
    "",
    "The optional no-selection choice must commit null.",
  );

  const eventCountBeforeDebounce = await desktop.evaluate(
    () => window.asyncSelectorEvents.length,
  );
  await asyncCombobox.focus();
  await asyncCombobox.fill("debounce-first");
  await desktop.waitForTimeout(100);
  await asyncCombobox.fill("debounce-final");
  await desktop.waitForTimeout(140);
  assert.equal(
    await desktop.evaluate(
      (start) => window.asyncSelectorEvents.slice(start).length,
      eventCountBeforeDebounce,
    ),
    0,
    "Search must wait for the default 250 ms debounce.",
  );
  await desktop
    .getByRole("option", {
      name: "Result for debounce-final",
    })
    .waitFor();
  assert.deepEqual(
    await desktop.evaluate(
      (start) =>
        window.asyncSelectorEvents.slice(start).map((event) => event.query),
      eventCountBeforeDebounce,
    ),
    ["debounce-final"],
    "The debounce must issue only the final search.",
  );

  await asyncCombobox.fill("slow-resolve");
  await desktop.waitForTimeout(280);
  await asyncCombobox.fill("fresh-result");
  await desktop
    .getByRole("option", {
      name: "Result for fresh-result",
    })
    .waitFor();
  await desktop.waitForTimeout(320);
  assert.equal(
    await desktop.getByRole("option", { name: "Stale resolve" }).count(),
    0,
    "A late resolved request must not replace current options.",
  );
  assert.equal(
    await desktop.evaluate(() =>
      window.asyncSelectorEvents.some(
        (event) => event.query === "slow-resolve" && event.aborted,
      ),
    ),
    true,
    "A new search must abort the prior signal.",
  );

  await asyncCombobox.fill("slow-reject");
  await desktop.waitForTimeout(280);
  await asyncCombobox.fill("after-reject");
  await desktop
    .getByRole("option", {
      name: "Result for after-reject",
    })
    .waitFor();
  await desktop.waitForTimeout(320);
  assert.equal(
    await desktop.getByText("Unable to load options.", { exact: true }).count(),
    0,
    "A late rejected request must not replace current error state.",
  );

  const closeEventStart = await desktop.evaluate(
    () => window.asyncSelectorEvents.length,
  );
  await asyncCombobox.fill("slow-resolve");
  await desktop.waitForFunction(
    (start) =>
      window.asyncSelectorEvents
        .slice(start)
        .some((event) => event.query === "slow-resolve"),
    closeEventStart,
  );
  await desktop.keyboard.press("Escape");
  await desktop.waitForTimeout(600);
  assert.equal(
    await asyncRoot.getByRole("listbox").count(),
    0,
    "Escape must close the asynchronous selector.",
  );
  assert.deepEqual(
    await desktop.evaluate(
      (start) =>
        window.asyncSelectorEvents.slice(start).map((event) => ({
          aborted: event.aborted,
          query: event.query,
        })),
      closeEventStart,
    ),
    [{ aborted: true, query: "slow-resolve" }],
    "Close must abort the request and must not start a closed search.",
  );

  await asyncCombobox.fill("empty");
  await desktop
    .locator(".od-async-searchable-select-state")
    .getByText("No options found.", { exact: true })
    .waitFor();
  assert.equal(
    await desktop.getByRole("option", { name: "No service" }).count(),
    1,
    "The empty state must keep the optional no-selection choice.",
  );

  await asyncCombobox.fill("fail");
  await desktop
    .locator(".od-async-searchable-select-state")
    .getByText("Unable to load options.", { exact: true })
    .waitFor();
  await desktop.getByRole("button", { name: "Retry", exact: true }).click();
  await desktop.getByRole("option", { name: "Recovered result" }).waitFor();

  await asyncCombobox.fill("cursor");
  await desktop.getByRole("option", { name: "Page one" }).waitFor();
  const loadMore = desktop.getByRole("button", { name: "Load more" });
  await loadMore.focus();
  await desktop.keyboard.press("Enter");
  await desktop
    .getByRole("button", { name: "Loading more options…" })
    .waitFor();
  await desktop
    .locator(".od-async-searchable-select-cursor")
    .getByText("Unable to load more options.", { exact: true })
    .waitFor();
  assert.equal(
    await asyncCombobox.evaluate(
      (element) => element === document.activeElement,
    ),
    true,
    "A failed cursor request must return focus to the combobox.",
  );
  const cursorRetry = desktop.getByRole("button", {
    name: "Retry",
    exact: true,
  });
  await cursorRetry.focus();
  await desktop.keyboard.press("Enter");
  await desktop.getByRole("option", { name: "Page two" }).waitFor();
  assert.equal(
    await desktop.getByRole("option", { name: "Page one" }).count(),
    1,
    "A cursor page must keep one stable copy of each option value.",
  );
  assert.deepEqual(
    await asyncRoot.getByRole("option").allTextContents(),
    ["No service", "Page one", "Page two"],
    "Cursor pages must keep stable first-seen order.",
  );
  assert.equal(
    await asyncCombobox.evaluate(
      (element) => element === document.activeElement,
    ),
    true,
    "A successful cursor request must return focus to the combobox.",
  );
  assert.equal(
    await desktop.getByRole("button", { name: "Load more" }).count(),
    0,
    "The cursor action must stop after the last page.",
  );

  await asyncCombobox.fill("cursor-cycle");
  await asyncRoot.getByRole("option", { name: "Cycle one" }).waitFor();
  await asyncRoot.getByRole("button", { name: "Load more" }).click();
  await asyncRoot.getByRole("option", { name: "Cycle two" }).waitFor();
  await asyncRoot.getByRole("button", { name: "Load more" }).click();
  await asyncRoot.getByRole("option", { name: "Cycle three" }).waitFor();
  assert.equal(
    await asyncRoot.getByRole("button", { name: "Load more" }).count(),
    0,
    "A cursor cycle must stop before it can request an earlier page again.",
  );

  await asyncCombobox.fill("invalid-cursor");
  await asyncRoot
    .getByRole("option", { name: "Invalid cursor result" })
    .waitFor();
  assert.equal(
    await asyncRoot.getByRole("button", { name: "Load more" }).count(),
    0,
    "A blank cursor must not create a load-more request.",
  );

  await asyncCombobox.fill("selection-loading");
  const selectionOne = asyncRoot.getByRole("option", {
    name: "Selection one",
  });
  await selectionOne.waitFor();
  const selectionRequestStart = await desktop.evaluate(
    () => window.asyncSelectorEvents.length,
  );
  await asyncRoot.getByRole("button", { name: "Load more" }).click();
  await asyncRoot
    .getByRole("button", { name: "Loading more options…" })
    .waitFor();
  await selectionOne.dispatchEvent("pointerdown", {
    button: 0,
    pointerType: "mouse",
  });
  assert.equal(
    await desktop
      .getByRole("status", { name: "Selected asynchronous service" })
      .textContent(),
    "selection-one",
    "A pointer selection must commit the controlled option.",
  );
  assert.equal(
    await asyncCombobox.evaluate(
      (element) => element === document.activeElement,
    ),
    true,
    "A pointer selection must keep focus on the combobox.",
  );
  await desktop.waitForTimeout(600);
  assert.deepEqual(
    await desktop.evaluate(
      (start) =>
        window.asyncSelectorEvents.slice(start).map((event) => ({
          aborted: event.aborted,
          cursor: event.cursor,
        })),
      selectionRequestStart,
    ),
    [{ aborted: true, cursor: "selection-page-2" }],
    "Selection must invalidate an active cursor request.",
  );

  await asyncCombobox.fill("selection-loading");
  await asyncRoot.getByRole("option", { name: "Selection one" }).waitFor();
  const focusLeaveRequestStart = await desktop.evaluate(
    () => window.asyncSelectorEvents.length,
  );
  await asyncRoot.getByRole("button", { name: "Load more" }).click();
  await asyncRoot
    .getByRole("button", { name: "Loading more options…" })
    .waitFor();
  const saveSettings = desktop.getByRole("button", { name: "Save settings" });
  await saveSettings.focus();
  await desktop.waitForTimeout(600);
  assert.equal(
    await asyncRoot.getByRole("listbox").count(),
    0,
    "Leaving the selector root must close the listbox.",
  );
  assert.deepEqual(
    await desktop.evaluate(
      (start) =>
        window.asyncSelectorEvents
          .slice(start)
          .filter((event) => event.cursor === "selection-page-2")
          .map((event) => ({
            aborted: event.aborted,
            cursor: event.cursor,
          })),
      focusLeaveRequestStart,
    ),
    [{ aborted: true, cursor: "selection-page-2" }],
    "Leaving a cursor action must abort its request.",
  );
  assert.equal(
    await saveSettings.evaluate(
      (element) => element === document.activeElement,
    ),
    true,
    "A stale cursor completion must not steal focus after the selector closes.",
  );

  const unmountedCombobox = desktop.getByRole("combobox", {
    name: "Unmounted asynchronous service",
  });
  const unmountRequestStart = await desktop.evaluate(
    () => window.asyncSelectorEvents.length,
  );
  await unmountedCombobox.fill("slow-resolve");
  await desktop.waitForFunction(
    (start) =>
      window.asyncSelectorEvents
        .slice(start)
        .some((event) => event.query === "slow-resolve"),
    unmountRequestStart,
  );
  await desktop
    .getByRole("button", { name: "Unmount asynchronous selector" })
    .evaluate((button) => button.click());
  await desktop.waitForTimeout(50);
  assert.deepEqual(
    await desktop.evaluate(
      (start) =>
        window.asyncSelectorEvents
          .slice(start)
          .filter((event) => event.query === "slow-resolve")
          .map((event) => ({
            aborted: event.aborted,
            query: event.query,
          })),
      unmountRequestStart,
    ),
    [{ aborted: true, query: "slow-resolve" }],
    "Unmount must abort the current request.",
  );

  const immediateCombobox = desktop.getByRole("combobox", {
    name: "Immediate asynchronous service",
  });
  const immediateEventCount = await desktop.evaluate(
    () => window.asyncSelectorEvents.length,
  );
  await immediateCombobox.fill("host-zero-debounce");
  await desktop
    .getByRole("option", {
      name: "Result for host-zero-debounce",
    })
    .waitFor();
  assert.equal(
    await desktop.evaluate(
      (start) =>
        window.asyncSelectorEvents
          .slice(start)
          .some((event) => event.query === "host-zero-debounce"),
      immediateEventCount,
    ),
    true,
    "The host must be able to replace the default debounce.",
  );

  await desktop.keyboard.press("Tab");

  assert.equal(
    await desktop
      .getByRole("textbox", { name: "Provider name", exact: true })
      .count(),
    1,
    "The visual requirement must not change the control accessible name.",
  );

  const sharedControls = [
    desktop.getByRole("textbox", { name: "Shared text" }),
    desktop.getByRole("spinbutton", { name: "Shared number" }),
    desktop.getByRole("combobox", { name: "Shared choice" }),
    desktop.getByRole("textbox", { name: "Shared details" }),
    desktop.getByRole("checkbox", { name: "Shared checkbox" }),
    desktop.getByRole("switch", { name: "Shared switch" }),
  ];
  for (const control of sharedControls) {
    const describedBy = (await control.getAttribute("aria-describedby")) ?? "";
    const descriptionIds = describedBy.split(" ").filter(Boolean);
    assert.equal(descriptionIds.length, 2);
    assert.equal(await control.getAttribute("aria-invalid"), "true");
    assert.notEqual(await control.getAttribute("required"), null);
    for (const descriptionId of descriptionIds) {
      assert.equal(
        await desktop.locator(`[id=${JSON.stringify(descriptionId)}]`).count(),
        1,
      );
    }
    await control.focus();
    assert.equal(
      await control.evaluate(
        (element) => getComputedStyle(element).outlineStyle !== "none",
      ),
      true,
      "Each shared control must have a visible focus outline.",
    );
  }

  await sharedControls[0].fill("Changed text");
  await sharedControls[1].fill("8");
  await sharedControls[2].selectOption("gamma");
  await sharedControls[3].fill("Changed details");
  await sharedControls[4].focus();
  await desktop.keyboard.press("Space");
  await sharedControls[5].focus();
  await desktop.keyboard.press("Space");
  assert.equal(
    await desktop
      .getByRole("status", { name: "Shared text value" })
      .textContent(),
    "Changed text",
  );
  assert.equal(
    await desktop
      .getByRole("status", { name: "Shared number value" })
      .textContent(),
    "8",
  );
  assert.equal(
    await desktop
      .getByRole("status", { name: "Shared choice value" })
      .textContent(),
    "gamma",
  );
  assert.equal(
    await desktop
      .getByRole("status", { name: "Shared details value" })
      .textContent(),
    "Changed details",
  );
  assert.equal(
    await desktop
      .getByRole("status", { name: "Shared checkbox value" })
      .textContent(),
    "true",
  );
  assert.equal(
    await desktop
      .getByRole("status", { name: "Shared switch value" })
      .textContent(),
    "true",
  );
  assert.equal(await sharedControls[4].isChecked(), true);
  assert.equal(await sharedControls[5].getAttribute("aria-checked"), "true");

  for (const name of [
    "Disabled text",
    "Disabled number",
    "Disabled choice",
    "Disabled details",
    "Disabled checkbox",
    "Disabled switch",
  ]) {
    assert.equal(await desktop.getByLabel(name).isDisabled(), true);
  }

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
  const phoneAsyncCombobox = phone.getByRole("combobox", {
    name: "Asynchronous service",
    exact: true,
  });
  await phoneAsyncCombobox.focus();
  await phone.getByRole("option", { name: "Alpha service" }).waitFor();
  const phoneAsyncBounds = await phone
    .locator(".od-async-searchable-select")
    .first()
    .evaluate((root) => {
      const popover = root.querySelector(".od-async-searchable-select-popover");
      if (!(popover instanceof HTMLElement)) return null;
      return {
        popoverRight: popover.getBoundingClientRect().right,
        popoverWidth: popover.getBoundingClientRect().width,
        rootWidth: root.getBoundingClientRect().width,
        viewportWidth: window.innerWidth,
      };
    });
  assert.ok(phoneAsyncBounds, "The phone selector popover must be visible.");
  assert.equal(
    phoneAsyncBounds.popoverRight <= phoneAsyncBounds.viewportWidth,
    true,
    "The phone selector must stay in the viewport.",
  );
  assert.equal(
    Math.abs(phoneAsyncBounds.popoverWidth - phoneAsyncBounds.rootWidth) < 2,
    true,
    "The phone selector popover must use its field width.",
  );
  const phoneControlledSection = phone.getByRole("group", {
    name: "Controlled fields",
  });
  const sectionWidth = await phoneControlledSection.evaluate(
    (section) => section.getBoundingClientRect().width,
  );
  const fieldWidths = await phoneControlledSection
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
