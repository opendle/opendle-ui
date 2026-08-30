import { strict as assert } from "node:assert";
import { readFile } from "node:fs/promises";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  ApplicationNavigation,
  ApplicationNavigationGroup,
  ApplicationShell,
  ApplicationSidebar,
  ApplicationTopbar,
  AutoGrowTextarea,
  AccountMenu,
  AgentSidebar,
  AttentionRow,
  Button,
  Card,
  CalendarBoard,
  ConfirmationDialog,
  ContextItem,
  DockedPanelLayout,
  GraphBundledLink,
  GraphEdge,
  GraphEdges,
  GraphEmptyState,
  GraphInspector,
  GraphInspectorFact,
  GraphInspectorFacts,
  GraphInspectorNotice,
  GraphInspectorRow,
  GraphInspectorRows,
  GraphInspectorSection,
  GraphNode,
  GraphNodeAction,
  GraphToolbar,
  GraphViewport,
  GraphViewportControls,
  GraphWorkspace,
  HealthBar,
  Icon,
  IconButton,
  NavigationItem,
  NavigationLink,
  MobileNavigation,
  MediaLightbox,
  OperationPlayground,
  PageSurface,
  PageHeading,
  Panel,
  PanelHeader,
  PlanCardShell,
  ReviewPlanCard,
  SessionCard,
  SessionPage,
  ShellErrorBoundary,
  StatCard,
  StatePanel,
  StatusPill,
  Toast,
  WorkspaceSelector,
  clampGraphPosition,
  clampGraphViewport,
  fitGraphViewport,
  graphPositionAtViewportCenter,
  graphViewportCenter,
  layoutLayeredDirectedGraph,
  layoutTree,
  moveGraphPosition,
  treeEdgePath,
  zoomGraphViewportAtPoint,
} from "../dist/index.js";

test("Icon renders a decorative SVG with the shared class", () => {
  const markup = renderToStaticMarkup(
    React.createElement(Icon, { name: "search", size: 16 }),
  );
  assert.match(markup, /class="od-icon"/);
  assert.match(markup, /aria-hidden="true"/);
  assert.match(markup, /width="16"/);
});

test("StatusPill renders one status dot and its label", () => {
  const markup = renderToStaticMarkup(
    React.createElement(StatusPill, { tone: "lime" }, "Healthy"),
  );
  assert.match(markup, /od-status-pill od-status-lime/);
  assert.match(markup, /od-status-dot od-status-lime/);
  assert.match(markup, />Healthy<\/span>/);
});

test("Toast keeps semantic fallback markup and a labelled dismiss action", () => {
  const markup = renderToStaticMarkup(
    React.createElement(
      Toast,
      {
        "aria-label": "Save status",
        className: "host-toast",
        onDismiss: () => undefined,
        role: "status",
      },
      "Service saved",
    ),
  );
  assert.match(markup, /<output[^>]*aria-label="Save status"/);
  assert.match(markup, /class="od-toast host-toast"/);
  assert.match(markup, /role="status"/);
  assert.match(markup, /aria-label="Dismiss message"/);
  assert.match(markup, />Service saved<\/span>/);
});

test("ConfirmationDialog labels a modal confirmation and its exact impact input", () => {
  const markup = renderToStaticMarkup(
    React.createElement(ConfirmationDialog, {
      open: true,
      title: "Delete workspace",
      description: "All current records will be deleted.",
      impactStatement: "delete service-a/workspace-a with 12 records",
      confirmLabel: "Delete",
      onCancel: () => undefined,
      onConfirm: () => undefined,
    }),
  );
  assert.match(markup, /<dialog/);
  assert.match(markup, /aria-describedby=/);
  assert.match(markup, /aria-labelledby=/);
  assert.match(markup, /Delete workspace/);
  assert.match(markup, /delete service-a\/workspace-a with 12 records/);
  assert.match(
    markup,
    /<input[^>]*aria-describedby="[^"]+"[^>]*aria-label="Enter the impact statement to continue"/,
  );
  assert.doesNotMatch(markup, /autofocus=/);
  assert.match(markup, /<button[^>]*disabled=""[^>]*>Delete<\/button>/);
  assert.throws(
    () =>
      renderToStaticMarkup(
        React.createElement(ConfirmationDialog, {
          open: true,
          title: "Unsafe confirmation",
          description: "This statement is empty.",
          impactStatement: " ",
          confirmLabel: "Continue",
          onCancel: () => undefined,
          onConfirm: () => undefined,
        }),
      ),
    /must not be empty/,
  );
});

test("MediaLightbox accepts only a labelled host-owned image or PDF blob", () => {
  const image = renderToStaticMarkup(
    React.createElement(MediaLightbox, {
      open: true,
      title: "Diagram",
      source: "blob:diagram",
      kind: "image",
      imageAlt: "System diagram",
      onClose: () => undefined,
    }),
  );
  const pdf = renderToStaticMarkup(
    React.createElement(MediaLightbox, {
      open: true,
      title: "Report",
      source: "blob:report",
      kind: "pdf",
      onClose: () => undefined,
    }),
  );
  assert.match(image, /<img[^>]*alt="System diagram"/);
  assert.match(pdf, /<iframe[^>]*aria-label="Preview Report"/);
  assert.match(pdf, /<iframe[^>]*sandbox=""/);
  assert.doesNotMatch(
    pdf,
    /allow-(?:downloads|forms|modals|orientation-lock|pointer-lock|popups|presentation|same-origin|scripts|top-navigation)/,
  );
  assert.throws(
    () =>
      renderToStaticMarkup(
        React.createElement(MediaLightbox, {
          open: true,
          title: "Remote",
          source: "https:\/\/example.com\/file.pdf",
          kind: "pdf",
          onClose: () => undefined,
        }),
      ),
    /blob URL/,
  );
  assert.doesNotMatch(
    renderToStaticMarkup(
      React.createElement(MediaLightbox, {
        open: false,
        title: "Closed report",
        source: "blob:closed-report",
        kind: "pdf",
        onClose: () => undefined,
      }),
    ),
    /<iframe|blob:closed-report/,
  );
  assert.throws(
    () =>
      renderToStaticMarkup(
        React.createElement(MediaLightbox, {
          open: true,
          title: " ",
          source: "blob:unnamed",
          kind: "pdf",
          onClose: () => undefined,
        }),
      ),
    /must have a name/,
  );
  assert.throws(
    () =>
      renderToStaticMarkup(
        React.createElement(MediaLightbox, {
          open: true,
          title: "Unsupported",
          source: "blob:unsupported",
          kind: "video",
          onClose: () => undefined,
        }),
      ),
    /only image or PDF media/,
  );
});

