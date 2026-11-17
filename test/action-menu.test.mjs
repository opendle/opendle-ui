import { strict as assert } from "node:assert";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ActionMenu, ChannelList } from "../dist/index.js";

const render = (type, props) =>
  renderToStaticMarkup(React.createElement(type, props));

test("ActionMenu is a closed menu button until a press", () => {
  const markup = render(ActionMenu, {
    label: "More actions: Studio",
    items: [{ id: "remove", label: "Delete", tone: "danger" }],
  });
  assert.match(markup, /aria-haspopup="menu"/);
  assert.match(markup, /aria-expanded="false"/);
  assert.match(markup, /aria-label="More actions: Studio"/);
  assert.match(markup, /title="More actions: Studio"/);
  assert.doesNotMatch(markup, /role="menu"|Delete/);
  assert.doesNotMatch(markup, /disabled=""/);
});

test("ActionMenu without items is disabled", () => {
  assert.match(
    render(ActionMenu, { label: "More actions", items: [] }),
    /disabled=""/,
  );
});

test("ChannelList keeps the actions of a healthy row in its menu", () => {
  const markup = render(ChannelList, {
    items: [
      {
        id: "c1",
        network: "youtube",
        name: "Studio",
        handle: "@studio",
        tags: [],
        needsReconnect: false,
        switches: [],
        reconnectHref: "/oauth/youtube/start?channel=c1",
      },
    ],
    networks: [
      { network: "youtube", label: "YouTube", href: "/oauth/youtube/start" },
    ],
    onRename: async () => undefined,
    onTagsChange: async () => undefined,
    onSwitchChange: async () => undefined,
    onDisconnect: async () => undefined,
    onPasswordConnect: async () => undefined,
    errorMessage: () => "Failed",
  });
  assert.match(markup, /aria-label="More actions: Studio"/);
  assert.doesNotMatch(markup, />Reconnect<|>Disconnect</);
  assert.doesNotMatch(markup, /od-icon-button[^>]*data-tone="danger"/);
});
