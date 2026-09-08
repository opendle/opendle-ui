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
the package. `Dialog` supplies a controlled native modal with focus return,
fixed framing, local body scrolling, three desktop sizes, and a full phone
sheet. `ConfirmationDialog` composes it for an optional exact impact-statement
check. Host apps keep the target, effect, impact text, and mutation behavior.
`MediaLightbox` previews one host-owned image or PDF blob URL. The host owns
media-type policy, loading, URL revocation, and error handling. Host apps keep
their navigation, routes, product copy, mock data, and service behavior here.

Graph applications can compose `GraphWorkspace`, `GraphToolbar`,
`GraphViewport`, `GraphNode`, `GraphEdges`, `GraphEdge`, `GraphInspector`, and
`GraphEmptyState`. `PageSurface` gives pages one responsive gutter or one
edge-to-edge mode. `GraphViewport` can center an intrinsic tree canvas while
free-position canvases keep start alignment. `GraphInspector` manages initial
focus, Escape close, and focus return to the exact opening control. Its host
width selects a split panel, a non-modal overlay, or a modal bottom sheet.
Close and Escape request the host's `onClose` behavior. The host can keep the
inspector mounted during a pending write or a discard confirmation. The shared
component keeps its modal state and focus until the host removes it. Removal
uses the current return-focus reference or a connected graph fallback.
`GraphInspectorProps.onClose` is required. The heading always receives initial
focus; the removed `initialFocusRef` prop has no replacement. Use
`GraphWorkspace` or `RelationshipGraph` as the inspector host. The old unhosted
phone layout is removed. Hosts cannot set an inspector width or mode.
These are breaking API changes; all three host applications use the strict
contract. HTML and SVG return-focus references remain supported.

`GraphInspectorFacts`, `GraphInspectorFact`, `GraphInspectorSection`,
`GraphInspectorRows`, `GraphInspectorRow`, and `GraphInspectorNotice` supply
the compact semantic content structure. A host can change the inspector
activation key or supply a return-focus ref when the selected record changes
while the inspector stays mounted. `GraphControlElement` accepts native HTML
and SVG controls. `GraphWorkspace.selectedControlRef` uses that type to keep
the selected control visible beside an overlay. `GraphInspector.returnFocusRef`
uses the same type to return focus to the exact opener. Keep these references
separate when inspector navigation changes selection. Update the opener only
for an external open action. `GraphNode.ref` supplies its `HTMLButtonElement`;
`GraphEdge.ref` supplies its `SVGGElement`. Use callback refs to update the
selected-control reference during the DOM commit, before layout effects run.
Existing HTML-only references remain valid. The
`layoutTree`, `layoutLayeredDirectedGraph`, and
`treeEdgePath` helpers give host apps stable tree and multiple-parent graph
layouts without a graph-library dependency. Layouts run from top to bottom by
default. A host can request a left-to-right layout. The layered layout treats
items with no known parent as roots and rejects duplicate identifiers and
cycles. Host apps still own graph data, selection, editing, drag behavior, and
persistence.

Set `PageSurface.edgeToEdge` to `true` to give a graph the complete page width.
`GraphWorkspace`, `GraphToolbar`, and `RelationshipGraph` read the nearest
page mode. Each control row receives one shared responsive gutter. Its
physical left and right padding uses the larger of `--od-page-gutter` and
that side's safe area. The graph viewport has no page gutter. A nested
`PageSurface` with a false or omitted mode restores the normal page geometry.

Set `GraphWorkspace.fullPage` or `RelationshipGraph.fullPage` to `true` when
the host supplies a definite page height. The host calculates that height
from its dynamic viewport and persistent navigation. In edge mode, control
rows use their rendered height and the graph viewport receives the remaining
height. Large graph content scrolls in that viewport. Split inspectors use
one `21rem` column; overlays and sheets keep their independent shared insets.
Omit `fullPage` for a standalone graph with the existing bounded height.

An overlay inspector starts at the larger of `4.75rem` and the rendered end
of its graph toolbar or standalone search plus `0.875rem`. The shared package
updates this position when controls wrap or change size. Controls stay visible;
the inspector uses less height. Hosts do not supply an offset.

Text-only inspector details receive a Tab stop when they need local scrolling.
Details with a visible keyboard control keep their existing Tab order. When
the extra stop is no longer needed, it leaves the Tab order without moving
current focus. Overlay relationship boards keep enough trailing scroll space
to move the selected control beside the inspector.

The inspector keeps its header fixed when the natural header and footer leave
room for the content padding and one `2.75rem` control. If they do not fit,
the title, eyebrow, icon, and details scroll together. Close and footer actions
stay fixed. The default layout returns when it fits again. This shared rule
applies in all modes and keeps the same content, field values, focus, and
visible details position within the new scroll bounds. Hosts do not select
the scroll behavior.

