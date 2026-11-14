export const calendarBoardLabels = {
    board: "Calendar",
    today: "Today",
    empty: "No posts",
    earlier: "Earlier",
    later: "Later",
    states: {
        scheduled: "Scheduled",
        publishing: "Publishing",
        published: "Published",
        failed: "Failed",
        cancelled: "Cancelled",
    },
};
const statePriority = [
    "failed",
    "publishing",
    "scheduled",
    "published",
    "cancelled",
];
/** The state of an entry: the most urgent state of its networks. */
export function calendarItemState(item) {
    return (statePriority.find((state) => item.targets.some((target) => target.state === state)) ?? "scheduled");
}
//# sourceMappingURL=calendarItems.js.map