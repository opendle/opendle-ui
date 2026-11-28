import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  CalendarBoard,
  CalendarHeader,
  ChannelAvatar,
  ChannelChip,
  ChannelPicker,
  CharacterCount,
  MediaAttachmentList,
  MediaGridPicker,
  SocialPostPreview,
  characterCount,
} from "../dist/index.js";

const element = React.createElement;

test("CharacterCount counts code points and marks a count above the limit", () => {
  assert.equal(characterCount("é👍a"), 3);
  const valid = renderToStaticMarkup(
    element(CharacterCount, { value: "abc", limit: 5, label: "X" }),
  );
  assert.match(valid, /data-invalid="false"/);
  assert.match(valid, /X: <\/span>3 \/ 5/);
  const over = renderToStaticMarkup(
    element(CharacterCount, { value: 2201, limit: 2200 }),
  );
  assert.match(over, /data-invalid="true"/);
  assert.match(
    renderToStaticMarkup(element(CharacterCount, { value: "ab", limit: null })),
    />2<\/span>$/,
  );
});

test("ChannelAvatar shows the channel picture with its network badge", () => {
  const markup = renderToStaticMarkup(
    element(ChannelAvatar, {
      name: "studio",
      network: "youtube",
      src: "/studio.jpg",
      size: "large",
    }),
  );
  assert.match(markup, /<span class="od-channel-avatar" data-size="large">/);
  assert.match(markup, /class="od-avatar" data-shape="circle"/);
  assert.match(markup, /<img alt="" src="\/studio.jpg"\/>/);
  assert.match(markup, /data-badge="true" data-network="youtube"/);
  assert.match(markup, /aria-label="YouTube"/);
  const initial = renderToStaticMarkup(
    element(ChannelAvatar, { name: "studio", network: "x" }),
  );
  assert.match(initial, /^<span class="od-channel-avatar">/);
  assert.match(initial, />S<\/span>/);
});

test("ChannelChip is static text, a button or a toggle", () => {
  const still = renderToStaticMarkup(
    element(ChannelChip, { name: "Studio", network: "x", title: "@studio" }),
  );
  assert.match(still, /^<span class="od-channel-chip" title="@studio">/);
  assert.match(still, /class="od-channel-avatar"/);
  assert.match(still, /<span class="od-channel-chip-name">Studio<\/span>/);
  assert.doesNotMatch(still, /<button/);
  const action = renderToStaticMarkup(
    element(ChannelChip, {
      name: "Studio",
      network: "x",
      onClick: () => {},
    }),
  );
  assert.match(action, /^<button class="od-channel-chip" type="button">/);
  assert.doesNotMatch(action, /aria-pressed/);
  const toggle = renderToStaticMarkup(
    element(
      ChannelChip,
      {
        className: "host-chip",
        invalid: true,
        name: "Studio",
        network: "x",
        pressed: false,
        disabled: true,
      },
      element("span", { className: "host-mark" }),
    ),
  );
  assert.match(
    toggle,
    /^<button aria-pressed="false" class="od-channel-chip host-chip" data-invalid="true" disabled="" type="button">/,
  );
  assert.match(
    toggle,
    /Studio<\/span><span class="host-mark"><\/span><\/button>$/,
  );
});

test("ChannelPicker shows each channel as a toggle with its network", () => {
  const markup = renderToStaticMarkup(
    element(ChannelPicker, {
      label: "Channels",
      items: [
        { id: "one", network: "x", name: "Studio" },
        { id: "two", network: "bluesky", name: "Music", disabled: true },
      ],
      value: ["one"],
      invalid: new Set(["one"]),
      onChange: () => {},
    }),
  );
  assert.match(markup, /<legend class="od-visually-hidden">Channels<\/legend>/);
  assert.match(markup, /aria-pressed="true"[^>]*data-invalid="true"/);
  assert.match(markup, /aria-pressed="false"[^>]*disabled=""/);
  assert.match(markup, /data-network="bluesky"/);
  assert.match(markup, /class="od-channel-chip od-channel-picker-item"/);
  assert.match(markup, /class="od-channel-avatar"/);
});

