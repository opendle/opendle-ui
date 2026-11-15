import assert from "node:assert/strict";
import test from "node:test";

Object.defineProperty(globalThis, "Notification", {
  value: {},
  writable: true,
  configurable: true,
});
import {
  browserPushSubscription,
  subscribeBrowserPush,
  supportsBrowserPush,
} from "../dist/browserPush.js";

test("push support is false without a secure browser", () => {
  assert.equal(supportsBrowserPush(), false);
});

test("push subscriptions need both encryption keys", () => {
  assert.throws(
    () =>
      browserPushSubscription({
        endpoint: "https://push.test",
        toJSON: () => ({ keys: {} }),
      }),
    /encryption keys/,
  );
  assert.deepEqual(
    browserPushSubscription({
      endpoint: "https://push.test",
      toJSON: () => ({ keys: { p256dh: "key", auth: "auth" } }),
    }),
    { endpoint: "https://push.test", keys: { p256dh: "key", auth: "auth" } },
  );
});

test("permission denial makes no subscription", async (t) => {
  t.mock.property(globalThis, "Notification", {
    requestPermission: async () => "denied",
  });
  await assert.rejects(subscribeBrowserPush({}, "AQID"), /Allow notifications/);
});

test("a matching application key reuses the browser subscription", async (t) => {
  t.mock.property(globalThis, "Notification", {
    requestPermission: async () => "granted",
  });
  const existing = {
    options: { applicationServerKey: new Uint8Array([1, 2, 3]).buffer },
  };
  const registration = {
    pushManager: { getSubscription: async () => existing },
  };
  assert.equal(await subscribeBrowserPush(registration, "AQID"), existing);
});

test("a changed application key replaces the browser subscription", async (t) => {
  t.mock.property(globalThis, "Notification", {
    requestPermission: async () => "granted",
  });
  let removed = false;
  const existing = {
    options: { applicationServerKey: new Uint8Array([4]).buffer },
    unsubscribe: async () => {
      removed = true;
      return true;
    },
  };
  const registration = {
    pushManager: {
      getSubscription: async () => existing,
      subscribe: async (options) => {
        assert.equal(removed, true);
        assert.equal(options.userVisibleOnly, true);
        assert.deepEqual([...options.applicationServerKey], [1, 2, 3]);
        return { endpoint: "new" };
      },
    },
  };
  assert.deepEqual(await subscribeBrowserPush(registration, "AQID"), {
    endpoint: "new",
  });
});
