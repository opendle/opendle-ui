/** The browser subscription fields that a push server needs. */
export interface BrowserPushSubscription {
  readonly endpoint: string;
  readonly keys: { readonly p256dh: string; readonly auth: string };
}

/** True when this secure browser can receive Web Push. */
export function supportsBrowserPush(): boolean {
  return (
    typeof window !== "undefined" &&
    window.isSecureContext &&
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  );
}

/** Register a same-origin worker and wait until it can receive push. */
export async function browserPushRegistration(
  workerPath: string,
): Promise<ServiceWorkerRegistration> {
  await navigator.serviceWorker.register(workerPath, {
    scope: "/",
    updateViaCache: "none",
  });
  return navigator.serviceWorker.ready;
}

/** Request permission from a user action, then use the app's VAPID public key. */
export async function subscribeBrowserPush(
  registration: ServiceWorkerRegistration,
  publicKey: string,
): Promise<PushSubscription> {
  const permission = await Notification.requestPermission();
  if (permission !== "granted")
    throw new Error("Allow notifications in the browser settings.");
  const bytes = Uint8Array.from(
    atob(publicKey.replace(/-/g, "+").replace(/_/g, "/")),
    (letter) => letter.charCodeAt(0),
  );
  const existing = await registration.pushManager.getSubscription();
  if (existing !== null) {
    const key = existing.options.applicationServerKey;
    if (key !== null && String(new Uint8Array(key)) === String(bytes))
      return existing;
    await existing.unsubscribe();
  }
  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: bytes,
  });
}

/** Return the serializable encryption keys, or fail for an incomplete subscription. */
export function browserPushSubscription(
  subscription: PushSubscription,
): BrowserPushSubscription {
  const value = subscription.toJSON();
  const p256dh = value.keys?.p256dh;
  const auth = value.keys?.auth;
  if (p256dh === undefined || auth === undefined)
    throw new Error("The browser did not give push encryption keys.");
  return { endpoint: subscription.endpoint, keys: { p256dh, auth } };
}
