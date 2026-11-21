import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ChannelList, NavigationGroup, NavigationLink } from "../dist/index.js";

const element = React.createElement;

test("ChannelList keeps the connection label for every authorization and access state", () => {
  for (const needsReconnect of [false, true]) {
    for (const readOnly of [false, true]) {
      const item = {
        id: "external",
        network: "pinterest",
        name: "Music",
        handle: "@music",
        tags: [],
        switches: [],
        needsReconnect,
        connectionProvider: "gateway",
        connectionLabel: "via Gateway",
      };
      const markup = renderToStaticMarkup(
        element(ChannelList, {
          items: [
            item,
            {
              ...item,
              id: "native",
              name: "Native",
              connectionLabel: undefined,
              connectionProvider: undefined,
            },
          ],
          networks: [],
          readOnly,
          onRename: async () => {},
          onTagsChange: async () => {},
          onSwitchChange: async () => {},
          onDisconnect: async () => {},
          onPasswordConnect: async () => {},
          errorMessage: () => "Failed",
        }),
      );
      assert.equal(
        (markup.match(/class="od-channel-provider"/g) ?? []).length,
        1,
      );
      assert.match(markup, /class="od-channel-provider">via Gateway<\/span>/);
      assert.match(markup, needsReconnect ? /Authorization ended/ : /@music/);
    }
  }
});

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
    /<button aria-pressed="false" class="od-tag od-channel-switch" data-unavailable="true" disabled="" title="Community is not supported"[^>]*><svg aria-hidden="true"[^>]*>.*?<\/svg><span class="od-channel-switch-label">Community<\/span><\/button>/,
  );
});

test("ChannelList switches show their icon and their help text", () => {
  const props = {
    networks: [],
    onRename: async () => {},
    onTagsChange: async () => {},
    onSwitchChange: async () => {},
    onDisconnect: async () => {},
    onPasswordConnect: async () => {},
    errorMessage: () => "Failed",
  };
  const channel = (switches) => ({
    id: "channel",
    network: "youtube",
    name: "Music",
    handle: "@music",
    tags: [],
    needsReconnect: false,
    switches,
  });
  const markup = renderToStaticMarkup(
    element(ChannelList, {
      ...props,
      items: [
        channel([
          {
            id: "publish",
            label: "Publish",
            on: true,
            icon: "send",
            description: "Publish posts to this channel",
          },
          {
            id: "messages",
            label: "Messages",
            on: false,
            icon: "mail",
            description: "Read direct messages",
            disabled: true,
            disabledReason: "Messages are not supported",
          },
        ]),
      ],
    }),
  );
  assert.match(
    markup,
    /<button aria-pressed="true" class="od-tag od-channel-switch" title="Publish posts to this channel" type="button"><span class="od-channel-switch-icon"><svg[^>]*>.*?<\/svg><\/span><span class="od-channel-switch-label">Publish<\/span><\/button>/,
  );
  // An unavailable switch shows its reason, not its help text.
  assert.match(markup, /title="Messages are not supported"/);
  assert.doesNotMatch(markup, /Read direct messages/);
  // A read-only switch keeps its help text.
  const fixed = renderToStaticMarkup(
    element(ChannelList, {
      ...props,
      readOnly: true,
      items: [
        channel([
          {
            id: "publish",
            label: "Publish",
            on: true,
            icon: "send",
            description: "Publish posts to this channel",
          },
        ]),
      ],
    }),
  );
  assert.match(
    fixed,
    /<span class="od-tag od-channel-switch" title="Publish posts to this channel">/,
  );
});
