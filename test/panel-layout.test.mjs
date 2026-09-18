import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { Panel, PanelBody, PanelHeader, SummaryFacts } from "../dist/index.js";

test("panel bodies keep labelled summaries readable at desktop, phone, and enlarged text", async () => {
  const browser = await chromium.launch({
    ...(existsSync("/usr/bin/google-chrome")
      ? { executablePath: "/usr/bin/google-chrome" }
      : {}),
  });
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    const css = await readFile(
      new URL("../styles/tokens.css", import.meta.url),
      "utf8",
    );
    const values = [
      "Example",
      "W".repeat(200),
      "A long value with spaces ".repeat(20),
      "0",
    ];
    const markup = renderToStaticMarkup(
      React.createElement(
        Panel,
        null,
        React.createElement(PanelHeader, { title: "Record details" }),
        React.createElement(
          PanelBody,
          { "data-testid": "body" },
          React.createElement(SummaryFacts, {
            "aria-label": "Record facts",
            items: values.map((value, index) => ({
              label: `Field ${index + 1}`,
              value,
            })),
          }),
          React.createElement("p", null, "Each value stays with its label."),
        ),
        React.createElement(
          PanelBody,
          { "data-testid": "empty" },
          React.createElement(SummaryFacts, { items: [] }),
        ),
      ),
    );
    for (const width of [1440, 1100, 390])
      for (const textSize of [100, 200]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.setContent(
          `<html lang="en"><head><title>Panel layout</title><style>${css} html{font-size:${textSize}%} body{margin:0;padding:16px} *{box-sizing:border-box}</style></head><body><main><h1>Summary</h1>${markup}</main></body></html>`,
        );
        assert.deepEqual(await page.locator("dd").allTextContents(), values);
        assert.equal(await page.locator("dt").count(), 4);
        const geometry = await page.evaluate(() => {
          const panel = document
            .querySelector(".od-panel")
            .getBoundingClientRect();
          const facts = document
            .querySelector(".od-summary-facts")
            .getBoundingClientRect();
          return {
            overflow: document.documentElement.scrollWidth > innerWidth,
            left: facts.left - panel.left,
            right: panel.right - facts.right,
          };
        });
        assert.equal(geometry.overflow, false);
        assert.ok(geometry.left >= 16 && geometry.right >= 16);
        assert.equal(
          (await new AxeBuilder({ page }).analyze()).violations.length,
          0,
        );
      }
  } finally {
    await browser.close();
  }
});
