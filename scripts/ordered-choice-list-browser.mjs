import { strict as assert } from "node:assert";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import AxeBuilder from "@axe-core/playwright";
import { chromium } from "@playwright/test";
import { build } from "esbuild";

const root = fileURLToPath(new URL("..", import.meta.url));
const fixture = String.raw`
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { OrderedChoiceList } from "./dist/index.js";
const options = [
  { value: "alpha", label: "Alpha", description: "Provider A" },
  { value: "beta", label: "Beta", description: "Provider B" },
  { value: "gamma", label: "Gamma", searchText: "vision" },
  { value: "disabled", label: "Disabled route", disabled: true },
];
function Fixture() {
  const [ids, setIds] = useState(["alpha", "beta"]);
  const [disabled, setDisabled] = useState(false);
  const [addCalls, setAddCalls] = useState(0);
  const [dragCalls, setDragCalls] = useState(0);
  const [longNames, setLongNames] = useState(false);
  return <main>
    <h1>Ordered choices</h1>
    <button onClick={() => setDisabled(!disabled)}>Toggle disabled</button>
    <button onClick={() => setLongNames(!longNames)}>Toggle long names</button>
    <OrderedChoiceList
      label="Route chain" addLabel="Add route" addPlaceholder="Search routes"
      items={ids.map((id) => ({ id, value: id, label: longNames ? id + " route with a deliberately long name to check wrapping" : options.find((o) => o.value === id).label, detail: "Provider" }))}
      options={options} maxItems={3} disabled={disabled}
      onAdd={(value) => { setIds((current) => [...current, value]); setAddCalls((value) => value + 1); }}
      onRemove={(id) => setIds((current) => current.filter((value) => value !== id))}
      onReorder={(order) => { setIds([...order]); setDragCalls((value) => value + 1); }}
    />
    <output aria-label="Current order">{ids.join(",")}</output>
    <output aria-label="Add calls">{addCalls}</output>
    <output aria-label="Reorder calls">{dragCalls}</output>
  </main>;
}
createRoot(document.getElementById("root")).render(<Fixture />);
`;
const result = await build({
  bundle: true,
  format: "iife",
  jsx: "automatic",
  logLevel: "silent",
  platform: "browser",
  stdin: {
    contents: fixture,
    loader: "jsx",
    resolveDir: root,
    sourcefile: "ordered-choice-fixture.jsx",
  },
  write: false,
});
const css = await readFile(
  new URL("../styles/tokens.css", import.meta.url),
  "utf8",
);
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Ordered choices</title><style>${css}main{box-sizing:border-box;max-width:48rem;margin:auto;padding:1rem}main>button{margin:0 .5rem 1rem 0}output{display:block}</style></head><body><div id="root"></div></body></html>`;
const browser = await chromium.launch({
  executablePath: existsSync("/usr/bin/google-chrome")
    ? "/usr/bin/google-chrome"
    : undefined,
  headless: true,
});

async function order(page) {
  return page.getByRole("status", { name: "Current order" }).textContent();
}

try {
  for (const [width, scale] of [
    [1280, 1],
    [390, 1],
    [390, 2],
  ]) {
    const context = await browser.newContext({
      viewport: { width, height: 844 },
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setContent(html);
    await page.addScriptTag({ content: result.outputFiles[0].text });
    if (scale === 2)
      await page.addStyleTag({ content: "html{font-size:200%}" });
    const list = page.getByRole("list", { name: "Route chain" });
    const add = page.getByRole("combobox", { name: "Add route" });
    await page
      .getByRole("button", { name: "Reorder Alpha", exact: true })
      .focus();
    await page.keyboard.press("ArrowDown");
    assert.equal(await order(page), "beta,alpha");
    assert.equal(
      await page
        .getByRole("button", { name: "Reorder Alpha", exact: true })
        .evaluate((element) => element === document.activeElement),
      true,
    );
    await page.keyboard.press("ArrowDown");
    assert.equal(
      await page.getByRole("status", { name: "Reorder calls" }).textContent(),
      "1",
      "Moving past the end must not call the host.",
    );
    await page
      .getByRole("button", { name: "Move Alpha up", exact: true })
      .click();
    assert.equal(await order(page), "alpha,beta");

    await add.fill("vision");
    const popup = page.getByRole("listbox");
    assert.equal(await popup.locator("option").count(), 1);
    await popup.selectOption("gamma");
    assert.equal(await order(page), "alpha,beta,gamma");
    assert.equal(
      await page.getByRole("status", { name: "Add calls" }).textContent(),
      "1",
      "Choosing a result must add it once, without a second action.",
    );
    assert.equal(
      await add.isDisabled(),
      true,
      "The maximum must disable addition.",
    );
    assert.equal(
      await page
        .getByRole("button", { name: "Reorder Gamma", exact: true })
        .evaluate((element) => element === document.activeElement),
      true,
      "If addition disables the picker, focus must move to the new row.",
    );

    const source = await page
      .getByRole("button", { name: "Reorder Alpha", exact: true })
      .boundingBox();
    const target = await list.locator("li").last().boundingBox();
    assert.ok(source && target);
    await page.mouse.move(
      source.x + source.width / 2,
      source.y + source.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(
      target.x + target.width / 2,
      target.y + target.height / 2,
      { steps: 8 },
    );
    await page.mouse.move(
      target.x + target.width / 2,
      target.y + target.height / 2 + 1,
    );
    await page.mouse.up();
    assert.equal(
      await order(page),
      "beta,gamma,alpha",
      `Drag reordering must submit the exact stable ID order at ${width}px and ${scale}x text.`,
    );
    const compactRows = await list.locator("li").evaluateAll((elements) =>
      elements.map((element) => ({
        height: element.getBoundingClientRect().height,
        overflow: element.scrollWidth > element.clientWidth + 1,
      })),
    );
    assert.equal(
      compactRows.some((row) => row.overflow),
      false,
      "All reorder controls must fit the middle row.",
    );
    if (scale === 1)
      assert.equal(
        compactRows.some((row) => row.height > 64),
        false,
        "Short ordered choices must stay in compact rows on desktop and phone.",
      );
    await page
      .getByRole("button", { name: "Remove Beta", exact: true })
      .click();
    assert.equal(await order(page), "gamma,alpha");
    assert.equal(
      await page
        .getByRole("button", { name: "Reorder Gamma", exact: true })
        .evaluate((element) => element === document.activeElement),
      true,
      "Removal must focus the following row.",
    );

    await page
      .getByRole("button", { name: "Toggle disabled", exact: true })
      .click();
    assert.equal(await list.locator("button:not(:disabled)").count(), 0);
    assert.equal(await add.isDisabled(), true);
    await page
      .getByRole("button", { name: "Toggle disabled", exact: true })
      .click();
    await add.click();
    const unused = await page
      .getByRole("listbox")
      .locator("option")
      .evaluateAll((elements) => elements.map((element) => element.value));
    assert.deepEqual(
      unused,
      ["beta", "disabled"],
      "Already selected choices must be absent from addition options.",
    );
    assert.equal(
      await page
        .getByRole("listbox")
        .locator('option[value="disabled"]')
        .isDisabled(),
      true,
    );
    await page.keyboard.press("Escape");
    await page
      .getByRole("button", { name: "Toggle long names", exact: true })
      .click();
    const geometry = await list.evaluate((element) => ({
      overflow: element.scrollWidth > element.clientWidth + 1,
      rowOverflow: [...element.children].some(
        (row) => row.scrollWidth > row.clientWidth + 1,
      ),
    }));
    assert.deepEqual(
      geometry,
      { overflow: false, rowOverflow: false },
      "Names and reorder controls must fit at narrow widths and larger text.",
    );
    const axe = await new AxeBuilder({ page }).analyze();
    assert.deepEqual(
      axe.violations,
      [],
      "The ordered choice editor must pass Axe.",
    );
    await list.screenshot({
      path: `/tmp/opendle-ordered-choices-${width}-${scale}.png`,
    });
    await page.getByRole("button", { name: /^Remove alpha route/ }).click();
    assert.equal(
      await page
        .getByRole("button", { name: /^Remove gamma route/ })
        .evaluate((element) => element === document.activeElement),
      true,
      "Removal of the last row must focus the previous row.",
    );
    await page.getByRole("button", { name: /^Remove gamma route/ }).click();
    assert.equal(await order(page), "");
    assert.equal(
      await add.evaluate((element) => element === document.activeElement),
      true,
      "Removing the final row must focus the add control.",
    );
    assert.deepEqual(errors, []);
    await context.close();
  }
  process.stdout.write("Ordered choice list browser checks passed.\n");
} finally {
  await browser.close();
}
