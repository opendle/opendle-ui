# OpenDLE UI

OpenDLE UI is the shared React framework and design system for the
[llmrouter](https://github.com/tubededentifrice/llmrouter),
[ontology](https://github.com/tubededentifrice/ontology), and
[xbot](https://github.com/tubededentifrice/xbot) projects.

## Scope

This repository owns shared design tokens, accessible React primitives,
composition patterns, and frontend quality tools. Host applications own
product behavior, routing, data access, and service integration.

The package starts as `@opendle/ui`. Add a shared primitive here when at least
two host projects need the same behavior. Keep the public API small and test
the user-visible behavior.

The three host applications use the `main` branch of this Git repository. This
keeps all apps on the current shared package without release coordination or
package version updates. The Git dependency is an intentional exception to
host dependency age and exact-version checks. Keep the built `dist/` files in
Git because host installs can use `npm ci --ignore-scripts`.

## Development

```sh
npm install
npm run typecheck
npm run build
npm test
./scripts/check-repository.sh
```

Read [`AGENTS.md`](AGENTS.md) before work. Use the skills in
[`.claude/skills/`](.claude/skills/) for design-system work, repository
tooling, and self-review.

## License

This project uses the Functional Source License, Version 1.1, ALv2 Future
License (`FSL-1.1-ALv2`). Each version receives the Apache License 2.0 on the
second anniversary of the date that version is made available. See
[`LICENSE.md`](LICENSE.md).
