import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
import { Panel, PanelContent, PanelHeader } from "@opendle/ui";

test("public PanelContent renders a named native region with host attributes", () => {
  for (const name of [
    { "aria-label": "Details" },
    { "aria-labelledby": "details-heading" },
  ]) {
    const markup = renderToStaticMarkup(
      React.createElement(
        PanelContent,
        {
          ...name,
          id: "details",
          className: "fixture-details",
          "data-state": "ready",
          "aria-describedby": "details-help",
        },
        React.createElement("input", { "aria-label": "Draft" }),
      ),
    );
    assert.match(markup, /^<section\b/);
    assert.doesNotMatch(markup, /role=/);
    assert.match(markup, /tabindex="0"/);
    assert.match(markup, /class="od-panel-content fixture-details"/);
    assert.match(markup, /id="details"/);
    assert.match(markup, /data-state="ready"/);
    assert.match(markup, /aria-describedby="details-help"/);
    assert.match(
      markup,
      new RegExp(`${Object.keys(name)[0]}="${Object.values(name)[0]}"`),
    );
    assert.match(markup, /<input aria-label="Draft"/);
    assert.doesNotMatch(markup, /<dialog|autofocus|aria-modal/);
  }
});

test("existing Panel and PanelHeader keep their native unbounded composition", () => {
  const markup = renderToStaticMarkup(
    React.createElement(
      Panel,
      { id: "ordinary-panel", "aria-label": "Ordinary panel" },
      React.createElement(PanelHeader, {
        title: "Ordinary content",
        actions: React.createElement("button", null, "Close"),
      }),
      React.createElement("p", null, "Unbounded host content"),
    ),
  );
  assert.match(markup, /^<section\b/);
  assert.match(markup, /class="od-panel"/);
  assert.match(markup, /<header class="od-panel-header"/);
  assert.match(markup, /<button>Close<\/button>/);
  assert.doesNotMatch(markup, /od-panel-content|tabindex|role="region"/);
});

test("built public PanelContent types require a name and accept section refs and events", () => {
  const file = fileURLToPath(
    new URL("../panel-content-contract-fixture.mts", import.meta.url),
  );
  const source = `
import {PanelContent, type PanelContentProps} from '@opendle/ui';
import {createElement, createRef} from 'react';
const ref = createRef<HTMLElement>();
const labelled: PanelContentProps = {'aria-label':'Details', ref, id:'details', children:'Text', onKeyDown:event => event.currentTarget.scrollTo(0, 10)};
const referenced: PanelContentProps = {'aria-labelledby':'heading', 'aria-describedby':'help', ref:element => { if (element) element.scrollTop = 0; }};
createElement(PanelContent, labelled);
createElement(PanelContent, referenced);
// @ts-expect-error One accessible name is required.
const unnamed: PanelContentProps = {children:'Text'};
// @ts-expect-error A name must contain text.
const wrongName: PanelContentProps = {'aria-label':42};
// @ts-expect-error The public ref points to the native section.
const wrongRef: PanelContentProps = {'aria-label':'Details', ref:createRef<SVGSVGElement>()};
`;
  const options = {
    strict: true,
    exactOptionalPropertyTypes: true,
    noEmit: true,
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    target: ts.ScriptTarget.ES2022,
    jsx: ts.JsxEmit.ReactJSX,
  };
  const host = ts.createCompilerHost(options);
  const read = host.getSourceFile;
  host.getSourceFile = (name, version, onError, fresh) =>
    name === file
      ? ts.createSourceFile(name, source, version)
      : read(name, version, onError, fresh);
  const program = ts.createProgram([file], options, host);
  assert.deepEqual(
    ts
      .getPreEmitDiagnostics(program)
      .map((diagnostic) =>
        ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"),
      ),
    [],
  );
});

test("panel browser check rejects unsafe extra arguments before it starts", () => {
  const result = spawnSync(
    process.execPath,
    [
      fileURLToPath(
        new URL("../scripts/panel-content-browser.mjs", import.meta.url),
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
