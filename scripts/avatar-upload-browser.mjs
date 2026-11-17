/* global document, window, createImageBitmap */
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
  ["tokens.css", "avatar-upload.css"].map((name) =>
    readFile(new URL(`../styles/${name}`, import.meta.url), "utf8"),
  ),
);
const fixture = String.raw`
import React, {useState} from "react";
import {createRoot} from "react-dom/client";
import {AvatarUpload} from "./dist/index.js";
function Fixture() {
  const [src, setSrc] = useState(null);
  return <main style={{padding: 24, minHeight: "200vh"}}>
    <AvatarUpload name="Ada" src={src} shape="circle" errorMessage={() => "Not a picture"}
      output={{width: 128, type: "image/webp", quality: 0.8}}
      onRemove={async () => setSrc(null)}
      onUpload={async (picture) => {
        window.uploads.push(picture);
        setSrc(URL.createObjectURL(picture));
      }}/>
  </main>;
}
window.uploads = [];
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
    sourcefile: "avatar-upload-fixture.jsx",
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
const imageLeft = (page) =>
  page
    .locator(".od-picture-crop-frame > img")
    .evaluate((image) => Number.parseFloat(image.style.left));

try {
  for (const width of [1280, 390]) {
    const context = await browser.newContext({
      viewport: { width, height: 800 },
    });
    const page = await context.newPage();
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setContent(
      `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Avatar upload check</title><style>${styles.join("\n")}</style></head><body><div id="root"></div></body></html>`,
    );
    await page.addScriptTag({ content: bundle.outputFiles[0].text });
    // A 400 x 200 picture: red on the left half, blue on the right half.
    const png = await page.evaluate(() => {
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 200;
      const context = canvas.getContext("2d");
      context.fillStyle = "#f00";
      context.fillRect(0, 0, 200, 200);
      context.fillStyle = "#00f";
      context.fillRect(200, 0, 200, 200);
      return canvas.toDataURL("image/png").split(",")[1];
    });
    const file = {
      name: "picture.png",
      mimeType: "image/png",
      buffer: Buffer.from(png, "base64"),
    };
    const choose = async () => {
      const chooser = page.waitForEvent("filechooser");
      await page
        .getByRole("button", { name: /Upload picture|Replace/ })
        .click();
      await (await chooser).setFiles(file);
    };

    // A file opens the crop dialog. Tab moves from Close to the frame.
    await choose();
    const dialog = page.getByRole("dialog", { name: "Adjust picture" });
    await dialog.waitFor();
    const frame = dialog.getByRole("group", { name: "Picture position" });
    await page.keyboard.press("Tab");
    assert.equal(
      await frame.evaluate((node) => node === document.activeElement),
      true,
      `${width}: frame focus`,
    );
    const box = await frame.boundingBox();
    assert.ok(box.x >= 0 && box.x + box.width <= width, `${width}: in view`);
    assert.ok(Math.abs(box.width - box.height) < 1, `${width}: square frame`);
    assert.equal(
      await frame.evaluate((node) => getComputedStyle(node).borderRadius),
      "50%",
    );
    assert.equal(await imageLeft(page), -50);
    assert.deepEqual(
      (await new AxeBuilder({ page }).include(".od-dialog").analyze())
        .violations,
      [],
    );

    // The arrow keys move the picture and stop at its edge.
    await page.keyboard.press("ArrowLeft");
    assert.equal(await imageLeft(page), -52);
    for (let step = 0; step < 6; step += 1) {
      await page.keyboard.press("Shift+ArrowLeft");
    }
    assert.equal(await imageLeft(page), -100);

    // A drag moves the picture.
    const center = [box.x + box.width / 2, box.y + box.height / 2];
    await page.mouse.move(...center);
    await page.mouse.down();
    await page.mouse.move(center[0] + box.width / 4, center[1], { steps: 4 });
    await page.mouse.up();
    assert.equal(Math.round(await imageLeft(page)), -75);

    // The slider, the wheel and the + and - keys zoom.
    const zoom = dialog.getByRole("slider", { name: "Zoom" });
    await zoom.fill("2");
    assert.equal(await zoom.inputValue(), "2");
    const scroll = await page.evaluate(() => window.scrollY);
    await page.mouse.move(...center);
    await page.mouse.wheel(0, -200);
    await page.waitForFunction(
      () => Number(document.querySelector('input[type="range"]').value) > 2,
    );
    assert.equal(await page.evaluate(() => window.scrollY), scroll);
    await zoom.fill("1");
    await frame.focus();
    await page.keyboard.press("+");
    assert.equal(await zoom.inputValue(), "1.1");
    await page.keyboard.press("-");
    assert.equal(await zoom.inputValue(), "1");

    // Cancel keeps the old picture.
    await dialog.getByRole("button", { name: "Cancel" }).click();
    await dialog.waitFor({ state: "hidden" });
    assert.equal(await page.evaluate(() => window.uploads.length), 0);

    // Save gives the visible part at the output size and format.
    await choose();
    await dialog.waitFor();
    await frame.focus();
    for (let step = 0; step < 6; step += 1) {
      await page.keyboard.press("Shift+ArrowLeft");
    }
    await dialog.getByRole("button", { name: "Save" }).click();
    await dialog.waitFor({ state: "hidden" });
    const result = await page.evaluate(async () => {
      const [picture] = window.uploads;
      const bitmap = await createImageBitmap(picture);
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const context = canvas.getContext("2d");
      context.drawImage(bitmap, 0, 0);
      const [red, , blue] = context.getImageData(64, 64, 1, 1).data;
      return {
        type: picture.type,
        width: bitmap.width,
        height: bitmap.height,
        red,
        blue,
      };
    });
    assert.equal(result.type, "image/webp");
    assert.equal(result.width, 128);
    assert.equal(result.height, 128);
    assert.ok(result.blue > 200 && result.red < 50, `${width}: right half`);
    assert.ok(
      await page
        .getByRole("button", { name: "Replace" })
        .evaluate((node) => node.isConnected),
    );
    await context.close();
  }
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
}
console.log("Avatar upload browser checks passed.");
