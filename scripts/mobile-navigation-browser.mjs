import { createServer } from "node:http";
import { strict as assert } from "node:assert";
import { existsSync } from "node:fs";
import { mkdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import AxeBuilder from "@axe-core/playwright";
import { chromium } from "@playwright/test";
import { build } from "esbuild";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));
const fixture = String.raw`
import React, { StrictMode, useLayoutEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { ApplicationShell, ApplicationSidebar, ApplicationNavigation, NavigationLink, MobileNavigation, Button, Icon } from "./dist/index.js";
const labels = ["Overview", "Services", "LLM configuration", "Logs", "Usage & cost", "Activity & health"];
function Fixture() {
  const [route, setRoute] = useState(0);
  const [legacy, setLegacy] = useState(0);
  const [account, setAccount] = useState(0);
  const [present, setPresent] = useState(true);
  const [long, setLong] = useState(false);
  const heading = useRef(null);
  const previousRoute = useRef(route);
  const items = labels.map((label, id) => ({id: String(id), label: long ? label + " with a longer destination label" : label, icon: <Icon name="grid" />, href: "/destination/" + id, active: route === id }));
  useLayoutEffect(() => { if (previousRoute.current !== route) heading.current?.focus(); previousRoute.current = route; }, [route]);
  window.fixture = {
    remove: () => setPresent(false),
    long: () => setLong(true),
    route: (id) => setRoute(id),
    cancelReopenNavigate: () => {
      flushSync(() => document.querySelector(".od-mobile-navigation-surface .od-dialog-actions button:last-child").click());
      flushSync(() => document.querySelector("[aria-haspopup='dialog']").click());
      document.querySelector(".od-mobile-navigation-surface a[href='/destination/3']").click();
    },
  };
  const navigate = (item, event) => {
    event.preventDefault();
    history.pushState({}, "", item.href);
    setRoute(Number(item.id));
    // Exercise immediate focus as well as route-entry layout focus.
    heading.current?.focus();
  };
  return <>
    <a className="fixture-skip" href="#content">Skip to content</a>
    <ApplicationShell
      mainProps={{id: "content"}}
      sidebar={<ApplicationSidebar brand="Example application" context="Administrator: Example user"
        navigation={<ApplicationNavigation aria-label="Desktop destinations">{items.map(item => <NavigationLink key={item.id} {...item} onClick={event => navigate(item,event)} />)}</ApplicationNavigation>}
        footer={<Button onClick={() => setAccount(value => value + 1)}>Desktop account action</Button>}
      />}
      mobileNavigation={present ? <MobileNavigation aria-label="Phone destinations"
        items={[...items.slice(0,2), {id:"legacy",label:"Assistant",icon:<Icon name="spark"/>,badge:3}]}
        onSelect={() => setLegacy(value => value + 1)} onNavigate={navigate}
        surface={{label:"All destinations",icon:<Icon name="menu"/>,applicationName:"Example application",context:{label:"Administrator",value:"Example user"},closeLabel:"Close navigation",items,
          accountActions:<><Button onClick={() => setAccount(value => value + 1)}>Account settings</Button><Button onClick={() => setAccount(value => value + 1)}>Sign out</Button></>}}
      /> : <></>}
    >
      <section className="fixture-page">
        <h1 tabIndex={-1} ref={heading}>{labels[route]}</h1>
        <Button>Route action</Button>
        <output aria-label="Legacy count">{legacy}</output>
        <output aria-label="Account count">{account}</output>
        <div className="fixture-page-end">End of route content</div>
      </section>
    </ApplicationShell>
  </>;
}
createRoot(document.getElementById("root")).render(<StrictMode><Fixture/></StrictMode>);
`;

