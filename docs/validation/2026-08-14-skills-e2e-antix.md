# Phase 3 antiX validation — Skills E2E

Date: 2026-08-14
Target: antiX Linux
Workspace: unrelated test workspace `teste dsh`
Preset: `matspectrum Engineering`

## Discovery and load result

A fresh real DSH session received the normal `skill-catalog` context injection and successfully loaded, in the requested order, all four globally managed skills through the model-facing Skill tool:

1. `problem-analysis`
2. `specification-driven-development`
3. `test-driven-development`
4. `verification`

No requested skill was missing. The session responded in Brazilian Portuguese and used only non-mutating inspection after the skill loads.

Result for discovery/loading: **PASS**.

## Methodology exercise

The no-write hypothetical exercise asked the agent to plan adding `GET /health` to an existing API while repository evidence was unavailable in the empty test workspace.

The response correctly identified several unknowns, but then promoted unsupported conventions into normative specification/verification content. Examples included:

- asserting `200 OK` as required behavior;
- inventing `status: healthy|unhealthy` response semantics;
- inventing dependent-service behavior with `503`/`504`;
- declaring that the endpoint requires no authentication;
- inventing a `api.health.status` metric;
- inventing a one-second timeout criterion;
- asserting a specific pre-implementation `404` body shape;
- describing security risk as zero without direct evidence.

Those claims were not supported by user requirements, repository evidence, runtime evidence, or a user-approved design decision.

Result for methodology fidelity: **FAIL**.

## Root-cause classification

The runtime skill mechanism is healthy: catalog discovery and full-body Skill loads both worked. The defect is instruction strength / methodology enforcement, not DSH skill discovery.

The original skills already said to keep unknowns explicit, but the first real E2E showed that this wording was insufficient to stop a model from filling gaps with common API conventions.

## Corrective TDD cycle

A new acceptance contract was committed first and intentionally made the `Engineering Skills` workflow RED. The new contract requires explicit anti-speculation language at three layers:

- `problem-analysis`;
- `specification-driven-development`;
- the top-level `matspectrum Engineering` persona.

The intended invariant is:

> Unknown engineering behavior remains unknown until repository/runtime evidence or an explicit user decision resolves it. Common conventions are not project requirements.

Implementation then hardened the skills/persona to forbid inventing status codes, response schemas, authentication policy, dependency semantics, metrics, timeouts, rollback behavior, or other normative engineering facts.

## Remaining gate

After the hardened skills/persona are materialized on the target machine, repeat the same no-write exercise. Phase 3 is GREEN only if:

1. all four skills load through the Skill tool;
2. pt-BR persona remains active;
3. the plan contains only user/evidence-backed normative behavior;
4. unsupported details remain explicit unknowns or clearly labeled non-normative options;
5. no file mutation occurs.