test("AutoGrowTextarea keeps the public textarea attributes", () => {
  const markup = renderToStaticMarkup(
    React.createElement(AutoGrowTextarea, {
      "aria-label": "Draft",
      maxHeight: 120,
      rows: 3,
    }),
  );
  assert.match(markup, /aria-label="Draft"/);
  assert.match(markup, /rows="3"/);
  assert.match(markup, /max-height:120px/);
});

test("shared composition components expose semantic classes and content", () => {
  const markup = renderToStaticMarkup(
    React.createElement(
      Card,
      { "aria-label": "Example card" },
      React.createElement(PageHeading, {
        description: "Review the current state.",
        eyebrow: "Overview",
        title: "Shared UI",
      }),
      React.createElement(ContextItem, {
        icon: React.createElement(Icon, { name: "activity" }),
        label: "State",
        value: "Ready",
      }),
      React.createElement(StatCard, {
        icon: React.createElement(Icon, { name: "health" }),
        label: "Health",
        trend: "up",
        trendClassName: "trend-up",
        value: "100%",
      }),
      React.createElement(Button, { variant: "secondary" }, "Continue"),
    ),
  );
  assert.match(markup, /class="od-card"/);
  assert.match(markup, /class="od-page-heading"/);
  assert.match(markup, /class="od-context-item"/);
  assert.match(markup, /class="od-stat-card stat-card"/);
  assert.match(markup, /class="od-stat-trend stat-trend trend-up"/);
  assert.match(markup, /class="od-button od-button-secondary"/);
  assert.match(markup, />Continue<\/button>/);
});

test("application shell components keep caller-owned content in semantic slots", () => {
  const sidebar = React.createElement(ApplicationSidebar, {
    brand: React.createElement("strong", null, "Example"),
    context: React.createElement(WorkspaceSelector, {
      avatar: "EX",
      detail: "Workspace",
      name: "Example scope",
    }),
    footer: React.createElement("small", null, "Session active"),
    navigation: React.createElement(
      ApplicationNavigation,
      { "aria-label": "Primary navigation" },
      React.createElement(
        ApplicationNavigationGroup,
        { label: "Manage" },
        React.createElement(NavigationItem, {
          active: true,
          icon: React.createElement(Icon, { name: "grid" }),
          label: "Overview",
        }),
      ),
    ),
  });
  const topbar = React.createElement(ApplicationTopbar, {
    actions: React.createElement(Button, null, "Refresh"),
    leading: React.createElement(Icon, { name: "menu" }),
    title: React.createElement("strong", null, "Overview"),
  });
  const mobileNavigation = React.createElement(MobileNavigation, {
    "aria-label": "Mobile navigation",
    items: [
      {
        active: true,
        icon: React.createElement(Icon, { name: "grid" }),
        id: "overview",
        label: "Overview",
      },
    ],
    onSelect: () => undefined,
  });
  const markup = renderToStaticMarkup(
    React.createElement(
      ApplicationShell,
      {
        mainProps: { id: "main-content", "aria-label": "Current page" },
        mobileNavigation,
        sidebar,
        topbar,
      },
      React.createElement("h1", null, "Application content"),
    ),
  );
  assert.match(markup, /class="od-application-shell"/);
  assert.match(markup, /<aside[^>]*class="od-application-sidebar"/);
  assert.match(markup, /<nav[^>]*aria-label="Primary navigation"/);
  assert.match(markup, /<section[^>]*class="od-application-navigation-group"/);
  assert.match(markup, /aria-labelledby="[^"]+"/);
  assert.match(markup, /<header[^>]*class="od-application-topbar"/);
  assert.match(
    markup,
    /<main[^>]*id="main-content"[^>]*aria-label="Current page"/,
  );
  assert.match(markup, /<h1>Application content<\/h1>/);
  assert.match(markup, /class="od-application-mobile-navigation"/);
  assert.match(markup, /aria-label="Mobile navigation"/);
});

test("page surfaces own one full-width responsive gutter mode", () => {
  const markup = renderToStaticMarkup(
    React.createElement(
      PageSurface,
      null,
      React.createElement(PageSurface, { edgeToEdge: true }, "Graph"),
    ),
  );
  assert.match(markup, /class="od-page-surface" data-edge-to-edge="false"/);
  assert.match(
    markup,
    /class="od-page-surface" data-edge-to-edge="true">Graph/,
  );
});

test("graph workspace components expose one labelled canvas and inspector", () => {
  const markup = renderToStaticMarkup(
    React.createElement(
      GraphWorkspace,
      {
        "aria-label": "Service inheritance",
        toolbar: React.createElement(GraphToolbar, {
          actions: React.createElement(Button, null, "Create root"),
        }),
        inspector: React.createElement(
          GraphInspector,
          { onClose: () => undefined, title: "Platform" },
          React.createElement("p", null, "Root service"),
        ),
      },
      React.createElement(
        GraphViewport,
        {
          "aria-label": "Service tree",
          canvasAlignment: "center",
          canvasHeight: 480,
          canvasProps: { "aria-label": "Three services" },
          canvasWidth: 720,
        },
        React.createElement(
          GraphEdges,
          { "aria-label": "Inheritance links" },
          React.createElement(GraphEdge, { path: "M 0 0 L 10 10" }),
          React.createElement(GraphEdge, {
            "aria-label": "Move Platform under Shared",
            onSelect: () => undefined,
            path: "M 10 10 L 20 20",
          }),
        ),
        React.createElement(GraphNode, {
          "aria-label": "Inspect Platform",
          eyebrow: "Root service",
          meta: "2 children",
          draggable: true,
          dragging: true,
          dropTarget: true,
          root: true,
          selected: true,
          title: "Platform",
          tone: "lime",
          x: 48,
          y: 96,
        }),
      ),
    ),
  );
  assert.match(markup, /class="od-graph-workspace"/);
  assert.match(markup, /aria-label="Service tree"/);
  assert.match(
    markup,
    /aria-label="Service tree"[^>]*role="region"[^>]*data-canvas-alignment="center"/,
  );
  assert.match(
    markup,
    /class="od-graph-canvas" data-alignment="center" role="group"/,
  );
  assert.match(markup, /transform:translate\(48px, 96px\)/);
  assert.match(markup, /data-root="true"/);
  assert.match(markup, /data-dragging="true"/);
  assert.match(markup, /data-drop-target="true"/);
  assert.match(markup, /aria-pressed="true"/);
  assert.match(markup, /aria-label="Close inspector"/);
  assert.match(markup, /data-graph-inspector-close="true"/);
  assert.match(markup, /<dialog[^>]*open=""/);
  assert.match(markup, /tabindex="-1"/);
  assert.match(markup, /aria-hidden="true"/);
  assert.match(markup, /aria-label="Move Platform under Shared"/);
  assert.match(markup, /role="button"/);
});

