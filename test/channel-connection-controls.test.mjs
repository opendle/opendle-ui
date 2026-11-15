import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { TextControl } from "../dist/index.js";

test("TextControl masks a secret and keeps its label, value and validation", () => {
  const render = (type) =>
    renderToStaticMarkup(
      React.createElement(TextControl, {
        id: "key",
        label: "API key",
        type,
        value: "test-secret",
        onChange: () => {},
        required: true,
        error: "Invalid key",
        autoComplete: "off",
      }),
    );
  const secret = render("password");
  assert.match(secret, /type="password"/);
  assert.match(secret, /value="test-secret"/);
  assert.match(secret, /<label[^>]*for="key"[^>]*>API key<\/label>/);
  assert.match(secret, /aria-invalid="true"/);
  assert.match(secret, /autoComplete="off"/);
  assert.match(secret, /required=""/);
  assert.match(render(undefined), /type="text"/);
});
