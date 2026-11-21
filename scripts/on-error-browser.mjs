import { strict as assert } from "node:assert";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";
import { build } from "esbuild";

// With `onError`, a component gives each failure to the host and shows no
// alert. Without it, the component shows the failure in an alert.
assert.equal(process.argv.length, 2, "This check accepts no arguments.");
const root = fileURLToPath(new URL("..", import.meta.url));
const fixture = `
import React, {useState} from "react";
import {createRoot} from "react-dom/client";
import {
  ApiTokenList, AvatarUpload, ChannelList, Conversation, PasskeyList, PostDetailDialog,
} from "./dist/index.js";

const fail = (name) => async () => { throw new Error(name + " failed"); };
const message = (error) => error.message;
const picture = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect width="8" height="8" fill="#888"/></svg>');
function App() {
  const host = location.hash === "#host";
  const [errors, setErrors] = useState([]);
  const [open, setOpen] = useState(false);
  const report = host ? {onError: (text) => setErrors((list) => [...list, text])} : {};
  return (
    <main>
      <output id="errors">{errors.join("|")}</output>
      <PasskeyList items={[{id: "a", label: "Laptop", createdAt: "2026-11-02T10:00:00Z"}]} errorMessage={message}
        onAdd={fail("passkey")} onRemove={fail("unused")} {...report}/>
      <ApiTokenList items={[{id: "t", name: "CI", createdAt: "2026-11-02T10:00:00Z"}]} errorMessage={message}
        onCreate={fail("token")} onRevoke={fail("revoke")} {...report}/>
      <AvatarUpload name="Vincent" src={picture} errorMessage={message} onUpload={fail("upload")} onRemove={fail("avatar")} {...report}/>
      <ChannelList items={[{id: "c", network: "youtube", name: "Main", handle: "@main", tags: [], needsReconnect: false,
        switches: [{id: "publish", label: "Publish", on: false}]}]} networks={[]} errorMessage={message}
        onRename={fail("rename")} onTagsChange={fail("tags")} onSwitchChange={fail("switch")} onDisconnect={fail("disconnect")}
        onPasswordConnect={fail("connect")} {...report}/>
      <Conversation selectedId="m" errorMessage={message} onReply={fail("reply")} {...report}
        messages={[{id: "m", depth: 0, authorName: "Mara", authorHandle: "@mara", avatarUrl: null, text: "Hello", when: "1 h",
          createdAt: "2026-11-14T09:00:00Z", own: false, liked: false, likeCount: null, state: "new", canReply: true, canLike: false}]}/>
      <button type="button" onClick={() => setOpen(true)}>Open post</button>
      <PostDetailDialog open={open} onClose={() => setOpen(false)} title="Post" errorMessage={message} onRetry={fail("retry")} {...report}
        targets={[{id: "p", network: "youtube", name: "Main", state: "failed", error: "Upload error", text: "Hello", when: "Today"}]}/>
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
const directory = mkdtempSync(join(tmpdir(), "opendle-on-error-"));
const pagePath = join(directory, "index.html");
writeFileSync(
  pagePath,
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Errors</title><link rel="stylesheet" href="${pathToFileURL(join(root, "styles/index.css")).href}"></head><body><div id="root"></div><script>${bundled.outputFiles[0].text.replaceAll("</script", "<\\/script")}</script></body></html>`,
);
const browser = await chromium.launch({ headless: true });

/** Each step causes one failure, then returns to a neutral state. */
const steps = [
  [
    "passkey",
    (page) => page.getByRole("button", { name: "Add passkey" }).click(),
  ],
  [
    "revoke",
    async (page) => {
      await page.getByRole("button", { name: "Revoke: CI" }).click();
      await page
        .getByRole("dialog")
        .getByRole("button", { name: "Revoke", exact: true })
        .click();
    },
  ],
  [
    "avatar",
    (page) => page.getByRole("button", { name: "Remove", exact: true }).click(),
  ],
  ["switch", (page) => page.getByRole("button", { name: "Publish" }).click()],
  [
    "reply",
    async (page) => {
      await page.getByRole("textbox", { name: "Reply to Mara" }).fill("Hi");
      await page.keyboard.press("Enter");
    },
  ],
  [
    "retry",
    async (page) => {
      await page.getByRole("button", { name: "Open post" }).click();
      await page.getByRole("button", { name: "Retry" }).click();
    },
  ],
];

try {
  for (const mode of ["inline", "host"]) {
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`${pathToFileURL(pagePath).href}#${mode}`);
    const reported = [];
    for (const [name, act] of steps) {
      await act(page);
      const text = `${name} failed`;
      if (mode === "host") {
        reported.push(text);
        await page.waitForFunction(
          (expected) =>
            document.getElementById("errors")?.textContent === expected,
          reported.join("|"),
        );
        assert.equal(
          await page.getByRole("alert").filter({ hasText: text }).count(),
          0,
          `${name}: no alert with onError`,
        );
      } else {
        await page.getByRole("alert").filter({ hasText: text }).waitFor();
        assert.equal(await page.locator("#errors").textContent(), "");
      }
      // A failed revocation keeps its confirmation open.
      if (name === "revoke") {
        await page
          .getByRole("dialog")
          .getByRole("button", { name: "Cancel" })
          .click();
      }
    }
    // A failed reply keeps its text.
    assert.equal(
      await page.getByRole("textbox", { name: "Reply to Mara" }).inputValue(),
      "Hi",
    );
    assert.deepEqual(errors, []);
    await page.close();
  }
} finally {
  await browser.close();
  rmSync(directory, { recursive: true, force: true });
}
console.log("Host error browser checks passed.");
