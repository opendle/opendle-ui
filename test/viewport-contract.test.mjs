import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { GraphViewport, RelationshipGraph } from "@opendle/ui";

const columns = ["Sources", "Records", "Targets"].map((id) => ({
  id,
  label: id,
  nodes: [{ id: `${id}-1`, label: `${id} one` }],
}));
const base = { "aria-label": "Relations", columns, relationships: [] };

test("public viewport props compile through the built package root", () => {
  const file = fileURLToPath(
    new URL("../viewport-api-fixture.mts", import.meta.url),
  );
  const source = `import {GraphViewport, RelationshipGraph, type GraphViewportProps, type RelationshipGraphProps} from '@opendle/ui';
import {createElement} from 'react';
const oldViewport: GraphViewportProps = {};
const oldGraph: Pick<RelationshipGraphProps, 'viewportLabel' | 'viewportContent'> = {};
const viewport: GraphViewportProps = {viewportContent:createElement('button', null, 'Retry')};
const graph: Pick<RelationshipGraphProps, 'viewportLabel' | 'viewportContent'> = {viewportLabel:'Exact graph name',viewportContent:'Loading'};
// @ts-expect-error A viewport label is text.
const invalid: Pick<RelationshipGraphProps, 'viewportLabel'> = {viewportLabel:2};
void [GraphViewport,RelationshipGraph,oldViewport,oldGraph,viewport,graph];`;
  const options = {
    strict: true,
    noEmit: true,
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    target: ts.ScriptTarget.ES2022,
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

test("labels are exact and optional content keeps the board and canvas", () => {
  const renderGraph = (props) =>
    renderToStaticMarkup(
      React.createElement(RelationshipGraph, { ...base, ...props }),
    );
  assert.match(renderGraph({}), /aria-label="Relations viewport"/);
  const graph = renderGraph({
    viewportLabel: "Exact records",
    viewportContent: React.createElement("p", null, "Load failed"),
  });
  assert.match(graph, /aria-label="Exact records"/);
  assert.ok(
    graph.indexOf("Load failed") < graph.indexOf("od-relationship-graph-board"),
  );
  assert.match(graph, /Sources one/);
  const viewport = renderToStaticMarkup(
    React.createElement(
      GraphViewport,
      { canvasWidth: 1800, canvasHeight: 1400, viewportContent: "Loading" },
      React.createElement("button", null, "Retained node"),
    ),
  );
  assert.ok(viewport.indexOf("Loading") < viewport.indexOf("od-graph-canvas"));
  assert.match(viewport, /width:1800px/);
  assert.match(viewport, /Retained node/);
  for (const value of [undefined, null, false, true, ""]) {
    assert.equal(renderGraph({ viewportContent: value }), renderGraph({}));
    assert.equal(
      renderToStaticMarkup(
        React.createElement(GraphViewport, { viewportContent: value }),
      ),
      renderToStaticMarkup(React.createElement(GraphViewport)),
    );
  }
});

test("controlled pan keeps omitted content and rejects visible state content", () => {
  const props = {
    viewport: { x: -80, y: 120, zoom: 1.5 },
    canvasWidth: 1800,
    canvasHeight: 1400,
  };
  const render = (content) =>
    renderToStaticMarkup(
      React.createElement(GraphViewport, {
        ...props,
        viewportContent: content,
      }),
    );
  const omitted = render(undefined);
  assert.match(omitted, /translate\(-80px, 120px\) scale\(1.5\)/);
  for (const content of [
    null,
    false,
    true,
    "",
    React.createElement(React.Fragment, null, null, false),
  ])
    assert.equal(render(content), omitted);
  for (const content of [
    "Loading",
    0,
    React.createElement("button", null, "Retry"),
  ])
    assert.throws(
      () => render(content),
      /Graph viewport content requires native scrolling; omit viewport\./,
    );
});
