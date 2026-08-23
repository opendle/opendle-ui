/** Return the next graph-item index for one navigation key. */
export function serviceAssignmentFocusIndex(
  currentIndex: number,
  assignmentCount: number,
  key: string,
): number | null {
  if (assignmentCount <= 0) return null;
  if (key === "ArrowDown" || key === "ArrowRight") {
    return Math.min(currentIndex + 1, assignmentCount - 1);
  }
  if (key === "ArrowUp" || key === "ArrowLeft") {
    return Math.max(currentIndex - 1, 0);
  }
  if (key === "Home") return 0;
  if (key === "End") return assignmentCount - 1;
  return null;
}
