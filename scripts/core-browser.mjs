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
import {
  AccountMenu, ApiTokenList, ApplicationShell, AutoGrowTextarea, Avatar,
  AvatarUpload, Button, Card, Icon, InlineAlert, NavigationLink, NetworkIcon,
  PageHeading, PasskeyList, Section, SessionPage, SignInCard, TabPanel, Tabs,
  TagChip, Toast, networkNames, useToastQueue,
} from "./dist/index.js";

const message = () => "The request failed.";
function Mark() {
  return <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><circle cx="11" cy="11" r="11" fill="currentColor"/></svg>;
}
function App() {
  const [tab, setTab] = useState("inbox");
  const [pressed, setPressed] = useState(false);
  const [passkeys, setPasskeys] = useState([
    {id: "a", label: "MacBook", createdAt: "2026-11-02T10:00:00Z", lastUsedAt: "2026-11-14T08:00:00Z"},
  ]);
  const [tokens, setTokens] = useState([]);
  const {toast, showToast} = useToastQueue(60000);
  if (location.hash === "#sign-in") {
    return <SessionPage><SignInCard icon={<Mark/>} title="Poster" actionLabel="Sign in with a passkey"
      actionIcon={<Icon name="passkey"/>} pendingLabel="Waiting for passkey…"
      onSignIn={() => Promise.reject(new Error("no"))} errorMessage={message}/></SessionPage>;
  }
  return (
    <ApplicationShell brandMark={<Mark/>} brandName="Poster" navigationLabel="Main" skipLabel="Skip to content"
      navigation={<>
        <NavigationLink href="#calendar" icon={<Icon name="calendar"/>} label="Calendar"/>
        <NavigationLink href="#community" icon={<Icon name="message"/>} label="Community" count={12}/>
        <NavigationLink href="#settings" icon={<Icon name="settings"/>} label="Settings" active/>
      </>}
      account={<AccountMenu href="#settings" avatar={<Avatar name="Vincent"/>} name="Vincent"/>}>
      <PageHeading title="Settings" actions={<Button variant="quiet" icon={<Icon name="sign-out" size={15}/>}>Sign out</Button>}/>
      <PasskeyList items={passkeys} errorMessage={message}
        onAdd={async () => { setPasskeys((p) => [...p, {id: "b", label: "", createdAt: "2026-11-14T09:00:00Z"}]); showToast("Passkey added"); }}
        onRemove={async (id) => { setPasskeys((p) => p.filter((k) => k.id !== id)); showToast("Passkey removed"); }}
        onRename={async (id, label) => { if (label === "fail") throw new Error("no"); setPasskeys((p) => p.map((k) => k.id === id ? {...k, label} : k)); }}/>
      <AvatarUpload name="Vincent" src={null} errorMessage={message} onUpload={async () => {}} onRemove={async () => {}}/>
      <ApiTokenList items={tokens} errorMessage={message}
        onCreate={async (name) => { setTokens((t) => [...t, {id: name, name, createdAt: "2026-11-14T09:00:00Z"}]); return "pst_3f9a7c2e41b85d06c9e1f4a7b2d8"; }}
        onRevoke={async (id) => { setTokens((t) => t.filter((k) => k.id !== id)); }}/>
      <Section title="Primitives">
        <Card padded>
          <Tabs idBase="demo" label="Messages" value={tab} onChange={setTab}
            items={[{id: "inbox", label: "Inbox", count: 12}, {id: "replied", label: "Replied to"}, {id: "ignored", label: "Ignored"}]}/>
          <TabPanel idBase="demo" id={tab}>
            <p id="panel-text">{tab}</p>
            <p>{networkNames.map((n) => <NetworkIcon key={n} network={n} badge labelled/>)}</p>
            <p><TagChip pressed={pressed} onPressedChange={setPressed}>#short</TagChip> <TagChip>#reel</TagChip></p>
            <p><Button>Primary</Button> <Button variant="secondary">Secondary</Button> <Button variant="danger">Danger</Button> <Button variant="quiet">Quiet</Button></p>
            <InlineAlert tone="success">Saved</InlineAlert>
            <InlineAlert tone="warning">Authorization expires soon</InlineAlert>
            <InlineAlert tone="error">Board not found</InlineAlert>
            <AutoGrowTextarea aria-label="Reply" defaultValue="@mara.keys"/>
          </TabPanel>
        </Card>
      </Section>
      {toast === null ? null : <Toast key={toast.id} tone={toast.tone}>{toast.message}</Toast>}
    </ApplicationShell>
  );
}
createRoot(document.getElementById("root")).render(<App/>);`;
const bundled = await build({
  stdin: { contents: fixture, loader: "jsx", resolveDir: root },
  bundle: true,
  write: false,
  format: "iife",
});
const directory = mkdtempSync(join(tmpdir(), "opendle-core-"));
const pagePath = join(directory, "index.html");
writeFileSync(
  pagePath,
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Core components</title><link rel="stylesheet" href="${pathToFileURL(join(root, "styles/tokens.css")).href}"></head><body><div id="root"></div><script>${bundled.outputFiles[0].text.replaceAll("</script", "<\\/script")}</script></body></html>`,
);
const pageUrl = pathToFileURL(pagePath).href;
const browser = await chromium.launch({ headless: true });

