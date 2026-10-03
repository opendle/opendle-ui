import { strict as assert } from "node:assert";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { OrderedChoiceList } from "../dist/index.js";

const items = [
  { id: "first", value: "alpha", label: "Alpha", detail: "Provider A" },
  { id: "second", value: "beta", label: "Beta" },
];
const options = [
  { value: "alpha", label: "Alpha" },
  { value: "beta", label: "Beta" },
  { value: "gamma", label: "Gamma" },
];

function render(overrides = {}) {
  return renderToStaticMarkup(
    React.createElement(OrderedChoiceList, {
      label: "Selected routes",
      addLabel: "Add route",
      items,
      options,
      onAdd() {},
      onRemove() {},
      onReorder() {},
      ...overrides,
    }),
  );
}

test("ordered choices expose names, positions, and independent named actions", () => {
  const markup = render();
  assert.match(markup, /<ol aria-label="Selected routes"/);
  assert.match(markup, /Provider A/);
  assert.match(markup, /aria-label="Position 1"/);
  assert.match(markup, /aria-keyshortcuts="ArrowUp ArrowDown"/);
  assert.match(markup, /aria-label="Move Alpha down"/);
  assert.match(markup, /aria-label="Move Beta up"/);
  assert.doesNotMatch(markup, /aria-label="Move Alpha up"/);
  assert.doesNotMatch(markup, /aria-label="Move Beta down"/);
  assert.match(markup, /aria-label="Remove Alpha"/);
  assert.match(markup, /aria-live="polite"/);
});

test("invalid stable IDs, labels and maximums fail before interaction", () => {
  for (const invalid of [
    [{ ...items[0], id: "" }],
    [{ ...items[0], label: " " }],
    [items[0], { ...items[1], id: "first" }],
  ])
    assert.throws(
      () => render({ items: invalid }),
      /unique non-empty IDs and labels/,
    );
  for (const maxItems of [0, -1, 1.5, Infinity]) {
    assert.throws(() => render({ maxItems }), /positive integer/);
  }
});

test("duplicate option values fail and loaded repeat choices keep distinct IDs", () => {
  assert.throws(
    () => render({ options: [options[0], options[0]] }),
    /option values must be unique/,
  );
  const markup = render({ items: [items[0], { ...items[0], id: "repeated" }] });
  assert.equal((markup.match(/aria-label="Remove Alpha"/g) ?? []).length, 2);
});

test("addition is disabled at the limit and when no enabled unused choice remains", () => {
  for (const overrides of [
    { maxItems: 2 },
    { disabled: true },
    { options: options.slice(0, 2) },
    { options: [...options.slice(0, 2), { ...options[2], disabled: true }] },
  ])
    assert.match(
      render(overrides),
      /<input[^>]*disabled=""[^>]*role="combobox"/,
    );
});
