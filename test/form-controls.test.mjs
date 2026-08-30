import { strict as assert } from "node:assert";
import test from "node:test";

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import {
  AdvancedFieldsDisclosure,
  AsyncSearchableSelect,
  Button,
  CheckboxControl,
  DateTime,
  FieldError,
  FieldHelp,
  FileDropZone,
  FormActions,
  FormField,
  FormSection,
  InlineAlert,
  NumberControl,
  SearchableSelect,
  SelectControl,
  SecretRevealPanel,
  SwitchControl,
  TextareaControl,
  TextControl,
  YamlEditor,
  designTokens,
} from "../dist/index.js";

test("FormField connects its label, help, error, and control", () => {
  const markup = renderToStaticMarkup(
    React.createElement(
      FormField,
      {
        controlId: "provider-name",
        error: "Use a unique name.",
        help: "This name is part of the public API.",
        label: "Provider name",
        requirement: "required",
      },
      React.createElement("input", {
        "aria-describedby": "host-description",
        name: "provider_name",
        required: true,
      }),
    ),
  );

  assert.match(
    markup,
    /<div class="od-form-field-heading"><label class="od-form-field-label" for="provider-name">Provider name<\/label><span aria-hidden="true" class="od-form-field-requirement">required<\/span><\/div>/,
  );
  assert.match(markup, /<input[^>]*id="provider-name"/);
  assert.match(
    markup,
    /<input[^>]*aria-describedby="host-description [^"]+ [^"]+"/,
  );
  assert.match(markup, /<input[^>]*aria-invalid="true"/);
  assert.match(markup, /class="od-field-help"/);
  assert.match(markup, /class="od-field-error" role="alert"/);
});

test("controlled form controls keep common field states and native semantics", () => {
  const commonProps = {
    "aria-describedby": "host-description",
    disabled: true,
    error: "Correct this value.",
    help: "Use the shared control.",
    onChange: () => undefined,
    required: true,
  };
  const controls = [
    {
      Component: TextControl,
      control: /<input(?=[^>]*type="text")/,
      id: "shared-text",
      props: { value: "Current text" },
    },
    {
      Component: NumberControl,
      control: /<input(?=[^>]*type="number")/,
      id: "shared-number",
      props: { value: 4 },
    },
    {
      Component: SelectControl,
      children: [
        React.createElement("option", { key: "a", value: "a" }, "Alpha"),
        React.createElement("option", { key: "b", value: "b" }, "Beta"),
      ],
      control: /<select/,
      id: "shared-select",
      props: { value: "b" },
    },
    {
      Component: TextareaControl,
      control: /<textarea/,
      id: "shared-textarea",
      props: { value: "Current description" },
    },
    {
      Component: CheckboxControl,
      control: /<input(?=[^>]*type="checkbox")/,
      id: "shared-checkbox",
      props: { checked: true },
    },
    {
      Component: SwitchControl,
      control: /<input(?=[^>]*role="switch")(?=[^>]*type="checkbox")/,
      id: "shared-switch",
      props: { checked: true },
    },
  ];

  for (const { Component, children, control, id, props } of controls) {
    const markup = renderToStaticMarkup(
      React.createElement(
        Component,
        {
          ...commonProps,
          ...props,
          className: `${id}-field`,
          controlClassName: `${id}-input`,
          id,
          label: id,
        },
        children,
      ),
    );
    assert.match(markup, new RegExp(`<label[^>]*for="${id}"`));
    assert.match(markup, new RegExp(`${id}-field`));
    assert.match(markup, new RegExp(`${id}-input`));
    assert.match(markup, control);
    assert.match(
      markup,
      new RegExp(
        `<(?:input|select|textarea)(?=[^>]*id="${id}")(?=[^>]*aria-describedby="host-description [^"]+ [^"]+")(?=[^>]*aria-invalid="true")(?=[^>]*disabled="")(?=[^>]*required="")[^>]*>`,
      ),
    );
    assert.match(markup, /class="od-field-help"/);
    assert.match(markup, /class="od-field-error" role="alert"/);
    assert.match(markup, />required<\/span>/);
  }

  const checkboxMarkup = renderToStaticMarkup(
    React.createElement(CheckboxControl, {
      checked: true,
      label: "Selected checkbox",
      onChange: () => undefined,
    }),
  );
  const switchMarkup = renderToStaticMarkup(
    React.createElement(SwitchControl, {
      checked: true,
      label: "Enabled switch",
      onChange: () => undefined,
    }),
  );
  assert.match(checkboxMarkup, /<input[^>]*checked=""/);
  assert.match(switchMarkup, /<input[^>]*aria-checked="true"/);
  assert.match(switchMarkup, /<input[^>]*checked=""/);

  const requirementMarkup = renderToStaticMarkup(
    React.createElement(TextControl, {
      label: "Required shorthand",
      onChange: () => undefined,
      requirement: "required",
      value: "",
    }),
  );
  assert.match(requirementMarkup, /<input[^>]*required=""/);
});

