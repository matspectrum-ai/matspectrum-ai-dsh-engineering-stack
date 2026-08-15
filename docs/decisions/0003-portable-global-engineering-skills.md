# ADR 0003 — Portable global engineering skills

Status: accepted for Phase 3
Date: 2026-08-14

## Context

The engineering methodology must be available when `dsh-engineering` is launched from arbitrary project workspaces. Keeping reusable methodology only inside this stack repository would make it discoverable only while the stack repository itself is the active project.

DeepSeek Harness currently discovers filesystem skills from project `.dsh/skills`, project `.agents/skills`, custom roots, user `~/.dsh/skills`, and user `~/.agents/skills`. The `.agents` convention is portable across agent ecosystems and therefore better matches the repository goal of keeping methodology independent from one runtime.

## Decision

1. Canonical skill source lives under repository `.agents/skills/<name>/SKILL.md`.
2. Reusable stack skills are materialized by bootstrap into `${DSH_AGENTS_HOME:-$HOME/.agents}/skills/<name>/SKILL.md`.
3. Only the explicitly managed skill names are owned by this repository.
4. Unrelated user skill bundles are never deleted or rewritten.
5. If a managed runtime skill diverges from canonical repository content, bootstrap backs it up before restoring canonical content.
6. Doctor verifies all managed skill files and reports missing/drifted state as failure.
7. Project-specific rules remain project-local skills or repository instructions and are not promoted into the global library by default.
8. Skill bundle names are kebab-case and match frontmatter `name` exactly.
9. Phase 3 uses one-level directory bundles because the pinned DSH runtime deliberately does not discover nested skill trees.

## Consequences

- A fresh clone plus bootstrap restores the same global engineering methodology.
- The stack can coexist with user-installed or project-installed skills.
- Managed skill names form a public compatibility surface and should not be casually renamed.
- Repository reviews can inspect methodology changes like code changes.
- Runtime drift becomes explicit rather than silently changing agent behavior.

## Rejected alternatives

### Keep skills only inside the stack repository

Rejected because they disappear from discovery when the agent works in another project.

### Use only `~/.dsh/skills`

Rejected as the canonical distribution target because it unnecessarily couples reusable methodology to DeepSeek Harness.

### Symlink the whole user skills root to this repository

Rejected because it would take ownership of unrelated user skills and create an unsafe collision boundary.

### Overwrite the entire user skills directory during bootstrap

Rejected because it violates least surprise and would destroy unrelated user configuration.
