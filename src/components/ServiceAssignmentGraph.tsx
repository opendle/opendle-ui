import { useEffect, useRef } from "react";
import type {
  CSSProperties,
  HTMLAttributes,
  KeyboardEvent,
  ReactNode,
} from "react";
import {
  GraphEdge,
  GraphEdges,
  GraphEmptyState,
  GraphInspector,
  GraphNode,
  GraphViewport,
  GraphWorkspace,
  type GraphNodeTone,
} from "./GraphWorkspace.js";
import { serviceAssignmentFocusIndex } from "../ServiceAssignmentKeyboard.js";

const assignmentX = 32;
const candidateX = 272;
const rowHeight = 112;
const rowStart = 40;
const candidateWidth = 184;
const candidateGap = 12;

function classes(...values: (string | false | null | undefined)[]) {
  return values.filter(Boolean).join(" ");
}

export type ServiceAssignmentSourceKind = "direct" | "inherited" | "implicit";

export interface ServiceAssignmentSource {
  readonly kind: ServiceAssignmentSourceKind;
  /** A host-owned service or scope label. */
  readonly label: string;
}

export interface ServiceAssignmentCandidate {
  /** A stable identifier within this assignment. */
  readonly id: string;
  readonly label: string;
  readonly detail?: string;
}

export interface ServiceAssignmentLastUse {
  /** Host-formatted visible text. */
  readonly label: string;
  /** An optional machine-readable date or time. */
  readonly dateTime?: string;
}

export interface ServiceAssignmentItem {
  /** A stable identifier within the graph. */
  readonly id: string;
  readonly name: string;
  /** The effective definition source, or null when no definition exists. */
  readonly source: ServiceAssignmentSource | null;
  /** The effective candidate chain in its complete order. */
  readonly candidates: readonly ServiceAssignmentCandidate[];
  /** The assignment that this definition resolves through, when applicable. */
  readonly inheritsFrom?: string;
  readonly isDefault?: boolean;
  readonly lastUsed: ServiceAssignmentLastUse | null;
  readonly observedRequirements: readonly string[];
}

export interface ServiceAssignmentGraphProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "id"
> {
  /** A page-unique prefix for labels and controls. */
  readonly id: string;
  readonly assignments: readonly ServiceAssignmentItem[];
  readonly selectedAssignmentId?: string | null;
  readonly onSelectionChange: (assignmentId: string | null) => void;
  /** Return host-owned mutation or routing controls for one assignment. */
  readonly actionsForAssignment?: (
    assignment: ServiceAssignmentItem,
  ) => ReactNode;
  readonly "aria-label": string;
}

function sourceLabel(assignment: ServiceAssignmentItem): string {
  if (assignment.source === null) return "No definition";
  if (assignment.source.kind === "direct") return "Direct definition";
  if (assignment.source.kind === "inherited") return "Inherited definition";
  return assignment.isDefault === true
    ? "Implicit root default"
    : "Implicit assignment";
}

function sourceTone(source: ServiceAssignmentSource | null): GraphNodeTone {
  if (source === null) return "neutral";
  if (source.kind === "direct") return "lime";
  if (source.kind === "inherited") return "blue";
  return "amber";
}

function definitionLabel(assignment: ServiceAssignmentItem): string {
  if (assignment.source === null && assignment.inheritsFrom !== undefined) {
    return `Unconfigured · inherits ${assignment.inheritsFrom}`;
  }
  if (assignment.source === null) return "Unconfigured";
  if (assignment.inheritsFrom !== undefined) {
    return `Inherits ${assignment.inheritsFrom}`;
  }
  if (assignment.candidates.length > 0) return "Ordered candidate chain";
  if (assignment.isDefault === true) return "Empty default chain";
  return "Unconfigured";
}

function candidateCountLabel(count: number): string {
  return `${String(count)} ${count === 1 ? "candidate" : "candidates"}`;
}

function assignmentCountLabel(count: number): string {
  return `${String(count)} ${count === 1 ? "assignment" : "assignments"}`;
}

function assignmentSummary(assignment: ServiceAssignmentItem): string {
  return `${definitionLabel(assignment)} · ${candidateCountLabel(assignment.candidates.length)}`;
}

