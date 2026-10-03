import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import AxeBuilder from "@axe-core/playwright";
import { chromium } from "@playwright/test";
import { build } from "esbuild";

assert.equal(process.argv.length, 2, "This check accepts no arguments.");
const root = fileURLToPath(new URL("..", import.meta.url));
const fixture = `
import React from "react";
import {createRoot} from "react-dom/client";
import {SessionPage, SignInCard} from "./dist/index.js";
window.starts = 0;
function signIn() {
 window.starts++;
 return new Promise((resolve,reject) => { window.finish = resolve; window.fail = reject; });
}
createRoot(document.getElementById("root")).render(
 <SessionPage><SignInCard title="Administrator sign-in" description="Use your shared account."
  actionLabel="Continue with Pocket ID" pendingLabel="Opening Pocket ID…"
  onSignIn={signIn} errorMessage={() => "The identity service is unavailable."}/></SessionPage>
);`;
const bundled = await build({
  stdin: { contents: fixture, loader: "jsx", resolveDir: root },
  bundle: true,
  write: false,
  format: "iife",
});
const browser = await chromium.launch({ headless: true });
try {
  for (const viewport of [
    { width: 1280, height: 800 },
    { width: 375, height: 812 },
  ]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setContent(
      '<!doctype html><html lang="en"><head><title>Sign-in controls</title></head><body><div id="root"></div></body></html>',
    );
    await page.addStyleTag({
      content: readFileSync(`${root}/styles/tokens.css`, "utf8"),
    });
    await page.addScriptTag({ content: bundled.outputFiles[0].text });
    const action = page.getByRole("button", {
      name: "Continue with Pocket ID",
    });
    await action.waitFor();
    await page.keyboard.press("Tab");
    assert.equal(
      await action.evaluate((node) => node === document.activeElement),
      true,
    );
    await action.evaluate((node) => {
      node.click();
      node.click();
    });
    const pending = page.getByRole("button", { name: "Opening Pocket ID…" });
    await pending.waitFor();
    assert.equal(await pending.isDisabled(), true);
    assert.equal(await page.evaluate(() => window.starts), 1);
    await page.evaluate(() => window.fail(new Error("provider details")));
    const alert = page.getByRole("alert");
    await alert.waitFor();
    assert.equal(
      await alert.textContent(),
      "The identity service is unavailable.",
    );
    assert.equal(await action.isEnabled(), true);
    assert.equal(
      await page.getByText("Use your shared account.").isVisible(),
      true,
    );
    assert.equal(await page.evaluate(() => window.starts), 1);
    assert.deepEqual((await new AxeBuilder({ page }).analyze()).violations, []);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
    );
    await action.click();
    await pending.waitFor();
    assert.equal(await alert.count(), 0);
    assert.equal(await page.evaluate(() => window.starts), 2);
    await page.evaluate(() => window.finish());
    await page.evaluate(
      () => new Promise((resolve) => requestAnimationFrame(resolve)),
    );
    assert.equal(await pending.isDisabled(), true);
    assert.deepEqual(errors, []);
    await context.close();
  }
  console.log(
    "Shared sign-in state, keyboard, and accessibility checks passed.",
  );
} finally {
  await browser.close();
}