test("form compositions use semantic sections, actions, and disclosure", () => {
  const markup = renderToStaticMarkup(
    React.createElement(
      FormSection,
      {
        actions: React.createElement(Button, null, "Save section"),
        columns: 2,
        description: "These values control request limits.",
        legend: "Limits",
      },
      React.createElement(
        AdvancedFieldsDisclosure,
        {
          description: "Use these fields only for an explicit provider limit.",
          summary: "Advanced limits",
        },
        React.createElement(
          FormField,
          { label: "Token limit" },
          React.createElement("input", { type: "number" }),
        ),
      ),
    ),
  );
  const actions = renderToStaticMarkup(
    React.createElement(
      FormActions,
      { alignment: "between" },
      React.createElement(Button, null, "Continue"),
    ),
  );

  assert.match(markup, /<fieldset[^>]*aria-describedby=/);
  assert.match(markup, /<legend>Limits<\/legend>/);
  assert.match(markup, /data-columns="2"/);
  assert.match(markup, /<details class="od-advanced-fields"/);
  assert.match(markup, /<summary>Advanced limits<\/summary>/);
  assert.match(markup, />Save section<\/button>/);
  assert.match(actions, /data-alignment="between"/);
});

test("field messages and inline alerts keep compact accessible roles", () => {
  const help = renderToStaticMarkup(
    React.createElement(FieldHelp, null, "Select one current model."),
  );
  const error = renderToStaticMarkup(
    React.createElement(FieldError, null, "The model is required."),
  );
  const alert = renderToStaticMarkup(
    React.createElement(
      InlineAlert,
      { title: "Save failed", tone: "error" },
      "Correct the marked fields and try again.",
    ),
  );

  assert.match(help, /class="od-field-help"/);
  assert.match(error, /role="alert"/);
  assert.match(alert, /role="alert"/);
  assert.match(alert, /data-tone="error"/);
  assert.match(alert, /Save failed/);
});

test("SearchableSelect has one labelled search control and validates its option contract", () => {
  const options = [
    { value: "alpha", label: "Alpha model", description: "Text" },
    { value: "beta", label: "Beta model", disabled: true },
  ];
  const markup = renderToStaticMarkup(
    React.createElement(SearchableSelect, {
      help: "Search by model name.",
      label: "Model",
      name: "model",
      onChange: () => undefined,
      options,
      required: true,
      value: "alpha",
    }),
  );

  assert.match(markup, /type="search"/);
  assert.match(markup, /role="combobox"/);
  assert.match(markup, /aria-autocomplete="list"/);
  assert.match(markup, /aria-expanded="false"/);
  assert.doesNotMatch(markup, /aria-controls=/);
  assert.match(markup, /value="Alpha model"/);
  assert.match(markup, /<input[^>]*type="hidden"[^>]*value="alpha"/);
  assert.doesNotMatch(markup, /role="listbox"/);
  const nodeLabelMarkup = renderToStaticMarkup(
    React.createElement(SearchableSelect, {
      label: React.createElement("span", null, "Provider model"),
      onChange: () => undefined,
      options,
      value: "alpha",
    }),
  );
  assert.match(nodeLabelMarkup, />Provider model<\/span>/);
  assert.doesNotMatch(nodeLabelMarkup, /aria-label="Search options"/);
  assert.throws(
    () =>
      renderToStaticMarkup(
        React.createElement(SearchableSelect, {
          label: "Model",
          onChange: () => undefined,
          options: [options[0], options[0]],
          value: "alpha",
        }),
      ),
    /must be unique/,
  );
  assert.throws(
    () =>
      renderToStaticMarkup(
        React.createElement(SearchableSelect, {
          label: "Model",
          maxVisibleOptions: 0,
          onChange: () => undefined,
          options,
          value: "alpha",
        }),
      ),
    /must be positive/,
  );
});

