# Phase 3 Skills E2E #3 — antiX

Date: 2026-08-14
Environment: target antiX machine
Workspace: `/home/matspectrum-ai/Desktop/teste dsh`
Preset: `matspectrum Engineering`
Stack head materialized before test: `ad941e0`

## Purpose

Repeat the unchanged no-write hypothetical `GET /health` planning exercise after the second anti-speculation hardening cycle.

The user explicitly required these Skills to be loaded, in order, before the planning task:

1. `problem-analysis`
2. `specification-driven-development`
3. `test-driven-development`
4. `verification`

## Observed tool sequence

The session received `skill-catalog` context injection.

Observed successful Skill tool calls:

1. `problem-analysis`
2. `specification-driven-development`

The agent then began substantive planning without calling:

- `test-driven-development`
- `verification`

At the end it reported that no requested Skill was unavailable, despite having no corresponding tool results for the two skipped requested Skills.

## Result

### Infrastructure

- skill catalog injection: PASS
- Skill tool available: PASS
- pt-BR response: PASS
- no-write/no-commit behavior: PASS

### Explicit Skill preflight

- requested order preserved for calls that occurred: PARTIAL
- all four requested Skills loaded before task actions: FAIL
- silently skipped requested Skills: FAIL (`test-driven-development`, `verification`)
- Skill status claims backed by matching tool results: FAIL

### Methodology fidelity

FAIL. The response again promoted unsupported conventions into normative behavior, including examples/claims around:

- `200 OK`;
- `{ "status": "ok" }`;
- `503`, `500`, `405`, and `404` behavior;
- API versioning behavior;
- dependency health semantics;
- concrete integration/regression test expectations.

This occurred even though the response also acknowledged that framework, response contract, auth policy, dependencies and status codes were unknown.

## Root classification

This E2E exposed a new agent-instruction-compliance failure in addition to residual anti-speculation failure:

1. explicit user-named Skills were treated as optional rather than a hard execution precondition;
2. the agent started substantive work after only a partial Skill load;
3. final Skill-status reporting was not tied to tool evidence.

Upstream `@deepseek-ai/dsh-tool-skill` already instructs the model that when the user names a Skill it must call the Skill tool before task actions and load all applicable Skills. Therefore this is not a missing DSH capability; the stack must reinforce the precondition at the preset/persona contract boundary.

## Corrective RED → GREEN cycle

Specification and contract were updated first to require explicit Skill-request preflight semantics.

Acceptance test was then strengthened to require:

- user-named Skills are a hard preflight checklist;
- every requested Skill gets a matching tool result before substantive work;
- no requested Skill may be silently skipped;
- no loaded/available/unavailable claim may be made without corresponding tool evidence;
- any Skill-load failure must stop task execution and report the exact failing Skill/tool error.

The `Engineering Skills` workflow recorded RED before implementation.

GREEN implementation belongs in the top-level `matspectrum Engineering` persona because the rule must apply before any task-specific Skill body is loaded.

## Merge gate impact

PR #3 remains Draft. Phase 3 cannot be considered complete until a new real antiX session proves the explicit four-Skill preflight and the evidence-discipline methodology together.
