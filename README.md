# OpenDLE UI

OpenDLE UI is the shared React framework and design system for the
[llmrouter](https://github.com/tubededentifrice/llmrouter),
[ontology](https://github.com/tubededentifrice/ontology), and
[xbot](https://github.com/tubededentifrice/xbot) projects.

## Scope

This repository owns shared design tokens, accessible React primitives,
composition patterns, and frontend quality tools. Host applications own
product behavior, routing, data access, and service integration.

The package starts as `@opendle/ui`. Add a shared primitive here when it could
be reused by another host project. Do not wait for a second caller. Keep the
public API small and test the user-visible behavior.

The package includes accessible primitives and composition components such as
application shells, grouped navigation, buttons, icon buttons, cards, page
headings, context items, statistic cards, route steps, workspace and account
selectors, navigation items, panels, attention rows, health bars, review-plan
cards, agent sidebars, calendar boards, status indicators, and error
boundaries. `DataTable` supplies a host-controlled, bounded table with
responsive phone cards, sorting, selection, details, safe row actions, and
incremental loading. `EditableTable` builds controlled read, edit, create,
validation, save, delete, and scoped reorder behavior on `DataTable`. Host
apps keep drafts, records, API calls, permissions, and product copy outside
the package. `ConfirmationDialog` supplies an accessible modal
confirmation and an optional exact impact-statement check. Host apps keep the
target, effect, impact text, and mutation behavior. `MediaLightbox` previews one
host-owned image or PDF blob URL. The host owns media-type policy, loading,
URL revocation, and error handling. Host apps keep
their navigation, routes, product copy, mock data, and service behavior here.

Graph applications can compose `GraphWorkspace`, `GraphToolbar`,
`GraphViewport`, `GraphNode`, `GraphEdges`, `GraphEdge`, `GraphInspector`, and
`GraphEmptyState`. `PageSurface` gives pages one responsive gutter or one
edge-to-edge mode. `GraphViewport` can center an intrinsic tree canvas while
free-position canvases keep start alignment. `GraphInspector` manages initial
focus, Escape close, and focus return to the exact opening control. A host can
change its activation key or supply a return-focus ref when the selected record
changes while the inspector stays mounted. The
`layoutTree`, `layoutLayeredDirectedGraph`, and
`treeEdgePath` helpers give host apps stable tree and multiple-parent graph
layouts without a graph-library dependency. Layouts run from top to bottom by
default. A host can request a left-to-right layout. The layered layout treats
items with no known parent as roots and rejects duplicate identifiers and
cycles. Host apps still own graph data, selection, editing, drag behavior, and
persistence.

`ServiceAssignmentGraph` gives service-scoped assignment views one controlled
graph, side inspector, and accessible list. It shows direct, inherited,
implicit-default, empty-chain, and unconfigured states. Hosts supply the
effective ordered candidates, last-use text, observed requirements, actions,
and all product behavior.

`OperationPlayground` gives host applications one controlled, provider-neutral
surface for model, embedding, image, video, and audio operations. It supports
an assignment or exact provider-model selection and shows output, the selected
route, latency, usage, cost, and corrective errors. The host owns all API
calls, credentials, data access, routing, product copy, state, and mutations.

Ontology clients can compose `ExplorerWorkspace`, `BoundedDataExplorer`,
`SavedViewCanvas`, `ChangeTimeline`, `OntologyInheritanceTree`,
`MetadataBagList`, `OntologyLabelList`, `ManagedFileList`, and
`ExplorerState`. These components accept bounded current records, canvas
positions, type relationships, metadata bags, labels, and file metadata. They
do not load data, store credentials, make authorization decisions, accept
executable queries, or own host routes. Host applications keep service keys in
their backends and supply current authorized data and controlled actions.

Typography uses the Xbot design as the source of truth: Aptos for body text,
Aptos Display for headings, and Aptos Mono with system fallbacks for technical
text. Use the `--od-*` tokens instead of adding a host-specific font system.

The three host applications use the `main` branch of this Git repository. This
keeps all apps on the current shared package without release coordination or
package version updates. The Git dependency is an intentional exception to
host dependency age and exact-version checks. Keep the built `dist/` files in
Git because host installs can use `npm ci --ignore-scripts`.

Host projects run `scripts/build-consumer.mjs` before development, build,
typecheck, and test commands. The helper builds local shared source, updates a
local installed copy when needed, and checks the required public exports. It
also serializes concurrent host builds so no host reads partial output.

## Development

```sh
npm install
npm run format:check
npm run lint
npm run typecheck
npm run build
npm test
./scripts/check-repository.sh
```

The repository check also runs the 14-day dependency policy, dependency audit,
and React Doctor. React Doctor must report score 100 with zero diagnostics.

Read [`AGENTS.md`](AGENTS.md) before work. Use the skills in
[`.claude/skills/`](.claude/skills/) for design-system work, repository
tooling, and self-review.

## License

This project uses the Functional Source License, Version 1.1, ALv2 Future
License (`FSL-1.1-ALv2`). Each version receives the Apache License 2.0 on the
second anniversary of the date that version is made available. See
[`LICENSE.md`](LICENSE.md).
