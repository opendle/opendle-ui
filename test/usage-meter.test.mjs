import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { UsageMeter, formatBytes } from "../dist/index.js";

const render = (props) =>
  renderToStaticMarkup(React.createElement(UsageMeter, props));

const items = [
  { id: "video", label: "Videos", value: 6_000, slot: 0, detail: "3 files" },
  { id: "image", label: "Images", value: 2_000, slot: 1 },
  { id: "file", label: "Other", value: 0, slot: 2 },
];

test("formatBytes uses the largest decimal unit", () => {
  assert.equal(formatBytes(0), "0 B");
  assert.equal(formatBytes(999), "999 B");
  assert.equal(formatBytes(1_550), "1.6 KB");
  assert.equal(formatBytes(999_999), "1 MB");
  assert.equal(formatBytes(10_000_000_000), "10 GB");
  assert.equal(formatBytes(-5), "0 B");
});

test("UsageMeter shows the use, the limit and one part for each value", () => {
  const html = render({
    label: "Storage",
    items,
    limit: 20_000,
    formatValue: formatBytes,
  });
  assert.match(html, /data-level="normal"/);
  assert.match(html, /<strong class="od-usage-meter-value">8 KB<\/strong>/);
  assert.match(html, /of 20 KB/);
  assert.match(html, /12 KB free/);
  assert.match(html, /<meter aria-label="Storage"/);
  assert.match(html, /aria-valuetext="8 KB of 20 KB"/);
  const parts = [...html.matchAll(/class="od-usage-meter-part"/g)];
  assert.equal(parts.length, 2);
  assert.match(html, /--od-usage-share:30%/);
  // An item without a value stays in the legend, dimmed.
  assert.match(html, /<li data-empty="true">/);
  assert.match(html, /3 files/);
});

test("UsageMeter warns near the limit and when it is full", () => {
  const high = render({ label: "Storage", items, limit: 9_000 });
  assert.match(high, /data-level="high"/);
  const full = render({
    label: "Storage",
    items,
    limit: 8_000,
    labels: { full: "No space" },
  });
  assert.match(full, /data-level="full"/);
  assert.match(full, /No space/);
});

test("UsageMeter without a limit shows the parts of the use only", () => {
  const html = render({ label: "Storage", items, legend: false });
  assert.doesNotMatch(html, /od-usage-meter-limit/);
  assert.doesNotMatch(html, /od-usage-meter-legend/);
  assert.match(html, /--od-usage-share:75%/);
  const empty = render({ label: "Storage", items: [] });
  assert.doesNotMatch(empty, /od-usage-meter-part/);
});
