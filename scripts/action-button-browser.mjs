/* global document, window, requestAnimationFrame, getComputedStyle */
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { fileURLToPath, URL } from "node:url";
import AxeBuilder from "@axe-core/playwright";
import { chromium } from "@playwright/test";
import { build } from "esbuild";

assert.equal(process.argv.length, 2, "This check accepts no arguments.");
const root = fileURLToPath(new URL("..", import.meta.url));
const css = await readFile(
  new URL("../styles/tokens.css", import.meta.url),
  "utf8",
);
const source = String.raw`
import React, {StrictMode, useLayoutEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ActionButton, ActionButtonGroup, Icon} from '@opendle/ui';
function Fixture() {
  const [label, setLabel] = useState('First action');
  const [disabled, setDisabled] = useState(false);
  const button = useRef(null);
  useLayoutEffect(() => {
    window.setActionLabel = setLabel;
    window.setActionDisabled = setDisabled;
    window.actionRef = button;
    window.actionClicks = 0;
    window.actionSubmits = 0;
  }, []);
  return <main><h1>Action buttons</h1>
    <form onSubmit={event => {event.preventDefault(); window.actionSubmits++;}}>
      <ActionButtonGroup id="actions">
        <ActionButton ref={button} label={label} icon={<Icon name="edit" size={16}/>} onClick={() => window.actionClicks++}/>
        <ActionButton label="Other action" icon={<Icon name="close" size={16}/>} onClick={() => window.actionClicks++}/>
        <ActionButton label="Third action" icon={<Icon name="check" size={16}/>} variant="primary" type="submit" disabled={disabled}/>
      </ActionButtonGroup>
    </form>
    <div id="single"><ActionButton label="Inspect record" icon={<Icon name="eye" size={16}/>} /></div>
  </main>;
}
createRoot(document.getElementById('root')).render(<StrictMode><Fixture/></StrictMode>);
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
    sourcefile: "action-button-fixture.jsx",
  },
  write: false,
});
const browser = await chromium.launch({
  headless: true,
  executablePath: existsSync("/usr/bin/google-chrome")
    ? "/usr/bin/google-chrome"
    : undefined,
});
const errors = [];
try {
  const context = await browser.newContext({
    viewport: { width: 900, height: 700 },
  });
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.setContent(`<!doctype html><html lang="en"><head><title>Action buttons</title><style>${css}
    body{margin:0;color:var(--od-color-foreground);font-family:Arial,sans-serif}main{padding:8px}#actions,#single{width:600px}
    </style></head><body><div id="root"></div></body></html>`);
  await page.addScriptTag({ content: bundle.outputFiles[0].text });
  await page.waitForFunction(() => typeof window.setActionLabel === "function");
  const first = page.getByRole("button", { name: "First action", exact: true });
  const third = page.getByRole("button", { name: "Third action", exact: true });
  await first.focus();
  assert.equal(
    await first.evaluate((button) => button === window.actionRef.current),
    true,
  );

  async function width(value, expected) {
    await page.locator("#actions").evaluate((row, size) => {
      row.style.width = `${size}px`;
    }, value);
    await page.waitForFunction(
      (mode) =>
        [...document.querySelectorAll("#actions button")].every(
          (button) => button.dataset.presentation === mode,
        ),
      expected,
    );
    const metrics = await page.locator("#actions").evaluate((row) => {
      const box = row.getBoundingClientRect();
      const buttons = [...row.querySelectorAll("button")].map((button) => {
        const label = button.querySelector(".od-action-button-label");
        const icon = button.querySelector(".od-action-button-icon");
        return {
          box: button.getBoundingClientRect().toJSON(),
          labelVisible: getComputedStyle(label).visibility === "visible",
          iconVisible: getComputedStyle(icon).visibility === "visible",
        };
      });
      return {
        box: box.toJSON(),
        buttons,
        overflow: document.documentElement.scrollWidth > window.innerWidth,
      };
    });
    assert.equal(
      new Set(metrics.buttons.map((button) => button.box.top)).size,
      1,
    );
    assert.ok(Math.abs(metrics.buttons[0].box.left - metrics.box.left) < 1);
    assert.ok(Math.abs(metrics.buttons[2].box.right - metrics.box.right) < 1);
    assert.ok(
      Math.max(...metrics.buttons.map((button) => button.box.width)) -
        Math.min(...metrics.buttons.map((button) => button.box.width)) <
        1,
    );
    for (const button of metrics.buttons) {
      assert.ok(button.box.height >= 44 && button.box.width >= 44);
      assert.equal(button.labelVisible, expected !== "icon");
      assert.equal(button.iconVisible, expected !== "text");
    }
    assert.equal(metrics.overflow, false);
    assert.equal(
      await first.evaluate((button) => button === document.activeElement),
      true,
    );
    const a11y = await new AxeBuilder({ page }).analyze();
    assert.deepEqual(a11y.violations, []);
  }

  for (let pass = 0; pass < 2; pass++) {
    await width(600, "full");
    await width(300, "text");
    await width(180, "icon");
  }
  await first.press("Enter");
  assert.equal(await page.evaluate(() => window.actionClicks), 1);
  await first.press("Tab");
  assert.equal(
    await page
      .getByRole("button", { name: "Other action" })
      .evaluate((button) => button === document.activeElement),
    true,
  );
  await third.press("Enter");
  assert.equal(await page.evaluate(() => window.actionSubmits), 1);
  await page.evaluate(() => window.setActionDisabled(true));
  await page.waitForFunction(
    () => document.querySelector("#actions button:last-child").disabled,
  );
  await third.evaluate((button) => button.click());
  assert.equal(await page.evaluate(() => window.actionSubmits), 1);
  await page.evaluate(() =>
    window.setActionLabel("LongUnbrokenActionLabel".repeat(20)),
  );
  await page.waitForFunction(
    () =>
      document.querySelector("#actions button").dataset.presentation === "icon",
  );
  await page.locator("#actions").evaluate((row) => {
    row.style.width = "600px";
  });
  await page.waitForFunction(
    () =>
      document.querySelector("#actions button").dataset.presentation === "icon",
  );
  await page.evaluate(() => window.setActionLabel("First action"));
  await page.waitForFunction(
    () =>
      document.querySelector("#actions button").dataset.presentation === "full",
  );
  await first.focus();
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });
  await width(360, "icon");
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "100%";
  });
  await width(600, "full");
  await page.locator("#actions").evaluate((row) => {
    row.style.width = "100px";
  });
  await page.waitForFunction(
    () =>
      document.querySelector("#actions").scrollWidth >
      document.querySelector("#actions").clientWidth,
  );
  await page.evaluate(() => window.setActionDisabled(false));
  await third.focus();
  assert.equal(
    await third.evaluate((button) => {
      const box = button.getBoundingClientRect();
      const row = button.parentElement.getBoundingClientRect();
      return box.left >= row.left && box.right <= row.right + 1;
    }),
    true,
  );
  for (const [size, mode] of [
    [600, "full"],
    [120, "text"],
    [44, "icon"],
    [600, "full"],
  ]) {
    await page.locator("#single").evaluate((parent, width) => {
      parent.style.width = `${width}px`;
    }, size);
    await page.waitForFunction(
      (expected) =>
        document.querySelector("#single button").dataset.presentation ===
        expected,
      mode,
    );
    assert.equal(
      await page
        .locator("#single button")
        .evaluate((button) => button.getBoundingClientRect().width),
      size,
    );
  }
  const clicksBeforeDisable = await page.evaluate(() => window.actionClicks);
  await page.locator("#actions").evaluate((group) => {
    group.disabled = true;
    group.querySelector("button").click();
  });
  assert.equal(
    await page.evaluate(() => window.actionClicks),
    clicksBeforeDisable,
  );
  assert.deepEqual(errors, []);
  console.log(
    "Action buttons: all display modes, full-width rows, text scaling, dynamic labels, focus, keyboard, forms, disabled actions, and accessibility passed.",
  );
} finally {
  await browser.close();
}
