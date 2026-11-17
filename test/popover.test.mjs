import { strict as assert } from "node:assert";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  ApplicationShell,
  Popover,
  Section,
  formatAge,
} from "../dist/index.js";

const render = (type, props, ...children) =>
  renderToStaticMarkup(React.createElement(type, props, ...children));

test("Popover is a closed button with a hidden count until a press", () => {
  const markup = render(
    Popover,
    { label: "Alerts", countLabel: "3 unread", count: 3, icon: "bell" },
    "Panel content",
  );
  assert.match(markup, /aria-expanded="false"/);
  assert.match(markup, /aria-haspopup="dialog"/);
  assert.match(markup, /aria-label="Alerts, 3 unread"/);
  assert.match(markup, /title="Alerts"/);
  assert.match(
    markup,
    /<span aria-hidden="true" class="od-count[^"]*">3<\/span>/,
  );
  assert.doesNotMatch(markup, /Panel content/);
});

test("Popover hides a zero count and shortens a large count", () => {
  const empty = render(
    Popover,
    { label: "Alerts", count: 0, icon: "bell" },
    "",
  );
  assert.doesNotMatch(empty, /od-count/);
  assert.match(empty, /aria-label="Alerts"/);
  assert.match(
    render(Popover, { label: "Alerts", count: 120, icon: "bell" }, ""),
    />99\+<\/span>/,
  );
});

test("the application shell puts its actions next to the product name", () => {
  const markup = render(ApplicationShell, {
    actions: "Alert control",
    brandMark: null,
    brandName: "Product",
    navigationLabel: "Main",
    skipLabel: "Skip",
    workspace: "Workspace control",
    navigation: "Navigation control",
    children: "Content",
  });
  assert.match(
    markup,
    /<div class="od-application-header"><a class="od-application-brand"[^>]*>.*Product<\/span><\/a><div class="od-application-actions">Alert control<\/div><\/div>/,
  );
  assert.ok(
    markup.indexOf("Alert control") < markup.indexOf("Workspace control"),
  );
  assert.doesNotMatch(
    render(ApplicationShell, {
      brandMark: null,
      brandName: "Product",
      navigationLabel: "Main",
      skipLabel: "Skip",
      navigation: null,
      children: null,
    }),
    /od-application-actions/,
  );
});

test("Section can be the target of a fragment link", () => {
  assert.match(
    render(Section, { title: "Alerts", id: "alerts" }, "Body"),
    /<section aria-labelledby="[^"]+" class="od-section" id="alerts">/,
  );
});

test("formatAge gives a short age and shows a future instant as now", () => {
  const now = Date.parse("2026-11-17T12:00:00Z");
  assert.equal(formatAge("2026-11-17T11:59:30Z", now, "en"), "now");
  assert.equal(formatAge("2026-11-17T12:05:00Z", now, "en"), "now");
  assert.equal(formatAge("2026-11-17T11:55:00Z", now, "en"), "5m ago");
  assert.equal(
    formatAge(new Date("2026-11-17T09:00:00Z"), now, "en"),
    "3h ago",
  );
  assert.equal(formatAge("2026-11-15T12:00:00Z", now, "en"), "2d ago");
  assert.equal(formatAge("2026-11-03T12:00:00Z", now, "en"), "2w ago");
});
