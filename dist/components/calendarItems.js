export const calendarBoardLabels = {
    board: "Calendar",
    today: "Today",
    empty: "No posts",
    earlier: "Earlier",
    later: "Later",
    time: "Time",
    states: {
        scheduled: "Scheduled",
        publishing: "Publishing",
        published: "Published",
        failed: "Failed",
        cancelled: "Cancelled",
    },
    followUps: { comment: "Comments", like: "Like" },
};
const statePriority = [
    "failed",
    "publishing",
    "scheduled",
    "published",
    "cancelled",
];
/** The most urgent state of a list of states. */
export function urgentState(states) {
    return statePriority.find((state) => states.includes(state)) ?? "scheduled";
}
/** The state of an entry: the most urgent state of its networks. */
export function calendarItemState(item) {
    return urgentState(item.targets.map((target) => target.state));
}
//# sourceMappingURL=calendarItems.js.map