async function audit(page, name) {
  assert.deepEqual(
    (await new AxeBuilder({ page }).analyze()).violations.map(
      (violation) => `${violation.id}: ${violation.nodes[0]?.html ?? ""}`,
    ),
    [],
    name,
  );
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
    true,
    `${name}: horizontal overflow`,
  );
  if (screenshots !== null) {
    await page.screenshot({
      path: join(screenshots, `${name}.png`),
      fullPage: true,
    });
  }
}

try {
  for (const colorScheme of ["light", "dark"]) {
    for (const width of [1440, 1000, 390]) {
      const context = await browser.newContext({
        colorScheme,
        reducedMotion: "reduce",
        viewport: { width, height: 900 },
      });
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(pageUrl);
      await page.evaluate(() => document.fonts.ready);
      const name = `${colorScheme}-${String(width)}`;

      // The sidebar is a column, then a rail, then a bottom bar.
      const sidebar = await page
        .locator(".od-application-sidebar")
        .boundingBox();
      const settings = page.getByRole("link", { name: "Settings" }).first();
      assert.equal(await settings.getAttribute("aria-current"), "page");
      if (width === 1440) assert.equal(sidebar.width, 216);
      if (width === 1000) assert.equal(sidebar.width, 64);
      if (width === 390) {
        assert.equal(Math.round(sidebar.y + sidebar.height), 900);
        assert.equal(sidebar.width, 390);
      }
      assert.equal(
        await page.getByRole("link", { name: "Community" }).count(),
        1,
        "the rail keeps the accessible name",
      );
      await audit(page, `${name}-page`);

      // One passkey has no remove button. A second passkey shows it.
      assert.equal(
        await page.getByRole("button", { name: /^Remove:/ }).count(),
        0,
      );
      await page.getByRole("button", { name: "Add passkey" }).click();
      await page.getByText("Passkey added").waitFor();
      assert.equal(
        await page.getByRole("button", { name: /^Remove:/ }).count(),
        2,
      );
      await page.getByRole("button", { name: "Remove: Passkey" }).click();
      const confirm = page.getByRole("dialog", {
        name: "Remove this passkey?",
      });
      await confirm.waitFor();
      await audit(page, `${name}-confirm`);
      await page.keyboard.press("Escape");
      await confirm.waitFor({ state: "hidden" });
      assert.equal(
        await page.getByRole("button", { name: /^Remove:/ }).count(),
        2,
      );
      await page.getByRole("button", { name: "Remove: Passkey" }).click();
      await confirm.getByRole("button", { name: "Remove" }).click();
      await confirm.waitFor({ state: "hidden" });
      assert.equal(
        await page.getByRole("button", { name: /^Remove:/ }).count(),
        0,
      );
      // A new message replaces the old one: one toast shows at a time.
      await page.getByText("Passkey removed").waitFor();
      assert.equal(await page.locator(".od-toast").count(), 1);

      // A double click edits the name. Enter saves and Escape cancels.
      await page.getByRole("button", { name: "Rename: MacBook" }).dblclick();
      const nameInput = page.getByRole("textbox", { name: "Rename: MacBook" });
      await nameInput.fill("Office laptop");
      await page.keyboard.press("Enter");
      const renamed = page.getByRole("button", {
        name: "Rename: Office laptop",
      });
      await renamed.waitFor();
      assert.equal(
        await renamed.evaluate((element) => element === document.activeElement),
        true,
        "focus returns to the name after a save",
      );
      await page.keyboard.press("Enter");
      const again = page.getByRole("textbox", {
        name: "Rename: Office laptop",
      });
      await again.fill("Other");
      await page.keyboard.press("Escape");
      await renamed.waitFor();
      await renamed.dblclick();
      await again.fill("fail");
      await page.keyboard.press("Enter");
      await page
        .getByRole("region", { name: "Passkeys" })
        .getByRole("alert")
        .waitFor();
      assert.equal(await again.isVisible(), true, "a failed save stays open");
      await page.keyboard.press("Escape");
      await audit(page, `${name}-renamed`);

      // A token shows its secret one time.
      await page.getByText("No tokens").waitFor();
      await page.getByRole("button", { name: "New token" }).click();
      const create = page.getByRole("dialog", { name: "New API token" });
      await create.waitFor();
      const submit = create.getByRole("button", { name: "Create token" });
      assert.equal(await submit.isDisabled(), true);
      await create.getByLabel("Name").fill("songs agent");
      await page.keyboard.press("Enter");
      const reveal = page.getByRole("dialog", { name: "Copy this token now" });
      await reveal.waitFor();
      assert.equal(
        await reveal.getByLabel("API token").textContent(),
        "pst_3f9a7c2e41b85d06c9e1f4a7b2d8",
      );
      await audit(page, `${name}-token`);
      await reveal.getByRole("button", { name: "Done" }).click();
      await reveal.waitFor({ state: "hidden" });
      await page.getByText("songs agent").waitFor();
      assert.equal(await page.getByText("pst_3f9a").count(), 0);
      await page.getByRole("button", { name: "Revoke: songs agent" }).click();
      await page
        .getByRole("dialog", { name: "Revoke this token?" })
        .getByRole("button", { name: "Revoke" })
        .click();
      await page.getByText("No tokens").waitFor();

      // Tabs move with the arrow keys.
      await page.getByRole("tab", { name: /Inbox/ }).focus();
      await page.keyboard.press("ArrowRight");
      assert.equal(await page.locator("#panel-text").textContent(), "replied");
      await page.keyboard.press("End");
      assert.equal(await page.locator("#panel-text").textContent(), "ignored");
      await page.keyboard.press("ArrowRight");
      assert.equal(await page.locator("#panel-text").textContent(), "inbox");

      // A tag chip with a handler is a toggle.
      const chip = page.getByRole("button", { name: "#short" });
      await chip.click();
      assert.equal(await chip.getAttribute("aria-pressed"), "true");

      // The textarea grows with its content.
      const reply = page.getByLabel("Reply");
      const before = (await reply.boundingBox()).height;
      await reply.fill("one\ntwo\nthree\nfour\nfive");
      assert.ok((await reply.boundingBox()).height > before);

      // Sign-in shows the failure and permits a retry.
      await page.goto(`${pageUrl}#sign-in`);
      await page.reload();
      const action = page.getByRole("button", {
        name: "Sign in with a passkey",
      });
      await action.click();
      await page.getByRole("alert").waitFor();
      assert.equal(await action.isEnabled(), true);
      await audit(page, `${name}-sign-in`);

      assert.deepEqual(errors, []);
      await context.close();
    }
  }
} finally {
  await browser.close();
  rmSync(directory, { recursive: true, force: true });
}
console.log("Core component browser checks passed.");
