import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SkipLink } from "../dist/index.js";

test("SkipLink supplies a named native anchor and keeps host attributes", () => {
  const markup = renderToStaticMarkup(
    React.createElement(SkipLink, {
      href: "#content-heading",
      label: "Skip to content",
      className: "host-skip",
      lang: "en",
      "aria-describedby": "skip-help",
      target: "_self",
      onClick: () => undefined,
    }),
  );
  assert.match(markup, /^<a /);
  assert.match(markup, /href="#content-heading"/);
  assert.match(markup, /class="od-skip-link host-skip"/);
  assert.match(markup, /aria-describedby="skip-help"/);
  assert.match(markup, /target="_self"/);
  assert.match(markup, />Skip to content<\/a>$/);
  assert.doesNotMatch(markup, /role=|tabindex=|label=/);
});

test("built SkipLink types require a target and label and retain native events", async () => {
  const { default: ts } = await import("typescript");
  const { fileURLToPath } = await import("node:url");
  const file = fileURLToPath(
    new URL("../skip-link-contract-fixture.mts", import.meta.url),
  );
  const source = `
import { SkipLink, type SkipLinkProps } from './dist/index.js';
const link: SkipLinkProps = {
  href: '#heading', label: 'Skip to content', className: 'host-skip',
  target: '_self', 'aria-describedby': 'help',
  onClick: event => { event.preventDefault(); event.currentTarget.href; event.button; event.ctrlKey; },
  onAuxClick: event => { event.currentTarget.href; },
  onFocus: event => { event.currentTarget.href; },
};
// @ts-expect-error The target is required.
const missingTarget: SkipLinkProps = { label: 'Skip' };
// @ts-expect-error The visible label is required.
const missingLabel: SkipLinkProps = { href: '#heading' };
// @ts-expect-error Text labels do not accept nested controls.
const children: SkipLinkProps = { href: '#heading', label: 'Skip', children: 'Nested' };
void [SkipLink, link, missingTarget, missingLabel, children];`;
  const options = {
    strict: true,
    exactOptionalPropertyTypes: true,
    noEmit: true,
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    target: ts.ScriptTarget.ES2022,
  };
  const host = ts.createCompilerHost(options);
  const read = host.getSourceFile;
  host.getSourceFile = (name, languageVersion, onError, newFile) =>
    name === file
      ? ts.createSourceFile(name, source, languageVersion)
      : read(name, languageVersion, onError, newFile);
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
