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
import { Button, Dialog, IconButton, OrderedChoiceList, SwitchControl } from "./dist/index.js";
const options = [
  { value: "alpha", label: "Alpha" }, { value: "beta", label: "Beta" },
  { value: "gamma", label: "Gamma" },
  ...Array.from({length:20},(_,index)=>({value:"extra-"+index,label:"Extra route "+index})),
];
function Fixture() {
  const [ids, setIds] = useState(["alpha", "beta"]);
  const [enabled, setEnabled] = useState(true);
  const [open, setOpen] = useState(true);
  const [playCount, setPlayCount] = useState(0);
  return <main><h1>Modal form controls</h1>
    <Dialog open={open} appearance="form" title="Edit assignment" onClose={()=>setOpen(false)}
      headerActions={<IconButton aria-label="Play assignment" icon={<span aria-hidden="true">▷</span>} onClick={()=>setPlayCount((value)=>value+1)} />}
      actions={<Button>Save assignment</Button>}>
      <SwitchControl label="Enabled" data-dialog-initial-focus checked={enabled} onChange={(event)=>setEnabled(event.currentTarget.checked)} />
      <div className="fixture-spacer" aria-hidden="true" />
      <OrderedChoiceList label="Assignment chain" addLabel="Add route" items={ids.map((id)=>({id,value:id,label:options.find((option)=>option.value===id).label,detail:"Provider"}))} options={options}
        onAdd={(value)=>setIds((items)=>[...items,value])}
        onRemove={(id)=>setIds((items)=>items.filter((value)=>value!==id))}
        onReorder={(items)=>setIds([...items])} />
      <output aria-label="Current order">{ids.join(",")}</output>
      <output aria-label="Play count">{playCount}</output>
    </Dialog></main>;
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
    sourcefile: "modal-form-controls-fixture.jsx",
  },
  write: false,
});
const css = await readFile(
  new URL("../styles/tokens.css", import.meta.url),
  "utf8",
);
const chipsFixture = String.raw`
import React, {useState} from "react";
import {createRoot} from "react-dom/client";
import {AdvancedFieldsDisclosure, Button, CheckboxChipGroup, CheckboxControl, Dialog, FormActions} from "./dist/index.js";
const choices = ["Tools", "Vision", "Audio input", "Audio output", "Images", "Video", "JSON", "Reasoning", "Streaming", "Embeddings", "Structured output"];
function Fixture() {
  const [selected, setSelected] = useState(["Tools"]);
  const [disabled, setDisabled] = useState(false);
  return <main><h1>Compact choices</h1><Dialog open appearance="form" title="Edit requirements" onClose={()=>{}} actions={<Button>Save</Button>}>
    <FormActions alignment="start" layout="wrap" aria-label="Inheritance actions">
      <span>Inherits from <strong>Parent assignment</strong></span><Button variant="quiet">Change</Button><Button variant="quiet">Stop inheriting</Button>
    </FormActions>
    <CheckboxChipGroup label="Requirements" disabled={disabled}>
      {choices.map((label)=><CheckboxControl key={label} label={label} appearance="chip" checked={selected.includes(label)} onChange={(event)=>{const checked=event.currentTarget.checked;setSelected((items)=>checked?[...items,label]:items.filter((item)=>item!==label));}} />)}
    </CheckboxChipGroup>
    <Button variant="quiet" onClick={()=>setDisabled((value)=>!value)}>Lock requirements</Button>
    <output aria-label="Selected requirements">{selected.join(",")}</output>
    <AdvancedFieldsDisclosure summary="Assignment details">Details</AdvancedFieldsDisclosure>
  </Dialog></main>;
}
createRoot(document.getElementById("root")).render(<Fixture />);
`;
const chipsBuild = await build({
  bundle: true,
  format: "iife",
  jsx: "automatic",
  logLevel: "silent",
  platform: "browser",
  stdin: {
    contents: chipsFixture,
    loader: "jsx",
    resolveDir: root,
    sourcefile: "checkbox-chip-fixture.jsx",
  },
  write: false,
});
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Modal form controls</title><style>${css}.fixture-spacer{height:12rem}.od-dialog-body{max-height:25rem}output{display:block}</style></head><body><div id="root"></div></body></html>`;
const browser = await chromium.launch({
  executablePath: existsSync("/usr/bin/google-chrome")
    ? "/usr/bin/google-chrome"
    : undefined,
  headless: true,
});

try {
  for (const width of [1280, 390]) {
    const context = await browser.newContext({
      viewport: { width, height: 844 },
      hasTouch: true,
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setContent(html);
    await page.addScriptTag({ content: result.outputFiles[0].text });
    const dialog = page.getByRole("dialog", { name: "Edit assignment" });
    const enabled = dialog.getByRole("switch", { name: "Enabled" });
    const checkedBackground = await enabled.evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    );
    await enabled.click();
    await enabled.evaluate(async (element) => {
      await Promise.all(
        element.getAnimations().map((animation) => animation.finished),
      );
    });
    const uncheckedBackground = await enabled.evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    );
    assert.notEqual(
      checkedBackground,
      uncheckedBackground,
      "Enabled and disabled switch tracks must be visibly different.",
    );
    await enabled.click();
    assert.equal(await enabled.isChecked(), true);
    const play = dialog.getByRole("button", { name: "Play assignment" });
    assert.equal(
      await play.evaluate(
        (element) => element.closest(".od-dialog-header") !== null,
      ),
      true,
    );
    await play.click();
    assert.equal(
      await dialog.getByRole("status", { name: "Play count" }).textContent(),
      "1",
    );
    const body = dialog.locator(".od-dialog-body");
    const add = dialog.getByRole("combobox", { name: "Add route" });
    await add.scrollIntoViewIfNeeded();
    const before = await body.evaluate((element) => ({
      height: element.scrollHeight,
      top: element.scrollTop,
    }));
    await add.click();
    const popup = dialog.getByRole("listbox");
    assert.equal(
      await popup.evaluate((element) => element.matches(":popover-open")),
      true,
      "Options must use the browser top layer inside a native modal.",
    );
    const after = await body.evaluate((element) => ({
      height: element.scrollHeight,
      top: element.scrollTop,
    }));
    assert.deepEqual(
      after,
      before,
      "Opening options must not create or change modal scrolling.",
    );
    const hit = await popup.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      const point = document.elementFromPoint(
        bounds.left + bounds.width / 2,
        bounds.bottom - 4,
      );
      return {
        top: bounds.top,
        bottom: bounds.bottom,
        hit: point === element || element.contains(point),
        bodyBottom: element
          .closest("dialog")
          .querySelector(".od-dialog-body")
          .getBoundingClientRect().bottom,
      };
    });
    assert.ok(hit.top >= 0 && hit.bottom <= 844);
    assert.equal(
      hit.hit,
      true,
      "Popup options must receive pointer events above the modal footer and clipping regions.",
    );
    assert.ok(
      hit.bottom > hit.bodyBottom,
      "The fixture must exercise popup content outside the scroll body.",
    );
    await page.screenshot({ path: `/tmp/opendle-modal-popup-${width}.png` });
    const popupAxe = await new AxeBuilder({ page })
      .include("dialog[open]")
      .analyze();
    assert.deepEqual(
      popupAxe.violations,
      [],
      "An open top-layer option list must stay accessible inside its modal.",
    );
    await popup.getByRole("option", { name: "Gamma", exact: true }).click();
    assert.equal(
      await dialog.getByRole("status", { name: "Current order" }).textContent(),
      "alpha,beta,gamma",
    );
    assert.equal(
      await add.evaluate((element) => element === document.activeElement),
      true,
      "Pointer selection must keep focus on the searchable input.",
    );
    await page.setViewportSize({ width, height: 480 });
    await add.scrollIntoViewIfNeeded();
    await add.click();
    const above = await popup.boundingBox();
    const anchor = await add.boundingBox();
    assert.ok(above && anchor);
    assert.ok(
      above.y >= 0 && above.y + above.height <= anchor.y + 1,
      "Options must open above an input near the viewport bottom.",
    );
    await page.keyboard.press("Escape");
    assert.equal(
      await dialog.isVisible(),
      true,
      "Escape must close options before it closes the modal.",
    );
    assert.equal(await dialog.getByRole("listbox").count(), 0);
    await page.setViewportSize({ width, height: 844 });
    await add.fill("Extra route 0");
    await page.keyboard.press("Enter");
    assert.equal(
      await dialog.getByRole("status", { name: "Current order" }).textContent(),
      "alpha,beta,gamma,extra-0",
      "Keyboard selection must add a route inside the modal.",
    );
    await dialog
      .getByRole("button", { name: "Remove Extra route 0", exact: true })
      .click();

    const list = dialog.getByRole("list", { name: "Assignment chain" });
    await list.scrollIntoViewIfNeeded();
    const source = await dialog
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
    await page.mouse.up();
    assert.equal(
      await dialog.getByRole("status", { name: "Current order" }).textContent(),
      "beta,gamma,alpha",
      "Real pointer drag inside a modal must reorder the chain.",
    );
    const touchSource = await dialog
      .getByRole("button", { name: "Reorder Beta", exact: true })
      .boundingBox();
    const touchTarget = await list.locator("li").last().boundingBox();
    assert.ok(touchSource && touchTarget);
    const cdp = await context.newCDPSession(page);
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [
        {
          x: touchSource.x + touchSource.width / 2,
          y: touchSource.y + touchSource.height / 2,
        },
      ],
    });
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [
        {
          x: touchTarget.x + touchTarget.width / 2,
          y: touchTarget.y + touchTarget.height / 2,
        },
      ],
    });
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    assert.equal(
      await dialog.getByRole("status", { name: "Current order" }).textContent(),
      "gamma,alpha,beta",
      "Touch drag inside a modal must reorder the chain.",
    );
    const axe = await new AxeBuilder({ page })
      .include("dialog[open]")
      .analyze();
    assert.deepEqual(axe.violations, []);
    assert.deepEqual(errors, []);
    await dialog.screenshot({
      path: `/tmp/opendle-modal-form-controls-${width}.png`,
    });
    await context.close();
  }
  for (const width of [1280, 390]) {
    const context = await browser.newContext({
      viewport: { width, height: 844 },
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setContent(
      `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Compact choices</title><style>${css}</style></head><body><div id="root"></div></body></html>`,
    );
    await page.addScriptTag({ content: chipsBuild.outputFiles[0].text });
    const dialog = page.getByRole("dialog", { name: "Edit requirements" });
    const group = dialog.getByRole("group", { name: "Requirements" });
    const tools = group.getByRole("checkbox", { name: "Tools", exact: true });
    const vision = group.getByRole("checkbox", { name: "Vision", exact: true });
    assert.equal(await tools.isChecked(), true);
    const checkedColor = await tools.evaluate(
      (element) =>
        getComputedStyle(element.closest(".od-checkbox-control"))
          .backgroundColor,
    );
    const uncheckedColor = await vision.evaluate(
      (element) =>
        getComputedStyle(element.closest(".od-checkbox-control"))
          .backgroundColor,
    );
    assert.notEqual(checkedColor, uncheckedColor);
    await group
      .locator("label")
      .filter({ hasText: /^Vision$/ })
      .click();
    assert.equal(
      await vision.isChecked(),
      true,
      "The whole chip label must toggle its native checkbox.",
    );
    const chip = await vision.evaluate((element) => {
      const rect = element
        .closest(".od-checkbox-control")
        .getBoundingClientRect();
      return { x: rect.left + rect.width - 3, y: rect.top + rect.height / 2 };
    });
    await page.mouse.click(chip.x, chip.y);
    assert.equal(
      await vision.isChecked(),
      false,
      "Clicking chip padding must toggle its checkbox.",
    );
    await vision.check();
    assert.equal(
      await vision.isChecked(),
      true,
      "The native checkbox must receive direct pointer input.",
    );
    await vision.uncheck();
    assert.equal(await vision.isChecked(), false);
    await dialog.getByRole("button", { name: "Change", exact: true }).focus();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    assert.equal(
      await tools.evaluate((element) => element === document.activeElement),
      true,
    );
    assert.equal(
      await tools.evaluate((element) => element.matches(":focus-visible")),
      true,
    );
    assert.notEqual(
      await tools.evaluate(
        (element) =>
          getComputedStyle(element.closest(".od-checkbox-control"))
            .outlineStyle,
      ),
      "none",
    );
    await page.keyboard.press("Space");
    assert.equal(await tools.isChecked(), false);
    const actions = dialog.locator('.od-form-actions[data-layout="wrap"]');
    assert.equal(
      await actions.evaluate(
        (element) => getComputedStyle(element).flexDirection,
      ),
      "row",
    );
    const changeBox = await actions
      .getByRole("button", { name: "Change", exact: true })
      .boundingBox();
    const actionBox = await actions.boundingBox();
    assert.ok(
      changeBox.width < actionBox.width / 2,
      "Context buttons must keep their natural width on phones.",
    );
    const disclosure = await dialog
      .locator(".od-advanced-fields")
      .evaluate((element) => ({
        height: element.getBoundingClientRect().height,
        summaryHeight: element.querySelector("summary").getBoundingClientRect()
          .height,
      }));
    assert.ok(
      Math.abs(disclosure.height - disclosure.summaryHeight - 2) < 1,
      "Closed disclosures must keep their natural height in a full-height modal.",
    );
    for (const zoom of [1, 2]) {
      await page.evaluate((size) => {
        document.documentElement.style.fontSize = `${size * 100}%`;
      }, zoom);
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        true,
        "Text zoom must not cause page overflow.",
      );
      const bounds = await group.evaluate((element) => {
        const parent = element.getBoundingClientRect();
        const children = [...element.children].map((child) =>
          child.getBoundingClientRect(),
        );
        return {
          inside: children.every(
            (rect) =>
              rect.left >= parent.left - 1 && rect.right <= parent.right + 1,
          ),
          rows: new Set(children.map((rect) => Math.round(rect.top))).size,
          maxHeight: Math.max(...children.map((rect) => rect.height)),
        };
      });
      assert.equal(bounds.inside, true, "Choices must wrap inside the modal.");
      if (width === 390) assert.ok(bounds.rows > 1);
      if (zoom === 1)
        assert.ok(
          bounds.maxHeight <= 36,
          `Normal text choices must keep a compact row height (${width}: ${bounds.maxHeight}px).`,
        );
      const disclosure = await dialog
        .getByText("Assignment details", { exact: true })
        .boundingBox();
      assert.ok(disclosure);
      assert.ok(
        disclosure.height <= 3.5 * 16 * zoom,
        "A closed disclosure must keep its natural height inside the modal body.",
      );
    }
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "100%";
    });
    await dialog.screenshot({
      path: `/tmp/opendle-checkbox-chips-${width}.png`,
    });
    await dialog.getByRole("button", { name: "Lock requirements" }).click();
    assert.equal(await vision.isDisabled(), true);
    const disabledLabel = await group
      .locator("label")
      .filter({ hasText: /^Vision$/ })
      .boundingBox();
    assert.ok(disabledLabel);
    await page.mouse.click(
      disabledLabel.x + disabledLabel.width / 2,
      disabledLabel.y + disabledLabel.height / 2,
    );
    assert.equal(
      await vision.isChecked(),
      false,
      "A disabled native group must block label changes.",
    );
    const axe = await new AxeBuilder({ page })
      .include("dialog[open]")
      .analyze();
    assert.deepEqual(axe.violations, []);
    assert.deepEqual(errors, []);
    await context.close();
  }
  process.stdout.write(
    "Modal form control and compact choice browser checks passed.\n",
  );
} finally {
  await browser.close();
}