function assignmentAriaLabel(assignment: ServiceAssignmentItem): string {
  const lastUse = assignment.lastUsed?.label ?? "Never used";
  const requirements =
    assignment.observedRequirements.length === 0
      ? "No observed requirements"
      : `Observed requirements: ${assignment.observedRequirements.join(", ")}`;
  const source =
    assignment.source === null
      ? sourceLabel(assignment)
      : `${sourceLabel(assignment)} from ${assignment.source.label}`;
  return `${assignment.name}. ${source}. ${assignmentSummary(assignment)}. Last use: ${lastUse}. ${requirements}.`;
}

function validateAssignmentIdentity(
  assignments: readonly ServiceAssignmentItem[],
): void {
  const assignmentIds = new Set<string>();
  const assignmentNames = new Set<string>();
  for (const assignment of assignments) {
    if (assignmentIds.has(assignment.id)) {
      throw new Error(`Service assignment id must be unique: ${assignment.id}`);
    }
    assignmentIds.add(assignment.id);
    if (assignmentNames.has(assignment.name)) {
      throw new Error(
        `Service assignment name must be unique: ${assignment.name}`,
      );
    }
    assignmentNames.add(assignment.name);

    const candidateIds = new Set<string>();
    for (const candidate of assignment.candidates) {
      if (candidateIds.has(candidate.id)) {
        throw new Error(
          `Candidate id must be unique in ${assignment.name}: ${candidate.id}`,
        );
      }
      candidateIds.add(candidate.id);
    }

    const observedRequirements = new Set<string>();
    for (const requirement of assignment.observedRequirements) {
      if (observedRequirements.has(requirement)) {
        throw new Error(
          `Observed requirement must be unique in ${assignment.name}: ${requirement}`,
        );
      }
      observedRequirements.add(requirement);
    }
  }
}

function edgePath(y: number): string {
  const centerY = y + 36;
  return `M 208 ${String(centerY)} C 228 ${String(centerY)} 244 ${String(centerY)} ${String(candidateX - 12)} ${String(centerY)}`;
}

function AssignmentCandidateChain({
  assignment,
  style,
}: {
  readonly assignment: ServiceAssignmentItem;
  readonly style: CSSProperties;
}) {
  return (
    <ol
      aria-label={`${assignment.name} ordered candidates`}
      className="od-service-assignment-candidate-chain"
      style={style}
    >
      {assignment.candidates.length === 0 ? (
        <li
          className="od-service-assignment-candidate od-service-assignment-candidate-empty"
          data-state={assignment.isDefault === true ? "empty-default" : "empty"}
        >
          <strong>{definitionLabel(assignment)}</strong>
          {assignment.inheritsFrom !== undefined ? (
            <span>No effective candidates</span>
          ) : null}
        </li>
      ) : (
        assignment.candidates.map((candidate, index) => (
          <li className="od-service-assignment-candidate" key={candidate.id}>
            <span className="od-service-assignment-candidate-position">
              <span>{String(index + 1)}</span>
              {index === 0 ? "Primary" : `Fallback ${String(index)}`}
            </span>
            <strong>{candidate.label}</strong>
            {candidate.detail !== undefined ? (
              <span className="od-service-assignment-candidate-detail">
                {candidate.detail}
              </span>
            ) : null}
          </li>
        ))
      )}
    </ol>
  );
}

function LastUse({
  value,
}: {
  readonly value: ServiceAssignmentLastUse | null;
}) {
  if (value === null) return <>Never used</>;
  if (value.dateTime === undefined) return <>{value.label}</>;
  return <time dateTime={value.dateTime}>{value.label}</time>;
}

