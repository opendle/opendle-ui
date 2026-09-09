import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
import { CompactCheckboxGroup } from "@opendle/ui";

const options = [
  { value: "alpha", label: "Alpha choice" },
  { value: "beta", label: "Beta choice" },
  { value: "gamma", label: "Gamma choice", disabled: true },
];
function render(props = {}) {
  return renderToStaticMarkup(
    React.createElement(CompactCheckboxGroup, {
      label: "Choices",
      options,
      value: ["gamma", "alpha"],
      onChange: () => undefined,
      ...props,
    }),
  );
}

test("public compact group uses a named fieldset and closed disclosure with mounted native checkboxes", () => {
  const markup = render({
    id: "choices",
    className: "fixture-choices",
    name: "choice",
    "data-state": "ready",
    "aria-describedby": "choices-help",
  });
  assert.match(markup, /^<fieldset\b/);
  assert.match(markup, /<legend[^>]*>Choices<\/legend>/);
  assert.match(markup, /class="[^"]*fixture-choices/);
  assert.match(markup, /id="choices"/);
  assert.match(markup, /data-state="ready"/);
  assert.match(markup, /aria-describedby="choices-help"/);
  assert.match(markup, /<summary>Choices \(2 selected\)<\/summary>/);
  assert.match(markup, /<details\b/);
  assert.doesNotMatch(markup, /<details[^>]*\bopen[= >]/);
  const inputs = markup.match(/<input\b[^>]*>/g);
  assert.equal(inputs.length, 3);
  assert.deepEqual(
    inputs.map((input) => /value="([^"]*)"/.exec(input)[1]),
    ["alpha", "beta", "gamma"],
  );
  for (const input of inputs) {
    assert.match(input, /type="checkbox"/);
    assert.match(input, /name="choice"/);
    const id = /id="([^"]*)"/.exec(input)[1];
    assert.ok(
      markup.includes(`for="${id}"`),
      "Each checkbox has a native label",
    );
  }
  assert.match(inputs[0], /checked=""/);
  assert.doesNotMatch(inputs[1], /checked=/);
  assert.match(inputs[2], /checked=""/);
  assert.match(inputs[2], /disabled=""/);
  assert.doesNotMatch(markup, /type="hidden"|role="(?:listbox|option)"/);
});

test("compact group counts available values and supports empty options and a host summary", () => {
  assert.match(
    render({ value: ["alpha", "unavailable"] }),
    /Choices \(1 selected\)/,
  );
  const empty = render({ options: [], value: ["unavailable"] });
  assert.match(empty, /Choices \(0 selected\)/);
  assert.doesNotMatch(empty, /<input/);
  assert.match(
    render({
      summary: (count) =>
        React.createElement("span", null, `Choices: ${count} chosen`),
    }),
    /<summary><span>Choices: 2 chosen<\/span><\/summary>/,
  );
  assert.match(render({ disabled: true }), /^<fieldset[^>]*disabled=""/);
  const many = Array.from({ length: 12 }, (_, index) => ({
    value: String(index),
    label: `Choice ${index}`,
  }));
  assert.match(
    render({ options: many, value: many.map(({ value }) => value) }),
    /Choices \(12 selected\)/,
  );
});

test("compact group forwards external form association to every native checkbox", () => {
  const markup = render({ form: "external-form", name: "choice" });
  assert.match(markup, /^<fieldset[^>]*form="external-form"/);
  for (const input of markup.match(/<input\b[^>]*>/g)) {
    assert.match(input, /form="external-form"/);
    assert.match(input, /name="choice"/);
  }
  assert.doesNotMatch(render(), /<input[^>]*\bname=/);
});

test("built public types preserve value unions and accept native fieldset refs and events", () => {
  const file = fileURLToPath(
    new URL("../compact-checkbox-contract-fixture.mts", import.meta.url),
  );
  const source = `
import {CompactCheckboxGroup, type CompactCheckboxGroupOption, type CompactCheckboxGroupProps} from '@opendle/ui';
import {createElement, createRef} from 'react';
type Choice = 'alpha' | 'beta';
const options: readonly CompactCheckboxGroupOption<Choice>[] = [{value:'alpha', label:'Alpha'}];
const props: CompactCheckboxGroupProps<Choice> = {
  label:'Choices', options, value:['alpha'], name:'choice', disabled:false,
  ref:createRef<HTMLFieldSetElement>(), id:'choices', form:'host-form',
  onChange: values => { const typed: Choice[] = values; typed.push('beta'); },
  onKeyDown:event => { const fieldset: HTMLFieldSetElement = event.currentTarget; fieldset.focus(); },
  summary:count => 'Choices: ' + count + ' chosen'
};
createElement(CompactCheckboxGroup<Choice>, props);
CompactCheckboxGroup({label:'Choices', options, value:['alpha'] as const, onChange:values => {const typed: Choice[] = values;}});
// @ts-expect-error The value must use the declared union.
const badValue: CompactCheckboxGroupProps<Choice> = {...props, value:['unknown']};
// @ts-expect-error Options must use the declared union.
const badOption: CompactCheckboxGroupOption<Choice> = {value:'unknown', label:'Unknown'};
// @ts-expect-error The ref points to a native fieldset.
const badRef: CompactCheckboxGroupProps<Choice> = {...props, ref:createRef<HTMLDivElement>()};
// @ts-expect-error The callback receives values, not a native event.
const badChange: CompactCheckboxGroupProps<Choice> = {...props, onChange:event => event.currentTarget.focus()};
// @ts-expect-error Options supply the children.
const badChildren: CompactCheckboxGroupProps<Choice> = {...props, children:'Text'};
`;
  const compilerOptions = {
    strict: true,
    exactOptionalPropertyTypes: true,
    noEmit: true,
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    target: ts.ScriptTarget.ES2022,
    jsx: ts.JsxEmit.ReactJSX,
  };
  const host = ts.createCompilerHost(compilerOptions);
  const read = host.getSourceFile;
  host.getSourceFile = (name, version, onError, fresh) =>
    name === file
      ? ts.createSourceFile(name, source, version)
      : read(name, version, onError, fresh);
  const program = ts.createProgram([file], compilerOptions, host);
  assert.deepEqual(
    ts
      .getPreEmitDiagnostics(program)
      .map((diagnostic) =>
        ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"),
      ),
    [],
  );
});

test("compact group browser check rejects extra arguments before starting", () => {
  const result = spawnSync(
    process.execPath,
    [
      fileURLToPath(
        new URL(
          "../scripts/compact-checkbox-group-browser.mjs",
          import.meta.url,
        ),
      ),
      "../../private-data",
    ],
    { encoding: "utf8", timeout: 10000 },
  );
  assert.equal(result.error, undefined);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /This check accepts no arguments\./);
  assert.equal(result.stdout, "");
});
