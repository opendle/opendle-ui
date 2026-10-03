import { strict as assert } from "node:assert";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  Dialog,
  FormActions,
  FormControls,
  FormGrid,
  FormSection,
} from "../dist/index.js";

test("form controls use native group disablement without a visible section", () => {
  const markup = renderToStaticMarkup(
    React.createElement(FormControls, {
      disabled: true,
      children: React.createElement("input", { "aria-label": "Name" }),
    }),
  );
  assert.match(markup, /^<fieldset disabled="" class="od-form-controls">/);
  assert.doesNotMatch(markup, /legend/);
});

test("form dialogs keep the native modal frame and expose the form appearance", () => {
  const markup = renderToStaticMarkup(
    React.createElement(Dialog, {
      appearance: "form",
      open: true,
      title: "Edit connection",
      onClose() {},
      children: React.createElement("form", { id: "connection" }),
      actions: React.createElement("button", { form: "connection" }, "Save"),
    }),
  );
  assert.match(markup, /data-appearance="form"/);
  assert.match(markup, /class="od-dialog-actions"/);
  assert.match(markup, /form="connection"/);
});

test("dialog context actions stay in the header beside close", () => {
  const markup = renderToStaticMarkup(
    React.createElement(Dialog, {
      open: true,
      title: "Edit assignment",
      onClose() {},
      headerActions: React.createElement(
        "button",
        { "aria-label": "Play assignment" },
        "Play",
      ),
      children: React.createElement("p", null, "Fields"),
    }),
  );
  assert.match(
    markup,
    /class="od-dialog-header-actions"><button aria-label="Play assignment"/,
  );
  assert.ok(
    markup.indexOf("Play assignment") < markup.indexOf("od-dialog-body"),
  );
});

test("plain form sections retain their accessible fieldset and responsive grid", () => {
  const markup = renderToStaticMarkup(
    React.createElement(FormSection, {
      legend: "Connection",
      variant: "plain",
      children: React.createElement(FormGrid, {
        columns: 2,
        children: React.createElement("input", { "aria-label": "Name" }),
      }),
    }),
  );
  assert.match(markup, /^<fieldset/);
  assert.match(markup, /data-variant="plain"/);
  assert.match(markup, /<legend>Connection<\/legend>/);
  assert.match(markup, /class="od-form-grid" data-columns="2"/);
});

test("secondary form actions stay separate and ahead of the main actions", () => {
  const markup = renderToStaticMarkup(
    React.createElement(FormActions, {
      secondaryActions: React.createElement("button", null, "Delete"),
      children: React.createElement("button", null, "Save"),
    }),
  );
  assert.match(markup, /class="od-form-actions-secondary"/);
  assert.ok(markup.indexOf("Delete") < markup.indexOf("Save"));
});
