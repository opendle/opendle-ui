---
name: selfreview
description: Review shared UI, design-token, tooling, and instruction changes with a skeptical pass before commit or push.
---

# Self-review

Find defects before work leaves the repository.

1. Read `git status --short --branch`, the complete diff, and the affected
   source and skill files. Preserve work owned by another agent.
2. Check the user request, package exports, version metadata, license, public
   API stability, semantic HTML, keyboard access, focus, responsive behavior,
   and host-app boundaries.
3. Check that instructions are concise, progressive, and consistent. Check
   that a new script or gate cannot expose secrets or accept unsafe paths.
4. Use `BUGS`, `MISSING`, `RISKY`, and `NITPICKS`. Each finding must name a
   file and line, explain the trigger, and give a direct fix. Do not invent
   findings.
5. Run LSP diagnostics when available, focused tests, and
   `./scripts/check-repository.sh` after the last fix.

The review does not commit or push. The task owner reviews the final diff and
then performs the Git actions.
