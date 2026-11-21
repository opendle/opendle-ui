import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  Avatar,
  AvatarUpload,
  AccountMenu,
  ApplicationShell,
  Button,
  Dialog,
  IconButton,
  InlineAlert,
  ItemList,
  NetworkIcon,
  PasskeyList,
  InlineEditableText,
  LoadingIndicator,
  NavigationLink,
  NavigationGroup,
  SecretValue,
  TagChip,
  Tabs,
  TextControl,
  Toast,
  networkNames,
} from "../dist/index.js";

const render = (type, props, ...children) =>
  renderToStaticMarkup(React.createElement(type, props, ...children));

test("the package has one entry and one style sheet with its fonts", () => {
  const manifest = JSON.parse(
    readFileSync(new URL("../package.json", import.meta.url), "utf8"),
  );
  assert.deepEqual(Object.keys(manifest.exports), [
    ".",
    "./styles.css",
    "./scripts/build-consumer.mjs",
    "./package.json",
  ]);
  const css = readFileSync(
    new URL("../styles/tokens.css", import.meta.url),
    "utf8",
  );
  assert.equal(manifest.exports["./styles.css"], "./styles/index.css");
  assert.match(
    readFileSync(new URL("../styles/index.css", import.meta.url), "utf8"),
    /@import url\("\.\/fonts\.css"\);\s*@import url\("\.\/tokens\.css"\);/,
  );
  const fonts = readFileSync(
    new URL("../styles/fonts.css", import.meta.url),
    "utf8",
  );
  assert.ok([...fonts.matchAll(/url\("\.\/(fonts\/[^"]+)"\)/g)].length >= 4);
  for (const font of fonts.matchAll(/url\("\.\/(fonts\/[^"]+)"\)/g)) {
    assert.ok(
      readFileSync(new URL(`../styles/${font[1]}`, import.meta.url)).length > 0,
    );
  }
  assert.match(css, /prefers-color-scheme: dark/);
});

test("Button and IconButton are native buttons with a safe default type", () => {
  assert.match(
    render(Button, null, "Save"),
    /^<button class="od-button od-button-primary" data-size="default" type="button">Save<\/button>$/,
  );
  const icon = render(IconButton, { label: "Remove", icon: "x" });
  assert.match(icon, /aria-label="Remove"/);
  assert.match(icon, /title="Remove"/);
  assert.match(icon, /data-tone="default"/);
  assert.match(
    render(Button, { variant: "danger", size: "small" }, "Remove"),
    /class="od-button od-button-danger" data-size="small"/,
  );
});

test("Avatar shows the picture, or the first letter of the name", () => {
  assert.match(render(Avatar, { name: " émile" }), />É<\/span>$/);
  assert.match(
    render(Avatar, { name: "V", src: "/a.jpg" }),
    /<img alt="" src="\/a.jpg"\/>/,
  );
  assert.match(render(Avatar, { name: "" }), /><\/span>$/);
});

test("NetworkIcon covers each network and always names it", () => {
  assert.deepEqual([...networkNames].sort(), [
    "bluesky",
    "facebook",
    "instagram",
    "pinterest",
    "threads",
    "tiktok",
    "tumblr",
    "x",
    "youtube",
  ]);
  // Each mark has the network name as its accessible name and its tooltip.
  assert.match(
    render(NetworkIcon, { network: "youtube" }),
    /data-network="youtube" title="YouTube"><svg aria-label="YouTube" role="img"/,
  );
  assert.match(
    render(NetworkIcon, { network: "x", badge: true }),
    /data-badge="true"/,
  );
});

test("Tabs take a pill appearance that wraps", () => {
  const props = {
    idBase: "version",
    label: "Version",
    items: [
      { id: "all", label: "All" },
      { id: "x", label: "X" },
    ],
    value: "x",
    onChange: () => undefined,
  };
  assert.match(
    render(Tabs, { ...props, appearance: "pills" }),
    /^<div aria-label="Version" class="od-tabs" data-appearance="pills" role="tablist">/,
  );
  assert.match(
    render(Tabs, props),
    /^<div aria-label="Version" class="od-tabs" role="tablist">/,
  );
  const css = readFileSync(
    new URL("../styles/tokens.css", import.meta.url),
    "utf8",
  );
  assert.match(
    css,
    /\.od-tabs\[data-appearance="pills"\] \{\n  flex-wrap: wrap;/,
  );
});

test("NavigationLink marks the current page and hides a zero count", () => {
  const active = render(NavigationLink, {
    href: "/a",
    icon: null,
    label: "Inbox",
    active: true,
    count: 3,
  });
  assert.match(active, /aria-current="page"/);
  assert.match(active, /<span class="od-count">3<\/span>/);
  const idle = render(NavigationLink, {
    href: "/a",
    icon: null,
    label: "Inbox",
  });
  assert.doesNotMatch(idle, /aria-current|od-count/);
});

test("TagChip is a label, or a toggle button with a handler", () => {
  assert.match(
    render(TagChip, null, "#reel"),
    /^<span class="od-tag">#reel<\/span>$/,
  );
  assert.match(
    render(
      TagChip,
      { pressed: true, onPressedChange: () => undefined },
      "#short",
    ),
    /^<button aria-pressed="true" class="od-tag" type="button">/,
  );
});

test("TextControl links its label and its error to the input", () => {
  const markup = render(TextControl, {
    id: "n",
    label: "Name",
    error: "Required",
    onChange: () => undefined,
    value: "",
  });
  assert.match(markup, /<label[^>]*for="n"[^>]*>Name<\/label>/);
  assert.match(markup, /aria-describedby="[^"]+"[^>]*aria-invalid="true"/);
  assert.match(markup, /role="alert"[^>]*>Required<\/p>/);
});

test("InlineAlert announces an error as an alert", () => {
  assert.match(
    render(InlineAlert, { tone: "error" }, "Failed"),
    /role="alert"/,
  );
  assert.doesNotMatch(render(InlineAlert, null, "Note"), /role=/);
});

test("Toast shows an icon for a success or an error", () => {
  assert.match(render(Toast, { tone: "success" }, "Saved"), /<svg/);
  assert.match(render(Toast, { tone: "error" }, "Failed"), /data-tone="error"/);
  assert.doesNotMatch(render(Toast, null, "Note"), /<svg/);
});

test("SecretValue names the value and its copy action", () => {
  const markup = render(SecretValue, {
    value: "s3cret",
    label: "API token",
    copyLabel: "Copy",
    copiedLabel: "Copied",
  });
  assert.match(markup, /<code aria-label="API token">s3cret<\/code>/);
  assert.match(markup, /aria-label="Copy"/);
});

test("InlineEditableText starts as a named button with the text", () => {
  assert.match(
    render(InlineEditableText, {
      value: "MacBook",
      label: "Rename: MacBook",
      onSave: async () => undefined,
    }),
    /^<button aria-label="Rename: MacBook" class="od-inline-editable" title="Rename: MacBook" type="button">MacBook<\/button>$/,
  );
});

test("ItemList shows the empty text only when it has no rows", () => {
  assert.match(
    render(ItemList, { empty: "None" }, []),
    /^<p class="od-list-empty">None<\/p>$/,
  );
  assert.match(
    render(ItemList, { empty: "None" }, [
      React.createElement("li", { key: 1 }),
    ]),
    /^<ul class="od-list">/,
  );
});

test("a closed Dialog renders no content", () => {
  const markup = render(
    Dialog,
    { open: false, onClose: () => undefined, title: "T", closeLabel: "Close" },
    "secret",
  );
  assert.doesNotMatch(markup, /secret/);
});

test("PasskeyList has no remove control for the last passkey", () => {
  const props = {
    onAdd: async () => undefined,
    onRemove: async () => undefined,
    errorMessage: () => "",
  };
  const one = [
    { id: "a", label: "MacBook", createdAt: "2026-11-02T10:00:00Z" },
  ];
  assert.doesNotMatch(render(PasskeyList, { ...props, items: one }), /Remove:/);
  const two = [
    ...one,
    { id: "b", label: "", createdAt: "2026-11-03T10:00:00Z" },
  ];
  const markup = render(PasskeyList, { ...props, items: two });
  assert.match(markup, /aria-label="Remove: MacBook"/);
  assert.match(markup, /aria-label="Remove: Passkey"/);
});

test("PasskeyList names are editable only with a rename handler", () => {
  const props = {
    onAdd: async () => undefined,
    onRemove: async () => undefined,
    errorMessage: () => "",
    items: [{ id: "a", label: "MacBook", createdAt: "2026-11-02T10:00:00Z" }],
  };
  assert.doesNotMatch(render(PasskeyList, props), /Rename:/);
  assert.match(
    render(PasskeyList, { ...props, onRename: async () => undefined }),
    /aria-label="Rename: MacBook"/,
  );
});

test("LoadingIndicator is a named status", () => {
  assert.equal(
    render(LoadingIndicator, { label: "Loading" }),
    '<output aria-label="Loading" class="od-loading" data-block="false" data-size="default"><span class="od-loading-ring"></span></output>',
  );
});

test("a loading Button is busy, does not act and shows the loading sign", () => {
  const markup = render(Button, { loading: true, icon: "i" }, "Save");
  assert.match(markup, /aria-busy="true"/);
  assert.match(markup, /disabled=""/);
  assert.match(markup, /class="od-loading-ring"><\/span>Save/);
  assert.doesNotMatch(render(Button, null, "Save"), /aria-busy|od-loading/);
});

test("TagChip carries the colour key of its tag", () => {
  assert.match(render(TagChip, { color: 7 }, "#reel"), /data-color="7"/);
  assert.doesNotMatch(render(TagChip, null, "#reel"), /data-color/);
});

test("disabled tag switches retain their reason and cannot be selected", () => {
  const markup = render(
    TagChip,
    {
      onPressedChange: () => undefined,
      disabled: true,
      title: "Not supported",
      pressed: false,
    },
    "Community",
  );
  assert.match(markup, /disabled=""/);
  assert.match(markup, /title="Not supported"/);
  assert.match(markup, /aria-pressed="false"/);
});

test("an unavailable tag switch is disabled and has a blocked mark", () => {
  const props = {
    onPressedChange: () => undefined,
    title: "Not supported",
    pressed: false,
  };
  const unavailable = render(
    TagChip,
    { ...props, unavailable: true },
    "Community",
  );
  assert.match(unavailable, /data-unavailable="true" disabled=""/);
  assert.match(unavailable, /title="Not supported"/);
  assert.match(
    unavailable,
    /<svg aria-hidden="true" class="od-icon"[^>]*>.*<\/svg>Community<\/button>/,
  );
  const off = render(TagChip, props, "Community");
  assert.doesNotMatch(off, /data-unavailable|disabled=|<svg/);
});

test("navigation groups contain their parent and nested destinations", () => {
  const markup = render(
    NavigationGroup,
    {
      active: true,
      nested: React.createElement(NavigationLink, {
        href: "/calendar",
        label: "Calendar",
        icon: null,
        nested: true,
        active: true,
      }),
    },
    React.createElement(NavigationLink, {
      href: "/channel",
      label: "Channel",
      icon: null,
    }),
  );
  assert.match(markup, /od-navigation-group" data-active="true"/);
  assert.match(markup, /od-navigation-group-children/);
  assert.equal(markup.match(/<a /g).length, 2);
});

test("workspace menus keep a labelled card trigger and detail", () => {
  const markup = render(AccountMenu, {
    appearance: "workspace",
    name: "Music",
    detail: "Workspace",
    label: "Switch workspace: Music",
    avatar: React.createElement(Avatar, { name: "Music" }),
    sections: [],
  });
  assert.match(markup, /data-appearance="workspace"/);
  assert.match(markup, /aria-label="Switch workspace: Music"/);
  assert.match(markup, /aria-haspopup="menu"/);
  assert.match(markup, /<strong>Music<\/strong><small>Workspace<\/small>/);
});

test("the application shell places the workspace before navigation", () => {
  const markup = render(ApplicationShell, {
    brandMark: null,
    brandName: "Product",
    navigationLabel: "Main",
    skipLabel: "Skip",
    workspace: "Workspace control",
    navigation: "Navigation control",
    children: "Content",
  });
  assert.ok(
    markup.indexOf("Workspace control") < markup.indexOf("Navigation control"),
  );
  assert.match(markup, /od-application-workspace/);
});

test("AvatarUpload keeps the picture and disables changes without permission", () => {
  const markup = render(AvatarUpload, {
    name: "Studio",
    src: "/workspace.png",
    disabled: true,
    errorMessage: String,
    onUpload: async () => {},
    onRemove: async () => {},
  });
  assert.match(markup, /src="\/workspace.png"/);
  assert.equal((markup.match(/<button[^>]*disabled=""/g) ?? []).length, 2);
  assert.match(markup, /<input[^>]*disabled=""/);
});
