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
  ContextItem,
  GraphEdge,
  GraphEdges,
  GraphEmptyState,
  GraphInspector,
  GraphNode,
  GraphToolbar,
  GraphViewport,
  GraphWorkspace,
  HealthBar,
  Icon,
  IconButton,
  NavigationItem,
  NavigationLink,
  MobileNavigation,
  OperationPlayground,
  PageHeading,
  Panel,
  PanelHeader,
  PlanCardShell,
  ReviewPlanCard,
  ServiceAssignmentGraph,
  SessionCard,
  SessionPage,
  ShellErrorBoundary,
  StatCard,
  StatePanel,
  StatusPill,
  Toast,
  WorkspaceSelector,
  layoutLayeredDirectedGraph,
  layoutTree,
  treeEdgePath,
} from "../dist/index.js";
import { serviceAssignmentFocusIndex } from "../dist/ServiceAssignmentKeyboard.js";

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
  assert.match(markup, /class="od-graph-canvas" role="group"/);
  assert.match(markup, /transform:translate\(48px, 96px\)/);
  assert.match(markup, /data-root="true"/);
  assert.match(markup, /data-dragging="true"/);
  assert.match(markup, /data-drop-target="true"/);
  assert.match(markup, /aria-pressed="true"/);
  assert.match(markup, /aria-label="Close inspector"/);
  assert.match(markup, /aria-hidden="true"/);
  assert.match(markup, /aria-label="Move Platform under Shared"/);
  assert.match(markup, /role="button"/);
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

const serviceAssignments = [
  {
    id: "default",
    name: "default",
    source: { kind: "implicit", label: "Root service" },
    candidates: [],
    isDefault: true,
    lastUsed: null,
    observedRequirements: [],
  },
  {
    id: "support-chat",
    name: "support.chat",
    source: { kind: "direct", label: "Support service" },
    candidates: [
      { id: "fast", label: "Fast text model", detail: "Region A" },
      { id: "steady", label: "Steady text model" },
    ],
    lastUsed: {
      dateTime: "2026-08-23T12:00:00Z",
      label: "23 Aug 2026, 12:00 UTC",
    },
    observedRequirements: ["text input", "tool calls"],
  },
  {
    id: "summary",
    name: "summary",
    source: { kind: "inherited", label: "Shared service" },
    candidates: [{ id: "steady", label: "Steady text model" }],
    inheritsFrom: "default",
    lastUsed: null,
    observedRequirements: ["text input"],
  },
  {
    id: "image-caption",
    name: "image.caption",
    source: null,
    candidates: [{ id: "vision", label: "Vision text model" }],
    inheritsFrom: "default",
    lastUsed: null,
    observedRequirements: ["image input"],
  },
  {
    id: "report-generate",
    name: "report.generate",
    source: { kind: "implicit", label: "Support service" },
    candidates: [
      { id: "fast", label: "Fast text model" },
      { id: "steady", label: "Steady text model" },
    ],
    inheritsFrom: "default",
    lastUsed: null,
    observedRequirements: ["text input"],
  },
  {
    id: "empty-inherited",
    name: "empty.inherited",
    source: { kind: "inherited", label: "Root service" },
    candidates: [],
    inheritsFrom: "default",
    lastUsed: null,
    observedRequirements: [],
  },
];

