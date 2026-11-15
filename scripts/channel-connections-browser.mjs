/* global document, window */
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import AxeBuilder from "@axe-core/playwright";
import { chromium } from "@playwright/test";
import { build } from "esbuild";

assert.equal(process.argv.length, 2, "This check accepts no arguments.");
const root = fileURLToPath(new URL("..", import.meta.url));
const fixture = `
import React, {useState} from "react";
import {createRoot} from "react-dom/client";
import {ChannelList, Dialog, TextControl} from "./dist/index.js";
const nothing = async () => {};
function App() {
 const [open,setOpen] = useState(false);
 const [readonly,setReadonly] = useState(false);
 const [native,setNative] = useState(true);
 const [secret,setSecret] = useState("");
 const [connectOpen,setConnectOpen] = useState();
 window.setConnectOpen = setConnectOpen;
 window.configureChannels = (readOnly, native) => {setReadonly(readOnly);setNative(native)};
 return <main><h1>Channel connections</h1>
 <ChannelList items={[{id:"buffer",network:"pinterest",name:"Music",handle:"music",tags:[],switches:[],needsReconnect:true,connectionProvider:"gateway"}, {id:"native",network:"pinterest",name:"Native",handle:"native",tags:[],switches:[],needsReconnect:true}]}
 connectOpen={connectOpen} onConnectOpenChange={setConnectOpen}
 readOnly={readonly} networks={native ? [{network:"pinterest",label:"Pinterest",href:"#native"},{network:"bluesky",label:"Bluesky"}] : []}
 connectionProviders={[{id:"gateway",label:"External gateway",onSelect:()=>setOpen(true)}]}
 errorMessage={()=>"Failed"} onRename={nothing} onTagsChange={nothing} onSwitchChange={nothing} onDisconnect={nothing} onPasswordConnect={nothing}/>
 {open ? <Dialog open title="External gateway" onClose={()=>setOpen(false)}><TextControl label="API key" type="password" value={secret} onChange={event=>setSecret(event.currentTarget.value)} data-dialog-initial-focus/></Dialog> : null}
 </main>;
}
createRoot(document.getElementById("root")).render(<App/>);`;
const bundle = await build({
  stdin: { contents: fixture, loader: "jsx", resolveDir: root },
  bundle: true,
  write: false,
  format: "iife",
});
const directory = mkdtempSync(join(tmpdir(), "opendle-channel-connections-"));
const pagePath = join(directory, "index.html");
writeFileSync(
  pagePath,
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Channel connections</title><link rel="stylesheet" href="${pathToFileURL(join(root, "styles/tokens.css")).href}"></head><body><div id="root"></div><script>${bundle.outputFiles[0].text.replaceAll("</script", "<\\/script")}</script></body></html>`,
);
const browser = await chromium.launch({ headless: true });
try {
  for (const width of [390, 1440]) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(pathToFileURL(pagePath).href);
    const add = page.getByRole("button", { name: "Connect", exact: true });
    await add.click();
    const picker = page.getByRole("dialog", { name: "Connect a channel" });
    await picker.getByRole("link", { name: /Pinterest/ }).waitFor();
    await picker
      .getByRole("button", { name: "External gateway", exact: true })
      .focus();
    await page.keyboard.press("Enter");
    const gateway = page.getByRole("dialog", {
      name: "External gateway",
      exact: true,
    });
    const key = gateway.getByLabel("API key");
    await key.waitFor();
    assert.equal(await picker.isVisible(), false);
    assert.equal(await page.locator("dialog:modal").count(), 1);
    assert.equal(await key.getAttribute("type"), "password");
    assert.equal(
      await key.evaluate((node) => node === document.activeElement),
      true,
    );
    await key.fill("test-secret");
    assert.equal(await key.inputValue(), "test-secret");
    assert.deepEqual(
      (await new AxeBuilder({ page }).analyze()).violations.map(
        (item) => item.id,
      ),
      [],
    );
    await page.keyboard.press("Escape");
    await gateway.waitFor({ state: "detached" });
    assert.equal(
      await add.evaluate((node) => node === document.activeElement),
      true,
    );

    // A routed reconnect must never use the same network's native OAuth link.
    const bufferRow = page.locator(".od-channel-row").filter({
      has: page.getByRole("button", { name: "Rename: Music", exact: true }),
    });
    assert.equal(
      await bufferRow.getByRole("link", { name: "Reconnect" }).count(),
      0,
    );
    await bufferRow
      .getByRole("button", { name: "Reconnect", exact: true })
      .click();
    await gateway.waitFor();
    await page.keyboard.press("Escape");
    const nativeRow = page.locator(".od-channel-row").filter({
      has: page.getByRole("button", { name: "Rename: Native", exact: true }),
    });
    assert.equal(
      await nativeRow
        .getByRole("link", { name: "Reconnect" })
        .getAttribute("href"),
      "#native",
    );

    // Existing password connections still work and mask their app passwords.
    await add.click();
    await picker.getByRole("button", { name: /Bluesky/ }).click();
    const bluesky = page.getByRole("dialog", { name: "Bluesky", exact: true });
    assert.equal(
      await bluesky.getByLabel("App password").getAttribute("type"),
      "password",
    );
    await page.keyboard.press("Escape");

    // A host can open and close the same picker without its Connect button.
    await page.evaluate(() => window.setConnectOpen(true));
    await picker.waitFor();
    await page.keyboard.press("Escape");
    await picker.waitFor({ state: "hidden" });
    await page.evaluate(() => window.setConnectOpen(true));
    await picker.waitFor();
    await page.evaluate(() => window.setConnectOpen(false));
    await picker.waitFor({ state: "hidden" });

    // The provider alone is sufficient to make the connect action available.
    await page.evaluate(() => window.configureChannels(false, false));
    await add.click();
    await picker
      .getByRole("button", { name: "External gateway", exact: true })
      .click();
    await gateway.waitFor();
    await page.keyboard.press("Escape");
    await page.evaluate(() => window.configureChannels(true, false));
    await add.waitFor({ state: "detached" });
    await page.evaluate(() => window.setConnectOpen(true));
    assert.equal(await picker.isVisible(), false);
    assert.equal(
      await page
        .getByRole("button", { name: "Reconnect", exact: true })
        .count(),
      0,
    );
    assert.equal(
      await page.getByRole("link", { name: "Reconnect", exact: true }).count(),
      0,
    );
    assert.deepEqual(errors, []);
    await context.close();
  }
} finally {
  await browser.close();
  rmSync(directory, { recursive: true, force: true });
}
console.log("Channel connection browser checks passed.");