test("AsyncSearchableSelect keeps one controlled accessible selector contract", () => {
  const selected = { value: "alpha", label: "Alpha service" };
  const markup = renderToStaticMarkup(
    React.createElement(AsyncSearchableSelect, {
      allowNoSelection: true,
      debounceMs: 0,
      label: "Service",
      loadOptions: async () => ({ options: [] }),
      name: "service",
      onChange: () => undefined,
      required: true,
      requirement: "optional",
      value: selected,
    }),
  );

  assert.match(markup, /type="text"/);
  assert.match(markup, /role="combobox"/);
  assert.match(markup, /aria-autocomplete="list"/);
  assert.match(markup, /aria-expanded="false"/);
  assert.match(markup, /value="Alpha service"/);
  assert.match(markup, /<input[^>]*type="hidden"[^>]*value="alpha"/);
  assert.match(markup, /aria-live="polite"/);
  assert.match(markup, /<input[^>]*aria-required="true"[^>]*required=""/);
  assert.match(markup, />required<\/span>/);
  assert.doesNotMatch(markup, />optional<\/span>/);
  assert.match(markup, /<output[^>]*aria-live="polite"[^>]*><\/output>/);
  assert.doesNotMatch(markup, /Loading options…/);
  assert.doesNotMatch(markup, /role="listbox"/);

  const emptySelectionMarkup = renderToStaticMarkup(
    React.createElement(AsyncSearchableSelect, {
      allowNoSelection: true,
      label: "Workspace",
      loadOptions: async () => ({ options: [] }),
      name: "workspace",
      onChange: () => undefined,
      value: null,
    }),
  );
  assert.match(
    emptySelectionMarkup,
    /<input[^>]*type="hidden"[^>]*name="workspace"[^>]*value=""/,
  );
  const requirementMarkup = renderToStaticMarkup(
    React.createElement(AsyncSearchableSelect, {
      label: "Required service",
      loadOptions: async () => ({ options: [] }),
      onChange: () => undefined,
      requirement: "required",
      value: null,
    }),
  );
  assert.match(requirementMarkup, /<input[^>]*aria-invalid="true"/);
  assert.match(requirementMarkup, /<input[^>]*required=""/);
  assert.match(requirementMarkup, />required<\/span>/);
  assert.throws(
    () =>
      renderToStaticMarkup(
        React.createElement(AsyncSearchableSelect, {
          debounceMs: -1,
          label: "Service",
          loadOptions: async () => ({ options: [] }),
          onChange: () => undefined,
          value: null,
        }),
      ),
    /must be a non-negative integer/,
  );
});

test("YamlEditor keeps one controlled source and accessible diagnostics", () => {
  const markup = renderToStaticMarkup(
    React.createElement(YamlEditor, {
      "aria-describedby": "host-yaml-help",
      diagnostics: [
        {
          from: 9,
          message: "Close the sequence.",
          severity: "error",
          to: 1_000,
        },
      ],
      disabled: true,
      id: "ontology-yaml",
      label: "Ontology YAML",
      onChange: () => undefined,
      readOnly: true,
      value: "service:\ninvalid: [",
    }),
  );

  assert.match(markup, /class="od-yaml-editor"/);
  assert.match(markup, /data-disabled="true"/);
  assert.match(markup, /data-invalid="true"/);
  assert.match(markup, /data-read-only="true"/);
  assert.match(markup, /id="ontology-yaml-label">Ontology YAML/);
  assert.match(markup, /id="ontology-yaml-mount"/);
  assert.match(markup, /<output[^>]*aria-label="Ontology YAML status"/);
  assert.match(markup, /aria-live="polite"/);
  assert.match(markup, /aria-label="Ontology YAML status"/);
  assert.match(markup, /aria-label="YAML diagnostics"/);
  assert.match(markup, />Go to error on line 2: Close the sequence\.</);
  assert.match(
    markup,
    /1 YAML diagnostic\. Error on line 2: Close the sequence\./,
  );

  assert.throws(
    () =>
      renderToStaticMarkup(
        React.createElement(YamlEditor, {
          diagnostics: [
            { from: -1, message: "Invalid position.", severity: "error" },
          ],
          label: "YAML",
          onChange: () => undefined,
          value: "value: true",
        }),
      ),
    /positions must be non-negative ordered integers/,
  );
  assert.throws(
    () =>
      renderToStaticMarkup(
        React.createElement(YamlEditor, {
          diagnostics: [{ from: 0, message: " ", severity: "warning" }],
          label: "YAML",
          onChange: () => undefined,
          value: "value: true",
        }),
      ),
    /messages must not be blank/,
  );
});