test("ChannelPicker groups select their channels and show when they are chosen", () => {
  const props = {
    label: "Channels",
    groupsLabel: "Channels by tag",
    items: [
      { id: "one", network: "x", name: "Studio" },
      { id: "two", network: "youtube", name: "Music" },
      { id: "off", network: "bluesky", name: "Off", disabled: true },
    ],
    value: ["one"],
    onChange: () => {},
  };
  const markup = renderToStaticMarkup(
    element(ChannelPicker, {
      ...props,
      groups: [
        { id: "short", label: "#short", color: 4, channelIds: ["one", "off"] },
        { id: "long", label: "#long", channelIds: ["one", "two"] },
        { id: "chosen", label: "#chosen", channelIds: ["one"], pressed: false },
        { id: "empty", label: "#empty", channelIds: ["off"] },
      ],
    }),
  );
  assert.match(
    markup,
    /<fieldset aria-label="Channels by tag" class="od-channel-picker-groups">/,
  );
  // A disabled channel does not count: all enabled channels of #short are selected.
  assert.match(
    markup,
    /<button aria-pressed="true" class="od-tag" data-color="4"[^>]*>#short<\/button>/,
  );
  assert.match(
    markup,
    /<button aria-pressed="false" class="od-tag"[^>]*>#long</,
  );
  assert.match(
    markup,
    /<button aria-pressed="false" class="od-tag"[^>]*>#chosen</,
  );
  assert.doesNotMatch(markup, /#empty/);
  assert.doesNotMatch(
    renderToStaticMarkup(element(ChannelPicker, props)),
    /od-channel-picker-groups/,
  );
});

test("MediaAttachmentList gives each item named move, remove and open buttons", () => {
  const markup = renderToStaticMarkup(
    element(
      MediaAttachmentList,
      {
        items: [
          { id: "a", kind: "image", previewUrl: "/a.jpg", label: "Image 1" },
          {
            id: "b",
            kind: "video",
            previewUrl: null,
            label: "Video 2",
            duration: 75,
            badge: "ALT",
          },
          {
            id: "c",
            kind: "image",
            previewUrl: null,
            label: "Image 3",
            progress: 0.4,
          },
        ],
        onMove: () => {},
        onRemove: () => {},
        onOpen: () => {},
      },
      element("button", { type: "button" }, "Add"),
    ),
  );
  assert.match(markup, /aria-label="Open: Image 1"/);
  assert.match(markup, /aria-label="Move earlier: Image 1"[^>]*disabled=""/);
  assert.match(markup, /aria-label="Move later: Video 2"/);
  assert.match(markup, /aria-label="Remove: Image 3"/);
  assert.doesNotMatch(markup, /Move later: Image 3/);
  assert.match(
    markup,
    /<progress aria-label="Uploading: Image 3"[^>]*max="100" value="40"/,
  );
  assert.match(markup, /1:15/);
  assert.match(markup, /od-attachment-badge">ALT/);
  assert.match(markup, /od-attachment-extra/);
});

test("MediaAttachmentList without move and remove only shows the files", () => {
  const markup = renderToStaticMarkup(
    element(MediaAttachmentList, {
      items: [
        { id: "a", kind: "image", previewUrl: "/a.jpg", label: "Image 1" },
        { id: "b", kind: "image", previewUrl: "/b.jpg", label: "Image 2" },
      ],
      onOpen: () => {},
    }),
  );
  assert.match(markup, /aria-label="Open: Image 2"/);
  assert.doesNotMatch(markup, /Remove|Move earlier|Move later/);
  assert.doesNotMatch(markup, /draggable="true"/);
});

test("MediaGridPicker marks the place of each selected item", () => {
  const markup = renderToStaticMarkup(
    element(MediaGridPicker, {
      label: "Library",
      items: [
        { id: "a", kind: "image", previewUrl: "/a.jpg", label: "First" },
        {
          id: "b",
          kind: "video",
          previewUrl: null,
          label: "Second",
          duration: 9,
        },
      ],
      selected: ["b", "a"],
      onToggle: () => {},
    }),
  );
  assert.equal((markup.match(/aria-pressed="true"/g) ?? []).length, 2);
  assert.match(
    markup,
    /od-media-grid-mark">2<\/span><\/span><span class="od-media-grid-label">First/,
  );
  assert.match(markup, /0:09/);
});

test("SocialPostPreview uses the layout of the network", () => {
  const props = {
    name: "Studio",
    handle: "studio",
    text: "New song #release https://example.com",
    media: [{ id: "a", kind: "image", src: "/a.jpg" }],
  };
  const feed = renderToStaticMarkup(
    element(SocialPostPreview, { ...props, network: "x" }),
  );
  assert.match(feed, /data-layout="feed"/);
  assert.match(feed, /aria-label="Preview: X · Studio"/);
  assert.match(feed, /<span class="od-social-entity">#release<\/span>/);
  assert.match(
    feed,
    /<span class="od-social-entity">https:\/\/example.com<\/span>/,
  );
  const photo = renderToStaticMarkup(
    element(SocialPostPreview, {
      ...props,
      network: "instagram",
      vertical: true,
    }),
  );
  assert.match(photo, /data-layout="photo"[^>]*data-vertical="true"/);
  const short = renderToStaticMarkup(
    element(SocialPostPreview, {
      ...props,
      network: "youtube",
      vertical: true,
      media: [{ id: "v", kind: "video", src: null }],
    }),
  );
  assert.match(short, /od-social-overlay/);
  const empty = renderToStaticMarkup(
    element(SocialPostPreview, { ...props, network: "pinterest", media: [] }),
  );
  assert.match(empty, /No media/);
});

test("CalendarBoard offers creation only on days that are not past", () => {
  const markup = renderToStaticMarkup(
    element(CalendarBoard, {
      mode: "month",
      anchor: "2030-01-15",
      today: "2030-01-15",
      items: [],
      onSelect: () => {},
      onCreate: () => {},
    }),
  );
  assert.match(markup, /aria-label="New post: Tuesday, January 15, 2030"/);
  assert.doesNotMatch(markup, /New post: Monday, January 14, 2030/);
  const week = renderToStaticMarkup(
    element(CalendarBoard, {
      mode: "week",
      anchor: "2030-01-15",
      today: "2030-01-15",
      now: new Date(2030, 0, 15, 12, 10),
      items: [],
      onSelect: () => {},
      onCreate: () => {},
    }),
  );
  assert.match(week, /class="od-calendar-week-slot"/);
  assert.match(
    week,
    /aria-hidden="true" class="od-calendar-week-slot"[^>]*tabindex="-1"|tabindex="-1"[^>]*class="od-calendar-week-slot"/,
  );
  const header = renderToStaticMarkup(
    element(CalendarHeader, {
      title: "January",
      onToday: () => {},
      actions: element("button", { type: "button" }, "New post"),
    }),
  );
  assert.match(
    header,
    /od-calendar-header-actions"><button type="button">New post/,
  );
});
