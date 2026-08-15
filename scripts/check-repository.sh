#!/usr/bin/env bash

set -euo pipefail

repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repository_root"

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
  "src/index.ts"
  "styles/tokens.css"
  ".claude/skills/design-system/SKILL.md"
  ".claude/skills/repository-tooling/SKILL.md"
  ".claude/skills/selfreview/SKILL.md"
)

for required_file in "${required_files[@]}"; do
  test -f "$required_file" || { echo "Missing required file: $required_file" >&2; exit 1; }
done

grep -Fqx "Copyright 2026 tubededentifrice" LICENSE.md
grep -Fqx '"license": "FSL-1.1-ALv2"' package.json
grep -Fq 'FSL-1.1-ALv2' README.md
grep -Fq 'export const OPENDLE_UI_VERSION' src/index.ts

echo "Repository checks passed."
