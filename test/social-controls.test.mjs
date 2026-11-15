import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ChannelList, NavigationGroup, NavigationLink } from "../dist/index.js";

const element = React.createElement;

test("NavigationGroup keeps a parent link with its active subpage", () => {
  const markup = renderToStaticMarkup(
    element(NavigationGroup, {
      active: true,
      children: element(NavigationLink, {
        href: "/channel",
        icon: "Y",
        label: "Main channel",
      }),
      nested: element(NavigationLink, {
        href: "/channel/calendar",
        icon: "C",
        label: "Calendar",
        active: true,
        nested: true,
      }),
    }),
  );
  assert.match(markup, /^<div class="od-navigation-group" data-active="true">/);
  assert.match(markup, /href="\/channel"/);
  assert.match(markup, /class="od-navigation-group-children"/);
  assert.match(markup, /href="\/channel\/calendar" aria-current="page"/);
  assert.doesNotMatch(
    renderToStaticMarkup(element(NavigationGroup, { children: "Channel" })),
    /od-navigation-group-children/,
  );
});

test("ChannelList disables an unsupported switch and gives its reason", () => {
  const markup = renderToStaticMarkup(
    element(ChannelList, {
      items: [
        {
          id: "channel",
          network: "pinterest",
          name: "Music",
          handle: "@music",
          tags: [],
          needsReconnect: false,
          switches: [
            {
              id: "community",
              label: "Community",
              on: false,
              disabled: true,
              disabledReason: "Community is not supported",
            },
          ],
        },
      ],
      networks: [],
      onRename: async () => {},
      onTagsChange: async () => {},
      onSwitchChange: async () => {},
      onDisconnect: async () => {},
      onPasswordConnect: async () => {},
      errorMessage: () => "Failed",
    }),
  );
  assert.match(
    markup,
    /<button aria-pressed="false" class="od-tag" disabled="" title="Community is not supported"[^>]*>Community<\/button>/,
  );
});
