import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
import { RadioGroup } from "@opendle/ui";

const options = [
  { value: "", label: "All choices" },
  { value: "alpha", label: "Alpha choice" },
  { value: "beta", label: "Beta choice", disabled: true },
];
function render(props = {}) {
  return renderToStaticMarkup(
    React.createElement(RadioGroup, {
      label: "Choices",
      options,
      value: "alpha",
      onChange: () => {},
      ...props,
    }),
  );
}

test("public radio group renders native semantic controls, controlled values and associated field text", () => {
  const markup = render({
    name: "choice",
    form: "host-form",
    help: "Choose one.",
    error: "Choose a valid value.",
    "aria-describedby": "host-help",
    id: "choices",
    className: "host-choice",
  });
  assert.match(markup, /^<fieldset\b/);
  assert.match(markup, /<legend[^>]*>Choices<\/legend>/);
  assert.match(markup, /class="od-radio-group host-choice"/);
  assert.match(markup, /^<fieldset[^>]*aria-invalid="true"/);
  const inputs = markup.match(/<input\b[^>]*>/g);
  assert.equal(inputs.length, 3);
  for (const input of inputs) {
    assert.match(input, /type="radio"/);
    assert.match(input, /name="choice"/);
    assert.match(input, /form="host-form"/);
    assert.doesNotMatch(input, /aria-invalid=/);
    assert.match(input, /aria-labelledby=/);
    const id = / id="([^"]*)"/.exec(input)[1];
    assert.ok(markup.includes(`for="${id}"`));
    const ids = /aria-describedby="([^"]*)"/.exec(input)[1].split(" ");
    assert.equal(ids[0], "host-help");
    assert.ok(markup.includes(`id="${ids[1]}"`));
    assert.match(markup, />Choose one\.<\/p>/);
    assert.ok(markup.includes(`id="${ids[2]}"`));
  }
  assert.doesNotMatch(inputs[0], /checked=/);
  assert.match(inputs[1], /checked=""/);
  assert.match(inputs[2], /disabled=""/);
  assert.doesNotMatch(markup, /<select|<details|type="hidden"/);
  assert.match(render({ disabled: true }), /^<fieldset[^>]*disabled=""/);
  assert.doesNotMatch(render({ value: "unavailable" }), /checked=/);
  assert.doesNotMatch(render({ options: [] }), /<input/);
  assert.doesNotMatch(
    render({ help: false, error: null }),
    /aria-invalid|aria-describedby/,
  );
});

test("automatic names isolate sibling native groups in server output", () => {
  const markup = renderToStaticMarkup(
    React.createElement(
      "form",
      null,
      ...[1, 2].map((key) =>
        React.createElement(RadioGroup, {
          key,
          label: `Group ${key}`,
          options,
          value: "alpha",
          onChange: () => {},
        }),
      ),
    ),
  );
  const names = [...markup.matchAll(/<input[^>]*name="([^"]*)"/g)].map(
    (match) => match[1],
  );
  assert.equal(names.length, 6);
  assert.equal(new Set(names.slice(0, 3)).size, 1);
  assert.equal(new Set(names.slice(3)).size, 1);
  assert.notEqual(names[0], names[3]);
  const ids = [...markup.matchAll(/<input[^>]*id="([^"]*)"/g)].map(
    (match) => match[1],
  );
  assert.equal(new Set(ids).size, 6);
});

test("public built types preserve value unions and native fieldset props", () => {
  const file = fileURLToPath(
    new URL("../radio-group-contract-fixture.mts", import.meta.url),
  );
  const source = `
import {RadioGroup,type RadioGroupOption,type RadioGroupProps} from '@opendle/ui';
import {createElement,createRef} from 'react';
type Choice=''|'alpha'|'beta';
const options: readonly RadioGroupOption<Choice>[]=[{value:'alpha',label:'Alpha'}];
const props:RadioGroupProps<Choice>={label:'Choices',options,value:'',name:'choice',form:'host',disabled:true,help:'Choose one.',error:'Choose a valid value.',ref:createRef<HTMLFieldSetElement>(),onChange:value=>{const selected:Choice=value;},onKeyDown:event=>{const fieldset:HTMLFieldSetElement=event.currentTarget;}};
createElement(RadioGroup<Choice>,props);
RadioGroup({label:'Choices',options,value:'alpha' as const,onChange:value=>{const selected:Choice=value;}});
// @ts-expect-error The value must use the declared union.
const badValue:RadioGroupProps<Choice>={...props,value:'unknown'};
// @ts-expect-error Options must use the declared union.
const badOption:RadioGroupOption<Choice>={value:'unknown',label:'Unknown'};
// @ts-expect-error The callback receives a value, not a native event.
const badChange:RadioGroupProps<Choice>={...props,onChange:event=>event.currentTarget.focus()};
// @ts-expect-error The ref points to a native fieldset.
const badRef:RadioGroupProps<Choice>={...props,ref:createRef<HTMLInputElement>()};
// @ts-expect-error Options supply the children.
const badChildren:RadioGroupProps<Choice>={...props,children:'Text'};
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
  const host = ts.createCompilerHost(compilerOptions),
    read = host.getSourceFile;
  host.getSourceFile = (name, version, onError, fresh) =>
    name === file
      ? ts.createSourceFile(name, source, version)
      : read(name, version, onError, fresh);
  assert.deepEqual(
    ts
      .getPreEmitDiagnostics(ts.createProgram([file], compilerOptions, host))
      .map((diagnostic) =>
        ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"),
      ),
    [],
  );
});

test("radio browser check rejects unsafe arguments before browser work", () => {
  const result = spawnSync(
    process.execPath,
    [
      fileURLToPath(
        new URL("../scripts/radio-group-browser.mjs", import.meta.url),
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
