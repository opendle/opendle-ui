import { strict as assert } from "node:assert";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  CheckboxChipGroup,
  CheckboxControl,
  FormActions,
} from "../dist/index.js";

test("compact choices keep native checkbox names, values, and validation", () => {
  const markup = renderToStaticMarkup(
    React.createElement(CheckboxControl, {
      appearance: "chip",
      checked: true,
      id: "tools",
      label: "Tools",
      name: "requirements",
      value: "tools",
      required: true,
      help: "Supports tools.",
      error: "Unavailable.",
      onChange() {},
    }),
  );
  assert.match(markup, /data-appearance="chip"/);
  assert.match(markup, /<label[^>]*for="tools">Tools<\/label>/);
  assert.match(
    markup,
    /<input(?=[^>]*type="checkbox")(?=[^>]*name="requirements")(?=[^>]*value="tools")(?=[^>]*checked="")(?=[^>]*required="")(?=[^>]*aria-invalid="true")/,
  );
  assert.match(markup, /aria-describedby="[^"]+ [^"]+"/);
  assert.match(markup, /Supports tools\./);
  assert.match(markup, /Unavailable\./);
});

test("compact choice groups have an accessible name and native disablement", () => {
  const markup = renderToStaticMarkup(
    React.createElement(CheckboxChipGroup, {
      label: "Requirements",
      disabled: true,
      children: React.createElement(CheckboxControl, {
        appearance: "chip",
        checked: false,
        label: "Vision",
        onChange() {},
      }),
    }),
  );
  assert.match(
    markup,
    /^<fieldset disabled="" aria-label="Requirements" class="od-checkbox-chip-group">/,
  );
  assert.doesNotMatch(markup, /role="button"/);
  assert.match(markup, /type="checkbox"/);
});

test("wrapping context actions are opt-in and retain alignment", () => {
  const markup = renderToStaticMarkup(
    React.createElement(FormActions, {
      alignment: "start",
      layout: "wrap",
      children: "Context actions",
    }),
  );
  assert.match(markup, /data-alignment="start" data-layout="wrap"/);
  const defaultMarkup = renderToStaticMarkup(
    React.createElement(FormActions, {
      children: "Save",
    }),
  );
  assert.match(defaultMarkup, /data-layout="responsive"/);
});
