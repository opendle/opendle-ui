import { strict as assert } from "node:assert";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { Dialog, OperationPlayground } from "../dist/index.js";

const request = {
  operation: "model",
  input: "Keep this input",
  systemPrompt: "Keep this system prompt",
  temperature: 0.4,
  outputLimit: 120,
};

const correctiveError = {
  status: "error",
  error: {
    title: "The target cannot run",
    message: "The exact target is not available.",
    correction: "Change the target or restore it.",
    code: "target_unavailable",
  },
};

function renderFixed(overrides = {}) {
  return renderToStaticMarkup(
    React.createElement(OperationPlayground, {
      fixedTarget: {
        selection: { kind: "assignment", id: "assignment-a" },
        label: "Support chat",
        detail: "Ordered route",
        context: { label: "Service context", value: "Service Alpha" },
        operations: [
          {
            operation: "model",
            controls: ["system-prompt", "output-limit"],
          },
        ],
      },
      id: "fixed-playground",
      onChangeTarget: () => undefined,
      onRun: () => undefined,
      onValueChange: () => undefined,
      runState: correctiveError,
      title: "Contextual playground",
      value: request,
      ...overrides,
    }),
  );
}

test("Dialog renders one named native modal frame with fixed regions", () => {
  const markup = renderToStaticMarkup(
    React.createElement(
      Dialog,
      {
        actions: React.createElement("button", null, "Save"),
        description: "Review the current values.",
        eyebrow: "Review",
        onClose: () => undefined,
        open: true,
        size: "wide",
        title: "Edit settings",
      },
      React.createElement("p", null, "Dialog body"),
    ),
  );
  assert.match(markup, /^<dialog/);
  assert.match(markup, /class="od-dialog"/);
  assert.match(markup, /data-size="wide"/);
  assert.match(markup, /aria-labelledby=/);
  assert.match(markup, /aria-describedby=/);
  assert.match(markup, /class="od-dialog-header"/);
  assert.match(markup, /class="od-dialog-body"/);
  assert.match(markup, /class="od-dialog-actions"/);
  assert.match(markup, /aria-label="Close dialog"/);
  assert.doesNotMatch(markup, /autofocus=/);
});

test("fixed assignment mode shows the exact target and inferred controls", () => {
  const markup = renderFixed();
  assert.match(markup, /data-target-mode="fixed"/);
  assert.match(markup, /aria-label="Assignment target: Support chat"/);
  assert.match(markup, /Support chat/);
  assert.match(markup, /Service context/);
  assert.match(markup, /Service Alpha/);
  assert.match(markup, />Change target</);
  assert.doesNotMatch(markup, /Route selection/);
  assert.doesNotMatch(markup, /fixed-playground-target/);
  assert.doesNotMatch(markup, /fixed-playground-operation/);
  assert.match(markup, /fixed-playground-system-prompt/);
  assert.match(markup, /fixed-playground-output-limit/);
  assert.doesNotMatch(markup, /fixed-playground-temperature/);
  assert.doesNotMatch(markup, /Input images/);
  assert.match(markup, /The target cannot run/);
  assert.match(markup, /Change the target or restore it/);
  assert.match(markup, /target_unavailable/);
});

test("fixed provider-model mode supports each operation and exact controls", () => {
  const cases = [
    ["model", ["temperature"], "Temperature"],
    ["embedding", [], "Input text"],
    ["image", ["input-images"], "Input images"],
    ["video", ["input-images"], "Input images"],
    ["audio", [], "Text"],
  ];
  for (const [operation, controls, expected] of cases) {
    const markup = renderFixed({
      fixedTarget: {
        selection: { kind: "provider-model", id: `provider/${operation}` },
        label: `Provider ${operation}`,
        operations: [{ operation, controls }],
      },
      inputImages:
        controls.length === 0 ? [] : [{ id: "image-a", name: "a.png" }],
      onAddInputImages: controls.length === 0 ? undefined : () => undefined,
      value: { ...request, operation },
    });
    assert.match(markup, /Exact provider-model/);
    assert.match(markup, new RegExp(expected));
    assert.doesNotMatch(markup, /Route selection/);
  }
});

