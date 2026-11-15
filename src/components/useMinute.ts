import { useSyncExternalStore } from "react";

const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;

function minute(): number {
  return Math.floor(Date.now() / 60_000);
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  timer ??= setInterval(() => {
    for (const entry of listeners) entry();
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
export function useMinute(): Date {
  return new Date(useSyncExternalStore(subscribe, minute, minute) * 60_000);
}
