# Agent instructions

These instructions apply to the complete repository.

## Mission

Build the shared React package for the OpenDLE projects. Keep design tokens,
accessible primitives, composition patterns, and frontend tooling here so
`llmrouter`, `ontology`, and `xbot` do not copy them.

Do not put product rules, service data, secrets, credentials, or private user
data in this repository. Keep this package independent of any one host app.

## Working rules

1. Read this file and `README.md` before a change.
2. Inspect `git status --short --branch`. Preserve work that you do not own.
3. Use LSP tools for symbols, references, diagnostics, renames, formatting, and
   safe edit previews when they apply. Use `rg`, Git, and shell tools for broad
   search and commands.
4. Keep components semantic, keyboard accessible, responsive, and usable with
   a screen reader. Add tests for public behavior.
5. Do not copy a component into a host app. Add or improve the shared package
   when two projects need the same design behavior.
6. Use the `design-system` skill for design work and
   `repository-tooling` for repeatable agent or test friction.
7. Keep this file limited to durable policy. Put detailed workflows in skills
   and deterministic work in `scripts/`.
8. Use ASD-STE100 Simplified Technical English in reports, documentation,
   pull requests, comments, and agent-created content.
9. Run the self-review skill and `./scripts/check-repository.sh` before commit.

## Agent improvement

Agents may improve these instructions, skills, scripts, and checks when they
find repeated friction or a missing guard. Keep changes small and reusable.
Use progressive disclosure: put only durable rules here, put the workflow in
one skill, and put large examples or references in a linked file. Test a new
tool for success, expected failure, and unsafe input. Do not weaken a check to
make a task pass.

Agents may delegate independent inspection or validation to subagents. The
owner agent reviews the complete diff, owns Git actions, and integrates only
valid work.

## Shared package rules

- Put public TypeScript exports in `src/`.
- Put shared CSS tokens in `styles/`.
- Keep host-specific layout, routing, data access, and product copy in the
  calling repository.
- Use stable, accessible APIs. Document breaking changes before release.
- Keep React as a peer dependency so host applications control one React copy.

## Concurrent work and Git

Other agents can change these repositories at the same time.

- Do not reset, discard, overwrite, or reformat work that you do not own.
- Stage explicit paths. Use focused commits with a clear reason.
- Reconcile new `origin/main` changes before integration. Preserve both valid
  changes. Never force-push or rewrite shared history.
- When the task is complete and checks pass, commit owned changes and push
  local `main` to `origin/main`.
