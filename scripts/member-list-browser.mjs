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
import {MemberList, Section} from "./dist/index.js";

const roles = [{value: "reader", label: "Reader"}, {value: "writer", label: "Writer"}, {value: "admin", label: "Admin"}];
const remove = [{id: "remove", label: "Remove", tone: "danger", onSelect: () => {}}];
const items = [
  {id: "u1", name: "Vincent Courcelle-Labrousse", email: "vincent@example.com", role: "admin", you: true, roleEditable: true,
    actions: [{id: "leave", label: "Leave workspace", tone: "danger", onSelect: () => {}}]},
  {id: "u2", name: "Ann", email: "ann.long.address.for.a.test@example.com", role: "writer", roleEditable: true, actions: remove},
  {id: "u3", name: "bob@example.com", email: "bob@example.com", role: "reader", roleEditable: true, href: "#bob",
    status: {label: "Locked", tone: "amber"}, actions: remove},
  {id: "i1", name: "cid@example.com", role: "writer", invitation: true, status: {label: "Invited", tone: "blue"},
    detail: "Invited by Vincent · expires in 6 days", actions: [{id: "resend", label: "Resend", onSelect: () => {}}]},
  {id: "i2", name: "dan@example.com", role: "reader", invitation: true, status: {label: "Declined", tone: "red"},
    detail: "Invited by Ann", actions: remove},
];
createRoot(document.getElementById("root")).render(
  <main style={{padding: 16, maxWidth: 1100, margin: "0 auto"}}>
    <Section title="Members">
      <MemberList items={items} roles={roles} errorMessage={() => "Failed"} onRoleChange={async () => {}}
        roleConfirmation={(item, role) => item.id === "u1" ? {title: "Change your role?", description: "You lose the admin rights.", confirmLabel: "Change role"} : null}/>
    </Section>
  </main>,
);`;
const bundled = await build({
  stdin: { contents: fixture, loader: "jsx", resolveDir: root },
  bundle: true,
  write: false,
  format: "iife",
});
const directory = mkdtempSync(join(tmpdir(), "opendle-member-list-"));
const pagePath = join(directory, "index.html");
writeFileSync(
  pagePath,
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Members</title><link rel="stylesheet" href="${pathToFileURL(join(root, "styles/index.css")).href}"></head><body><div id="root"></div><script>${bundled.outputFiles[0].text.replaceAll("</script", "<\\/script")}</script></body></html>`,
);
const browser = await chromium.launch({ headless: true });

/** The left edges of one kind of cell, in each row. */
const lefts = (page, selector) =>
  page
    .locator(".od-member-row")
    .evaluateAll(
      (rows, cell) =>
        rows.map((row) =>
          Math.round(
            row.querySelector(cell)?.getBoundingClientRect().left ?? -1,
          ),
        ),
      selector,
    );

try {
  for (const colorScheme of ["light", "dark"]) {
    for (const width of [1100, 700, 390]) {
      const context = await browser.newContext({
        colorScheme,
        reducedMotion: "reduce",
        viewport: { width, height: 800 },
      });
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(pathToFileURL(pagePath).href);
      await page.evaluate(() => document.fonts.ready);
      const name = `${colorScheme}-${String(width)}`;
      await page.locator(".od-member-row").first().waitFor();
      assert.equal(await page.locator(".od-member-row").count(), 5);

      // The roles and the menus of all rows align.
      for (const selector of [".od-member-role", ".od-member-actions"]) {
        assert.equal(
          new Set(await lefts(page, selector)).size,
          1,
          `${name}: ${selector}`,
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
          await new AxeBuilder({ page }).include(".od-member-list").analyze()
        ).violations.map((violation) => violation.id),
        [],
        `${name}: axe`,
      );
      if (width === 1100 && colorScheme === "light") {
        // A role change of the own account asks first.
        await page
          .getByRole("combobox", { name: "Role: Vincent Courcelle-Labrousse" })
          .selectOption("writer");
        const dialog = page.getByRole("dialog", { name: "Change your role?" });
        await dialog.waitFor();
        await dialog.getByRole("button", { name: "Cancel" }).click();
        await dialog.waitFor({ state: "hidden" });
        assert.equal(
          await page
            .getByRole("combobox", {
              name: "Role: Vincent Courcelle-Labrousse",
            })
            .inputValue(),
          "admin",
        );
      }
      if (screenshots !== null) {
        await page.locator(".od-member-card").screenshot({
          path: join(screenshots, `members-${name}.png`),
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
console.log("Member list browser checks passed.");
