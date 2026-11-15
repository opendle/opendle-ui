/** The browser subscription fields that a push server needs. */
export interface BrowserPushSubscription {
    readonly endpoint: string;
    readonly keys: {
        readonly p256dh: string;
        readonly auth: string;
    };
}
/** True when this secure browser can receive Web Push. */
export declare function supportsBrowserPush(): boolean;
/** Register a same-origin worker and wait until it can receive push. */
export declare function browserPushRegistration(workerPath: string): Promise<ServiceWorkerRegistration>;
/** Request permission from a user action, then use the app's VAPID public key. */
export declare function subscribeBrowserPush(registration: ServiceWorkerRegistration, publicKey: string): Promise<PushSubscription>;
/** Return the serializable encryption keys, or fail for an incomplete subscription. */
export declare function browserPushSubscription(subscription: PushSubscription): BrowserPushSubscription;
//# sourceMappingURL=browserPush.d.ts.map