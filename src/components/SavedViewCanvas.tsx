import {
  useRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";

import {
  ONTOLOGY_GRAPH_LIMIT,
  assertBoundedItems,
  assertFiniteNumber,
  assertIdentifier,
  assertTextMaximum,
  assertUniqueIdentifiers,
  moveCanvasPosition,
  validateOntologyRecordSummary,
  type OntologyCanvasPosition,
  type OntologyGraphLink,
  type OntologyGraphObject,
} from "../OntologyExplorerContract.js";
import {
  GraphEdge,
  GraphEdges,
  GraphNode,
  GraphViewport,
  GraphWorkspace,
} from "./GraphWorkspace.js";

export interface SavedViewCanvasProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "children" | "onSelect"
> {
  readonly objects: readonly OntologyGraphObject[];
  readonly links: readonly OntologyGraphLink[];
  readonly positions: readonly OntologyCanvasPosition[];
  readonly canvasWidth: number;
  readonly canvasHeight: number;
  readonly selectedKey?: string;
  readonly toolbar?: ReactNode;
  readonly inspector?: ReactNode;
  readonly onSelect?: (record: OntologyGraphObject | OntologyGraphLink) => void;
  readonly onPositionChange?: (position: OntologyCanvasPosition) => void;
  readonly empty?: ReactNode;
}

function validateCanvas(props: SavedViewCanvasProps) {
  assertBoundedItems("Saved-view objects", props.objects, ONTOLOGY_GRAPH_LIMIT);
  assertBoundedItems("Saved-view links", props.links, ONTOLOGY_GRAPH_LIMIT);
  assertBoundedItems(
    "Saved-view records",
    [...props.objects, ...props.links],
    ONTOLOGY_GRAPH_LIMIT,
  );
  assertBoundedItems(
    "Saved-view positions",
    props.positions,
    ONTOLOGY_GRAPH_LIMIT,
  );
  assertUniqueIdentifiers(
    "Saved-view object key",
    props.objects.map((item) => item.key),
  );
  assertUniqueIdentifiers(
    "Saved-view link key",
    props.links.map((item) => item.key),
  );
  assertUniqueIdentifiers(
    "Saved-view record key",
    [...props.objects, ...props.links].map((item) => item.key),
  );
  assertUniqueIdentifiers(
    "Saved-view positioned object key",
    props.positions.map((item) => item.objectKey),
  );
  assertFiniteNumber("Canvas width", props.canvasWidth);
  assertFiniteNumber("Canvas height", props.canvasHeight);
  if (props.canvasWidth <= 0 || props.canvasHeight <= 0) {
    throw new RangeError("Saved-view canvas dimensions must be positive.");
  }
  const maximumX = Math.max(0, props.canvasWidth - 192);
  const maximumY = Math.max(0, props.canvasHeight - 72);
  const objectKeys = new Set(props.objects.map((item) => item.key));
  for (const object of props.objects) {
    validateOntologyRecordSummary(object, "object");
  }
  for (const link of props.links) {
    validateOntologyRecordSummary(link, "link");
  }
  if (props.positions.length !== props.objects.length) {
    throw new TypeError(
      "Each saved-view object must have one canvas position.",
    );
  }
  for (const position of props.positions) {
    assertTextMaximum(
      "Saved-view positioned object key",
      position.objectKey,
      200,
    );
    assertFiniteNumber("Canvas x", position.x);
    assertFiniteNumber("Canvas y", position.y);
    if (
      position.x < 0 ||
      position.y < 0 ||
      position.x > maximumX ||
      position.y > maximumY
    ) {
      throw new RangeError("A saved-view position is outside the canvas.");
    }
    if (!objectKeys.has(position.objectKey)) {
      throw new TypeError("A saved-view position names an absent object.");
    }
  }
  for (const link of props.links) {
    assertIdentifier("Saved-view link endpoint", link.endpointA);
    assertIdentifier("Saved-view link endpoint", link.endpointB);
    assertTextMaximum("Saved-view link endpoint", link.endpointA, 200);
    assertTextMaximum("Saved-view link endpoint", link.endpointB, 200);
    if (!objectKeys.has(link.endpointA) || !objectKeys.has(link.endpointB)) {
      throw new TypeError(
        "A saved-view link endpoint is absent from the page.",
      );
    }
    const direction: unknown = link.direction;
    if (
      direction !== "a_to_b" &&
      direction !== "b_to_a" &&
      direction !== "bidirectional"
    ) {
      throw new TypeError("A saved-view link direction is invalid.");
    }
  }
}

function edgePath(
  start: OntologyCanvasPosition,
  end: OntologyCanvasPosition,
): string {
  const startX = start.x + 96;
  const startY = start.y + 36;
  const endX = end.x + 96;
  const endY = end.y + 36;
  const middleX = (startX + endX) / 2;
  return `M ${String(startX)} ${String(startY)} C ${String(middleX)} ${String(startY)}, ${String(middleX)} ${String(endY)}, ${String(endX)} ${String(endY)}`;
}

/** A controlled graph for current records and saved-view canvas positions. */
export function SavedViewCanvas(props: SavedViewCanvasProps) {
  validateCanvas(props);
  const {
    canvasHeight,
    canvasWidth,
    className,
    empty,
    inspector,
    links,
    objects,
    onPositionChange,
    onSelect,
    positions,
    selectedKey,
    toolbar,
    ...elementProps
  } = props;
  const positionByKey = new Map(
    positions.map((position) => [position.objectKey, position]),
  );
  const pointerDrag = useRef<{
    readonly pointerId: number;
    readonly startClientX: number;
    readonly startClientY: number;
    readonly startPosition: OntologyCanvasPosition;
    readonly objectKey: string;
    moved: boolean;
  } | null>(null);
  const suppressClick = useRef<string | null>(null);

  function movedPosition(
    position: OntologyCanvasPosition,
    deltaX: number,
    deltaY: number,
  ): OntologyCanvasPosition {
    return {
      objectKey: position.objectKey,
      x: Math.min(
        Math.max(0, canvasWidth - 192),
        Math.max(0, position.x + deltaX),
      ),
      y: Math.min(
        Math.max(0, canvasHeight - 72),
        Math.max(0, position.y + deltaY),
      ),
    };
  }

  function handlePointerDown(
    event: PointerEvent<HTMLButtonElement>,
    object: OntologyGraphObject,
  ) {
    if (!onPositionChange || event.button !== 0) return;
    const startPosition = positionByKey.get(object.key);
    if (!startPosition) return;
    suppressClick.current = null;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointerDrag.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startPosition,
      objectKey: object.key,
      moved: false,
    };
  }

  function handlePointerMove(event: PointerEvent<HTMLButtonElement>) {
    const drag = pointerDrag.current;
    if (drag?.pointerId !== event.pointerId || !onPositionChange) return;
    event.preventDefault();
    if (
      event.clientX !== drag.startClientX ||
      event.clientY !== drag.startClientY
    ) {
      drag.moved = true;
    }
    onPositionChange(
      movedPosition(
        drag.startPosition,
        event.clientX - drag.startClientX,
        event.clientY - drag.startClientY,
      ),
    );
  }

  function releasePointer(event: PointerEvent<HTMLButtonElement>) {
    pointerDrag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handlePointerUp(event: PointerEvent<HTMLButtonElement>) {
    const drag = pointerDrag.current;
    if (drag?.pointerId !== event.pointerId) return;
    suppressClick.current = drag.moved ? drag.objectKey : null;
    if (drag.moved) {
      globalThis.setTimeout(() => {
        if (suppressClick.current === drag.objectKey) {
          suppressClick.current = null;
        }
      }, 0);
    }
    releasePointer(event);
  }

  function handlePointerCancel(event: PointerEvent<HTMLButtonElement>) {
    if (pointerDrag.current?.pointerId !== event.pointerId) return;
    suppressClick.current = null;
    releasePointer(event);
  }

  function handleNodeKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    object: OntologyGraphObject,
  ) {
    if (!onPositionChange || !event.key.startsWith("Arrow")) return;
    if (
      event.key !== "ArrowLeft" &&
      event.key !== "ArrowRight" &&
      event.key !== "ArrowUp" &&
      event.key !== "ArrowDown"
    ) {
      return;
    }
    const position = positionByKey.get(object.key);
    if (!position) return;
    event.preventDefault();
    onPositionChange(
      moveCanvasPosition(position, event.key, {
        maximumX: Math.max(0, canvasWidth - 192),
        maximumY: Math.max(0, canvasHeight - 72),
        step: event.shiftKey ? 36 : 12,
      }),
    );
  }

  return (
    <GraphWorkspace
      {...elementProps}
      className={["od-saved-view-canvas", className].filter(Boolean).join(" ")}
      inspector={inspector}
      toolbar={toolbar}
    >
      {objects.length === 0 ? (
        <output className="od-saved-view-empty">{empty}</output>
      ) : (
        <GraphViewport
          aria-label={`Saved view with ${String(objects.length)} objects and ${String(links.length)} links`}
          canvasHeight={canvasHeight}
          canvasProps={{ "aria-label": "Current saved-view graph" }}
          canvasWidth={canvasWidth}
        >
          <GraphEdges aria-label="Current links" role="group">
            {links.map((link) => {
              const start = positionByKey.get(link.endpointA);
              const end = positionByKey.get(link.endpointB);
              if (!start || !end) return null;
              const directionLabel =
                link.direction === "a_to_b"
                  ? "A → B"
                  : link.direction === "b_to_a"
                    ? "B → A"
                    : "A ↔ B";
              return (
                <GraphEdge
                  aria-label={`Open ${link.displayTitle}`}
                  key={link.key}
                  onSelect={
                    onSelect
                      ? () => {
                          onSelect(link);
                        }
                      : undefined
                  }
                  label={directionLabel}
                  labelX={(start.x + end.x) / 2 + 96}
                  labelY={(start.y + end.y) / 2 + 24}
                  path={edgePath(start, end)}
                  selected={selectedKey === link.key}
                />
              );
            })}
          </GraphEdges>
          {objects.map((object) => {
            const position = positionByKey.get(object.key);
            if (!position) return null;
            return (
              <GraphNode
                aria-label={
                  onPositionChange
                    ? `${object.displayTitle}. Drag it or use arrow keys to move it.`
                    : onSelect
                      ? `Open ${object.displayTitle}`
                      : object.displayTitle
                }
                disabled={!onSelect && !onPositionChange}
                eyebrow={object.type}
                key={object.key}
                meta={object.key}
                onClick={
                  onSelect
                    ? () => {
                        if (suppressClick.current === object.key) {
                          suppressClick.current = null;
                          return;
                        }
                        onSelect(object);
                      }
                    : undefined
                }
                onKeyDown={(event) => {
                  handleNodeKeyDown(event, object);
                }}
                onPointerCancel={handlePointerCancel}
                onPointerDown={(event) => {
                  handlePointerDown(event, object);
                }}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                selected={selectedKey === object.key}
                title={object.displayTitle}
                tone="lime"
                x={position.x}
                y={position.y}
              />
            );
          })}
        </GraphViewport>
      )}
    </GraphWorkspace>
  );
}