function OrderedCandidateDetails({
  assignment,
  headingLevel = "h3",
}: {
  readonly assignment: ServiceAssignmentItem;
  readonly headingLevel?: "h3" | "h4";
}) {
  const Heading = headingLevel;
  return (
    <section className="od-service-assignment-detail-section">
      <Heading>Ordered candidates</Heading>
      {assignment.candidates.length === 0 ? (
        <p className="od-service-assignment-empty-value">
          {assignment.isDefault === true
            ? "The default chain is empty."
            : "No effective candidate is configured."}
        </p>
      ) : (
        <ol className="od-service-assignment-detail-candidates">
          {assignment.candidates.map((candidate, index) => (
            <li key={candidate.id}>
              <span>{String(index + 1)}</span>
              <div>
                <strong>{candidate.label}</strong>
                <small>
                  {index === 0 ? "Primary" : `Fallback ${String(index)}`}
                  {candidate.detail !== undefined
                    ? ` · ${candidate.detail}`
                    : ""}
                </small>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function RequirementDetails({
  headingLevel = "h3",
  requirements,
}: {
  readonly headingLevel?: "h3" | "h4";
  readonly requirements: readonly string[];
}) {
  const Heading = headingLevel;
  return (
    <section className="od-service-assignment-detail-section">
      <Heading>Observed requirements</Heading>
      {requirements.length === 0 ? (
        <p className="od-service-assignment-empty-value">None observed</p>
      ) : (
        <ul className="od-service-assignment-requirements">
          {requirements.map((requirement) => (
            <li key={requirement}>{requirement}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

function AssignmentFacts({
  assignment,
}: {
  readonly assignment: ServiceAssignmentItem;
}) {
  return (
    <dl className="od-service-assignment-facts">
      <div>
        <dt>Source</dt>
        <dd>
          <span data-source={assignment.source?.kind ?? "none"}>
            {sourceLabel(assignment)}
          </span>
          {assignment.source === null ? null : (
            <small>{assignment.source.label}</small>
          )}
        </dd>
      </div>
      <div>
        <dt>Definition</dt>
        <dd>{definitionLabel(assignment)}</dd>
      </div>
      <div>
        <dt>Last use</dt>
        <dd>
          <LastUse value={assignment.lastUsed} />
        </dd>
      </div>
    </dl>
  );
}

function AssignmentInspector({
  assignment,
  actionsForAssignment,
  getReturnFocusTarget,
  id,
  onClose,
  selectedNodeId,
}: {
  readonly assignment: ServiceAssignmentItem;
  readonly actionsForAssignment:
    ServiceAssignmentGraphProps["actionsForAssignment"] | undefined;
  readonly getReturnFocusTarget: () => HTMLElement | null;
  readonly id: string;
  readonly onClose: () => void;
  readonly selectedNodeId: string;
}) {
  const actions = actionsForAssignment?.(assignment);
  function closeInspector(): void {
    const fallbackTarget = globalThis.document.getElementById(selectedNodeId);
    const returnFocusTarget = getReturnFocusTarget();
    const focusTarget = returnFocusTarget?.isConnected
      ? returnFocusTarget
      : fallbackTarget;
    focusTarget?.focus();
    onClose();
  }
  return (
    <GraphInspector
      aria-live="polite"
      closeLabel={`Close ${assignment.name} details`}
      eyebrow={sourceLabel(assignment)}
      id={`${id}-inspector`}
      onClose={closeInspector}
      onKeyDown={(event) => {
        if (event.defaultPrevented || event.key !== "Escape") return;
        event.preventDefault();
        event.stopPropagation();
        closeInspector();
      }}
      title={assignment.name}
      tone={sourceTone(assignment.source)}
      actions={actions}
    >
      <AssignmentFacts assignment={assignment} />
      <OrderedCandidateDetails assignment={assignment} />
      <RequirementDetails requirements={assignment.observedRequirements} />
    </GraphInspector>
  );
}

function moveGraphFocus(
  event: KeyboardEvent<HTMLButtonElement>,
  assignmentIndex: number,
  assignmentCount: number,
) {
  const nextIndex = serviceAssignmentFocusIndex(
    assignmentIndex,
    assignmentCount,
    event.key,
  );
  if (nextIndex === null) return;
  event.preventDefault();
  if (nextIndex === assignmentIndex) return;
  const graph = event.currentTarget.closest<HTMLElement>(
    "[data-service-assignment-graph]",
  );
  const nodes = graph?.querySelectorAll<HTMLButtonElement>(
    "[data-service-assignment-node='true']",
  );
  nodes?.item(nextIndex).focus();
}

function AssignmentList({
  actionsForAssignment,
  assignments,
  id,
  onOpenAssignment,
  selectedAssignmentId,
}: {
  readonly actionsForAssignment:
    ServiceAssignmentGraphProps["actionsForAssignment"] | undefined;
  readonly assignments: readonly ServiceAssignmentItem[];
  readonly id: string;
  readonly onOpenAssignment: (
    assignmentId: string,
    trigger: HTMLButtonElement,
  ) => void;
  readonly selectedAssignmentId: string | null;
}) {
  return (
    <section
      aria-labelledby={`${id}-list-title`}
      className="od-service-assignment-list"
    >
      <header className="od-service-assignment-list-heading">
        <div>
          <h2 id={`${id}-list-title`}>Assignment list</h2>
          <p>The list contains the same records and actions as the graph.</p>
        </div>
        <span>{assignmentCountLabel(assignments.length)}</span>
      </header>
      {assignments.length === 0 ? (
        <p className="od-service-assignment-list-empty">No assignments</p>
      ) : (
        <ol className="od-service-assignment-list-records">
          {assignments.map((assignment) => {
            const selected = assignment.id === selectedAssignmentId;
            const actions = actionsForAssignment?.(assignment);
            return (
              <li data-selected={selected} key={assignment.id}>
                <article>
                  <header className="od-service-assignment-list-record-heading">
                    <h3>
                      <button
                        aria-controls={selected ? `${id}-inspector` : undefined}
                        aria-expanded={selected}
                        onClick={(event) => {
                          onOpenAssignment(assignment.id, event.currentTarget);
                        }}
                        type="button"
                      >
                        {assignment.name}
                      </button>
                    </h3>
                    <span data-source={assignment.source?.kind ?? "none"}>
                      {sourceLabel(assignment)}
                    </span>
                  </header>
                  <AssignmentFacts assignment={assignment} />
                  <OrderedCandidateDetails
                    assignment={assignment}
                    headingLevel="h4"
                  />
                  <RequirementDetails
                    headingLevel="h4"
                    requirements={assignment.observedRequirements}
                  />
                  {actions ? (
                    <footer
                      aria-label={`${assignment.name} actions`}
                      className="od-service-assignment-list-actions"
                    >
                      {actions}
                    </footer>
                  ) : null}
                </article>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

/**
 * A controlled assignment graph, detail inspector, and accessible list.
 * Hosts own data access, formatting, routes, and mutations.
 */
export function ServiceAssignmentGraph({
  actionsForAssignment,
  assignments,
  className,
  id,
  onSelectionChange,
  selectedAssignmentId = null,
  "aria-label": ariaLabel,
  ...props
}: ServiceAssignmentGraphProps) {
  validateAssignmentIdentity(assignments);
  const selectedAssignment =
    assignments.find((assignment) => assignment.id === selectedAssignmentId) ??
    null;
  const effectiveSelectedAssignmentId = selectedAssignment?.id ?? null;
  const selectedAssignmentIndex =
    selectedAssignment === null
      ? -1
      : assignments.findIndex(
          (assignment) => assignment.id === selectedAssignment.id,
        );
  const longestChain = assignments.reduce(
    (longest, assignment) =>
      Math.max(longest, Math.max(assignment.candidates.length, 1)),
    1,
  );
  const canvasWidth = Math.max(
    720,
    candidateX + longestChain * (candidateWidth + candidateGap) + 32,
  );
  const canvasHeight = Math.max(
    480,
    rowStart + assignments.length * rowHeight + 32,
  );
  const returnFocusRef = useRef<{
    readonly assignmentId: string;
    readonly target: HTMLElement;
  } | null>(null);
  const focusInspectorForIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (
      effectiveSelectedAssignmentId === null ||
      focusInspectorForIdRef.current !== effectiveSelectedAssignmentId
    ) {
      return;
    }
    focusInspectorForIdRef.current = null;
    globalThis.document
      .getElementById(`${id}-inspector`)
      ?.querySelector<HTMLElement>(".od-graph-inspector-close")
      ?.focus();
  }, [effectiveSelectedAssignmentId, id]);

  function openFromList(
    assignmentId: string,
    trigger: HTMLButtonElement,
  ): void {
    returnFocusRef.current = { assignmentId, target: trigger };
    if (effectiveSelectedAssignmentId === assignmentId) {
      globalThis.document
        .getElementById(`${id}-inspector`)
        ?.querySelector<HTMLElement>(".od-graph-inspector-close")
        ?.focus();
      return;
    }
    focusInspectorForIdRef.current = assignmentId;
    onSelectionChange(assignmentId);
  }

  return (
    <div
      {...props}
      aria-label={ariaLabel}
      className={classes("od-service-assignment-graph", className)}
      data-service-assignment-graph="true"
      id={id}
      role={props.role ?? "group"}
    >
      <div className="od-service-assignment-visual">
        <GraphWorkspace aria-label={`${ariaLabel} visual graph`}>
          <GraphViewport
            aria-label="Assignment graph canvas"
            canvasHeight={canvasHeight}
            canvasProps={{
              "aria-label": `${assignmentCountLabel(assignments.length)} and their ordered candidate chains`,
            }}
            canvasWidth={canvasWidth}
          >
            {assignments.length === 0 ? (
              <GraphEmptyState
                description="Supply assignments to show this graph."
                icon={<span>0</span>}
                title="No assignments"
              />
            ) : null}
            <GraphEdges height={canvasHeight} width={canvasWidth}>
              {assignments.map((assignment, index) => {
                const y = rowStart + index * rowHeight;
                return (
                  <GraphEdge
                    dashed={assignment.candidates.length === 0}
                    key={assignment.id}
                    path={edgePath(y)}
                  />
                );
              })}
            </GraphEdges>
            {assignments.map((assignment, index) => {
              const selected = assignment.id === effectiveSelectedAssignmentId;
              const y = rowStart + index * rowHeight;
              return (
                <div key={assignment.id}>
                  <GraphNode
                    aria-controls={selected ? `${id}-inspector` : undefined}
                    aria-expanded={selected}
                    aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight Home End Escape"
                    aria-label={assignmentAriaLabel(assignment)}
                    data-service-assignment-node="true"
                    eyebrow={sourceLabel(assignment)}
                    id={`${id}-assignment-${String(index)}`}
                    meta={assignmentSummary(assignment)}
                    onClick={(event) => {
                      returnFocusRef.current = {
                        assignmentId: assignment.id,
                        target: event.currentTarget,
                      };
                      focusInspectorForIdRef.current = null;
                      onSelectionChange(assignment.id);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Escape" && selected) {
                        event.preventDefault();
                        returnFocusRef.current = null;
                        onSelectionChange(null);
                        return;
                      }
                      moveGraphFocus(event, index, assignments.length);
                    }}
                    selected={selected}
                    tabIndex={
                      selected ||
                      (effectiveSelectedAssignmentId === null && index === 0)
                        ? 0
                        : -1
                    }
                    title={assignment.name}
                    tone={sourceTone(assignment.source)}
                    x={assignmentX}
                    y={y}
                  />
                  <AssignmentCandidateChain
                    assignment={assignment}
                    style={{ left: candidateX, top: y }}
                  />
                </div>
              );
            })}
          </GraphViewport>
          {selectedAssignment === null ? null : (
            <AssignmentInspector
              actionsForAssignment={actionsForAssignment}
              assignment={selectedAssignment}
              getReturnFocusTarget={() =>
                returnFocusRef.current?.assignmentId === selectedAssignment.id
                  ? returnFocusRef.current.target
                  : null
              }
              id={id}
              onClose={() => {
                returnFocusRef.current = null;
                focusInspectorForIdRef.current = null;
                onSelectionChange(null);
              }}
              selectedNodeId={`${id}-assignment-${String(selectedAssignmentIndex)}`}
            />
          )}
        </GraphWorkspace>
      </div>
      <AssignmentList
        actionsForAssignment={actionsForAssignment}
        assignments={assignments}
        id={id}
        onOpenAssignment={openFromList}
        selectedAssignmentId={effectiveSelectedAssignmentId}
      />
    </div>
  );
}
