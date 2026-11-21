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
import React from "react";
import {createRoot} from "react-dom/client";
import {ChannelList} from "./dist/index.js";

const names = ["publish", "community", "messages", "analytics"];
const labels = {publish: "Publish", community: "Comments & mentions", messages: "Messages", analytics: "Analytics"};
const icons = {publish: "send", community: "message", messages: "mail", analytics: "chart"};
const help = {publish: "Publish posts to this channel", community: "Read comments and mentions", messages: "Read direct messages", analytics: "Collect analytics"};
// 1 is on, 0 is off, and - is unavailable.
const rows = [
  ["youtube", "tubededentifrice", "@tubededentifrice", "11-1", ["long", "music"]],
  ["instagram", "vincent.music", "@vincent.music", "1101", ["short"]],
  ["tiktok", "Vincent", "@vincent", "1--1", []],
  ["facebook", "Vincent Music", "Page", "1011", ["long"]],
  ["threads", "vincent.music", "@vincent.music", "10-0", []],
  ["x", "Vincent", "@vincent_music", "0100", ["short", "news", "tour"]],
  ["bluesky", "vincent.bsky.social", "@vincent.bsky.social", "11-1", []],
  ["pinterest", "Vincent Music", "vincentmusic", "1---", ["boards"], "via Buffer"],
  ["tumblr", "vincentmusic", "vincentmusic.tumblr.com", "1-01", []],
];
const items = rows.map(([network, name, handle, states, tags, connectionLabel], index) => ({
  id: "c" + index, network, name, handle, tags, needsReconnect: index === 4,
  ...(connectionLabel ? {connectionLabel} : {}),
  switches: names.map((id, place) => ({
    id, label: labels[id], on: states[place] === "1", icon: icons[id], description: help[id],
    ...(states[place] === "-" ? {disabled: true, disabledReason: labels[id] + " is not supported"} : {}),
  })),
}));
const nothing = async () => {};
createRoot(document.getElementById("root")).render(
  <main style={{padding: 16, maxWidth: 1600, margin: "0 auto"}}>
    <ChannelList items={items} networks={[]} errorMessage={() => "Failed"} tagColors={{long: 2, short: 5, music: 8}}
      onRename={nothing} onTagsChange={nothing} onSwitchChange={nothing} onDisconnect={nothing} onPasswordConnect={nothing}/>
  </main>,
);`;
const bundled = await build({
  stdin: { contents: fixture, loader: "jsx", resolveDir: root },
  bundle: true,
  write: false,
  format: "iife",
});
const directory = mkdtempSync(join(tmpdir(), "opendle-channel-grid-"));
const pagePath = join(directory, "index.html");
writeFileSync(
  pagePath,
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Channels</title><link rel="stylesheet" href="${pathToFileURL(join(root, "styles/index.css")).href}"></head><body><div id="root"></div><script>${bundled.outputFiles[0].text.replaceAll("</script", "<\\/script")}</script></body></html>`,
);
const browser = await chromium.launch({ headless: true });

/** The left and right edges of the cells of one kind, in each row. */
const edges = (page, selector) =>
  page.locator(".od-channel-row").evaluateAll(
    (rows, cell) =>
      rows.map((row) => {
        const box = row.querySelector(cell)?.getBoundingClientRect();
        return box === undefined
          ? null
          : [Math.round(box.left), Math.round(box.right)];
      }),
    selector,
  );

try {
  for (const colorScheme of ["light", "dark"]) {
    for (const width of [1400, 1100, 920, 390]) {
      const context = await browser.newContext({
        colorScheme,
        reducedMotion: "reduce",
        viewport: { width, height: 1000 },
      });
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(pathToFileURL(pagePath).href);
      await page.evaluate(() => document.fonts.ready);
      const name = `${colorScheme}-${String(width)}`;
      await page.locator(".od-channel-row").first().waitFor();
      assert.equal(await page.locator(".od-channel-row").count(), 9);

      // Each switch column, and the actions, have one place and one width
      // in all rows.
      for (let column = 1; column <= 4; column += 1) {
        const cells = await edges(
          page,
          `.od-channel-switches > :nth-child(${String(column)})`,
        );
        assert.equal(
          new Set(cells.map((cell) => JSON.stringify(cell))).size,
          1,
          `${name}: switch column ${String(column)} ${JSON.stringify(cells)}`,
        );
      }
      // A switch shows its icon, and its label when the width permits. The
      // label stays its accessible name, and its help text shows on hover.
      const collapsed = width === 1100 || width === 390;
      const label = page
        .locator(".od-channel-row")
        .first()
        .locator(".od-channel-switch-label")
        .first();
      assert.equal(
        ((await label.boundingBox())?.width ?? 0) <= 1,
        collapsed,
        `${name}: collapsed labels`,
      );
      const publish = page.getByRole("button", { name: "Publish" }).first();
      assert.equal(
        await publish.getAttribute("title"),
        "Publish posts to this channel",
      );
      assert.equal(await publish.locator("svg").count(), 1);
      const unavailable = page
        .getByRole("button", { name: "Messages" })
        .first();
      assert.equal(await unavailable.isDisabled(), true);
      assert.equal(
        await unavailable.getAttribute("title"),
        "Messages is not supported",
      );
      // One icon with a line across it: the blocked mark does not show.
      assert.equal(
        await unavailable.locator("svg:visible").count(),
        1,
        `${name}: unavailable icon`,
      );
      if (width > 1100) {
        const actions = await edges(page, ".od-action-menu");
        assert.equal(
          new Set(actions.map((cell) => JSON.stringify(cell))).size,
          1,
          `${name}: actions`,
        );
      }
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
        true,
        `${name}: horizontal overflow`,
      );
      assert.deepEqual(
        (
          await new AxeBuilder({ page }).include(".od-channel-list").analyze()
        ).violations.map((violation) => violation.id),
        [],
        `${name}: axe`,
      );
      if (screenshots !== null) {
        await page.locator(".od-channel-table").screenshot({
          path: join(screenshots, `channels-${name}.png`),
        });
      }
      assert.deepEqual(errors, []);
      await context.close();
    }
  }
} finally {
  await browser.close();
  rmSync(directory, { recursive: true, force: true });
}
console.log("Channel grid browser checks passed.");