test("an unavailable fixed target keeps request and error data but blocks run", () => {
  const markup = renderFixed({
    fixedTarget: {
      selection: { kind: "assignment", id: "removed-assignment" },
      label: "Removed assignment",
      operations: [
        {
          operation: "model",
          controls: ["system-prompt", "temperature", "output-limit"],
        },
      ],
      state: {
        status: "unavailable",
        message: "This assignment was removed after the dialog opened.",
      },
    },
  });
  assert.match(markup, /Target unavailable/);
  assert.match(markup, /Keep this input/);
  assert.match(markup, /Keep this system prompt/);
  assert.match(markup, /The target cannot run/);
  assert.match(markup, /<button[^>]*disabled=""[^>]*>Run operation/);
  assert.doesNotMatch(
    markup,
    /<textarea[^>]*id="fixed-playground-input"[^>]*disabled=""/,
  );
});

test("a stale fixed operation stays explicit and does not change silently", () => {
  const markup = renderFixed({
    fixedTarget: {
      selection: { kind: "provider-model", id: "provider/model" },
      label: "Changed model",
      operations: [{ operation: "embedding", controls: [] }],
    },
  });
  assert.match(markup, /id="fixed-playground-operation"/);
  assert.match(markup, /<option value="" selected="">Select an operation/);
  assert.match(markup, /<option value="embedding">Embedding/);
  assert.match(markup, /The target cannot run/);
  assert.match(markup, /<button[^>]*disabled=""[^>]*>Run operation/);
});

test("fixed targets reject ambiguous or incompatible capabilities", () => {
  assert.throws(
    () =>
      renderFixed({
        fixedTarget: {
          selection: { kind: "assignment", id: "assignment-a" },
          label: "Assignment A",
          operations: [
            { operation: "model", controls: [] },
            { operation: "model", controls: [] },
          ],
        },
      }),
    /operations must be unique/,
  );
  assert.throws(
    () =>
      renderFixed({
        fixedTarget: {
          selection: { kind: "provider-model", id: "provider-a/model-a" },
          label: "Model A",
          operations: [{ operation: "embedding", controls: ["temperature"] }],
        },
      }),
    /Model controls are not valid/,
  );
});

test("fixed targets reject unknown runtime union values and missing controls", () => {
  const invalidTargets = [
    [
      {
        selection: { kind: "service", id: "service-a" },
        label: "Service A",
        operations: [{ operation: "model", controls: [] }],
      },
      /Unknown fixed playground target kind: service/,
    ],
    [
      {
        selection: { kind: "assignment", id: "assignment-a" },
        label: "Assignment A",
        operations: [{ operation: "chat", controls: [] }],
      },
      /Unknown playground operation: chat/,
    ],
    [
      {
        selection: { kind: "provider-model", id: "provider\/model" },
        label: "Provider model",
        operations: [{ operation: "model", controls: ["top-p"] }],
      },
      /Unknown fixed playground control: top-p/,
    ],
    [
      {
        selection: { kind: "assignment", id: "assignment-a" },
        label: "Assignment A",
        operations: [{ operation: "model", controls: [] }],
        state: { status: "deleted" },
      },
      /Unknown fixed playground target state: deleted/,
    ],
    [
      {
        selection: { kind: "assignment", id: "assignment-a" },
        label: "Assignment A",
        operations: [{ operation: "model" }],
      },
      /controls must be declared for model/,
    ],
  ];
  for (const [fixedTarget, expectedError] of invalidTargets) {
    assert.throws(() => renderFixed({ fixedTarget }), expectedError);
  }
});

test("a fixed target never gains an undeclared control", () => {
  const markup = renderFixed({
    fixedTarget: {
      selection: { kind: "provider-model", id: "provider/model" },
      label: "Provider model",
      operations: [{ operation: "model", controls: ["temperature"] }],
    },
  });
  assert.match(markup, /fixed-playground-temperature/);
  assert.doesNotMatch(markup, /fixed-playground-system-prompt/);
  assert.doesNotMatch(markup, /fixed-playground-output-limit/);
  assert.doesNotMatch(markup, /Input images/);
});
