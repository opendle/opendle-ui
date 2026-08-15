import { strict as assert } from "node:assert";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  AutoGrowTextarea,
  Button,
  Card,
  ContextItem,
  Icon,
  IconButton,
  PageHeading,
  PlanCardShell,
  ShellErrorBoundary,
  StatCard,
  StatusPill,
} from "../dist/index.js";

test("Icon renders a decorative SVG with the shared class", () => {
  const markup = renderToStaticMarkup(React.createElement(Icon, { name: "search", size: 16 }));
  assert.match(markup, /class="od-icon"/);
  assert.match(markup, /aria-hidden="true"/);
  assert.match(markup, /width="16"/);
});

test("StatusPill renders one status dot and its label", () => {
  const markup = renderToStaticMarkup(
    React.createElement(StatusPill, { tone: "lime" }, "Healthy"),
  );
  assert.match(markup, /od-status-pill od-status-lime/);
  assert.match(markup, /od-status-dot od-status-lime/);
  assert.match(markup, />Healthy<\/span>/);
});

test("AutoGrowTextarea keeps the public textarea attributes", () => {
  const markup = renderToStaticMarkup(
    React.createElement(AutoGrowTextarea, { "aria-label": "Draft", maxHeight: 120, rows: 3 }),
  );
  assert.match(markup, /aria-label="Draft"/);
  assert.match(markup, /rows="3"/);
  assert.match(markup, /max-height:120px/);
});

test("shared composition components expose semantic classes and content", () => {
  const markup = renderToStaticMarkup(
    React.createElement(
      Card,
      { "aria-label": "Example card" },
      React.createElement(
        PageHeading,
        { description: "Review the current state.", eyebrow: "Overview", title: "Shared UI" },
      ),
      React.createElement(
        ContextItem,
        { icon: React.createElement(Icon, { name: "activity" }), label: "State", value: "Ready" },
      ),
      React.createElement(
        StatCard,
        { icon: React.createElement(Icon, { name: "health" }), label: "Health", trend: "up", trendClassName: "trend-up", value: "100%" },
      ),
      React.createElement(Button, { variant: "secondary" }, "Continue"),
    ),
  );
  assert.match(markup, /class="od-card"/);
  assert.match(markup, /class="od-page-heading"/);
  assert.match(markup, /class="od-context-item"/);
  assert.match(markup, /class="od-stat-card stat-card"/);
  assert.match(markup, /class="od-stat-trend stat-trend trend-up"/);
  assert.match(markup, /class="od-button od-button-secondary"/);
  assert.match(markup, />Continue<\/button>/);
});

test("shared controls support heading levels, inline statistics, and icon buttons", () => {
  const markup = renderToStaticMarkup(
    React.createElement(
      "div",
      null,
      React.createElement(PageHeading, { eyebrow: "Area", headingLevel: "h2", title: "Details" }),
      React.createElement(StatCard, { icon: React.createElement(Icon, { name: "server" }), label: "Services", note: "Healthy", orientation: "inline", value: "8" }),
      React.createElement(IconButton, { "aria-label": "Refresh", icon: React.createElement(Icon, { name: "refresh" }) }),
    ),
  );
  assert.match(markup, /<h2>Details<\/h2>/);
  assert.match(markup, /class="od-stat-card od-stat-card-inline stat-card"/);
  assert.match(markup, /class="od-icon-button"/);
  assert.match(markup, /aria-label="Refresh"/);
});

test("PlanCardShell keeps an accessible article boundary", () => {
  const markup = renderToStaticMarkup(
    React.createElement(
      PlanCardShell,
      { age: "now", ariaLabel: "Review plan", icon: React.createElement(Icon, { name: "clock" }), meta: "Review", state: "pending", title: "Publish" },
      React.createElement("p", null, "Waiting for review."),
    ),
  );
  assert.match(markup, /class="od-plan-card shared-plan-card"/);
  assert.match(markup, /aria-label="Review plan"/);
  assert.match(markup, /Waiting for review/);
});

test("ShellErrorBoundary renders its children when no error exists", () => {
  const markup = renderToStaticMarkup(
    React.createElement(ShellErrorBoundary, { resetKey: "initial" }, React.createElement("p", null, "Ready")),
  );
  assert.equal(markup, "<p>Ready</p>");
});
