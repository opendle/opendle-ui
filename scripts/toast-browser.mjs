import { strict as assert } from "node:assert";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";
import { build } from "esbuild";

// The toast queue: the time of each tone, the pause, the close button of an
// error, and a message that waits for the end of an error.
assert.equal(process.argv.length, 2, "This check accepts no arguments.");
const root = fileURLToPath(new URL("..", import.meta.url));
const fixture = `
import React from "react";
import {createRoot} from "react-dom/client";
import {Toast, useToastQueue} from "./dist/index.js";
function App() {
  const {toast, showToast, toastProps} = useToastQueue();
  window.showToast = showToast;
  return <main><h1>Toasts</h1>
    {toast === null ? null : <Toast key={toast.id} role="status" tone={toast.tone} {...toastProps}>{toast.message}</Toast>}
  </main>;
}
createRoot(document.getElementById("root")).render(<App/>);`;
const bundled = await build({
  stdin: { contents: fixture, loader: "jsx", resolveDir: root },
  bundle: true,
  write: false,
  format: "iife",
});
const directory = mkdtempSync(join(tmpdir(), "opendle-toast-"));
const pagePath = join(directory, "index.html");
writeFileSync(
  pagePath,
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Toasts</title><link rel="stylesheet" href="${pathToFileURL(join(root, "styles/index.css")).href}"></head><body><div id="root"></div><script>${bundled.outputFiles[0].text.replaceAll("</script", "<\\/script")}</script></body></html>`,
);
const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  // A paused clock: only runFor moves the time.
  await page.clock.install({ time: new Date("2029-01-01T00:00:00Z") });
  await page.goto(pathToFileURL(pagePath).href);
  await page.getByRole("heading", { name: "Toasts" }).waitFor();
  await page.clock.pauseAt(new Date("2029-01-01T00:01:00Z"));
  const toast = page.locator(".od-toast");
  const text = async () =>
    (await toast.count()) === 0
      ? null
      : await toast.locator("span").first().textContent();
  const show = (message, tone) =>
    page.evaluate(([m, t]) => window.showToast(m, t), [message, tone]);

  // A message shows for 4 s, without a close button.
  await show("Saved", "success");
  assert.equal(await text(), "Saved");
  assert.equal(await toast.getByRole("button").count(), 0);
  await page.clock.runFor(3900);
  assert.equal(await text(), "Saved");
  await page.clock.runFor(200);
  assert.equal(await text(), null);

  // An error shows for 8 s, with a close button.
  await show("Upload failed", "error");
  assert.equal(
    await toast.getByRole("button", { name: "Dismiss message" }).count(),
    1,
  );
  await page.clock.runFor(7900);
  assert.equal(await text(), "Upload failed");
  await page.clock.runFor(200);
  assert.equal(await text(), null);

  // A message during an error waits until the error ends.
  await show("First error", "error");
  await page.clock.runFor(1000);
  await show("Saved later", "success");
  assert.equal(await text(), "First error");
  // A new error replaces the error; the message still waits.
  await show("Second error", "error");
  assert.equal(await text(), "Second error");
  await page.clock.runFor(7900);
  assert.equal(await text(), "Second error");
  await page.clock.runFor(200);
  assert.equal(await text(), "Saved later");
  await page.clock.runFor(4100);
  assert.equal(await text(), null);

  // The close button ends the error, and the waiting message shows.
  await show("Third error", "error");
  await show("Saved again", "success");
  await toast.getByRole("button", { name: "Dismiss message" }).click();
  assert.equal(await text(), "Saved again");
  await page.clock.runFor(4100);
  assert.equal(await text(), null);

  // A pointer on the toast stops the time; the time left continues after.
  await page.mouse.move(0, 0);
  await show("Hover me", "success");
  await page.clock.runFor(3000);
  await toast.hover();
  await page.clock.runFor(10000);
  assert.equal(await text(), "Hover me");
  await page.mouse.move(0, 0);
  await page.clock.runFor(900);
  assert.equal(await text(), "Hover me");
  await page.clock.runFor(200);
  assert.equal(await text(), null);

  // The focus on the close button stops the time of an error.
  await show("Focus me", "error");
  await toast.getByRole("button", { name: "Dismiss message" }).focus();
  await page.clock.runFor(20000);
  assert.equal(await text(), "Focus me");
  await page.getByRole("heading", { name: "Toasts" }).click();
  await page.clock.runFor(8100);
  assert.equal(await text(), null);

  assert.deepEqual(errors, []);
} finally {
  await browser.close();
  rmSync(directory, { recursive: true, force: true });
}
console.log("Toast browser checks passed.");