export async function checkMobileNavigation(browser) {
  const bundle = await build({
    bundle: true,
    format: "iife",
    stdin: {
      contents: fixture,
      loader: "jsx",
      resolveDir: repositoryRoot,
      sourcefile: "mobile-navigation-fixture.jsx",
    },
    write: false,
  });
  const css = await readFile(
    new URL("../styles/tokens.css", import.meta.url),
    "utf8",
  );
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>Navigation checks</title><style>${css}
.fixture-skip{position:fixed;left:1rem;top:-10rem;z-index:100}.fixture-skip:focus{top:1rem}
.fixture-page{display:flex;flex-direction:column;height:calc(100dvh - var(--od-application-navigation-height,0px));padding:1rem;gap:1rem}.fixture-page h1{margin:0}.fixture-page-end{margin-top:auto}
</style></head><body><div id="root"></div><script>${bundle.outputFiles[0].text}</script></body></html>`;
  const server = createServer((_request, response) => {
    response.writeHead(200, { "Content-Type": "text/html" });
    response.end(html);
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const origin = "http://127.0.0.1:" + server.address().port;
  const artifacts = "/tmp/opendle-ui-phone-navigation";
  await mkdir(artifacts, { recursive: true });
  const labels = [
    "Overview",
    "Services",
    "LLM configuration",
    "Logs",
    "Usage & cost",
    "Activity & health",
  ];
  try {
    for (const viewport of [
      { width: 1440, height: 1000 },
      { width: 1100, height: 800 },
      { width: 390, height: 844 },
    ]) {
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      await page.goto(origin);
      await page
        .getByRole("heading", { name: "Overview", exact: true })
        .waitFor();
      assert.equal(await page.locator(".od-application-topbar").count(), 0);
      const row = page.getByRole("navigation", { name: "Phone destinations" });
      const dialog = page.getByRole("dialog", { name: "Example application" });
      const trigger = page.getByRole("button", {
        name: "All destinations",
        exact: true,
      });
      const focusIs = async (locator) =>
        assert.equal(
          await locator.evaluate((node) => node === document.activeElement),
          true,
        );
      const settle = () =>
        page.evaluate(
          () =>
            new Promise((resolve) =>
              requestAnimationFrame(() => requestAnimationFrame(resolve)),
            ),
        );
      const geometry = async () => {
        await settle();
        const result = await page.evaluate(() => {
          const shell = document.querySelector(".od-application-shell");
          const row = document
            .querySelector(".od-application-mobile-navigation")
            .getBoundingClientRect();
          const content = document
            .querySelector(".fixture-page")
            .getBoundingClientRect();
          const main = document
            .querySelector(".od-application-main")
            .getBoundingClientRect();
          const sidebar = document
            .querySelector(".od-application-sidebar")
            .getBoundingClientRect();
          return {
            main: { left: main.left, top: main.top, bottom: main.bottom },
            sidebar: {
              top: sidebar.top,
              bottom: sidebar.bottom,
              right: sidebar.right,
              width: sidebar.width,
            },
            reserve: parseFloat(
              getComputedStyle(shell).getPropertyValue(
                "--od-application-navigation-height",
              ),
            ),
            row: row.height,
            contentBottom: content.bottom,
            rowTop: row.top,
            contentTop: content.top,
            width: document.documentElement.scrollWidth,
            height: document.documentElement.scrollHeight,
            viewportWidth: innerWidth,
            viewportHeight: innerHeight,
          };
        });
        assert.equal(result.reserve, result.row);
        assert.equal(result.contentTop, 0);
        assert.equal(result.main.top, 0);
        if (viewport.width === 390) {
          assert.equal(result.sidebar.width, 0);
          assert.equal(result.main.left, 0);
          assert.ok(
            Math.abs(result.main.bottom - result.rowTop) < 1,
            JSON.stringify(result),
          );
        } else {
          assert.equal(result.sidebar.top, 0);
          assert.equal(result.sidebar.bottom, result.viewportHeight);
          assert.ok(
            Math.abs(result.sidebar.right - result.main.left) < 1,
            JSON.stringify(result),
          );
        }
        assert.ok(result.width <= result.viewportWidth, JSON.stringify(result));
        assert.ok(
          result.height <= result.viewportHeight,
          JSON.stringify(result),
        );
        if (viewport.width === 390)
          assert.ok(
            Math.abs(result.contentBottom - result.rowTop) < 1,
            JSON.stringify(result),
          );
      };
      await geometry();
      assert.equal(await row.isVisible(), viewport.width === 390);
      assert.deepEqual(
        (await new AxeBuilder({ page }).analyze()).violations,
        [],
      );
      await page.screenshot({
        path: `${artifacts}/frame-${viewport.width}.png`,
        fullPage: true,
      });
      if (viewport.width !== 390) {
        await context.close();
        continue;
      }
      await page.keyboard.press("Tab");
      await focusIs(page.getByRole("link", { name: "Skip to content" }));
      await page.keyboard.press("Tab");
      await focusIs(page.getByRole("button", { name: "Route action" }));
      for (const label of ["Overview", "Services"]) {
        await page.keyboard.press("Tab");
        await focusIs(row.getByRole("link", { name: label, exact: true }));
      }
      await page.keyboard.press("Tab");
      await focusIs(
        row.getByRole("button", { name: "Assistant", exact: true }),
      );
      await page.keyboard.press("Enter");
      assert.equal(
        await page.getByRole("status", { name: "Legacy count" }).textContent(),
        "1",
      );
      await trigger.click();
      await focusIs(
        dialog.getByRole("link", { name: "Overview", exact: true }),
      );
      assert.deepEqual(
        (await new AxeBuilder({ page }).analyze()).violations,
        [],
      );
      await page.screenshot({
        path: `${artifacts}/surface-phone.png`,
        fullPage: true,
      });
      assert.equal(
        await dialog
          .getByRole("region", { name: "Administrator" })
          .textContent(),
        "Administrator: Example user",
      );
      assert.equal(
        await dialog
          .getByRole("link", { name: "Overview", exact: true })
          .getAttribute("aria-current"),
        "page",
      );
      for (const label of [
        ...labels.slice(1),
        "Account settings",
        "Sign out",
        "Close navigation",
      ]) {
        await page.keyboard.press("Tab");
        await focusIs(
          dialog.getByRole(labels.includes(label) ? "link" : "button", {
            name: label,
            exact: true,
          }),
        );
      }
      await page.keyboard.press("Tab");
      await focusIs(
        dialog.getByRole("link", { name: "Overview", exact: true }),
      );
      await page.keyboard.press("Shift+Tab");
      await focusIs(dialog.getByRole("button", { name: "Close navigation" }));
      await page.keyboard.press("Escape");
      await settle();
      await focusIs(trigger);
      await trigger.click();
      await dialog.getByRole("button", { name: "Account settings" }).click();
      await dialog
        .getByRole("button", { name: "Sign out", exact: true })
        .click();
      assert.equal(
        await page
          .getByRole("status", { name: "Account count", includeHidden: true })
          .textContent(),
        "2",
      );
      await dialog.getByRole("button", { name: "Close navigation" }).click();
      await settle();
      await focusIs(trigger);
      await trigger.click();
      // Modified and middle activations remain native and do not call the host.
      for (const options of [
        { ctrlKey: true },
        { metaKey: true },
        { shiftKey: true },
        { altKey: true },
        { button: 1 },
      ]) {
        assert.equal(
          await dialog
            .getByRole("link", { name: "Services", exact: true })
            .evaluate((node, options) => {
              let native = false;
              document.addEventListener(
                "click",
                (event) => {
                  native = !event.defaultPrevented;
                  event.preventDefault();
                },
                { once: true },
              );
              node.dispatchEvent(
                new MouseEvent("click", {
                  bubbles: true,
                  cancelable: true,
                  ...options,
                }),
              );
              return native;
            }, options),
          true,
        );
        assert.equal(await dialog.isVisible(), true);
        assert.equal(new URL(page.url()).pathname, "/");
      }
      // Prove a real middle click opens the native href in another page.
      const popupPromise = context.waitForEvent("page");
      await dialog
        .getByRole("link", { name: "Services", exact: true })
        .click({ button: "middle" });
      const popup = await popupPromise;
      await popup.waitForLoadState();
      assert.equal(
        new URL(popup.url()).pathname,
        "/destination/1",
        popup.url(),
      );
      await popup.close();
      assert.equal(await dialog.isVisible(), true);
      await dialog
        .getByRole("link", { name: "Activity & health", exact: true })
        .click();
      await settle();
      assert.equal(await dialog.isVisible(), false);
      await focusIs(
        page.getByRole("heading", { name: "Activity & health", exact: true }),
      );
      await page.keyboard.press("Tab");
      await focusIs(page.getByRole("button", { name: "Route action" }));
      await trigger.click();
      assert.equal(
        await dialog
          .getByRole("link", { name: "Activity & health", exact: true })
          .getAttribute("aria-current"),
        "page",
      );
      await dialog.getByRole("link", { name: "Services", exact: true }).click();
      await settle();
      assert.equal(
        await row
          .getByRole("link", { name: "Services", exact: true })
          .getAttribute("aria-current"),
        "page",
      );
      await focusIs(
        page.getByRole("heading", { name: "Services", exact: true }),
      );
      // A later removal of the closed modal must not restore its old trigger.
      await trigger.click();
      await page.evaluate(() => window.fixture.cancelReopenNavigate());
      await settle();
      await focusIs(page.getByRole("heading", { name: "Logs", exact: true }));
      await page.evaluate(() => window.fixture.remove());
      await settle();
      await focusIs(page.getByRole("heading", { name: "Logs", exact: true }));
      await page.reload();
      await trigger.click();
      await page.setViewportSize({ width: 1100, height: 800 });
      assert.equal(await dialog.isVisible(), true);
      await dialog.getByRole("link", { name: "Logs", exact: true }).click();
      await settle();
      await focusIs(page.getByRole("heading", { name: "Logs", exact: true }));
      await page.setViewportSize(viewport);
      await trigger.click();
      await page.evaluate(() => window.fixture.remove());
      await settle();
      assert.equal(await dialog.isVisible(), false);
      assert.equal(
        await page.evaluate(() => document.activeElement?.isConnected),
        true,
      );
      await page.reload();
      await page.evaluate(() => {
        document.documentElement.style.fontSize = "200%";
        window.fixture.long();
      });
      const cdp = await context.newCDPSession(page);
      await cdp.send("Emulation.setSafeAreaInsetsOverride", {
        insets: { bottom: 24 },
      });
      await geometry();
      assert.equal(
        await row.evaluate((node) => getComputedStyle(node).paddingBottom),
        "24px",
      );
      await page.screenshot({
        path: `${artifacts}/phone-large-text.png`,
        fullPage: true,
      });
      await trigger.click();
      for (const link of await dialog.getByRole("link").all()) {
        await link.focus();
        await focusIs(link);
        assert.ok(
          await link.evaluate((node) => {
            const r = node.getBoundingClientRect();
            return r.left >= 0 && r.right <= innerWidth && r.height >= 44;
          }),
        );
      }
      assert.deepEqual(
        (await new AxeBuilder({ page }).analyze()).violations,
        [],
      );
      const linkBounds = await dialog.getByRole("link").evaluateAll((nodes) =>
        nodes.map((node) => {
          const r = node.getBoundingClientRect();
          return {
            top: r.top,
            bottom: r.bottom,
            height: r.height,
            scroll: node.scrollHeight,
          };
        }),
      );
      for (let index = 1; index < linkBounds.length; index++)
        assert.ok(
          linkBounds[index].top >= linkBounds[index - 1].bottom,
          JSON.stringify(linkBounds),
        );
      for (const bounds of linkBounds)
        assert.ok(bounds.height >= bounds.scroll, JSON.stringify(linkBounds));
      await dialog.getByRole("link").first().scrollIntoViewIfNeeded();
      await page.screenshot({
        path: `${artifacts}/surface-large-text.png`,
        fullPage: true,
      });
      await page.keyboard.press("Escape");
      await settle();
      await focusIs(trigger);
      await page.setViewportSize({ width: 390, height: 620 });
      await geometry();
      await trigger.click();
      await focusIs(dialog.getByRole("link").first());
      await dialog
        .getByRole("button", { name: "Close navigation" })
        .scrollIntoViewIfNeeded();
      assert.ok(
        await dialog
          .getByRole("button", { name: "Close navigation" })
          .evaluate((node) => {
            const r = node.getBoundingClientRect();
            return r.top >= 0 && r.bottom <= innerHeight;
          }),
      );
      await page.screenshot({
        path: `${artifacts}/surface-short-viewport.png`,
        fullPage: true,
      });
      await page.keyboard.press("Escape");
      await settle();
      await focusIs(trigger);
      assert.deepEqual(errors, []);
      await context.close();
    }
  } finally {
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
  process.stdout.write("Mobile navigation browser checks passed.\n");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const browser = await chromium.launch({
    executablePath: existsSync("/usr/bin/google-chrome")
      ? "/usr/bin/google-chrome"
      : undefined,
    headless: true,
  });
  try {
    await checkMobileNavigation(browser);
  } finally {
    await browser.close();
  }
}
