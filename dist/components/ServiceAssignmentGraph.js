import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { GraphEdge, GraphEdges, GraphEmptyState, GraphInspector, GraphNode, GraphViewport, GraphWorkspace, } from "./GraphWorkspace.js";
import { serviceAssignmentFocusIndex } from "../ServiceAssignmentKeyboard.js";
const assignmentX = 32;
const candidateX = 272;
const rowHeight = 112;
const rowStart = 40;
const candidateWidth = 184;
const candidateGap = 12;
function classes(...values) {
    return values.filter(Boolean).join(" ");
}
function sourceLabel(source) {
    if (source.kind === "direct")
        return "Direct definition";
    if (source.kind === "inherited")
        return "Inherited definition";
    return "Implicit default";
}
function sourceTone(source) {
    if (source.kind === "direct")
        return "lime";
    if (source.kind === "inherited")
        return "blue";
    return "amber";
}
function definitionLabel(assignment) {
    if (assignment.inheritsFrom !== undefined) {
        return `Inherits ${assignment.inheritsFrom}`;
    }
    if (assignment.candidates.length > 0)
        return "Ordered candidate chain";
    if (assignment.isDefault === true)
        return "Empty default chain";
    return "Unconfigured";
}
function candidateCountLabel(count) {
    return `${String(count)} ${count === 1 ? "candidate" : "candidates"}`;
}
function assignmentCountLabel(count) {
    return `${String(count)} ${count === 1 ? "assignment" : "assignments"}`;
}
function assignmentSummary(assignment) {
    return `${definitionLabel(assignment)} · ${candidateCountLabel(assignment.candidates.length)}`;
}
function assignmentAriaLabel(assignment) {
    const lastUse = assignment.lastUsed?.label ?? "Never used";
    const requirements = assignment.observedRequirements.length === 0
        ? "No observed requirements"
        : `Observed requirements: ${assignment.observedRequirements.join(", ")}`;
    return `${assignment.name}. ${sourceLabel(assignment.source)} from ${assignment.source.label}. ${assignmentSummary(assignment)}. Last use: ${lastUse}. ${requirements}.`;
}
function edgePath(y) {
    const centerY = y + 36;
    return `M 208 ${String(centerY)} C 228 ${String(centerY)} 244 ${String(centerY)} ${String(candidateX - 12)} ${String(centerY)}`;
}
function AssignmentCandidateChain({ assignment, style, }) {
    return (_jsx("ol", { "aria-label": `${assignment.name} ordered candidates`, className: "od-service-assignment-candidate-chain", style: style, children: assignment.candidates.length === 0 ? (_jsxs("li", { className: "od-service-assignment-candidate od-service-assignment-candidate-empty", "data-state": assignment.isDefault === true ? "empty-default" : "empty", children: [_jsx("strong", { children: definitionLabel(assignment) }), assignment.inheritsFrom !== undefined ? (_jsx("span", { children: "No effective candidates" })) : null] })) : (assignment.candidates.map((candidate, index) => (_jsxs("li", { className: "od-service-assignment-candidate", children: [_jsxs("span", { className: "od-service-assignment-candidate-position", children: [_jsx("span", { children: String(index + 1) }), index === 0 ? "Primary" : `Fallback ${String(index)}`] }), _jsx("strong", { children: candidate.label }), candidate.detail !== undefined ? (_jsx("span", { className: "od-service-assignment-candidate-detail", children: candidate.detail })) : null] }, candidate.id)))) }));
}
function LastUse({ value, }) {
    if (value === null)
        return _jsx(_Fragment, { children: "Never used" });
    if (value.dateTime === undefined)
        return _jsx(_Fragment, { children: value.label });
    return _jsx("time", { dateTime: value.dateTime, children: value.label });
}
function OrderedCandidateDetails({ assignment, headingLevel = "h3", }) {
    const Heading = headingLevel;
    return (_jsxs("section", { className: "od-service-assignment-detail-section", children: [_jsx(Heading, { children: "Ordered candidates" }), assignment.candidates.length === 0 ? (_jsx("p", { className: "od-service-assignment-empty-value", children: assignment.isDefault === true
                    ? "The default chain is empty."
                    : "No effective candidate is configured." })) : (_jsx("ol", { className: "od-service-assignment-detail-candidates", children: assignment.candidates.map((candidate, index) => (_jsxs("li", { children: [_jsx("span", { children: String(index + 1) }), _jsxs("div", { children: [_jsx("strong", { children: candidate.label }), _jsxs("small", { children: [index === 0 ? "Primary" : `Fallback ${String(index)}`, candidate.detail !== undefined
                                            ? ` · ${candidate.detail}`
                                            : ""] })] })] }, candidate.id))) }))] }));
}
function RequirementDetails({ headingLevel = "h3", requirements, }) {
    const Heading = headingLevel;
    return (_jsxs("section", { className: "od-service-assignment-detail-section", children: [_jsx(Heading, { children: "Observed requirements" }), requirements.length === 0 ? (_jsx("p", { className: "od-service-assignment-empty-value", children: "None observed" })) : (_jsx("ul", { className: "od-service-assignment-requirements", children: requirements.map((requirement) => (_jsx("li", { children: requirement }, requirement))) }))] }));
}
function AssignmentFacts({ assignment, }) {
    return (_jsxs("dl", { className: "od-service-assignment-facts", children: [_jsxs("div", { children: [_jsx("dt", { children: "Source" }), _jsxs("dd", { children: [_jsx("span", { "data-source": assignment.source.kind, children: sourceLabel(assignment.source) }), _jsx("small", { children: assignment.source.label })] })] }), _jsxs("div", { children: [_jsx("dt", { children: "Definition" }), _jsx("dd", { children: definitionLabel(assignment) })] }), _jsxs("div", { children: [_jsx("dt", { children: "Last use" }), _jsx("dd", { children: _jsx(LastUse, { value: assignment.lastUsed }) })] })] }));
}
function AssignmentInspector({ assignment, actionsForAssignment, id, onClose, selectedNodeId, }) {
    const actions = actionsForAssignment?.(assignment);
    return (_jsxs(GraphInspector, { "aria-live": "polite", closeLabel: "Close assignment details", eyebrow: sourceLabel(assignment.source), id: `${id}-inspector`, onClose: () => {
            globalThis.document.getElementById(selectedNodeId)?.focus();
            onClose();
        }, title: assignment.name, tone: sourceTone(assignment.source), actions: actions, children: [_jsx(AssignmentFacts, { assignment: assignment }), _jsx(OrderedCandidateDetails, { assignment: assignment }), _jsx(RequirementDetails, { requirements: assignment.observedRequirements })] }));
}
function moveGraphFocus(event, assignmentIndex, assignmentCount) {
    const nextIndex = serviceAssignmentFocusIndex(assignmentIndex, assignmentCount, event.key);
    if (nextIndex === null)
        return;
    event.preventDefault();
    if (nextIndex === assignmentIndex)
        return;
    const graph = event.currentTarget.closest("[data-service-assignment-graph]");
    const nodes = graph?.querySelectorAll("[data-service-assignment-node='true']");
    nodes?.item(nextIndex).focus();
}
function AssignmentList({ actionsForAssignment, assignments, id, onSelectionChange, selectedAssignmentId, }) {
    return (_jsxs("section", { "aria-labelledby": `${id}-list-title`, className: "od-service-assignment-list", children: [_jsxs("header", { className: "od-service-assignment-list-heading", children: [_jsxs("div", { children: [_jsx("h2", { id: `${id}-list-title`, children: "Assignment list" }), _jsx("p", { children: "The list contains the same records and actions as the graph." })] }), _jsx("span", { children: assignmentCountLabel(assignments.length) })] }), assignments.length === 0 ? (_jsx("p", { className: "od-service-assignment-list-empty", children: "No assignments" })) : (_jsx("ol", { className: "od-service-assignment-list-records", children: assignments.map((assignment) => {
                    const selected = assignment.id === selectedAssignmentId;
                    const actions = actionsForAssignment?.(assignment);
                    return (_jsx("li", { "data-selected": selected, children: _jsxs("article", { children: [_jsxs("header", { className: "od-service-assignment-list-record-heading", children: [_jsx("h3", { children: _jsx("button", { "aria-controls": selected ? `${id}-inspector` : undefined, "aria-expanded": selected, onClick: () => {
                                                    onSelectionChange(assignment.id);
                                                }, type: "button", children: assignment.name }) }), _jsx("span", { "data-source": assignment.source.kind, children: sourceLabel(assignment.source) })] }), _jsx(AssignmentFacts, { assignment: assignment }), _jsx(OrderedCandidateDetails, { assignment: assignment, headingLevel: "h4" }), _jsx(RequirementDetails, { headingLevel: "h4", requirements: assignment.observedRequirements }), actions !== undefined ? (_jsx("footer", { "aria-label": `${assignment.name} actions`, className: "od-service-assignment-list-actions", children: actions })) : null] }) }, assignment.id));
                }) }))] }));
}
/**
 * A controlled assignment graph, detail inspector, and accessible list.
 * Hosts own data access, formatting, routes, and mutations.
 */
