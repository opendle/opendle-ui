/* global document */
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import AxeBuilder from "@axe-core/playwright";
import { chromium } from "@playwright/test";
import { build } from "esbuild";

assert.equal(process.argv.length, 2, "This check accepts no arguments.");
const root = fileURLToPath(new URL("..", import.meta.url));
const styles = await Promise.all(
  ["tokens.css", "popover.css"].map((name) =>
    readFile(new URL(`../styles/${name}`, import.meta.url), "utf8"),
  ),
);
const fixture = String.raw`
import React, {useState} from "react";
import {createRoot} from "react-dom/client";
import {AccountMenu, ApplicationShell, Avatar, Icon, NavigationLink, Popover} from "./dist/index.js";
function Fixture() {
  const [opens, setOpens] = useState([]);
  return <ApplicationShell brandMark={<Icon name="grid"/>} brandName="Example" navigationLabel="Main" skipLabel="Skip to content"
    workspace={<AccountMenu appearance="workspace" avatar={<Avatar name="Music"/>} name="Music" label="Switch workspace: Music" sections={[]}/>}
    actions={<Popover label="Alerts" countLabel="3 unread" count={3} icon={<Icon name="bell"/>} onOpenChange={(open) => setOpens((list) => [...list, open])}>
      <h2>Alerts</h2><button type="button">First</button><a href="#all">View all</a>
    </Popover>}
    navigation={<NavigationLink href="#home" icon={<Icon name="home"/>} label="Home"/>}>
    <h1>Page</h1><button type="button">Outside</button><output aria-label="Changes">{JSON.stringify(opens)}</output>
  </ApplicationShell>;
}
createRoot(document.getElementById("root")).render(<Fixture/>);
`;
const bundle = await build({
  bundle: true,
  format: "iife",
  jsx: "automatic",
  logLevel: "silent",
  stdin: {
    contents: fixture,
    loader: "jsx",
    resolveDir: root,
    sourcefile: "popover-fixture.jsx",
  },
  write: false,
});
const browser = await chromium.launch({
  headless: true,
  ...(existsSync("/usr/bin/google-chrome")
    ? { executablePath: "/usr/bin/google-chrome" }
    : {}),
});
const errors = [];
const focused = (locator) =>
  locator.evaluate((node) => node === document.activeElement);
try {
  for (const width of [1440, 900, 390]) {
    const context = await browser.newContext({
      viewport: { width, height: 800 },
    });
    const page = await context.newPage();
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setContent(
      `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Popover check</title><style>${styles.join("\n")}</style></head><body><div id="root"></div></body></html>`,
    );
    await page.addScriptTag({ content: bundle.outputFiles[0].text });
    const button = page.getByRole("button", { name: "Alerts, 3 unread" });
    await button.waitFor();
    assert.equal(await button.getAttribute("aria-expanded"), "false");
    await button.click();
    const panel = page.getByRole("dialog", { name: "Alerts" });
    await panel.waitFor();
    assert.equal(await focused(panel), true, `${width}: panel focus`);
    assert.equal(await button.getAttribute("aria-expanded"), "true");
    const box = await panel.boundingBox();
    assert.ok(box.x >= 0 && box.x + box.width <= width, `${width}: in view`);
    assert.ok(box.y >= 0 && box.y + box.height <= 800, `${width}: in height`);
    assert.deepEqual(
      (await new AxeBuilder({ page }).include(".od-popover").analyze())
        .violations,
      [],
    );
    // Escape closes the panel and returns the focus to the button.
    await page.keyboard.press("Tab");
    assert.equal(
      await focused(page.getByRole("button", { name: "First" })),
      true,
    );
    await page.keyboard.press("Escape");
    await panel.waitFor({ state: "detached" });
    assert.equal(await focused(button), true, `${width}: focus returns`);
    // A press outside closes it.
    await button.press("Enter");
    await panel.waitFor();
    await page.mouse.click(width - 8, 792);
    await panel.waitFor({ state: "detached" });
    // A used link closes it.
    await button.click();
    await panel.getByRole("link", { name: "View all" }).click();
    await panel.waitFor({ state: "detached" });
    // The focus that leaves the panel closes it.
    await button.click();
    await page.getByRole("button", { name: "Outside" }).focus();
    await panel.waitFor({ state: "detached" });
    assert.equal(
      await page.getByRole("status").or(page.locator("output")).textContent(),
      JSON.stringify([true, false, true, false, true, false, true, false]),
    );
    await context.close();
  }
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
}
console.log("Popover browser checks passed.");
