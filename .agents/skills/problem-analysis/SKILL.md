---
name: problem-analysis
description: "Investigate a requested change before specification or implementation, grounding scope, current behavior, constraints, risks, unknowns, and success criteria in repository evidence."
whenToUse: "Use before any non-trivial engineering task, especially when requirements are ambiguous, behavior is existing, or implementation risk is material."
metadata:
  owner: matspectrum-ai
  category: engineering-method
---

# Problem Analysis

Use this skill before writing a specification or changing implementation.

## Objective

Convert a request into an evidence-backed problem statement. Do not solve the problem by intuition when the repository, runtime, logs, tests, or documentation can answer it.

## Required workflow

1. **Restate the outcome**
   - State what must be true when the work is complete.
   - Separate user outcome from a proposed implementation.
   - Identify whether the request is corrective, additive, migratory, operational, or exploratory.

2. **Inspect current state**
   - Read repository instructions first.
   - Locate relevant code, configuration, tests, schemas, docs, and runtime boundaries.
   - Inspect existing behavior before proposing replacement behavior.
   - Prefer primary evidence: source, contracts, tests, generated config, runtime output.

3. **Map scope**
   - Identify affected modules, APIs, data stores, jobs, UI surfaces, external services, and deployment boundaries.
   - Identify what is explicitly out of scope.
   - Note shared code paths where a local-looking change may have wider effects.

4. **Surface constraints**
   - Runtime and language versions.
   - Security and permission boundaries.
   - Backward compatibility requirements.
   - Performance, latency, cost, data-retention, or operational constraints.
   - Existing architectural decisions that constrain the solution.

5. **Identify unknowns**
   - Mark each unknown explicitly.
   - Resolve discoverable unknowns through inspection or safe probes.
   - Ask the user only for genuinely user-owned choices or facts that cannot be derived.
   - Never convert an unknown into an assumption silently.

6. **Enumerate failure modes and edge cases**
   - Invalid input.
   - Partial failure.
   - Retries and duplicate execution.
   - Concurrent access.
   - Missing dependencies.
   - Stale state or version drift.
   - Permission denial.
   - Empty, boundary, and malformed states.

7. **Assess risk**
   - Correctness risk.
   - Data-loss or migration risk.
   - Security risk.
   - Compatibility risk.
   - Operational and rollback risk.
   - Observability gaps that would hide failure.

8. **Define success evidence**
   - What test, probe, artifact, or runtime observation will prove each important outcome?
   - Distinguish static composition checks from real runtime behavior.

## Output contract

Produce a concise Problem Analysis containing:

- requested outcome;
- current observed behavior;
- relevant repository/runtime evidence;
- affected scope;
- constraints;
- explicit unknowns;
- risks and failure modes;
- success criteria;
- recommended next artifact, normally a specification.

## Prohibitions

- Do not edit implementation while performing problem analysis.
- Do not claim a root cause without evidence.
- Do not assume a dependency is installed, authenticated, reachable, or compatible merely because configuration mentions it.
- Do not treat a passing static config dump as proof that runtime loading or end-to-end behavior works.