`GraphNodeAction` places a labelled action beside a node inside the graph
canvas. Set `variant="text"` for visible text supplied as children. The default
`icon` variant keeps the compact circular shape. Text actions wrap long labels
within `20rem` and retain the minimum `2.75rem` target size. Both variants keep
their screen size when the host supplies the current `viewportZoom`. The host
supplies position, accessible name, action, and roving focus handlers. Use the
same host-controlled tab stop as the graph nodes.
The host owns selection, parent context, form state, and activation policy.

`RelationshipGraph` gives host applications one responsive three-column
relationship surface. Hosts name the columns and nodes, supply relationships,
compose contextual header actions and an optional inspector, and own all
record types and actions. The component supplies route search, decorative
connectors, persistent selection, route emphasis, unrelated-item dimming, and
the one-tab-stop arrow-key interaction. A column can contain peer nodes or
labelled compound groups. Each compound group keeps its header content and
nested row controls in one semantic group. Relationships can use a nested row
as an exact endpoint, and one row can connect to several controls in the next
column. Search keeps a matching group, its applicable rows, and connected
context. The component stacks its columns and keeps each group intact on a
phone. It keeps dense content in a labelled local viewport.
Set `RelationshipGraphGroup.headerActionable` to `false` when a group header
only names its nested rows. The group stays in search results and keeps its
state and content. It is not a relationship endpoint, selection target, or
keyboard target. Set `RelationshipGraphColumn.partialResult` to a labelled,
host-supplied action when a column has more results to load. A partial
no-result search focuses the first such action in column order. Use
`partialNoResultsTitle` and `partialNoResultsDescription` for the partial
search message. A complete no-result search focuses the clear-search action.
Column headers and supplied actions stay available when the graph is empty or
a search has no results. The optional selected-node inspector stays mounted
only while its selected node remains in the current graph. A host must clear
its inspector state when the selection change callback reports that the node
is unavailable. A host can supply one auxiliary inspector for a create form or
other action that does not have a selected node. It must not supply this
inspector together with an active selected-node inspector.
Supply `toolbar` when the graph must put host context and actions around its
search. `RelationshipGraph` keeps search in the center slot of the shared
`GraphToolbar`; `leading` and `actions` stay host-owned. Omit `toolbar` to keep
the standalone search surface.

`OperationPlayground` gives host applications one controlled, provider-neutral
surface for model, embedding, image, video, and audio operations. It supports
selectable and fixed-target modes. A fixed target identifies one assignment or
one exact provider-model and declares the exact control list for each supported
operation. It can stay visible when it becomes unavailable. The component
shows output, the selected route, latency, usage, cost, and corrective errors.
The host owns all API
calls, credentials, authorization, data access, routing, product copy, state,
and mutations.

Ontology clients can compose `ExplorerWorkspace`, `BoundedDataExplorer`,
`SavedViewCanvas`, `ChangeTimeline`, `OntologyInheritanceTree`,
`MetadataBagList`, `OntologyLabelList`, `ManagedFileList`, and
`ExplorerState`. These components accept bounded current records, canvas
positions, type relationships, metadata bags, labels, and file metadata. They
do not load data, store credentials, make authorization decisions, accept
executable queries, or own host routes. Host applications keep service keys in
their backends and supply current authorized data and controlled actions.

## Forms and input

`FormField`, `FieldHelp`, and `FieldError` connect a label, help text, an error,
and one control. `FormSection`, `FormActions`, and
`AdvancedFieldsDisclosure` supply responsive form structure. The host owns the
form state, validation rules, submission, and product text.

`SearchableSelect` supplies a controlled, filterable combobox. Each option has
a stable value and label. An option can also have a description, search text,
or a disabled state. The component supports arrow keys, Home, End, Enter, and
Escape. The host owns the current value and receives each committed option.

`InlineAlert` supplies a compact message for one form or action.
`SecretRevealPanel` supplies the show-once layout and copy interaction. The
host must keep the secret in memory, clear it at the correct time, and block an
unsafe route change. `FileDropZone` sends selected or dropped files to the
host. The host must check file type, size, and authorization. `DateTime`
supplies a valid `time` element, locale formatting, and a safe fallback for an
invalid value.

```tsx
<FormSection legend="Provider" columns={2}>
  <FormField
    label="Display name"
    help="Use a name that administrators can identify."
    requirement="required"
  >
    <input name="display_name" required />
  </FormField>
  <SearchableSelect
    label="Model"
    name="model"
    options={models}
    value={model}
    onChange={(value) => setModel(value)}
    required
  />
</FormSection>
```

The `designTokens` object maps `color.limeStrong`, `color.coralStrong`,
`color.amberStrong`, and `space.pageGutter` to the matching CSS custom
properties.

`ServiceAssignmentGraph` and its private keyboard helper were removed. A
search of the sibling repositories found no production consumer. Use
`RelationshipGraph` for a shared relationship view. Keep a product-specific
configuration graph in its host. This removal is the breaking change in
OpenDLE UI 0.2.0.

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
