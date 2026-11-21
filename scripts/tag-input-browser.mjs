import { strict as assert } from "node:assert";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import AxeBuilder from "@axe-core/playwright";
import { chromium } from "@playwright/test";
import { build } from "esbuild";

// Optional argument: a directory that receives screenshots for review.
assert.ok(process.argv.length <= 3, "This check accepts one optional path.");
const screenshots = process.argv[2] ?? null;
const root = fileURLToPath(new URL("..", import.meta.url));
const fixture = `
import React, {useState} from "react";
import {createRoot} from "react-dom/client";
import {Dialog, TagInput} from "./dist/index.js";

const known = ["short", "shoot-day", "reel", "long-form", "behind-the-shots"];
const colors = {short: 2, "shoot-day": 5, reel: 8, "long-form": 11};
function App() {
  const [tags, setTags] = useState(["long-form"]);
  const [dialogTags, setDialogTags] = useState([]);
  const [open, setOpen] = useState(false);
  const [changes, setChanges] = useState(0);
  return (
    <main style={{padding: 16, maxWidth: 640}}>
      <h1>Tags</h1>
      <TagInput label="Tags" removeLabel="Remove tag" colors={colors} suggestions={known} value={tags}
        onChange={(value) => { setTags(value); setChanges((count) => count + 1); }}/>
      <output id="tags">{tags.join(" ")}</output>
      <output id="changes">{changes}</output>
      <p><button type="button" onClick={() => setOpen(true)}>Open dialog</button></p>
      <Dialog open={open} onClose={() => setOpen(false)} title="Post">
        <TagInput label="Post tags" removeLabel="Remove tag" colors={colors} suggestions={known} value={dialogTags} onChange={setDialogTags}/>
        <output id="dialog-tags">{dialogTags.join(" ")}</output>
      </Dialog>
    </main>
  );
}
createRoot(document.getElementById("root")).render(<App/>);`;
const bundled = await build({
  stdin: { contents: fixture, loader: "jsx", resolveDir: root },
  bundle: true,
  write: false,
  format: "iife",
});
const directory = mkdtempSync(join(tmpdir(), "opendle-tag-input-"));
const pagePath = join(directory, "index.html");
writeFileSync(
  pagePath,
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Tag input</title><link rel="stylesheet" href="${pathToFileURL(join(root, "styles/index.css")).href}"></head><body><div id="root"></div><script>${bundled.outputFiles[0].text.replaceAll("</script", "<\\/script")}</script></body></html>`,
);
const pageUrl = pathToFileURL(pagePath).href;
const browser = await chromium.launch({ headless: true });

const optionNames = (list) =>
  list
    .getByRole("option")
    .evaluateAll((options) =>
      options.map(
        (option) => option.getAttribute("aria-label") ?? option.textContent,
      ),
    );

try {
  for (const colorScheme of ["light", "dark"]) {
    for (const width of [1024, 360]) {
      const context = await browser.newContext({
        colorScheme,
        reducedMotion: "reduce",
        viewport: { width, height: 720 },
      });
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(pageUrl);
      const name = `${colorScheme}-${String(width)}`;
      const field = page.getByRole("combobox", { name: "Tags", exact: true });
      const list = page.getByRole("listbox", { name: "Tags", exact: true });
      const tags = page.locator("#tags");

      // At rest: a fixed "#" before the add label, and no list.
      assert.equal(await field.getAttribute("placeholder"), "add tag");
      assert.equal(
        await page.locator(".od-tag-input-hash").first().textContent(),
        "#",
      );
      assert.equal(await field.getAttribute("aria-expanded"), "false");

      // Typing shows the matching known tags: prefix matches first, then the
      // other matches, and a last option that creates the typed tag.
      await field.fill("sho");
      await list.waitFor();
      assert.equal(await field.getAttribute("aria-expanded"), "true");
      assert.deepEqual(await optionNames(list), [
        "#short",
        "#shoot-day",
        "#behind-the-shots",
        "Create #sho",
      ]);
      assert.equal(
        await list.locator('.od-tag[data-color="2"]').textContent(),
        "#short",
      );
      const fieldBox = await page
        .locator(".od-tag-input-entry")
        .first()
        .boundingBox();
      const listBox = await list.boundingBox();
      assert.ok(listBox.y >= fieldBox.y + fieldBox.height, `${name}: below`);
      assert.ok(listBox.x + listBox.width <= width, `${name}: in view`);
      assert.deepEqual(
        (await new AxeBuilder({ page }).include(".od-tag-input").analyze())
          .violations,
        [],
        `${name}: axe`,
      );
      if (screenshots !== null) {
        await page.screenshot({ path: join(screenshots, `${name}-list.png`) });
      }

      // The arrow keys move the active option; Enter adds it.
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("ArrowDown");
      const active = await field.getAttribute("aria-activedescendant");
      assert.equal(
        await page.locator(`[id="${active}"]`).textContent(),
        "#shoot-day",
      );
      assert.equal(
        await page.locator(`[id="${active}"]`).getAttribute("aria-selected"),
        "true",
      );
      await page.keyboard.press("ArrowUp");
      await page.keyboard.press("Enter");
      assert.equal(await tags.textContent(), "long-form short");
      assert.equal(await field.inputValue(), "");
      assert.equal(await list.count(), 0);

      // Enter without an active option adds the typed tag. A typed "#" is
      // removed, and a known tag keeps its name.
      await field.fill("#Reel");
      assert.equal(await field.inputValue(), "Reel");
      await page.keyboard.press("Enter");
      assert.equal(await tags.textContent(), "long-form short reel");

      // A tag in the list is not added again, and it is not offered.
      await field.fill("short");
      assert.equal(await list.count(), 0);
      await page.keyboard.press("Enter");
      assert.equal(await tags.textContent(), "long-form short reel");
      assert.equal(await field.inputValue(), "");

      // A comma adds a new tag.
      await field.fill("Tour Diary");
      await page.keyboard.press(",");
      assert.equal(await tags.textContent(), "long-form short reel tour-diary");

      // Escape closes the list and keeps the text.
      await field.fill("be");
      await list.waitFor();
      await page.keyboard.press("Escape");
      assert.equal(await list.count(), 0);
      assert.equal(await field.inputValue(), "be");

      // A click on an option adds it one time, and the focus stays.
      await page.keyboard.press("ArrowDown");
      await list.waitFor();
      const changes = Number(await page.locator("#changes").textContent());
      await list.getByRole("option", { name: "#behind-the-shots" }).click();
      assert.equal(
        await tags.textContent(),
        "long-form short reel tour-diary behind-the-shots",
      );
      assert.equal(
        Number(await page.locator("#changes").textContent()),
        changes + 1,
      );
      assert.equal(
        await field.evaluate((node) => node === document.activeElement),
        true,
      );

      // With an empty text, ArrowDown opens all known tags not in the list.
      await page.keyboard.press("ArrowDown");
      assert.deepEqual(await optionNames(list), ["#shoot-day"]);
      await page.keyboard.press("Escape");

      // Backspace in the empty input removes the last tag.
      await page.keyboard.press("Backspace");
      assert.equal(await tags.textContent(), "long-form short reel tour-diary");

      // A blur adds the typed text.
      await field.fill("live");
      await page.getByRole("heading", { name: "Tags" }).click();
      assert.equal(
        await tags.textContent(),
        "long-form short reel tour-diary live",
      );

      // In a modal dialog, the list shows above the dialog, and Escape closes
      // the list before the dialog.
      await page.getByRole("button", { name: "Open dialog" }).click();
      const dialogField = page.getByRole("combobox", { name: "Post tags" });
      await dialogField.fill("s");
      const dialogList = page.getByRole("listbox", { name: "Post tags" });
      await dialogList.waitFor();
      const option = await dialogList
        .getByRole("option", { name: "#short" })
        .boundingBox();
      const top = await page.evaluate(
        ([x, y]) =>
          document.elementFromPoint(x, y)?.closest('[role="option"]')
            ?.textContent,
        [option.x + option.width / 2, option.y + option.height / 2],
      );
      assert.equal(top, "#short", `${name}: list over the dialog`);
      await page.keyboard.press("Escape");
      assert.equal(await dialogList.count(), 0);
      assert.equal(
        await page.getByRole("dialog", { name: "Post" }).isVisible(),
        true,
      );
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("Enter");
      assert.equal(await page.locator("#dialog-tags").textContent(), "short");

      assert.deepEqual(errors, []);
      await context.close();
    }
  }
} finally {
  await browser.close();
  rmSync(directory, { recursive: true, force: true });
}
console.log("Tag input browser checks passed.");