export function ServiceAssignmentGraph({ actionsForAssignment, assignments, className, id, onSelectionChange, selectedAssignmentId = null, "aria-label": ariaLabel, ...props }) {
    const selectedAssignment = assignments.find((assignment) => assignment.id === selectedAssignmentId) ??
        null;
    const effectiveSelectedAssignmentId = selectedAssignment?.id ?? null;
    const selectedAssignmentIndex = selectedAssignment === null
        ? -1
        : assignments.findIndex((assignment) => assignment.id === selectedAssignment.id);
    const longestChain = assignments.reduce((longest, assignment) => Math.max(longest, Math.max(assignment.candidates.length, 1)), 1);
    const canvasWidth = Math.max(720, candidateX + longestChain * (candidateWidth + candidateGap) + 32);
    const canvasHeight = Math.max(480, rowStart + assignments.length * rowHeight + 32);
    return (_jsxs("div", { ...props, "aria-label": ariaLabel, className: classes("od-service-assignment-graph", className), "data-service-assignment-graph": "true", id: id, role: props.role ?? "group", children: [_jsx("div", { className: "od-service-assignment-visual", children: _jsxs(GraphWorkspace, { "aria-label": `${ariaLabel} visual graph`, children: [_jsxs(GraphViewport, { "aria-label": "Assignment graph canvas", canvasHeight: canvasHeight, canvasProps: {
                                "aria-label": `${assignmentCountLabel(assignments.length)} and their ordered candidate chains`,
                            }, canvasWidth: canvasWidth, children: [assignments.length === 0 ? (_jsx(GraphEmptyState, { description: "Supply assignments to show this graph.", icon: _jsx("span", { children: "0" }), title: "No assignments" })) : null, _jsx(GraphEdges, { height: canvasHeight, width: canvasWidth, children: assignments.map((assignment, index) => {
                                        const y = rowStart + index * rowHeight;
                                        return (_jsx(GraphEdge, { dashed: assignment.candidates.length === 0, path: edgePath(y) }, assignment.id));
                                    }) }), assignments.map((assignment, index) => {
                                    const selected = assignment.id === effectiveSelectedAssignmentId;
                                    const y = rowStart + index * rowHeight;
                                    return (_jsxs("div", { children: [_jsx(GraphNode, { "aria-controls": selected ? `${id}-inspector` : undefined, "aria-expanded": selected, "aria-keyshortcuts": "ArrowUp ArrowDown ArrowLeft ArrowRight Home End Escape", "aria-label": assignmentAriaLabel(assignment), "data-service-assignment-node": "true", eyebrow: sourceLabel(assignment.source), id: `${id}-assignment-${String(index)}`, meta: assignmentSummary(assignment), onClick: () => {
                                                    onSelectionChange(assignment.id);
                                                }, onKeyDown: (event) => {
                                                    if (event.key === "Escape" && selected) {
                                                        event.preventDefault();
                                                        onSelectionChange(null);
                                                        return;
                                                    }
                                                    moveGraphFocus(event, index, assignments.length);
                                                }, selected: selected, tabIndex: selected ||
                                                    (effectiveSelectedAssignmentId === null && index === 0)
                                                    ? 0
                                                    : -1, title: assignment.name, tone: sourceTone(assignment.source), x: assignmentX, y: y }), _jsx(AssignmentCandidateChain, { assignment: assignment, style: { left: candidateX, top: y } })] }, assignment.id));
                                })] }), selectedAssignment === null ? null : (_jsx(AssignmentInspector, { actionsForAssignment: actionsForAssignment, assignment: selectedAssignment, id: id, onClose: () => {
                                onSelectionChange(null);
                            }, selectedNodeId: `${id}-assignment-${String(selectedAssignmentIndex)}` }))] }) }), _jsx(AssignmentList, { actionsForAssignment: actionsForAssignment, assignments: assignments, id: id, onSelectionChange: onSelectionChange, selectedAssignmentId: effectiveSelectedAssignmentId })] }));
}
//# sourceMappingURL=ServiceAssignmentGraph.js.map