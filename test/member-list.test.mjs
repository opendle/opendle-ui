import { strict as assert } from "node:assert";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AccountMenu, ChannelList, MemberList } from "../dist/index.js";

const render = (type, props) =>
  renderToStaticMarkup(React.createElement(type, props));

const roles = [
  { value: "reader", label: "Reader" },
  { value: "writer", label: "Writer" },
  { value: "admin", label: "Admin" },
];

test("MemberList shows members, invitations, roles and actions", () => {
  const markup = render(MemberList, {
    errorMessage: () => "Failed",
    onRoleChange: async () => undefined,
    roles,
    items: [
      {
        id: "u1",
        name: "Ann",
        email: "ann@example.com",
        role: "admin",
        you: true,
        roleEditable: true,
        actions: [{ id: "leave", label: "Leave", tone: "danger" }],
      },
      {
        id: "u2",
        name: "bob@example.com",
        email: "bob@example.com",
        role: "writer",
        href: "/admin/users/u2",
        status: { label: "Locked", tone: "amber" },
      },
      {
        id: "i1",
        name: "cid@example.com",
        role: "reader",
        invitation: true,
        status: { label: "Invited", tone: "blue" },
        detail: "Invited by Ann",
      },
    ],
  });
  assert.equal((markup.match(/<li /g) ?? []).length, 3);
  assert.match(markup, />You</);
  assert.match(markup, /ann@example\.com/);
  // An email that is also the name shows one time.
  assert.equal((markup.match(/bob@example\.com/g) ?? []).length, 1);
  assert.match(markup, /<a href="\/admin\/users\/u2">bob@example\.com<\/a>/);
  assert.match(markup, />Locked</);
  assert.match(markup, /<select aria-label="Role: Ann"/);
  assert.match(markup, /<option value="admin" selected="">Admin<\/option>/);
  // A row without an editable role shows the role as text.
  assert.match(markup, /od-member-role-text">Writer</);
  assert.match(markup, /od-member-role-text">Reader</);
  assert.match(markup, /data-invitation="true"/);
  assert.match(markup, /Invited by Ann/);
  assert.match(markup, /aria-label="More actions: Ann"/);
  assert.doesNotMatch(markup, /More actions: bob/);
});

test("MemberList without onRoleChange shows each role as text", () => {
  const markup = render(MemberList, {
    errorMessage: () => "Failed",
    roles,
    items: [{ id: "u1", name: "Ann", role: "admin", roleEditable: true }],
    labels: { role: "Rolle" },
  });
  assert.doesNotMatch(markup, /<select/);
  assert.match(markup, />Admin</);
});

test("MemberList shows a loading sign, then the empty text", () => {
  const props = { errorMessage: () => "Failed", roles, items: [] };
  assert.match(
    render(MemberList, { ...props, loading: true }),
    /Loading members/,
  );
  assert.match(
    render(MemberList, { ...props, labels: { empty: "Nobody" } }),
    />Nobody</,
  );
});

test("AccountMenu names its count and shows the detail of an item", () => {
  const props = {
    appearance: "workspace",
    avatar: null,
    label: "Switch workspace: Studio",
    name: "Studio",
    sections: [
      {
        id: "invitations",
        label: "Invitations",
        items: [
          {
            id: "i1",
            label: "Band",
            detail: "Invited by Ann",
            onSelect: () => undefined,
          },
        ],
      },
    ],
  };
  const markup = render(AccountMenu, {
    ...props,
    count: 2,
    countLabel: "2 invitations",
  });
  assert.match(
    markup,
    /aria-label="Switch workspace: Studio \(2 invitations\)"/,
  );
  assert.match(markup, /<span aria-hidden="true" class="od-count">2<\/span>/);
  const without = render(AccountMenu, props);
  assert.match(without, /aria-label="Switch workspace: Studio"/);
  assert.doesNotMatch(without, /od-count/);
});

const channel = (switches, extra = {}) => ({
  id: "c1",
  network: "x",
  name: "Studio",
  handle: "@studio",
  tags: [],
  needsReconnect: false,
  switches,
  ...extra,
});
const channelProps = {
  networks: [],
  onRename: async () => undefined,
  onTagsChange: async () => undefined,
  onSwitchChange: async () => undefined,
  onDisconnect: async () => undefined,
  onPasswordConnect: async () => undefined,
  errorMessage: () => "Failed",
};
const at = new Date(Date.now() - 2.5 * 3_600_000).toISOString();

test("ChannelList shows the last read of each read and a read button", () => {
  const markup = render(ChannelList, {
    ...channelProps,
    onSwitchRefresh: async () => undefined,
    items: [
      channel([
        { id: "publish", label: "Publish", on: true },
        { id: "community", label: "Comments", on: false, sync: { at } },
        { id: "messages", label: "Messages", on: true, sync: { at: null } },
        {
          id: "analytics",
          label: "Analytics",
          on: false,
          disabled: true,
          sync: { at },
        },
      ]),
    ],
  });
  // An off switch has a read button; an unsupported one has no read line.
  assert.match(markup, /aria-label="Read now: Comments, Studio"/);
  assert.match(markup, /aria-label="Read now: Messages, Studio"/);
  assert.doesNotMatch(markup, /Read now: Analytics/);
  assert.equal((markup.match(/od-channel-sync"/g) ?? []).length, 2);
  assert.match(markup, /Last read: <\/span>2h ago<\/time>/);
  assert.match(markup, />Not read</);
});

test("ChannelList shows read times without a button when it cannot read", () => {
  const sync = [{ id: "community", label: "Comments", on: true, sync: { at } }];
  const readOnly = render(ChannelList, {
    ...channelProps,
    onSwitchRefresh: async () => undefined,
    readOnly: true,
    items: [channel(sync)],
  });
  assert.match(readOnly, /2h ago/);
  assert.doesNotMatch(readOnly, /Read now/);
  const reconnect = render(ChannelList, {
    ...channelProps,
    onSwitchRefresh: async () => undefined,
    items: [channel(sync, { needsReconnect: true })],
  });
  assert.match(reconnect, /2h ago/);
  assert.doesNotMatch(reconnect, /Read now/);
  const noRefresh = render(ChannelList, {
    ...channelProps,
    items: [channel(sync)],
  });
  assert.doesNotMatch(noRefresh, /Read now/);
});