test("ServiceAssignmentGraph shows source, chain, use, and requirement states with list parity", () => {
  const markup = renderToStaticMarkup(
    React.createElement(ServiceAssignmentGraph, {
      "aria-label": "Support service assignments",
      assignments: serviceAssignments,
      id: "support-assignments",
      onSelectionChange: () => undefined,
      actionsForAssignment: (assignment) =>
        assignment.source === null
          ? null
          : React.createElement(Button, null, `Edit ${assignment.name}`),
      selectedAssignmentId: "support-chat",
    }),
  );

  assert.match(markup, /class="od-service-assignment-graph"/);
  assert.match(markup, /role="group"/);
  assert.match(markup, /aria-label="Support service assignments visual graph"/);
  assert.match(
    markup,
    /aria-label="6 assignments and their ordered candidate chains"/,
  );
  assert.match(
    markup,
    /aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight Home End Escape"/,
  );
  assert.match(markup, /aria-expanded="true"/);
  assert.match(markup, /aria-live="polite"/);
  assert.match(markup, /Direct definition from Support service/);
  assert.match(markup, /Inherited definition from Shared service/);
  assert.match(markup, /Implicit root default from Root service/);
  assert.match(markup, /Implicit assignment from Support service/);
  assert.match(markup, /No definition\. Unconfigured · inherits default/);
  assert.match(
    markup,
    /image\.caption[\s\S]*?Unconfigured · inherits default · 1 candidate/,
  );
  assert.match(markup, /Vision text model/);
  assert.match(markup, /Empty default chain/);
  assert.match(markup, /Unconfigured/);
  assert.match(markup, /Inherits default/);
  assert.match(markup, /Fast text model/);
  assert.match(markup, /Steady text model/);
  assert.match(
    markup,
    /Primary[\s\S]*?Fast text model[\s\S]*?Fallback 1[\s\S]*?Steady text model/,
  );
  assert.match(markup, /<time dateTime="2026-08-23T12:00:00Z">/);
  assert.match(markup, /tool calls/);
  assert.match(markup, /<h4>Ordered candidates<\/h4>/);
  assert.match(markup, /<h4>Observed requirements<\/h4>/);
  assert.match(markup, /id="support-assignments-list-title">Assignment list/);
  assert.match(
    markup,
    /The list contains the same records and actions as the graph/,
  );
  assert.equal(
    (markup.match(/>Edit support\.chat<\/button>/g) ?? []).length,
    2,
  );
  assert.equal((markup.match(/>Edit default<\/button>/g) ?? []).length, 1);
  assert.equal((markup.match(/>Edit summary<\/button>/g) ?? []).length, 1);
  assert.equal(
    (markup.match(/>Edit report\.generate<\/button>/g) ?? []).length,
    1,
  );
  assert.equal(
    (markup.match(/>Edit empty\.inherited<\/button>/g) ?? []).length,
    1,
  );
  assert.doesNotMatch(markup, /image\.caption actions/);
  assert.match(markup, /aria-label="Close support\.chat details"/);
  assert.equal((markup.match(/support\.chat/g) ?? []).length >= 3, true);
});

test("ServiceAssignmentGraph keeps empty data labelled in both views", () => {
  const markup = renderToStaticMarkup(
    React.createElement(ServiceAssignmentGraph, {
      "aria-label": "Empty service assignments",
      assignments: [],
      id: "empty-assignments",
      onSelectionChange: () => undefined,
    }),
  );

  assert.match(markup, /role="status"/);
  assert.match(markup, /Supply assignments to show this graph/);
  assert.match(
    markup,
    /class="od-service-assignment-list-empty">No assignments/,
  );
});

test("ServiceAssignmentGraph keeps a valid tab stop for a stale selection", () => {
  const markup = renderToStaticMarkup(
    React.createElement(ServiceAssignmentGraph, {
      "aria-label": "Service assignments",
      assignments: serviceAssignments,
      id: "stale-selection",
      onSelectionChange: () => undefined,
      selectedAssignmentId: "removed-assignment",
    }),
  );

  assert.equal((markup.match(/tabindex="0"/g) ?? []).length, 1);
  assert.doesNotMatch(markup, /id="stale-selection-inspector"/);
});

test("ServiceAssignmentGraph keyboard navigation stays within assignment nodes", () => {
  assert.equal(serviceAssignmentFocusIndex(0, 4, "ArrowDown"), 1);
  assert.equal(serviceAssignmentFocusIndex(3, 4, "ArrowRight"), 3);
  assert.equal(serviceAssignmentFocusIndex(2, 4, "ArrowUp"), 1);
  assert.equal(serviceAssignmentFocusIndex(0, 4, "ArrowLeft"), 0);
  assert.equal(serviceAssignmentFocusIndex(2, 4, "Home"), 0);
  assert.equal(serviceAssignmentFocusIndex(1, 4, "End"), 3);
  assert.equal(serviceAssignmentFocusIndex(1, 4, "Enter"), null);
  assert.equal(serviceAssignmentFocusIndex(0, 0, "ArrowDown"), null);
});

