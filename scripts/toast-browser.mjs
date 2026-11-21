import { strict as assert } from "node:assert";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import AxeBuilder from "@axe-core/playwright";
import { chromium } from "@playwright/test";
import { build } from "esbuild";

// The toast stack: the order, the time of each toast, the pause, the limit
// of three toasts, one toast for the same message, and the place above a
// modal dialog.
assert.ok(process.argv.length <= 3, "This check accepts one optional path.");
const screenshots = process.argv[2] ?? null;
const root = fileURLToPath(new URL("..", import.meta.url));
const fixture = `
import React, {useState} from "react";
import {createRoot} from "react-dom/client";
import {Dialog, ToastStack, useToastQueue} from "./dist/index.js";
function App() {
  const {toasts, showToast, dismissToast, pauseToasts} = useToastQueue();
  const [open, setOpen] = useState(false);
  window.showToast = showToast;
  window.openDialog = () => setOpen(true);
  return <main><h1>Toasts</h1>
    <Dialog open={open} onClose={() => setOpen(false)} title="Settings"><p>Body</p></Dialog>
    <ToastStack toasts={toasts} onDismiss={dismissToast} onPause={pauseToasts}/>
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
  for (const colorScheme of ["light", "dark"]) {
    const page = await browser.newPage({ colorScheme });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    // A paused clock: only runFor moves the time.
    await page.clock.install({ time: new Date("2029-01-01T00:00:00Z") });
    await page.goto(pathToFileURL(pagePath).href);
    const heading = page.getByRole("heading", { name: "Toasts" });
    await heading.waitFor();
    await page.clock.pauseAt(new Date("2029-01-01T00:01:00Z"));
    const toasts = page.locator(".od-toast-slot:not([data-leaving]) .od-toast");
    const shown = () => toasts.locator("span").allTextContents();
    const show = (message, tone) =>
      page.evaluate(([m, t]) => window.showToast(m, t), [message, tone]);

    // The toasts stack, the newest last, each with its own time.
    await show("Saved", "success");
    await page.clock.runFor(1000);
    await show("Upload failed", "error");
    await page.clock.runFor(1000);
    await show("Copied", "success");
    assert.deepEqual(await shown(), ["Saved", "Upload failed", "Copied"]);
    const tops = await toasts.evaluateAll((nodes) =>
      nodes.map((node) => node.getBoundingClientRect().top),
    );
    assert.ok(tops[0] < tops[1] && tops[1] < tops[2], "newest lowest");
    assert.equal(await toasts.getByRole("button").count(), 1);
    // Each toast is an output element: its role is status.
    assert.equal(
      await page.locator(".od-toast-stack").getByRole("status").count(),
      3,
    );
    // The message ends at 4 s, the second message at 6 s, the error at 9 s.
    await page.clock.runFor(2100);
    assert.deepEqual(await shown(), ["Upload failed", "Copied"]);
    await page.clock.runFor(2000);
    assert.deepEqual(await shown(), ["Upload failed"]);
    await page.clock.runFor(2800);
    assert.deepEqual(await shown(), ["Upload failed"]);
    await page.clock.runFor(200);
    assert.deepEqual(await shown(), []);
    await page.clock.runFor(300);
    assert.equal(await page.locator(".od-toast").count(), 0);

    // The same message does not show two times: its time starts again.
    await show("Saved", "success");
    await page.clock.runFor(3000);
    await show("Saved", "success");
    assert.deepEqual(await shown(), ["Saved"]);
    await page.clock.runFor(3000);
    assert.deepEqual(await shown(), ["Saved"]);
    await page.clock.runFor(1100);
    assert.deepEqual(await shown(), []);

    // At most three toasts: the oldest message closes first, then the
    // oldest error when all are errors.
    await show("Error one", "error");
    await show("Message", "success");
    await show("Error two", "error");
    await show("Error three", "error");
    assert.deepEqual(await shown(), ["Error one", "Error two", "Error three"]);
    await show("Error four", "error");
    assert.deepEqual(await shown(), ["Error two", "Error three", "Error four"]);

    // The close button closes one error.
    await page.clock.runFor(300);
    await toasts
      .nth(1)
      .getByRole("button", { name: "Dismiss message" })
      .click();
    assert.deepEqual(await shown(), ["Error two", "Error four"]);
    await page.mouse.move(0, 0);
    await heading.click();

    // A pointer on the stack stops the time of all its toasts.
    await page.clock.runFor(8100);
    assert.deepEqual(await shown(), []);
    await show("First", "success");
    await page.clock.runFor(1000);
    await show("Second", "success");
    await toasts.nth(0).hover();
    await page.clock.runFor(20000);
    assert.deepEqual(await shown(), ["First", "Second"]);
    await page.mouse.move(0, 0);
    await page.clock.runFor(3100);
    assert.deepEqual(await shown(), ["Second"]);
    await page.clock.runFor(1000);
    assert.deepEqual(await shown(), []);

    // The focus on a close button stops the time.
    await show("Focus me", "error");
    await toasts.getByRole("button", { name: "Dismiss message" }).focus();
    await page.clock.runFor(20000);
    assert.deepEqual(await shown(), ["Focus me"]);
    await heading.click();
    await page.clock.runFor(8100);
    assert.deepEqual(await shown(), []);

    // Above a modal dialog, the stack shows over the dialog.
    await page.clock.runFor(300);
    await page.evaluate(() => window.openDialog());
    await page.getByRole("dialog", { name: "Settings" }).waitFor();
    await show("Over the dialog", "success");
    const box = await toasts.first().boundingBox();
    const top = await page.evaluate(
      ([x, y]) =>
        document.elementFromPoint(x, y)?.closest(".od-toast")?.textContent,
      [box.x + box.width / 2, box.y + box.height / 2],
    );
    assert.equal(top, "Over the dialog");

    assert.deepEqual(errors, []);
    await page.close();

    // Accessibility and look, with the real clock.
    const context = await browser.newContext({
      colorScheme,
      reducedMotion: "reduce",
    });
    const plain = await context.newPage();
    await plain.goto(pathToFileURL(pagePath).href);
    await plain.getByRole("heading", { name: "Toasts" }).waitFor();
    await plain.evaluate(() => {
      window.showToast("Saved");
      window.showToast("Upload failed", "error");
      window.showToast("Copied", "neutral");
    });
    await plain.locator(".od-toast").nth(2).waitFor();
    assert.deepEqual(
      (
        await new AxeBuilder({ page: plain })
          .include(".od-toast-stack")
          .analyze()
      ).violations.map((violation) => violation.id),
      [],
    );
    if (screenshots !== null) {
      await plain.screenshot({
        path: join(screenshots, `toasts-${colorScheme}.png`),
      });
    }
    await context.close();
  }
} finally {
  await browser.close();
  rmSync(directory, { recursive: true, force: true });
}
console.log("Toast browser checks passed.");
