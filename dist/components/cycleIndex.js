/**
 * The next index in a list that wraps at its ends. Without a current index,
 * a step forward gives the first index and a step back gives the last.
 */
export function cycleIndex(current, count, step) {
    if (current < 0)
        return step === 1 ? 0 : count - 1;
    return (current + step + count) % count;
}
//# sourceMappingURL=cycleIndex.js.map