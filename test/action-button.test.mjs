import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ActionButton, ActionButtonGroup, Icon } from "../dist/index.js";

test("ActionButton keeps its name, native form properties, and decorative icon", () => {
  const html = renderToStaticMarkup(
    React.createElement(ActionButton, {
      label: "Save changes",
      icon: React.createElement(Icon, { name: "check" }),
      type: "submit",
      disabled: true,
      name: "decision",
      value: "save",
    }),
  );
  assert.match(html, /aria-label="Save changes"/);
  assert.match(html, /title="Save changes"/);
  assert.match(html, /type="submit"/);
  assert.match(html, /disabled=""/);
  assert.match(html, /name="decision"/);
  assert.match(html, /value="save"/);
  assert.equal((html.match(/aria-hidden="true"/g) ?? []).length, 3);
});

test("ActionButton permits an exact accessible name and host title", () => {
  const html = renderToStaticMarkup(
    React.createElement(ActionButton, {
      label: "Edit",
      icon: React.createElement(Icon, { name: "edit" }),
      "aria-label": "Edit this post",
      title: "Edit exact version",
      className: "host-action",
    }),
  );
  assert.match(html, /aria-label="Edit this post"/);
  assert.match(html, /title="Edit exact version"/);
  assert.match(html, /od-action-button host-action/);
});

test("ActionButtonGroup preserves host attributes and all actions", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      ActionButtonGroup,
      {
        "aria-label": "Review decisions",
        className: "review-actions",
      },
      ["Refuse", "Edit", "Approve"].map((label) =>
        React.createElement(ActionButton, {
          key: label,
          label,
          icon: React.createElement(Icon, { name: "check" }),
        }),
      ),
    ),
  );
  assert.match(html, /od-action-button-group review-actions/);
  assert.match(html, /aria-label="Review decisions"/);
  assert.match(html, /<fieldset /);
  assert.equal((html.match(/<button /g) ?? []).length, 3);
});
