#!/usr/bin/env bash

set -euo pipefail

usage() {
  echo "Usage: scripts/dependency-age-gate.sh [lock|check|sync]" >&2
}

action="${1:-check}"
minimum_age_days="${OPENDLE_UI_DEPENDENCY_MIN_AGE_DAYS:-14}"

if ! [[ "${minimum_age_days}" =~ ^[0-9]+$ ]] || [[ "${minimum_age_days}" -lt 14 ]]; then
  echo "OPENDLE_UI_DEPENDENCY_MIN_AGE_DAYS must be an integer of 14 or more." >&2
  exit 2
fi

repository_root="$(git rev-parse --show-toplevel)"

case "${action}" in
  lock)
    npm install --prefix "${repository_root}" --package-lock-only \
      --ignore-scripts --no-audit --no-fund \
      --min-release-age="${minimum_age_days}"
    ;;
  check)
    if [[ ! -f "${repository_root}/package-lock.json" ]]; then
      echo "package-lock.json is missing. Run the lock action first." >&2
      exit 1
    fi
    npm ci --prefix "${repository_root}" --dry-run \
      --ignore-scripts --no-audit --no-fund \
      --min-release-age="${minimum_age_days}"
    ;;
  sync)
    if [[ ! -f "${repository_root}/package-lock.json" ]]; then
      echo "package-lock.json is missing. Run the lock action first." >&2
      exit 1
    fi
    npm ci --prefix "${repository_root}" \
      --ignore-scripts --no-audit --no-fund \
      --min-release-age="${minimum_age_days}"
    ;;
  -h|--help|help)
    usage
    ;;
  *)
    usage
    exit 2
    ;;
esac

echo "Dependency age gate used a minimum age of ${minimum_age_days} days."
