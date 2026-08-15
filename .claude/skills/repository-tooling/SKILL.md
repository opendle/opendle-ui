---
name: repository-tooling
description: Build or improve durable repository tools, quality gates, and concise agent guidance when repeated work or missing checks slows delivery.
---

# Improve repository tooling

Turn repeated friction into a repository capability.

1. Use the smallest useful mechanism: a deterministic script, a regression
   test or gate, a skill for judgment, or a nested `AGENTS.md` for local rules.
2. Make scripts repeatable, non-interactive, clear on failure, and safe with
   secrets and local data. Never weaken a check to make a task pass.
3. Use LSP for semantic code work when available. Use `rg`, Git, and shell tools
   for broad search and commands.
4. Test new tooling for success, expected failure, and unsafe input when the
   tool accepts input. Add it to `scripts/check-repository.sh` when it protects
   all future changes.
5. Keep detailed procedures in this skill or a linked reference. Keep root
   instructions concise and durable.

Run focused checks, then `./scripts/check-repository.sh`. Report any limit on
verification.
