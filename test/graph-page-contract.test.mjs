import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  PageSurface,
  GraphWorkspace,
  GraphToolbar,
  RelationshipGraph,
} from "../dist/index.js";

test("built graph page exports keep the optional page contracts", () => {
  const file = fileURLToPath(
    new URL("../graph-page-contract-fixture.mts", import.meta.url),
  );
  const source = `import {PageSurface, type PageSurfaceProps, GraphToolbar, GraphWorkspace, RelationshipGraph, type RelationshipGraphProps, GraphNodeAction, type GraphNodeActionProps} from './dist/index.js';

import {createRef, type Ref} from 'react';
import {GraphNode, GraphEdge, type GraphControlElement, type GraphWorkspaceProps, type GraphInspectorProps, type GraphNodeProps, type GraphEdgeProps} from './dist/index.js';
const htmlRef = createRef<HTMLButtonElement>();
const svgRef = createRef<SVGGElement>();
const controlRef = createRef<GraphControlElement>();
const htmlSelection: GraphWorkspaceProps = {selectedControlRef: htmlRef};
const svgSelection: GraphWorkspaceProps = {selectedControlRef: svgRef};
const htmlReturn: GraphInspectorProps = {title:'Details', onClose: () => {}, returnFocusRef:htmlRef};
const svgReturn: GraphInspectorProps = {title:'Details', onClose: () => {}, returnFocusRef:svgRef};
const mixedReturn: GraphInspectorProps = {title:'Details', onClose: () => {}, returnFocusRef:controlRef};
// @ts-expect-error The host must supply its close behavior.
const missingClose: GraphInspectorProps = {title:'Details'};
// @ts-expect-error The heading owns initial focus.
const customInitialFocus: GraphInspectorProps = {title:'Details', onClose: () => {}, initialFocusRef:htmlRef};
// @ts-expect-error The shared host owns inspector width.
const customInspectorWidth: GraphWorkspaceProps = {inspectorWidth:'42rem'};
// @ts-expect-error The shared host has no separate inspector layout hook.
const customInspectorClass: GraphWorkspaceProps = {inspectorClassName:'wide'};
import {GraphInspector, GraphInspectorFacts, GraphInspectorFact, GraphInspectorSection, GraphInspectorRows, GraphInspectorRow, GraphInspectorNotice, type GraphInspectorFactsProps, type GraphInspectorFactProps, type GraphInspectorSectionProps, type GraphInspectorRowsProps, type GraphInspectorRowProps, type GraphInspectorNoticeProps} from './dist/index.js';
const facts: GraphInspectorFactsProps = {children:null};
const fact: GraphInspectorFactProps = {label:'Name', value:'Record'};
const section: GraphInspectorSectionProps = {title:'Properties', count:1};
const rows: GraphInspectorRowsProps = {children:null};
const row: GraphInspectorRowProps = {label:'Property', value:'Value', actions:null};
const notice: GraphInspectorNoticeProps = {tone:'error', dynamic:true, children:'Retry'};
void [GraphInspector, GraphInspectorFacts, GraphInspectorFact, GraphInspectorSection, GraphInspectorRows, GraphInspectorRow, GraphInspectorNotice, facts, fact, section, rows, row, notice];
const nodeRef: Ref<HTMLButtonElement> = node => { controlRef.current = node; };
const edgeRef: Ref<SVGGElement> = edge => { controlRef.current = edge; };
const nodeProps: GraphNodeProps = {x:0,y:0,title:'Node',ref:nodeRef};
const edgeProps: GraphEdgeProps = {path:'M 0 0 L 10 10',ref:edgeRef};
const objectNodeProps: GraphNodeProps = {x:0,y:0,title:'Node',ref:htmlRef};
const objectEdgeProps: GraphEdgeProps = {path:'M 0 0 L 10 10',ref:svgRef};
// @ts-expect-error A node ref must refer to its native HTML button.
const invalidNodeRef: GraphNodeProps = {x:0,y:0,title:'Node',ref:svgRef};
// @ts-expect-error A text node is not a focusable graph control.
const invalidControl: GraphControlElement = document.createTextNode('Record');
void [GraphNode, GraphEdge, htmlSelection, svgSelection, htmlReturn, svgReturn, mixedReturn, nodeProps, edgeProps, objectNodeProps, objectEdgeProps];

const textAction: GraphNodeActionProps = {x:0, y:0, 'aria-label':'New item below Parent', variant:'text', children:'+ New item', tabIndex:-1, onKeyDown:event => event.currentTarget.focus()};
const iconAction: GraphNodeActionProps = {x:0, y:0, 'aria-label':'New item', variant:'icon'};
const defaultAction: GraphNodeActionProps = {x:0, y:0, 'aria-label':'New item'};
// @ts-expect-error Only the documented shapes are accepted.
const invalidAction: GraphNodeActionProps = {x:0, y:0, 'aria-label':'New item', variant:'wide'};
// @ts-expect-error An accessible name is required.
const unnamedAction: GraphNodeActionProps = {x:0, y:0, variant:'text'};
void [GraphNodeAction, textAction, iconAction, defaultAction];
const edge: PageSurfaceProps = {children: null, edgeToEdge: true};
const inset: PageSurfaceProps = {children: null, edgeToEdge: false};
const omitted: PageSurfaceProps = {children: null};
const full: Pick<RelationshipGraphProps, 'fullPage'> = {fullPage:true};
const ordinary: Pick<RelationshipGraphProps, 'fullPage'> = {};
void [PageSurface, GraphToolbar, GraphWorkspace, RelationshipGraph, edge, inset, omitted, full, ordinary];
// @ts-expect-error The page contract accepts only a boolean.
const invalid: PageSurfaceProps = {children:null, edgeToEdge:'yes'};
`;
  const options = {
    strict: true,
    noEmit: true,
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    target: ts.ScriptTarget.ES2022,
    jsx: ts.JsxEmit.ReactJSX,
  };
  const host = ts.createCompilerHost(options);
  const read = host.getSourceFile;
  host.getSourceFile = (
    name,
    languageVersion,
    onError,
    shouldCreateNewSourceFile,
  ) =>
    name === file
      ? ts.createSourceFile(name, source, languageVersion)
      : read(name, languageVersion, onError, shouldCreateNewSourceFile);
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

test("the nearest page controls shared graph geometry", () => {
  const columns = ["Sources", "Records", "Targets"].map((id) => ({
    id,
    label: id,
    nodes: [],
  }));
  for (const edgeToEdge of [true, false, undefined]) {
    const markup = renderToStaticMarkup(
      React.createElement(
        PageSurface,
        { edgeToEdge: true },
        React.createElement(
          PageSurface,
          { edgeToEdge },
          React.createElement(
            GraphWorkspace,
            {
              toolbar: React.createElement(GraphToolbar, {
                leading: "Context",
              }),
            },
            React.createElement(RelationshipGraph, {
              "aria-label": "Relations",
              columns,
              relationships: [],
            }),
          ),
        ),
      ),
    );
    for (const name of ["workspace", "toolbar"])
      assert.match(
        markup,
        new RegExp(
          `class="od-graph-${name}" data-edge-to-edge="${edgeToEdge === true}"`,
        ),
      );
    assert.match(
      markup,
      new RegExp(
        `class="od-relationship-graph" data-edge-to-edge="${edgeToEdge === true}"`,
      ),
    );
  }
});
