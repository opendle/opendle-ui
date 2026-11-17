const gap = 4;
const margin = 8;
/**
 * Put a panel below its button, or above it when the window has no room
 * below. The panel is fixed to the window, so a container that hides its
 * overflow does not cut it. `end` aligns the panel with the end of the button.
 */
export function placePanel(button, panel, align = "start") {
    const bounds = button.getBoundingClientRect();
    const height = panel.offsetHeight;
    const width = panel.offsetWidth;
    const below = bounds.bottom + gap + height <= window.innerHeight - margin;
    panel.style.top = `${String(below ? bounds.bottom + gap : Math.max(margin, bounds.top - gap - height))}px`;
    const left = align === "end" ? bounds.right - width : bounds.left;
    panel.style.left = `${String(Math.max(margin, Math.min(left, window.innerWidth - width - margin)))}px`;
    panel.dataset.side = below ? "below" : "above";
}
//# sourceMappingURL=placePanel.js.map