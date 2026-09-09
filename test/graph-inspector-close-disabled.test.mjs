import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import test from "node:test";
import ts from "typescript";

test("built GraphInspector accepts an optional boolean close lock and requires onClose", () => {
  const file = fileURLToPath(
    new URL("../close-disabled-contract.tsx", import.meta.url),
  );
  const source = `
import {GraphInspector, type GraphInspectorProps} from '@opendle/ui';
const defaults: GraphInspectorProps = {title:'Record', onClose:() => {}};
const locked: GraphInspectorProps = {...defaults, closeDisabled:true};
const enabled: GraphInspectorProps = {...defaults, closeDisabled:false};
const cancel: GraphInspectorProps = {...locked, onCancel:event => event.preventDefault()};
// @ts-expect-error The close lock accepts only a boolean.
const invalid: GraphInspectorProps = {...defaults, closeDisabled:'true'};
// @ts-expect-error A locked inspector still requires host close behavior.
const missing: GraphInspectorProps = {title:'Record', closeDisabled:true};
void [GraphInspector, defaults, locked, enabled, cancel, invalid, missing];
`;
  const options = {
    strict: true,
    noEmit: true,
    exactOptionalPropertyTypes: true,
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    target: ts.ScriptTarget.ES2022,
    jsx: ts.JsxEmit.ReactJSX,
  };
  const host = ts.createCompilerHost(options);
  const read = host.getSourceFile;
  host.getSourceFile = (name, ...args) =>
    name === file
      ? ts.createSourceFile(name, source, args[0])
      : read(name, ...args);
  const program = ts.createProgram([file], options, host);
  assert.deepEqual(
    ts
      .getPreEmitDiagnostics(program)
      .map((d) => ts.flattenDiagnosticMessageText(d.messageText, "\n")),
    [],
  );
});

test(
  "built GraphInspector blocks close inputs and retains state across close-lock changes",
  { timeout: 120_000 },
  async () => {
    const { stdout } = await promisify(execFile)(
      process.execPath,
      [
        fileURLToPath(
          new URL(
            "../scripts/graph-inspector-close-disabled-browser.mjs",
            import.meta.url,
          ),
        ),
      ],
      { timeout: 110_000, maxBuffer: 1024 * 1024 },
    );
    const report = JSON.parse(stdout);
    assert.equal(report.cases.length, 6);
    assert.equal(report.axeCases, 6);
    assert.equal(report.screenshots.length, 6);
  },
);
