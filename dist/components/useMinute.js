import { useSyncExternalStore } from "react";
const listeners = new Set();
let timer = null;
function minute() {
    return Math.floor(Date.now() / 60_000);
}
function subscribe(listener) {
    listeners.add(listener);
    timer ??= setInterval(() => {
        for (const entry of listeners)
            entry();
    }, 15_000);
    return () => {
        listeners.delete(listener);
        if (listeners.size === 0 && timer !== null) {
            clearInterval(timer);
            timer = null;
        }
    };
}
/** The current time, to the minute. The component renders again each minute. */
export function useMinute() {
    return new Date(useSyncExternalStore(subscribe, minute, minute) * 60_000);
}
//# sourceMappingURL=useMinute.js.map