test("ServiceAssignmentGraph rejects ambiguous record and candidate identities", () => {
  const renderAssignments = (assignments) =>
    renderToStaticMarkup(
      React.createElement(ServiceAssignmentGraph, {
        "aria-label": "Service assignments",
        assignments,
        id: "identity-check",
        onSelectionChange: () => undefined,
      }),
    );

  assert.throws(
    () =>
      renderAssignments([
        serviceAssignments[0],
        { ...serviceAssignments[1], id: serviceAssignments[0].id },
      ]),
    /Service assignment id must be unique/,
  );
  assert.throws(
    () =>
      renderAssignments([
        serviceAssignments[0],
        { ...serviceAssignments[1], name: serviceAssignments[0].name },
      ]),
    /Service assignment name must be unique/,
  );
  assert.throws(
    () =>
      renderAssignments([
        {
          ...serviceAssignments[1],
          candidates: [
            serviceAssignments[1].candidates[0],
            serviceAssignments[1].candidates[0],
          ],
        },
      ]),
    /Candidate id must be unique/,
  );
  assert.throws(
    () =>
      renderAssignments([
        {
          ...serviceAssignments[1],
          observedRequirements: ["text input", "text input"],
        },
      ]),
    /Observed requirement must be unique/,
  );
});

test("ServiceAssignmentGraph shows implicit default inheritance and an inherited empty chain", () => {
  const markup = renderToStaticMarkup(
    React.createElement(ServiceAssignmentGraph, {
      "aria-label": "Service assignments",
      assignments: [
        serviceAssignments[0],
        serviceAssignments[4],
        serviceAssignments[5],
      ],
      id: "effective-chain-states",
      onSelectionChange: () => undefined,
      selectedAssignmentId: "report-generate",
    }),
  );

  assert.match(markup, /Implicit root default from Root service/);
  assert.match(markup, /Implicit assignment from Support service/);
  assert.match(
    markup,
    /report\.generate[\s\S]*?Inherits default · 2 candidates/,
  );
  assert.match(
    markup,
    /Primary[\s\S]*?Fast text model[\s\S]*?Fallback 1[\s\S]*?Steady text model/,
  );
  assert.match(
    markup,
    /empty\.inherited[\s\S]*?Inherited definition from Root service[\s\S]*?Inherits default · 0 candidates/,
  );
  assert.match(markup, /No effective candidates/);
});

test("ServiceAssignmentGraph has bounded graph and phone layout rules", async () => {
  const stylesheet = await readFile(
    new URL("../styles/tokens.css", import.meta.url),
    "utf8",
  );
  assert.match(
    stylesheet,
    /\.od-service-assignment-candidate > strong\s*\{[\s\S]*?max-height: 1\.875rem;[\s\S]*?overflow: hidden;/,
  );
  assert.match(
    stylesheet,
    /\.od-service-assignment-candidate-detail\s*\{[\s\S]*?max-height: 1\.6875rem;[\s\S]*?overflow: hidden;/,
  );
  const phoneStyles = stylesheet.slice(
    stylesheet.indexOf("@media (max-width: 48rem)"),
  );
  assert.notEqual(phoneStyles, stylesheet);
  assert.match(
    phoneStyles,
    /\.od-service-assignment-list-record-heading\s*\{[\s\S]*?flex-direction: column;/,
  );
  assert.match(
    phoneStyles,
    /\.od-service-assignment-facts > div\s*\{[\s\S]*?grid-template-columns: 1fr;/,
  );
  assert.match(
    phoneStyles,
    /\.od-service-assignment-visual \.od-graph-workspace\s*\{[\s\S]*?height: max\(34rem, calc\(100dvh - 6rem\)\);/,
  );
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
  assert.match(markup, /value="240"/);
  assert.match(markup, /accept="image\/jpeg,image\/png,image\/webp"/);
  assert.match(markup, /receipt\.png/);
  assert.match(markup, /aria-label="Remove receipt\.png"/);
  assert.match(markup, /role="status"/);
  assert.match(markup, /Result ready/);
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
    /\.od-playground-optional-controls > summary:focus-visible\s*\{[\s\S]*?outline:/,
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
