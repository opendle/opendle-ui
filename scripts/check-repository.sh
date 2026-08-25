#!/usr/bin/env bash

set -euo pipefail

repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repository_root"

if [[ "$(node --version)" != "v24.17.0" ]]; then
  echo "Node.js 24.17.0 is required." >&2
  exit 1
fi
if [[ "$(npm --version)" != "11.18.0" ]]; then
  echo "npm 11.18.0 is required." >&2
  exit 1
fi

required_files=(
  "AGENTS.md"
  "README.md"
  "LICENSE.md"
  ".editorconfig"
  ".gitattributes"
  ".gitignore"
  ".npmrc"
  "eslint.config.mjs"
  "package.json"
  "package-lock.json"
  "react-doctor.config.json"
  "renovate.json"
  "tsconfig.json"
  "tsconfig.build.json"
  "src/index.tsx"
  "src/OntologyExplorerContract.ts"
  "dist/index.js"
  "dist/index.d.ts"
  "styles/tokens.css"
  "scripts/ontology-explorer-browser.mjs"
  "scripts/dialog-playground-browser.mjs"
  "scripts/build-consumer.mjs"
  "scripts/check-react-doctor-report.mjs"
  "scripts/dependency-age-gate.sh"
  "scripts/react-doctor-gate.sh"
  "scripts/tests/fixtures/react-doctor-invalid.json"
  ".claude/skills/design-system/SKILL.md"
  ".claude/skills/repository-tooling/SKILL.md"
  ".claude/skills/selfreview/SKILL.md"
)

for required_file in "${required_files[@]}"; do
  test -f "$required_file" || { echo "Missing required file: $required_file" >&2; exit 1; }
done

for required_executable in scripts/*.sh; do
  if [[ ! -x "${required_executable}" ]]; then
    echo "Required executable is not executable: ${required_executable}" >&2
    exit 1
  fi
  bash -n "${required_executable}"
done

grep -Fqx "Copyright 2026 tubededentifrice" LICENSE.md
grep -Fq '"license": "FSL-1.1-ALv2"' package.json
grep -Fq 'FSL-1.1-ALv2' README.md
grep -Fq 'export const OPENDLE_UI_VERSION' src/index.tsx
node --check scripts/build-consumer.mjs
node --check scripts/check-react-doctor-report.mjs
node --check scripts/ontology-explorer-browser.mjs
node --check scripts/dialog-playground-browser.mjs
node --input-type=module -e "import('./dist/index.js').then((shared) => { for (const name of ['AccountMenu', 'BoundedDataExplorer', 'ChangeTimeline', 'Dialog', 'ExplorerWorkspace', 'ManagedFileList', 'MetadataBagList', 'OntologyInheritanceTree', 'OperationPlayground', 'ReviewPlanCard', 'SavedViewCanvas', 'WorkspaceSelector']) if (!(name in shared)) throw new Error('Missing shared export: ' + name); })"

grep -qx "min-release-age=14" .npmrc
grep -q 'OPENDLE_UI_DEPENDENCY_MIN_AGE_DAYS:-14' scripts/dependency-age-gate.sh
jq -e . react-doctor.config.json >/dev/null
jq -e . renovate.json >/dev/null

./scripts/dependency-age-gate.sh check
if OPENDLE_UI_DEPENDENCY_MIN_AGE_DAYS=13 ./scripts/dependency-age-gate.sh check >/dev/null 2>&1; then
  echo "The dependency age expected-failure check passed unexpectedly." >&2
  exit 1
fi
if ./scripts/dependency-age-gate.sh unsafe-action >/dev/null 2>&1; then
  echo "The dependency age unsafe-input check passed unexpectedly." >&2
  exit 1
fi
if node scripts/check-react-doctor-report.mjs scripts/tests/fixtures/react-doctor-invalid.json >/dev/null 2>&1; then
  echo "The React Doctor expected-failure fixture passed unexpectedly." >&2
  exit 1
fi
if node scripts/check-react-doctor-report.mjs >/dev/null 2>&1; then
  echo "The React Doctor missing-input check passed unexpectedly." >&2
  exit 1
fi

npm run format:check
npm run lint
npm run typecheck
npm test
npm run test:browser
npm run security
./scripts/react-doctor-gate.sh

git diff --check
git diff --cached --check

echo "Repository checks passed."
