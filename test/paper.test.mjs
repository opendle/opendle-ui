import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  Avatar,
  Button,
  Dialog,
  IconButton,
  InlineAlert,
  ItemList,
  NetworkIcon,
  PasskeyList,
  SidebarItem,
  TagChip,
  TextField,
  networkNames,
} from "../dist/paper/index.js";

const render = (type, props, ...children) =>
  renderToStaticMarkup(React.createElement(type, props, ...children));

test("the package exports the Paper entry and its style sheet", () => {
  const manifest = JSON.parse(
    readFileSync(new URL("../package.json", import.meta.url), "utf8"),
  );
  assert.equal(manifest.exports["./paper"].import, "./dist/paper/index.js");
  assert.equal(manifest.exports["./paper.css"], "./styles/paper.css");
  const css = readFileSync(
    new URL("../styles/paper.css", import.meta.url),
    "utf8",
  );
  for (const font of css.matchAll(/url\("\.\/(fonts\/[^"]+)"\)/g)) {
    assert.ok(
      readFileSync(new URL(`../styles/${font[1]}`, import.meta.url)).length > 0,
    );
  }
  assert.match(css, /prefers-color-scheme: dark/);
});

test("Button and IconButton are native buttons with a safe default type", () => {
  assert.match(
    render(Button, null, "Save"),
    /^<button class="pp-button" data-size="default" data-variant="secondary" type="button">Save<\/button>$/,
  );
  const icon = render(IconButton, { label: "Remove", icon: "x" });
  assert.match(icon, /aria-label="Remove"/);
  assert.match(icon, /title="Remove"/);
});

test("Avatar shows the picture, or the first letter of the name", () => {
  assert.match(render(Avatar, { name: " émile" }), />É<\/span>$/);
  assert.match(
    render(Avatar, { name: "V", src: "/a.jpg" }),
    /<img alt="" src="\/a.jpg"\/>/,
  );
  assert.match(render(Avatar, { name: "" }), /><\/span>$/);
});

test("NetworkIcon covers each network and names it on request", () => {
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
  const plain = render(NetworkIcon, { network: "youtube" });
  assert.match(plain, /data-network="youtube"/);
  assert.doesNotMatch(plain, /role=|aria-label=/);
  assert.match(
    render(NetworkIcon, { network: "x", labelled: true, badge: true }),
    /aria-label="X".*data-badge="true".*role="img"/,
  );
});

test("SidebarItem marks the current page and hides a zero count", () => {
  const active = render(SidebarItem, {
    href: "/a",
    icon: null,
    label: "Inbox",
    active: true,
    count: 3,
  });
  assert.match(active, /aria-current="page"/);
  assert.match(active, /<span class="pp-count">3<\/span>/);
  const idle = render(SidebarItem, { href: "/a", icon: null, label: "Inbox" });
  assert.doesNotMatch(idle, /aria-current|pp-count/);
});

test("TagChip is a label, or a toggle button with a handler", () => {
  assert.match(
    render(TagChip, null, "#reel"),
    /^<span class="pp-tag">#reel<\/span>$/,
  );
  assert.match(
    render(
      TagChip,
      { pressed: true, onPressedChange: () => undefined },
      "#short",
    ),
    /^<button aria-pressed="true" class="pp-tag" type="button">/,
  );
});

test("TextField links its label and its error to the input", () => {
  const markup = render(TextField, {
    id: "n",
    label: "Name",
    error: "Required",
    readOnly: true,
  });
  assert.match(markup, /<label class="pp-field-label" for="n">Name<\/label>/);
  assert.match(markup, /aria-describedby="n-error" aria-invalid="true"/);
  assert.match(markup, /<p class="pp-field-error" id="n-error">Required<\/p>/);
});

test("InlineAlert announces an error as an alert", () => {
  assert.match(
    render(InlineAlert, { tone: "error" }, "Failed"),
    /role="alert"/,
  );
  assert.match(render(InlineAlert, null, "Note"), /role="status"/);
});

test("ItemList shows the empty text only when it has no rows", () => {
  assert.match(
    render(ItemList, { empty: "None" }, []),
    /^<p class="pp-list-empty">None<\/p>$/,
  );
  assert.match(
    render(ItemList, { empty: "None" }, [
      React.createElement("li", { key: 1 }),
    ]),
    /^<ul class="pp-list">/,
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
