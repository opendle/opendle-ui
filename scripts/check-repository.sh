#!/usr/bin/env bash

set -euo pipefail

repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repository_root"

if [[ "$(node --version)" != "v24.17.0" ]]; then
  echo "Node.js 24.17.0 is required." >&2
  exit 1
fi

required_files=(
  "AGENTS.md"
  "README.md"
  "LICENSE.md"
  ".editorconfig"
  ".gitattributes"
  ".gitignore"
  "package.json"
  "tsconfig.json"
  "tsconfig.build.json"
  "src/index.tsx"
  "dist/index.js"
  "dist/index.d.ts"
  "styles/tokens.css"
  "scripts/build-consumer.mjs"
  ".claude/skills/design-system/SKILL.md"
  ".claude/skills/repository-tooling/SKILL.md"
  ".claude/skills/selfreview/SKILL.md"
)

for required_file in "${required_files[@]}"; do
  test -f "$required_file" || { echo "Missing required file: $required_file" >&2; exit 1; }
done

grep -Fqx "Copyright 2026 tubededentifrice" LICENSE.md
grep -Fq '"license": "FSL-1.1-ALv2"' package.json
grep -Fq 'FSL-1.1-ALv2' README.md
grep -Fq 'export const OPENDLE_UI_VERSION' src/index.tsx
node --check scripts/build-consumer.mjs
node --input-type=module -e "import('./dist/index.js').then((shared) => { for (const name of ['AccountMenu', 'ReviewPlanCard', 'WorkspaceSelector']) if (!(name in shared)) throw new Error('Missing shared export: ' + name); })"

echo "Repository checks passed."
