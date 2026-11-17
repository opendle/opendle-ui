const gap = 4;
const margin = 8;
/**
 * Put a panel below its button, or above it when the window has no room
 * below. The panel is fixed to the window, so a container that hides its
 * overflow does not cut it.
 */
export function placePanel(button, panel) {
    const bounds = button.getBoundingClientRect();
    const height = panel.offsetHeight;
    const width = panel.offsetWidth;
    const below = bounds.bottom + gap + height <= window.innerHeight - margin;
    panel.style.top = `${String(below ? bounds.bottom + gap : Math.max(margin, bounds.top - gap - height))}px`;
    panel.style.left = `${String(Math.max(margin, Math.min(bounds.left, window.innerWidth - width - margin)))}px`;
    panel.dataset.side = below ? "below" : "above";
}
//# sourceMappingURL=placePanel.js.map