import { strict as assert } from "node:assert";
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
  layoutTree,
  treeEdgePath,
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

test("tree helpers make stable horizontal and vertical layouts", () => {
  const items = [
    { id: "root", parentId: null },
    { id: "child-a", parentId: "root" },
    { id: "child-b", parentId: "root" },
  ];
  const horizontal = layoutTree(items, { padding: 20 });
  const vertical = layoutTree(items, { direction: "vertical", padding: 20 });
  assert.equal(horizontal.nodes[0].x, 20);
  assert.equal(horizontal.nodes[1].x, 260);
  assert.equal(horizontal.edges.length, 2);
  assert.equal(vertical.nodes[0].y, 20);
  assert.equal(vertical.nodes[1].y, 120);
  assert.match(treeEdgePath(horizontal.nodes[0], horizontal.nodes[1]), /^M /);
  assert.throws(
    () =>
      layoutTree([
        { id: "a", parentId: "b" },
        { id: "b", parentId: "a" },
      ]),
    /cycle/,
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
