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
  AccountMenu, ApiTokenList, ChannelList, LoadingIndicator, MetricTile, ApplicationShell, AutoGrowTextarea, Avatar,
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
  const [collapsed, setCollapsed] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [passkeys, setPasskeys] = useState([
    {id: "a", label: "MacBook", createdAt: "2026-11-02T10:00:00Z", lastUsedAt: "2026-11-14T08:00:00Z"},
  ]);
  const [tokens, setTokens] = useState([]);
  const [channels, setChannels] = useState([
    {id: "c1", network: "youtube", name: "tubededentifrice", handle: "@tubededentifrice", tags: ["long"], needsReconnect: false,
      switches: [{id: "publish", label: "Publish", on: true}, {id: "community", label: "Community", on: true}, {id: "analytics", label: "Analytics", on: false}]},
    {id: "c2", network: "pinterest", name: "Vincent Music", handle: "@vincent", tags: [], needsReconnect: true,
      switches: [{id: "publish", label: "Publish", on: true}, {id: "community", label: "Community", on: false}, {id: "analytics", label: "Analytics", on: false}]},
  ]);
  const patch = (id, change) => setChannels((list) => list.map((c) => c.id === id ? {...c, ...change(c)} : c));
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
        <NavigationLink href="#settings" icon={<Icon name="settings"/>} label="Overview"/>
      </>}
      account={<AccountMenu avatar={<Avatar name="Vincent"/>} name="Vincent" sections={[
        {id: "account", items: [
          {id: "settings", label: "Settings", icon: <Icon name="settings"/>, onSelect: () => { window.menuChoice = "settings"; }},
          {id: "sign-out", label: "Sign out", icon: <Icon name="sign-out"/>, onSelect: () => { window.menuChoice = "sign-out"; }},
        ]},
        {id: "workspaces", label: "Workspaces", items: [
          {id: "w1", label: "Vincent Music", current: true, onSelect: () => {}},
          {id: "w2", label: "Side project", current: false, onSelect: () => { window.menuChoice = "w2"; }},
        ]},
      ]}/>}
      collapsed={collapsed} onCollapsedChange={setCollapsed}
      secondaryNavigationLabel="Channels"
      secondaryNavigation={<>
        <NavigationLink href="#c1" icon={<NetworkIcon badge network="youtube"/>} label="tubededentifrice"/>
        <NavigationLink href="#c0" icon={<NetworkIcon badge network="tumblr"/>} label="Studio Tubededentifrice Official Long Channel Name"/>
        <NavigationLink href="#c2" icon={<NetworkIcon badge network="instagram"/>} label="vincent.music" active/>
        <NavigationLink nested href="#c2-calendar" icon={<Icon name="calendar"/>} label="Calendar"/>
      </>}>
      <PageHeading title="Settings" actions={<Button variant="quiet" icon={<Icon name="sign-out" size={15}/>}>Sign out</Button>}/>
      <PasskeyList items={passkeys} errorMessage={message}
        onAdd={async () => { setPasskeys((p) => [...p, {id: "b", label: "", createdAt: "2026-11-14T09:00:00Z"}]); showToast("Passkey added"); }}
        onRemove={async (id) => { setPasskeys((p) => p.filter((k) => k.id !== id)); showToast("Passkey removed"); }}
        onRename={async (id, label) => { if (label === "fail") throw new Error("no"); setPasskeys((p) => p.map((k) => k.id === id ? {...k, label} : k)); }}/>
      <AvatarUpload name="Vincent" src={null} errorMessage={message} onUpload={async () => {}} onRemove={async () => {}}/>
      <ApiTokenList items={tokens} errorMessage={message}
        onCreate={async (name) => { setTokens((t) => [...t, {id: name, name, createdAt: "2026-11-14T09:00:00Z"}]); return "pst_3f9a7c2e41b85d06c9e1f4a7b2d8"; }}
        onRevoke={async (id) => { setTokens((t) => t.filter((k) => k.id !== id)); }}/>
      <ChannelList items={channels} errorMessage={message}
        networks={[{network: "youtube", label: "YouTube", href: "#oauth-youtube"}, {network: "pinterest", label: "Pinterest", href: "#oauth-pinterest"}, {network: "bluesky", label: "Bluesky"}]}
        onRename={async (id, name) => patch(id, () => ({name}))}
        onTagsChange={async (id, tags) => patch(id, () => ({tags}))}
        onSwitchChange={async (id, switchId, on) => patch(id, (c) => ({switches: c.switches.map((s) => s.id === switchId ? {...s, on} : s)}))}
        onDisconnect={async (id) => setChannels((list) => list.filter((c) => c.id !== id))}
        onPasswordConnect={async (network, handle) => { if (handle === "bad") throw new Error("no"); setChannels((list) => [...list, {id: "c3", network, name: handle, handle, tags: [], needsReconnect: false, switches: []}]); }}/>
      <dl className="od-metrics" style={{marginTop: 36}}>
        <MetricTile label="Views" value="18.4K" change="+12%" trend="up"/>
        <MetricTile label="Likes" value="1,204" change="-3%" trend="down"/>
        <MetricTile label="Comments" value="37"/>
      </dl>
      <Section title="Primitives">
        <Card padded>
          <Tabs idBase="demo" label="Messages" value={tab} onChange={setTab}
            items={[{id: "inbox", label: "Inbox", count: 12}, {id: "replied", label: "Replied to"}, {id: "ignored", label: "Ignored"}]}/>
          <TabPanel idBase="demo" id={tab}>
            <p id="panel-text">{tab}</p>
            <p>{networkNames.map((n) => <NetworkIcon key={n} network={n} badge/>)}</p>
            <p><TagChip pressed={pressed} onPressedChange={setPressed}>#short</TagChip> <TagChip>#reel</TagChip></p>
            <p id="tag-colors">{Array.from({length: 12}, (_, i) => <TagChip key={i} color={i + 1}>#tag-{i + 1}</TagChip>)}</p>
            <p>{Array.from({length: 12}, (_, i) => <TagChip key={i} color={i + 1} pressed={i % 2 === 0} onPressedChange={() => {}}>#filter-{i + 1}</TagChip>)}</p>
            <LoadingIndicator label="Loading" block/>
            <p><Button loading>Saving</Button> <Button loading variant="secondary">Saving</Button></p>
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
      const current = page.getByRole("link", { name: "vincent.music" });
      if (width !== 390) {
        assert.equal(await current.getAttribute("aria-current"), "page");
      }
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
      // A long channel name stays in its row, with the full name as a title.
      if (width !== 390) {
        const long = page.getByRole("link", {
          name: "Studio Tubededentifrice Official Long Channel Name",
        });
        assert.equal(
          await long.getAttribute("title"),
          "Studio Tubededentifrice Official Long Channel Name",
        );
        const longBox = await long.boundingBox();
        assert.ok(
          longBox.x + longBox.width <= sidebar.x + sidebar.width,
          "a long name does not go out of the sidebar",
        );
        if (width === 1440) {
          assert.equal(
            await long
              .locator(".od-navigation-label")
              .evaluate((label) => label.scrollWidth > label.clientWidth),
            true,
            "a long name ends with an ellipsis",
          );
        }
      }
      await audit(page, `${name}-page`);

      // The account menu: arrow keys move, Escape closes, a choice runs.
      const account = page.getByRole("button", {
        name: "Vincent",
        exact: true,
      });
      await account.click();
      const menu = page.getByRole("menu", { name: "Vincent" });
      await menu.waitFor();
      const settingsItem = menu.getByRole("menuitem", { name: "Settings" });
      assert.equal(
        await settingsItem.evaluate((item) => item === document.activeElement),
        true,
        "the first entry has the focus",
      );
      assert.equal(
        await menu
          .getByRole("menuitemradio", { name: "Vincent Music" })
          .getAttribute("aria-checked"),
        "true",
      );
      const menuBox = await menu.boundingBox();
      assert.ok(
        menuBox.x >= 0 && menuBox.x + menuBox.width <= width && menuBox.y >= 0,
        "the menu stays in the window",
      );
      await audit(page, `${name}-menu`);
      await page.keyboard.press("Escape");
      await menu.waitFor({ state: "detached" });
      assert.equal(
        await account.evaluate((button) => button === document.activeElement),
        true,
        "Escape returns the focus to the account button",
      );
      await account.click();
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("Enter");
      assert.equal(await page.evaluate(() => window.menuChoice), "sign-out");
      await menu.waitFor({ state: "detached" });
      await account.click();
      await page.mouse.click(width - 5, 5);
      await menu.waitFor({ state: "detached" });

      // The collapse button changes the sidebar to icons on a wide window.
      const collapse = page.getByRole("button", {
        name: "Collapse the sidebar",
      });
      if (width === 1440) {
        await collapse.click();
        assert.equal(
          (await page.locator(".od-application-sidebar").boundingBox()).width,
          64,
        );
        await audit(page, `${name}-collapsed`);
        await page.getByRole("button", { name: "Expand the sidebar" }).click();
        assert.equal(
          (await page.locator(".od-application-sidebar").boundingBox()).width,
          216,
        );
      } else {
        assert.equal(await collapse.isVisible(), false);
      }

      // On a phone, one button opens the second list in a sheet.
      if (width === 390) {
        await page.getByRole("button", { name: "Channels" }).click();
        const sheet = page.getByRole("dialog", { name: "Channels" });
        await sheet
          .getByRole("link", { name: "YouTube tubededentifrice", exact: true })
          .waitFor();
        await audit(page, `${name}-channels`);
        await sheet
          .getByRole("link", { name: "YouTube tubededentifrice", exact: true })
          .click();
        await sheet.waitFor({ state: "hidden" });
      }

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

      // Channels: rename in place, tags, switches, connect, disconnect.
      const channelsRegion = page.getByRole("region", { name: "Channels" });
      await channelsRegion
        .getByRole("button", { name: "Rename: tubededentifrice" })
        .dblclick();
      await page
        .getByRole("textbox", { name: "Rename: tubededentifrice" })
        .fill("Main channel");
      await page.keyboard.press("Enter");
      await channelsRegion
        .getByRole("button", { name: "Rename: Main channel" })
        .waitFor();
      const tagField = channelsRegion.getByRole("textbox", {
        name: "Tags: Main channel",
      });
      await tagField.fill("#Short Form");
      await page.keyboard.press("Enter");
      await channelsRegion.getByText("#short-form").waitFor();
      await channelsRegion
        .getByRole("button", { name: "Remove tag: long" })
        .click();
      assert.equal(await channelsRegion.getByText("#long").count(), 0);
      const analytics = channelsRegion
        .getByRole("button", { name: "Analytics" })
        .first();
      await analytics.click();
      assert.equal(await analytics.getAttribute("aria-pressed"), "true");
      await channelsRegion.getByText("Authorization ended").waitFor();
      assert.equal(
        await channelsRegion
          .getByRole("link", { name: "Reconnect" })
          .getAttribute("href"),
        "#oauth-pinterest",
      );
      await audit(page, `${name}-channels-list`);
      await channelsRegion
        .getByRole("button", { name: "Connect", exact: true })
        .click();
      const connect = page.getByRole("dialog", { name: "Connect a channel" });
      await connect.getByRole("link", { name: "YouTube" }).waitFor();
      const mark = await connect.locator(".od-network").first().boundingBox();
      assert.equal(mark.width, mark.height, "a network mark is round");
      await audit(page, `${name}-connect`);
      await connect.getByRole("button", { name: "Bluesky" }).click();
      const form = page.getByRole("dialog", { name: "Bluesky" });
      await form.getByLabel("Handle").fill("bad");
      await form.getByLabel("App password").fill("abcd-efgh");
      await page.keyboard.press("Enter");
      await form.getByRole("alert").waitFor();
      await form.getByLabel("Handle").fill("vincent.bsky.social");
      await page.keyboard.press("Enter");
      await form.waitFor({ state: "hidden" });
      await channelsRegion.getByText("vincent.bsky.social").first().waitFor();
      await channelsRegion
        .getByRole("button", { name: "Disconnect: vincent.bsky.social" })
        .click();
      await page
        .getByRole("dialog", { name: "Disconnect this channel?" })
        .getByRole("button", { name: "Disconnect" })
        .click();
      await channelsRegion
        .getByRole("button", { name: "Disconnect: vincent.bsky.social" })
        .waitFor({ state: "detached" });

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

      // Twelve tag colours, each different. The loading sign fades and does
      // not turn with reduced motion.
      const tagFills = await page
        .locator("#tag-colors .od-tag")
        .evaluateAll((tags) =>
          tags.map((tag) => getComputedStyle(tag).backgroundColor),
        );
      assert.equal(new Set(tagFills).size, 12);
      assert.equal(
        await page
          .getByRole("status", { name: "Loading" })
          .locator(".od-loading-ring")
          .evaluate((ring) => getComputedStyle(ring).animationName),
        "od-loading-fade",
      );
      assert.equal(
        await page.getByRole("button", { name: "Saving" }).first().isDisabled(),
        true,
      );
      // Each network mark has the network name as a tooltip.
      assert.equal(
        await page
          .locator(".od-network")
          .evaluateAll((marks) => marks.every((mark) => mark.title !== "")),
        true,
      );

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
