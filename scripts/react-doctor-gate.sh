#!/usr/bin/env bash

set -euo pipefail

repository_root="$(git rev-parse --show-toplevel)"
report="$(mktemp)"
trap 'rm -f -- "${report}"' EXIT
cd "${repository_root}"

node scripts/check-react-doctor-runtime.mjs
npm run --silent react-doctor >"${report}"

node "${repository_root}/scripts/check-react-doctor-report.mjs" "${report}"