test("graph workspace adds controlled movement, view controls, and link junctions", () => {
  const markup = renderToStaticMarkup(
    React.createElement(
      GraphWorkspace,
      {
        "aria-label": "Ontology graph",
        fullPage: true,
        toolbar: React.createElement(GraphToolbar, {
          center: React.createElement(GraphViewportControls, {
            onAutomaticLayout: () => undefined,
            onFitView: () => undefined,
            onZoomIn: () => undefined,
            onZoomOut: () => undefined,
            zoomInDisabled: true,
          }),
        }),
      },
      React.createElement(
        GraphViewport,
        {
          "aria-label": "Ontology viewport",
          canvasHeight: 480,
          canvasWidth: 720,
          connectionMode: true,
          onConnectionCancel: () => undefined,
          onViewportChange: () => undefined,
          viewport: { x: 12, y: 18, zoom: 1.5 },
        },
        React.createElement(
          GraphEdges,
          { "aria-label": "Ontology relationships" },
          React.createElement(GraphEdge, {
            dashed: true,
            directed: true,
            path: "M 0 0 L 10 10",
          }),
          React.createElement(GraphBundledLink, {
            "aria-label": "Owns connects Company and Person",
            junctionX: 120,
            junctionY: 90,
            label: "Owns",
            onSelect: () => undefined,
            pathA: "M 20 20 L 120 90",
            pathB: "M 120 90 L 220 20",
            selected: true,
          }),
        ),
        React.createElement(GraphNode, {
          "aria-label": "Company object type",
          connectionTarget: true,
          onConnectionTarget: () => undefined,
          onPositionChange: () => undefined,
          positionBounds: { maxX: 640, maxY: 400, minX: 0, minY: 0 },
          selected: true,
          title: "Company",
          x: 48,
          y: 96,
        }),
        React.createElement(
          GraphNodeAction,
          { "aria-label": "Create link from Company", x: 236, y: 112 },
          "+",
        ),
      ),
    ),
  );
  assert.match(markup, /data-full-page="true"/);
  assert.match(markup, /aria-label="Graph view controls"/);
  assert.match(markup, /aria-label="Zoom in" disabled=""/);
  assert.match(markup, />Fit view<\/button>/);
  assert.match(markup, />Automatic layout<\/button>/);
  assert.match(markup, /data-pan-zoom="true"/);
  assert.match(markup, /data-connection-mode="true"/);
  assert.match(markup, /translate\(12px, 18px\) scale\(1.5\)/);
  assert.match(markup, /data-directed="true" data-selected="false"/);
  assert.match(markup, /marker-end="url\(#/);
  assert.match(markup, /class="od-graph-bundled-link"/);
  assert.match(markup, /aria-pressed="true"/);
  assert.equal((markup.match(/data-endpoint="A"/gu) ?? []).length, 1);
  assert.equal((markup.match(/data-endpoint="B"/gu) ?? []).length, 1);
  assert.match(markup, /class="od-graph-bundled-link-label"[^>]*>Owns/);
  assert.match(markup, /data-connection-target="true"/);
  assert.match(markup, /aria-label="Create link from Company"/);
  assert.match(markup, /class="od-graph-node-action"/);
});

test("graph view and position helpers are finite, bounded, and deterministic", () => {
  const bounds = { maxX: 200, maxY: 160, minX: 0, minY: 0 };
  assert.deepEqual(clampGraphPosition({ x: -8, y: 180 }, bounds), {
    x: 0,
    y: 160,
  });
  assert.deepEqual(
    moveGraphPosition({ x: 190, y: 12 }, { x: 24, y: -20 }, bounds),
    { x: 200, y: 0 },
  );
  assert.deepEqual(
    clampGraphViewport(
      { x: -500, y: 700, zoom: 9 },
      { maxX: 100, maxY: 100, minX: -100, minY: -100 },
    ),
    { x: -100, y: 100, zoom: 4 },
  );

  const viewport = { x: 20, y: 30, zoom: 2 };
  assert.deepEqual(graphViewportCenter(viewport, { height: 400, width: 600 }), {
    x: 140,
    y: 85,
  });
  assert.deepEqual(
    graphPositionAtViewportCenter(
      viewport,
      { height: 400, width: 600 },
      { height: 40, width: 100 },
    ),
    { x: 90, y: 65 },
  );
  assert.deepEqual(
    graphViewportCenter(
      { x: 0, y: 0, zoom: 10 },
      { height: 100, width: 100 },
      { maxZoom: 10 },
    ),
    { x: 5, y: 5 },
  );
  assert.deepEqual(
    fitGraphViewport(
      { height: 200, width: 400, x: 100, y: 50 },
      { height: 500, width: 900 },
      { maxZoom: 2, minZoom: 0.1, padding: 50 },
    ),
    { x: -150, y: -50, zoom: 2 },
  );
  const maximumFit = fitGraphViewport(
    { height: 100, width: 100, x: 1_000_000, y: 0 },
    { height: 1_000, width: 1_000 },
  );
  assert.equal(Math.abs(maximumFit.x + 1_000_000) < 0.000_001, true);
  assert.equal(
    Math.abs(maximumFit.x + (1_000_000 + 100 / 2) * maximumFit.zoom - 500) <
      0.000_001,
    true,
  );
  assert.deepEqual(
    fitGraphViewport(
      { height: 0, width: 0, x: 0, y: 0 },
      { height: 0, width: 0 },
    ),
    { x: 0, y: 0, zoom: 4 },
  );
  assert.deepEqual(
    zoomGraphViewportAtPoint({ x: 0, y: 0, zoom: 1 }, 2, { x: 100, y: 80 }),
    { x: -100, y: -80, zoom: 2 },
  );
  assert.throws(
    () => clampGraphViewport({ x: 0, y: 0, zoom: Number.NaN }),
    /finite/,
  );
  assert.throws(
    () =>
      moveGraphPosition(
        { x: Number.MAX_VALUE, y: 0 },
        { x: Number.MAX_VALUE, y: 0 },
      ),
    /finite/,
  );
  assert.throws(
    () =>
      clampGraphPosition(
        { x: 0, y: 0 },
        { maxX: 0, maxY: 0, minX: 1, minY: 0 },
      ),
    /minimum/,
  );
  assert.throws(
    () =>
      graphViewportCenter(
        { x: -Number.MAX_VALUE, y: 0, zoom: 0.1 },
        { height: 0, width: Number.MAX_VALUE },
        { minX: -Number.MAX_VALUE, maxX: Number.MAX_VALUE },
      ),
    /finite/,
  );
});

test("graph inspector preserves a caller-supplied accessible relationship", () => {
  const markup = renderToStaticMarkup(
    React.createElement(
      GraphInspector,
      { "aria-labelledby": "external-title", title: "Internal title" },
      "Details",
    ),
  );
  assert.match(markup, /<dialog[^>]*aria-labelledby="external-title"/);
});

test("graph inspector eyebrow uses the strong muted token only", async () => {
  const stylesheet = await readFile(
    new URL("../styles/tokens.css", import.meta.url),
    "utf8",
  );
  assert.match(
    stylesheet,
    /\.od-graph-node-eyebrow,\s*\.od-graph-inspector-eyebrow\s*\{[^}]*color: #aab4b3;/s,
  );
  assert.match(
    stylesheet,
    /\.od-graph-inspector-eyebrow\s*\{[^}]*color: var\(--od-color-muted-strong\);/s,
  );
});

test("compact graph inspector primitives keep semantic facts, sections, rows, and notices", () => {
  const markup = renderToStaticMarkup(
    React.createElement(
      GraphInspector,
      { actions: React.createElement("button", null, "Save"), title: "Record" },
      React.createElement(
        GraphInspectorFacts,
        null,
        React.createElement(GraphInspectorFact, {
          label: "Type",
          value: "Service",
        }),
      ),
      React.createElement(
        GraphInspectorSection,
        { count: 1, title: "Relationships" },
        React.createElement(
          GraphInspectorRows,
          null,
          React.createElement(GraphInspectorRow, {
            actions: React.createElement("button", null, "Open"),
            label: "Parent",
            value: "Platform",
          }),
        ),
      ),
      React.createElement(
        GraphInspectorNotice,
        { tone: "warning" },
        "Check this value.",
      ),
      React.createElement(
        GraphInspectorNotice,
        { dynamic: true, tone: "error" },
        "Save failed.",
      ),
    ),
  );
  assert.match(markup, /<dl class="od-graph-inspector-facts">/);
  assert.match(markup, /<dt>Type<\/dt><dd>Service<\/dd>/);
  assert.match(markup, /<section[^>]*aria-labelledby=/);
  assert.match(markup, /<h3[^>]*>Relationships<span/);
  assert.match(markup, /<ul class="od-graph-inspector-rows">/);
  assert.match(markup, /<li class="od-graph-inspector-row">/);
  assert.match(markup, /data-tone="warning"/);
  assert.match(markup, /data-tone="error" role="alert"/);
  assert.match(markup, /od-graph-inspector-notice-state">Warning:<\/strong>/);
  assert.match(markup, /od-graph-inspector-notice-state">Error:<\/strong>/);
});

test("tree helpers use stable vertical layouts by default", () => {
  const items = [
    { id: "root", parentId: null },
    { id: "child-a", parentId: "root" },
    { id: "child-b", parentId: "root" },
  ];
  const vertical = layoutTree(items, { padding: 20 });
  const horizontal = layoutTree(items, {
    direction: "horizontal",
    padding: 20,
  });
  assert.equal(vertical.nodes[0].y, 20);
  assert.equal(vertical.nodes[1].y, 120);
  assert.equal(horizontal.nodes[0].x, 20);
  assert.equal(horizontal.nodes[1].x, 260);
  assert.equal(horizontal.edges.length, 2);
  assert.equal(
    treeEdgePath(vertical.nodes[0], vertical.nodes[1]),
    "M 228 92 C 228 106 108 106 108 120",
  );
  assert.equal(
    treeEdgePath(horizontal.nodes[0], horizontal.nodes[1], {
      direction: "horizontal",
    }),
    "M 196 106 C 228 106 228 56 260 56",
  );
  assert.throws(
    () =>
      layoutTree([
        { id: "a", parentId: "b" },
        { id: "b", parentId: "a" },
      ]),
    /cycle/,
  );
});

test("layered graph layout is stable for multiple parents and unknown roots", () => {
  const graph = [
    { id: "child", parentIds: ["root-b", "root-a", "missing"] },
    { id: "root-b", parentIds: [] },
    { id: "orphan", parentIds: ["unknown"] },
    { id: "root-a", parentIds: [] },
  ];
  const first = layoutLayeredDirectedGraph(graph, { padding: 20 });
  const second = layoutLayeredDirectedGraph(
    [...graph]
      .reverse()
      .map((item) => ({ ...item, parentIds: [...item.parentIds].reverse() })),
    { padding: 20 },
  );

  assert.deepEqual(first, second);
  assert.deepEqual(
    first.nodes.map(({ id, depth }) => [id, depth]),
    [
      ["orphan", 0],
      ["root-a", 0],
      ["root-b", 0],
      ["child", 1],
    ],
  );
  assert.equal(first.nodes.find((node) => node.id === "root-a")?.y, 20);
  assert.equal(first.nodes.find((node) => node.id === "child")?.y, 120);
  assert.deepEqual(
    first.edges.map(({ sourceId, targetId }) => [sourceId, targetId]),
    [
      ["root-a", "child"],
      ["root-b", "child"],
    ],
  );
  assert.throws(
    () =>
      layoutLayeredDirectedGraph([
        { id: "same", parentIds: [] },
        { id: "same", parentIds: [] },
      ]),
    /unique/,
  );
  assert.throws(
    () =>
      layoutLayeredDirectedGraph([
        { id: "a", parentIds: ["b"] },
        { id: "b", parentIds: ["a"] },
      ]),
    /cycle/,
  );
});

test("GraphEmptyState labels its title and keeps actions available", () => {
  const markup = renderToStaticMarkup(
    React.createElement(GraphEmptyState, {
      actions: React.createElement(Button, null, "Create service"),
      description: "Create the first service to start the graph.",
      headingLevel: "h3",
      icon: React.createElement(Icon, { name: "layers" }),
      title: "No services",
    }),
  );
  assert.match(markup, /class="od-graph-empty-state"/);
  assert.match(markup, /role="status"/);
  assert.match(markup, /aria-labelledby="[^"]+"/);
  assert.match(markup, /<h3 id="[^"]+">No services<\/h3>/);
  assert.match(markup, /aria-hidden="true" class="od-graph-empty-state-icon"/);
  assert.match(markup, />Create service<\/button>/);
});

const playgroundValue = {
  operation: "model",
  selection: { kind: "assignment", id: "support-chat" },
  input: "Give one short answer.",
  systemPrompt: "Use plain language.",
  temperature: 0.3,
  outputLimit: 240,
};

const playgroundAssignments = [
  {
    id: "support-chat",
    label: "Support chat",
    detail: "Two routes",
  },
];

const playgroundProviderModels = [
  {
    id: "steady-text",
    label: "Steady text model",
    detail: "Text and tools",
  },
  {
    id: "unavailable-model",
    label: "Unavailable model",
    disabled: true,
  },
];

const playgroundSuccess = {
  status: "success",
  result: {
    output: { kind: "text", content: "The operation completed." },
    selectedRoute: {
      label: "steady-text",
      detail: "Selected from support-chat",
    },
    latencyMs: 184,
    usage: [
      { id: "input", label: "Input tokens", value: "22" },
      { id: "output", label: "Output tokens", value: "8" },
    ],
    cost: { amount: "0.00042", currency: "USD" },
  },
};

function renderPlayground(overrides = {}) {
  return renderToStaticMarkup(
    React.createElement(OperationPlayground, {
      assignmentOptions: playgroundAssignments,
      description: "Run one provider-neutral operation.",
      id: "operation-test",
      inputImages: [{ id: "input-1", name: "receipt.png", detail: "82 KB" }],
      onAddInputImages: () => undefined,
      onRemoveInputImage: () => undefined,
      onReset: () => undefined,
      onRun: () => undefined,
      onValueChange: () => undefined,
      providerModelOptions: playgroundProviderModels,
      runState: playgroundSuccess,
      title: "Operation playground",
      value: playgroundValue,
      ...overrides,
    }),
  );
}

test("OperationPlayground shows controlled model inputs and complete result facts", () => {
  const markup = renderPlayground();

  assert.match(markup, /class="od-playground"/);
  assert.match(markup, /aria-labelledby="operation-test-title"/);
  assert.match(markup, /<form[^>]*aria-busy="false"/);
  assert.match(markup, /<label[^>]*for="operation-test-operation"/);
  assert.match(markup, /<option value="model" selected="">Model/);
  assert.match(markup, /name="operation-test-route-kind"/);
  assert.match(markup, /<input[^>]*type="radio"[^>]*checked=""/);
  assert.match(markup, /Support chat · Two routes/);
  assert.match(markup, /<summary>Model controls<\/summary>/);
  assert.match(markup, /id="operation-test-system-prompt"/);
  assert.match(markup, /id="operation-test-temperature"/);
  assert.match(markup, /value="0.3"/);
  assert.match(markup, /id="operation-test-output-limit"/);
  assert.match(markup, /max="1000000"/);
  assert.match(markup, /value="240"/);
  assert.match(markup, /accept="image\/jpeg,image\/png,image\/webp"/);
  assert.match(markup, /receipt\.png/);
  assert.match(markup, /aria-label="Remove receipt\.png"/);
  assert.match(markup, /role="status"/);
  assert.match(markup, /Result ready/);
  assert.match(
    markup,
    /aria-label="Text output"[^>]*data-output-kind="text" role="region" tabindex="0"/,
  );
  assert.match(markup, /The operation completed\./);
  assert.match(markup, /Selected route/);
  assert.match(markup, /steady-text/);
  assert.match(markup, /184 ms/);
  assert.match(markup, /Input tokens/);
  assert.match(markup, />22<\/dd>/);
  assert.match(markup, /0\.00042 USD/);
  assert.doesNotMatch(markup, /service[ -]?key/i);
  assert.doesNotMatch(markup, /authorization/i);
});

test("OperationPlayground shows only the controls that apply to each operation", () => {
  const embedding = renderPlayground({
    value: { ...playgroundValue, operation: "embedding" },
    inputImages: [],
    runState: {
      status: "success",
      result: {
        ...playgroundSuccess.result,
        output: {
          kind: "embedding",
          vectorCount: 2,
          dimensions: 1536,
          preview: [0.1, 0.2, 0.3],
        },
        usage: [],
        cost: null,
      },
    },
  });
  assert.match(embedding, /data-operation="embedding"/);
  assert.match(embedding, />Input text<\/span>/);
  assert.match(embedding, /Put each input item on a new line/);
  assert.match(embedding, /Vectors/);
  assert.match(embedding, />2<\/dd>/);
  assert.match(embedding, /Dimensions/);
  assert.match(embedding, />1536<\/dd>/);
  assert.match(embedding, /Vector preview/);
  assert.match(embedding, /No usage reported/);
  assert.match(embedding, /Not reported/);
  assert.doesNotMatch(embedding, /id="operation-test-system-prompt"/);
  assert.doesNotMatch(embedding, /Input images/);

  const image = renderPlayground({
    value: { ...playgroundValue, operation: "image" },
    runState: {
      status: "success",
      result: {
        ...playgroundSuccess.result,
        output: {
          kind: "image",
          objectUrl: "blob:https://host.invalid/image-result",
          label: "Generated landscape",
          mediaType: "image/png",
        },
      },
    },
  });
  assert.match(image, /data-operation="image"/);
  assert.match(image, /<img alt="Generated landscape"/);
  assert.match(image, /referrerPolicy="no-referrer"/);
  assert.match(image, /<figcaption>Generated landscape<\/figcaption>/);
  assert.doesNotMatch(image, /Model controls/);

  const video = renderPlayground({
    value: { ...playgroundValue, operation: "video" },
    runState: {
      status: "success",
      result: {
        ...playgroundSuccess.result,
        output: {
          kind: "video",
          objectUrl: "blob:https://host.invalid/video-result",
          label: "Generated clip",
          mediaType: "video/mp4",
        },
      },
    },
  });
  assert.match(video, /data-operation="video"/);
  assert.match(video, /<video aria-label="Generated clip" controls=""/);
  assert.match(video, /preload="metadata"/);
  assert.match(video, /type="video\/mp4"/);
  assert.doesNotMatch(video, /<track/);

  const audio = renderPlayground({
    value: { ...playgroundValue, operation: "audio" },
    inputImages: [],
    runState: {
      status: "success",
      result: {
        ...playgroundSuccess.result,
        output: {
          kind: "audio",
          objectUrl: "blob:https://host.invalid/audio-result",
          label: "Generated speech",
          mediaType: "audio/mpeg",
        },
      },
    },
  });
  assert.match(audio, /data-operation="audio"/);
  assert.match(audio, />Text<\/span>/);
  assert.match(audio, /<audio aria-label="Generated speech" controls=""/);
  assert.doesNotMatch(audio, /<track/);
  assert.doesNotMatch(audio, /Input images/);
});

test("OperationPlayground renders optional media captions when supplied", () => {
  for (const kind of ["video", "audio"]) {
    const markup = renderPlayground({
      value: { ...playgroundValue, operation: kind },
      runState: {
        status: "success",
        result: {
          ...playgroundSuccess.result,
          output: {
            kind,
            objectUrl: `blob:https://host.invalid/${kind}-result`,
            label: `Generated ${kind}`,
            mediaType: `${kind}/test`,
            captions: {
              objectUrl: `blob:https://host.invalid/${kind}-captions`,
              label: "English",
              language: "en",
            },
          },
        },
      },
    });
    assert.match(markup, /<track[^>]*kind="captions"/);
    assert.match(markup, /label="English"/);
    assert.match(markup, /srcLang="en"/);
  }
});

test("OperationPlayground labels empty, loading, and corrective error states", () => {
  const empty = renderPlayground({
    runState: { status: "empty", message: "No saved result." },
  });
  assert.match(empty, /od-playground-state-empty/);
  assert.match(empty, /<output aria-live="polite"/);
  assert.match(empty, /No result/);
  assert.match(empty, /No saved result/);

  const loading = renderPlayground({
    runState: { status: "loading", message: "The media job is pending." },
  });
  assert.match(loading, /aria-busy="true"/);
  assert.match(loading, /aria-live="polite"/);
  assert.match(loading, /Operation running/);
  assert.match(loading, /The media job is pending/);
  assert.match(loading, /disabled=""[^>]*>Running…<\/button>/);

  const error = renderPlayground({
    runState: {
      status: "error",
      error: {
        title: "The route is not available",
        message: "The selected route cannot run this operation.",
        correction:
          "Select a route that supports image output and run it again.",
        code: "route_incompatible",
      },
    },
  });
  assert.match(error, /role="alert"/);
  assert.match(error, /aria-live="assertive"/);
  assert.match(error, /The route is not available/);
  assert.match(error, /How to correct it/);
  assert.match(error, /Select a route that supports image output/);
  assert.match(error, /<code>route_incompatible<\/code>/);

  const disabled = renderPlayground({ disabled: true });
  assert.match(disabled, /<form[^>]*aria-busy="false"/);
  assert.match(
    disabled,
    /<button[^>]*disabled=""[^>]*>Run operation<\/button>/,
  );
});

test("OperationPlayground accepts only host-owned blob URLs for media", () => {
  for (const objectUrl of [
    "https://router.invalid/v1/media-jobs/job-1/content",
    "data:image/png;base64,AAAA",
    "not a URL",
  ]) {
    assert.throws(
      () =>
        renderPlayground({
          value: { ...playgroundValue, operation: "image" },
          runState: {
            status: "success",
            result: {
              ...playgroundSuccess.result,
              output: {
                kind: "image",
                objectUrl,
                label: "Generated image",
              },
            },
          },
        }),
      /Media output object URL must/,
    );
  }

  assert.throws(
    () =>
      renderPlayground({
        value: { ...playgroundValue, operation: "video" },
        runState: {
          status: "success",
          result: {
            ...playgroundSuccess.result,
            output: {
              kind: "video",
              objectUrl: "blob:https://host.invalid/video-result",
              label: "Generated video",
              captions: {
                objectUrl: "https://host.invalid/captions.vtt",
                label: "English",
                language: "en",
              },
            },
          },
        },
      }),
    /Media captions object URL must use the blob protocol/,
  );
});

test("OperationPlayground keeps stale or unavailable route selections safe", () => {
  const stale = renderPlayground({
    value: {
      ...playgroundValue,
      selection: { kind: "assignment", id: "removed-assignment" },
    },
  });
  assert.match(
    stale,
    /<option value="" selected="">Select assignment<\/option>/,
  );
  assert.match(stale, /<button[^>]*disabled=""[^>]*>Run operation<\/button>/);

  const noAssignments = renderPlayground({
    assignmentOptions: [],
    value: {
      ...playgroundValue,
      selection: { kind: "assignment", id: "" },
    },
  });
  assert.match(noAssignments, /No assignments available/);
  assert.match(
    noAssignments,
    /<input(?=[^>]*disabled="")(?=[^>]*type="radio")(?=[^>]*checked="")[^>]*>/,
  );

  const noEnabledProviderModels = renderPlayground({
    providerModelOptions: playgroundProviderModels.map((option) => ({
      ...option,
      disabled: true,
    })),
    value: {
      ...playgroundValue,
      selection: { kind: "provider-model", id: "" },
    },
  });
  assert.match(
    noEnabledProviderModels,
    /<select disabled="" id="operation-test-target"/,
  );
  assert.match(noEnabledProviderModels, /No provider-models available/);

  const unavailableOperation = renderPlayground({
    availableOperations: ["embedding", "image"],
    value: playgroundValue,
  });
  assert.match(unavailableOperation, /Operation unavailable/);
  assert.doesNotMatch(unavailableOperation, /data-operation=/);
  assert.match(
    unavailableOperation,
    /<button[^>]*disabled=""[^>]*>Run operation<\/button>/,
  );
});

test("OperationPlayground rejects ambiguous options and operation lists", () => {
  assert.throws(
    () =>
      renderPlayground({
        assignmentOptions: [
          playgroundAssignments[0],
          { ...playgroundAssignments[0], label: "Duplicate" },
        ],
      }),
    /Assignment option id must be unique/,
  );
  assert.throws(
    () => renderPlayground({ availableOperations: [] }),
    /must not be empty/,
  );
  assert.throws(
    () => renderPlayground({ availableOperations: ["model", "model"] }),
    /must be unique/,
  );
  assert.throws(
    () =>
      renderPlayground({
        runState: {
          ...playgroundSuccess,
          result: {
            ...playgroundSuccess.result,
            usage: [
              playgroundSuccess.result.usage[0],
              playgroundSuccess.result.usage[0],
            ],
          },
        },
      }),
    /Usage item id must be unique/,
  );
});

test("OperationPlayground has responsive phone and motion rules", async () => {
  const stylesheet = await readFile(
    new URL("../styles/tokens.css", import.meta.url),
    "utf8",
  );
  const phoneStyles = stylesheet.slice(
    stylesheet.lastIndexOf("@media (max-width: 48rem)"),
  );
  assert.match(
    stylesheet,
    /\.od-playground\s*\{[\s\S]*?grid-template-columns: minmax\(0, 1\.08fr\) minmax\(18rem, 0\.92fr\);/,
  );
  assert.match(
    phoneStyles,
    /\.od-playground\s*\{[\s\S]*?grid-template-columns: minmax\(0, 1fr\);/,
  );
  assert.match(
    phoneStyles,
    /\.od-playground-route-kind,[\s\S]*?grid-template-columns: minmax\(0, 1fr\);/,
  );
  assert.match(
    stylesheet,
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.od-playground-state-loading > span[\s\S]*?animation: none;/,
  );
  assert.match(
    stylesheet,
    /\.od-playground-optional-controls > summary:focus-visible,[\s\S]*?\.od-playground-embedding-output summary:focus-visible\s*\{[\s\S]*?outline:/,
  );
  assert.match(
    stylesheet,
    /\.od-playground-text-output:focus-visible\s*\{[\s\S]*?outline:/,
  );
});

test("session components keep one named page and caller-supplied states", () => {
  const markup = renderToStaticMarkup(
    React.createElement(
      SessionPage,
      { "aria-label": "Session access" },
      React.createElement(SessionCard, {
        actions: React.createElement(Button, { disabled: true }, "Opening…"),
        description: "Use your shared account.",
        eyebrow: "Identity",
        feedback: React.createElement("p", { role: "alert" }, "Try again."),
        footer: "This account does not grant access.",
        headingLevel: "h2",
        icon: React.createElement(Icon, { name: "shield" }),
        title: "Sign in",
      }),
    ),
  );
  assert.match(markup, /<main[^>]*class="od-session-page"/);
  assert.match(markup, /aria-label="Session access"/);
  assert.match(markup, /aria-labelledby="[^"]+"/);
  assert.match(markup, /<h2 id="[^"]+">Sign in<\/h2>/);
  assert.match(markup, /class="od-session-icon"/);
  assert.match(markup, /<button[^>]*disabled=""[^>]*>Opening…<\/button>/);
  assert.match(markup, /<p role="alert">Try again.<\/p>/);
  assert.match(markup, /<footer class="od-session-footer">/);
});

test("state panels expose status, error, action, and heading states", () => {
  const loading = renderToStaticMarkup(
    React.createElement(
      StatePanel,
      { title: "Loading" },
      React.createElement("p", null, "Wait for the result."),
    ),
  );
  const failure = renderToStaticMarkup(
    React.createElement(
      StatePanel,
      {
        headingLevel: "h3",
        kind: "error",
        onRetry: () => undefined,
        retryLabel: "Load again",
        title: "Not available",
      },
      "No automatic retry was sent.",
    ),
  );
  assert.match(
    loading,
    /class="od-panel od-state-panel od-state-panel-loading"/,
  );
  assert.match(loading, /role="status"/);
  assert.match(loading, /<h2>Loading<\/h2>/);
  assert.match(failure, /od-state-panel-error/);
  assert.match(failure, /role="alert"/);
  assert.match(failure, /<h3>Not available<\/h3>/);
  assert.match(failure, />Load again<\/button>/);
});

test("shared controls support heading levels, inline statistics, and icon buttons", () => {
  const markup = renderToStaticMarkup(
    React.createElement(
      "div",
      null,
      React.createElement(PageHeading, {
        eyebrow: "Area",
        headingLevel: "h2",
        title: "Details",
      }),
      React.createElement(StatCard, {
        icon: React.createElement(Icon, { name: "server" }),
        label: "Services",
        note: "Healthy",
        orientation: "inline",
        value: "8",
      }),
      React.createElement(IconButton, {
        "aria-label": "Refresh",
        icon: React.createElement(Icon, { name: "refresh" }),
      }),
    ),
  );
  assert.match(markup, /<h2>Details<\/h2>/);
  assert.match(markup, /class="od-stat-card od-stat-card-inline stat-card"/);
  assert.match(markup, /class="od-icon-button"/);
  assert.match(markup, /aria-label="Refresh"/);
});

test("PlanCardShell keeps an accessible article boundary", () => {
  const markup = renderToStaticMarkup(
    React.createElement(
      PlanCardShell,
      {
        age: "now",
        ariaLabel: "Review plan",
        icon: React.createElement(Icon, { name: "clock" }),
        meta: "Review",
        state: "pending",
        title: "Publish",
      },
      React.createElement("p", null, "Waiting for review."),
    ),
  );
  assert.match(markup, /class="od-plan-card shared-plan-card"/);
  assert.match(markup, /aria-label="Review plan"/);
  assert.match(markup, /Waiting for review/);
});

test("shared shell controls expose semantic labels and states", () => {
  const markup = renderToStaticMarkup(
    React.createElement(
      "div",
      null,
      React.createElement(WorkspaceSelector, {
        avatar: "TD",
        detail: "Personal",
        name: "Workspace",
      }),
      React.createElement(AccountMenu, {
        avatar: "VL",
        detail: "Administrator",
        name: "Vincent",
      }),
      React.createElement(NavigationItem, {
        active: true,
        icon: React.createElement(Icon, { name: "grid" }),
        label: "Overview",
      }),
      React.createElement(NavigationLink, {
        active: false,
        href: "/audit",
        icon: React.createElement(Icon, { name: "audit" }),
        label: "Audit",
      }),
      React.createElement(MobileNavigation, {
        "aria-label": "Mobile navigation",
        items: [
          {
            id: "home",
            label: "Home",
            icon: React.createElement(Icon, { name: "grid" }),
            active: true,
            badge: 2,
          },
        ],
        onSelect: () => undefined,
      }),
      React.createElement(
        Panel,
        { "aria-label": "Health" },
        React.createElement(PanelHeader, {
          title: "Health",
          description: "Current status",
        }),
        React.createElement(HealthBar, { label: "API", value: 88 }),
      ),
      React.createElement(AttentionRow, {
        icon: React.createElement(Icon, { name: "warning" }),
        title: "Review",
        detail: "Needs action",
        onClick: () => undefined,
      }),
      React.createElement(Toast, null, "Saved"),
    ),
  );
  assert.match(markup, /od-workspace-selector/);
  assert.match(markup, /od-account-menu/);
  assert.match(markup, /aria-current="page"/);
  assert.match(markup, /href="\/audit"/);
  assert.match(markup, /<progress[^>]*max="100"/);
  assert.match(markup, /<progress[^>]*value="88"/);
  assert.match(markup, /od-attention-row/);
  assert.match(markup, /<output class="od-toast"/);
  assert.match(markup, /od-mobile-navigation/);
});

test("ReviewPlanCard and CalendarBoard provide generic interactive views", () => {
  const items = [
    {
      id: "event-1",
      title: "Review",
      detail: "Check",
      date: "2026-08-12",
      start: "10:00",
      end: "10:30",
      kind: "reminder",
      state: "planned",
      editable: true,
    },
  ];
  const markup = renderToStaticMarkup(
    React.createElement(
      "div",
      null,
      React.createElement(ReviewPlanCard, {
        ariaLabel: "Review plan",
        meta: "Needs review",
        state: "pending",
        text: "Check the release.",
        title: "Review",
        onApprove: () => undefined,
        onEdit: () => undefined,
        onRefuse: () => undefined,
        onRestore: () => undefined,
      }),
      React.createElement(CalendarBoard, {
        mode: "week",
        items,
        weekDates: ["2026-08-12"],
        weekHours: ["10:00"],
        today: "2026-08-12",
        selectedId: null,
        draggedId: null,
        dropDate: null,
        onSelect: () => undefined,
        onDragStart: () => undefined,
        onDragEnd: () => undefined,
        onAllowDrop: () => undefined,
        onClearDrop: () => undefined,
        onMove: () => undefined,
      }),
    ),
  );
  const monthMarkup = renderToStaticMarkup(
    React.createElement(CalendarBoard, {
      mode: "month",
      items,
      weekDates: [],
      weekHours: [],
      today: "2027-02-10",
      selectedId: null,
      draggedId: null,
      dropDate: null,
      onSelect: () => undefined,
      onDragStart: () => undefined,
      onDragEnd: () => undefined,
      onAllowDrop: () => undefined,
      onClearDrop: () => undefined,
      onMove: () => undefined,
    }),
  );
  assert.match(markup, /od-plan-card/);
  assert.match(markup, /calendar-week/);
  assert.match(markup, /Review/);
  assert.match(monthMarkup, /February 2027 month view/);
});

test("ShellErrorBoundary renders its children when no error exists", () => {
  const markup = renderToStaticMarkup(
    React.createElement(
      ShellErrorBoundary,
      { resetKey: "initial" },
      React.createElement("p", null, "Ready"),
    ),
  );
  assert.equal(markup, "<p>Ready</p>");
});

test("DockedPanelLayout keeps the workspace, inner panel, and outer panel in order", () => {
  const panel = (title, content) => ({
    children: React.createElement("p", null, content),
    onClose: () => undefined,
    open: true,
    title,
  });
  const markup = renderToStaticMarkup(
    React.createElement(
      DockedPanelLayout,
      {
        innerPanel: panel("Property inspector", "Property fields"),
        outerPanel: panel("YAML source", "YAML editor"),
      },
      React.createElement("div", { "aria-label": "Graph workspace" }),
    ),
  );
  const workspaceIndex = markup.indexOf("od-docked-panel-layout-workspace");
  const innerIndex = markup.indexOf('data-position="inner"');
  const outerIndex = markup.indexOf('data-position="outer"');
  assert.equal(workspaceIndex >= 0, true);
  assert.equal(workspaceIndex < innerIndex && innerIndex < outerIndex, true);
  assert.match(
    markup,
    /aria-label="Property inspector"[^>]*role="complementary"/,
  );
  assert.match(markup, /aria-label="YAML source"[^>]*role="complementary"/);
  assert.match(markup, /aria-label="Close Property inspector"/);
  assert.match(markup, /aria-label="Close YAML source"/);
});

test("DockedPanelLayout omits a closed panel without changing outer placement", () => {
  const markup = renderToStaticMarkup(
    React.createElement(
      DockedPanelLayout,
      {
        innerPanel: {
          children: "Hidden",
          onClose: () => undefined,
          open: false,
          title: "Property inspector",
        },
        outerPanel: {
          children: "Visible",
          onClose: () => undefined,
          open: true,
          title: "YAML source",
        },
      },
      React.createElement("div", null, "Graph"),
    ),
  );
  assert.doesNotMatch(markup, /data-position="inner"/);
  assert.match(markup, /data-position="outer"/);
});
