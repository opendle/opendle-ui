import { useId, type HTMLAttributes, type ReactNode } from "react";

import {
  ONTOLOGY_TYPE_LIMIT,
  assertApiName,
  assertBoundedItems,
  assertIdentifier,
  assertTextMaximum,
  assertUniqueIdentifiers,
  type OntologyTypeDefinition,
} from "../OntologyExplorerContract.js";
import { layoutLayeredDirectedGraph, treeEdgePath } from "../GraphLayout.js";
import {
  GraphEdge,
  GraphEdges,
  GraphNode,
  GraphViewport,
} from "./GraphWorkspace.js";

export interface OntologyInheritanceTreeProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "children" | "onSelect" | "title"
> {
  readonly title: ReactNode;
  readonly description?: ReactNode;
  readonly definitions: readonly OntologyTypeDefinition[];
  readonly selectedApiName?: string;
  readonly onSelect?: (definition: OntologyTypeDefinition) => void;
  readonly empty?: ReactNode;
}

function layoutDefinitions(definitions: readonly OntologyTypeDefinition[]) {
  const result = layoutLayeredDirectedGraph(
    definitions.map((definition) => ({
      id: definition.apiName,
      parentIds: definition.parentTypes,
    })),
    { horizontalGap: 72, padding: 48, verticalGap: 48 },
  );
  return {
    ...result,
    height: Math.max(420, result.height),
    width: Math.max(760, result.width),
  };
}

/** A top-to-bottom view of additive object-type inheritance. */
export function OntologyInheritanceTree({
  className,
  definitions,
  description,
  empty,
  onSelect,
  selectedApiName,
  title,
  ...props
}: OntologyInheritanceTreeProps) {
  assertBoundedItems(
    "Ontology type definitions",
    definitions,
    ONTOLOGY_TYPE_LIMIT,
  );
  assertUniqueIdentifiers(
    "Ontology type API name",
    definitions.map((definition) => definition.apiName),
  );
  const names = new Set(definitions.map((definition) => definition.apiName));
  for (const definition of definitions) {
    assertApiName("Ontology type API name", definition.apiName);
    assertIdentifier("Ontology type title", definition.title);
    assertTextMaximum("Ontology type title", definition.title, 200);
    assertBoundedItems("Ontology parent types", definition.parentTypes, 20);
    assertUniqueIdentifiers("Ontology parent type", definition.parentTypes);
    for (const parent of definition.parentTypes) {
      assertApiName("Ontology parent type", parent);
    }
    if (definition.parentTypes.some((parent) => !names.has(parent))) {
      throw new TypeError("An ontology parent type is absent from the input.");
    }
  }
  const titleId = useId();
  const descriptionId = useId();
  const layout = layoutDefinitions(definitions);
  const positionById = new Map(layout.nodes.map((node) => [node.id, node]));
  return (
    <section
      {...props}
      aria-describedby={description ? descriptionId : undefined}
      aria-labelledby={titleId}
      className={["od-ontology-tree", className].filter(Boolean).join(" ")}
    >
      <header className="od-ontology-tree-heading">
        <h2 id={titleId}>{title}</h2>
        {description ? <p id={descriptionId}>{description}</p> : null}
      </header>
      {definitions.length === 0 ? (
        <output className="od-ontology-tree-empty">{empty}</output>
      ) : (
        <>
          <div className="od-ontology-tree-graph">
            <GraphViewport
              aria-label="Top-to-bottom ontology inheritance graph"
              canvasHeight={layout.height}
              canvasProps={{ "aria-label": "Object types and inheritance" }}
              canvasWidth={layout.width}
            >
              <GraphEdges aria-label="Inheritance relationships" role="group">
                {layout.edges.map((edge) => {
                  const start = positionById.get(edge.sourceId);
                  const end = positionById.get(edge.targetId);
                  return start && end ? (
                    <GraphEdge key={edge.id} path={treeEdgePath(start, end)} />
                  ) : null;
                })}
              </GraphEdges>
              {definitions.map((definition) => {
                const position = positionById.get(definition.apiName);
                if (!position) return null;
                const relationship =
                  definition.parentTypes.length === 0
                    ? "Root type"
                    : `Parents: ${definition.parentTypes.join(", ")}`;
                return (
                  <GraphNode
                    aria-label={
                      onSelect
                        ? `Open ${definition.title}. ${relationship}`
                        : `${definition.title}. ${relationship}`
                    }
                    disabled={!onSelect}
                    eyebrow={
                      definition.deprecated
                        ? "Deprecated type"
                        : definition.inherited
                          ? "Inherited type"
                          : "Local type"
                    }
                    key={definition.apiName}
                    meta={definition.apiName}
                    onClick={
                      onSelect
                        ? () => {
                            onSelect(definition);
                          }
                        : undefined
                    }
                    root={definition.parentTypes.length === 0}
                    selected={selectedApiName === definition.apiName}
                    title={definition.title}
                    tone={definition.deprecated ? "amber" : "blue"}
                    x={position.x}
                    y={position.y}
                  />
                );
              })}
            </GraphViewport>
          </div>
          <ol className="od-ontology-tree-list">
            {definitions.map((definition) => (
              <li key={definition.apiName}>
                {onSelect ? (
                  <button
                    aria-pressed={selectedApiName === definition.apiName}
                    onClick={() => {
                      onSelect(definition);
                    }}
                    type="button"
                  >
                    <strong>{definition.title}</strong>
                    <code>{definition.apiName}</code>
                  </button>
                ) : (
                  <span>
                    <strong>{definition.title}</strong>
                    <code>{definition.apiName}</code>
                  </span>
                )}
                <span>
                  {definition.parentTypes.length === 0
                    ? "Root type"
                    : `Parents: ${definition.parentTypes.join(", ")}`}
                </span>
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  );
}
