---
name: design-system
description: Add or update shared OpenDLE React design tokens, accessible primitives, and composition patterns without duplicating host-app behavior. Use for frontend consistency work.
---

# Shared design system

Keep one design language across `llmrouter`, `ontology`, and `xbot`.

## Workflow

1. Read `AGENTS.md`, inspect the host use cases, and check current exports.
2. Put reusable tokens in `styles/` and reusable TypeScript or React code in
   `src/`. Keep product copy, routing, data access, and service rules in the
   host repository.
3. Prefer semantic HTML, keyboard access, visible focus, labelled controls,
   predictable states, and responsive layouts.
4. Keep APIs small. Add a test for each public behavior and document a
   breaking change before release.
5. Use LSP diagnostics and the package type check. Run the repository check.

## Avoid duplication

If a host app needs a local exception, record why it cannot be shared. Do not
copy a shared component only to change its color, spacing, or label. Extend
tokens or use composition when the behavior remains shared.

For detailed component patterns, add a focused reference under this skill.
Do not make `AGENTS.md` a component catalogue.