test("SecretRevealPanel shows a selectable host-owned secret and actions", () => {
  const markup = renderToStaticMarkup(
    React.createElement(SecretRevealPanel, {
      onDismiss: () => undefined,
      headingLevel: "h3",
      secret: "secret-value",
      secretLabel: "Service key",
      title: "Store this key now",
    }),
  );

  assert.match(markup, /<section[^>]*aria-labelledby=/);
  assert.match(markup, /<h3[^>]*>Store this key now<\/h3>/);
  assert.match(markup, /<output[^>]*aria-label="Service key"/);
  assert.match(markup, /<code>secret-value<\/code>/);
  assert.match(markup, />Copy secret<\/button>/);
  assert.match(markup, />I stored the secret<\/button>/);
});

test("FileDropZone keeps one accessible native file input", () => {
  const markup = renderToStaticMarkup(
    React.createElement(FileDropZone, {
      accept: "image/*",
      description: "PNG or JPEG, up to 10 MiB.",
      inputLabel: "Local image files",
      multiple: true,
      name: "files",
      onFiles: () => undefined,
      title: "Drop images here",
    }),
  );

  assert.match(markup, /<input[^>]*type="file"/);
  assert.match(markup, /<input[^>]*aria-label="Local image files"/);
  assert.match(markup, /<input[^>]*aria-describedby=/);
  assert.match(markup, /<label[^>]*for="[^"]+"/);
  assert.match(markup, /multiple=""/);
  assert.match(markup, /accept="image\/\*"/);
});

test("DateTime emits a machine value and a safe invalid fallback", () => {
  const defaultDateTime = renderToStaticMarkup(
    React.createElement(DateTime, {
      format: { timeZone: "UTC" },
      locale: "en-GB",
      value: "2026-08-25T13:45:00Z",
    }),
  );
  const valid = renderToStaticMarkup(
    React.createElement(DateTime, {
      format: {
        day: "2-digit",
        month: "short",
        timeZone: "UTC",
        year: "numeric",
      },
      locale: "en-GB",
      value: "2026-08-25T13:45:00Z",
    }),
  );
  const invalid = renderToStaticMarkup(
    React.createElement(DateTime, {
      fallback: "Not available",
      value: "not-a-date",
    }),
  );

  assert.match(valid, /dateTime="2026-08-25T13:45:00\.000Z"/);
  assert.match(valid, />25 Aug 2026<\/time>/);
  assert.match(defaultDateTime, /25 Aug 2026/);
  assert.match(defaultDateTime, /13:45/);
  assert.match(invalid, /od-date-time-invalid/);
  assert.match(invalid, /<span[^>]*>Not available<\/span>/);
  assert.doesNotMatch(invalid, /<time/);
  assert.doesNotMatch(invalid, /dateTime=/);
});

test("designTokens exposes the matching strong colors and page gutter", () => {
  assert.equal(designTokens.color.limeStrong, "--od-color-lime-strong");
  assert.equal(designTokens.color.coralStrong, "--od-color-coral-strong");
  assert.equal(designTokens.color.amberStrong, "--od-color-amber-strong");
  assert.equal(designTokens.space.pageGutter, "--od-page-gutter");
});
