# ADR-0002 — Own the engineering agent preset

Status: Accepted for Phase 2
Date: 2026-08-14

## Context

The DSH Web surface moves model-facing coding tools out of the host composition and behind per-agent presets. The shipped `standard` preset already provides the majority of the desired coding-agent toolset: one-shot bash, filesystem tools, jobs, filesystem Skills, Plan Mode, subagents, workflow, and Ralph.

Persistent PTY is intentionally separate upstream. The terminal family consists of a terminal registry, a terminal backend, and the model-facing terminal tool exposing `terminal_open`, `terminal_send`, `terminal_read`, `terminal_signal`, `terminal_close`, and `terminal_list`.

We need to extend the standard coding experience without placing model-facing terminal tools in the wrong ownership plane and without relying on manual edits under `~/.dsh`.

## Decision

The repository will own a full agent preset with id `matspectrum-engineering`.

- The preset begins from the pinned DSH release's shipped `standard` composition.
- The stack owns and versions the resulting composition.
- One-shot `tool-bash` remains present.
- `tool-terminal` is added to the agent plane.
- Terminal registry/backend providers are mounted in the engineering profile's host plane.
- Bootstrap materializes the canonical preset into the DSH user preset root.
- The engineering profile selects `matspectrum-engineering` as the default for new sessions.
- Runtime upgrades require an explicit diff against the new upstream `standard` preset before the DSH pin changes.

## Why not replace bash with persistent bash

Upstream's terminal contract explicitly distinguishes bounded shell work from terminal work. Persistent state has additional lifecycle and uncertainty concerns. The stack therefore keeps:

- `bash` for bounded, deterministic commands;
- terminal tools for persistent state, interactive stdin, and long-running terminal sessions.

This reduces hidden state and keeps ordinary build/test/git commands deterministic.

## Why not add `tool-terminal` globally in the Web profile

The Web composition deliberately disables model-facing host-plane tool rows and lets each session mount its preset. Adding a model-facing terminal tool globally would cross the agent-preset ownership seam and make preset capability boundaries ambiguous.

## Why a full preset instead of mutable manual copy

A manually copied preset in `$DSH_HOME` would not be reproducible and would drift between machines. Repository ownership gives us:

- Git history;
- deterministic bootstrap;
- reviewable changes;
- tests;
- upgrade drift detection;
- a stable place to add later SDD/TDD and orchestration policy.

## Consequences

Positive:

- the complete coding-agent capability surface becomes versioned;
- future engineering governance can evolve in one canonical preset;
- Web sessions and subagents can inherit one known composition;
- PTY can be added without weakening one-shot shell semantics.

Costs:

- the preset duplicates upstream configuration intentionally;
- every DSH upgrade must compare our preset against the corresponding upstream `standard` preset;
- upstream package or service renames can break preset loading and must fail loudly in acceptance tests.

## Rejected alternatives

1. **Fork DeepSeek Harness** — unnecessary; all required seams are public configuration/plugin seams.
2. **Global host-plane terminal tool** — violates the Web agent-preset ownership model.
3. **Replace `tool-bash` with `tool-bash-persistent` globally** — introduces persistent state into routine commands and conflicts with the desired explicit split.
4. **Manual preset authored only in the Web UI** — non-reproducible and not repository-canonical.
