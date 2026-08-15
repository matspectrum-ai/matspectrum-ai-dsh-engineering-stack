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
   - Identify affected modules, APIs, data stores, jobs, UI surfaces, external services, and deployment boundaries only when evidence supports them.
   - Identify what is explicitly out of scope.
   - Note shared code paths where a local-looking change may have wider effects.

4. **Surface constraints**
   - Runtime and language versions.
   - Security and permission boundaries.
   - Backward compatibility requirements.
   - Performance, latency, cost, data-retention, or operational constraints.
   - Existing architectural decisions that constrain the solution.
   - If a constraint is not known, mark it unknown rather than inventing a reasonable default.

5. **Identify unknowns**
   - Mark each unknown explicitly.
   - Resolve discoverable unknowns through inspection or safe probes.
   - Ask the user only for genuinely user-owned choices or facts that cannot be derived.
   - Never convert an unknown into an assumption silently.

6. **Enumerate failure modes and edge cases**
   - Derive concrete cases from the requested behavior, repository evidence, existing contracts, or user-provided requirements.
   - Generic engineering checklists are prompts for investigation, not permission to assert that those cases apply.
   - Candidate categories include invalid input, partial failure, retries, concurrency, missing dependencies, stale state, permission denial, and boundary states only when relevant evidence exists.

7. **Assess risk**
   - Correctness risk.
   - Data-loss or migration risk.
   - Security risk.
   - Compatibility risk.
   - Operational and rollback risk.
   - Observability gaps that would hide failure.
   - Classify unsupported risk claims as UNVERIFIED rather than PASS/zero-risk.

8. **Define success evidence**
   - What test, probe, artifact, or runtime observation will prove each important outcome?
   - Distinguish static composition checks from real runtime behavior.
   - Do not prescribe a concrete command, status code, schema, metric, dependency state, or runtime behavior until its contract is known.

## Evidence discipline for hypothetical or empty workspaces

When the task is hypothetical, the workspace is empty, or repository evidence is unavailable:

- treat only the user's explicit request as known;
- state that implementation framework, existing routing behavior, response contract, authentication policy, dependencies, observability, deployment model, and rollback constraints are unknown unless the user supplied them;
- do not infer conventional behavior merely because it is common practice;
- if useful, alternatives may be listed only as clearly labeled options for later decision, never as requirements or acceptance criteria;
- do not claim that a missing endpoint returns 404, a dependency failure returns 503/504, an endpoint is unauthenticated, or a metric exists unless evidence establishes that behavior;
- never call a security or operational risk zero without direct evidence.

Do not invent requirements, defaults, status codes, response schemas, authentication policy, dependencies, observability signals, or failure behavior.

## Output contract

Produce a concise Problem Analysis containing:

- requested outcome;
- current observed behavior;
- relevant repository/runtime evidence;
- affected scope supported by evidence;
- constraints;
- explicit unknowns;
- evidence-backed risks and failure modes;
- success criteria that are actually known;
- recommended next artifact, normally a specification.

When evidence is insufficient, an honest short analysis with unresolved unknowns is better than a detailed speculative one.

## Prohibitions

- Do not edit implementation while performing problem analysis.
- Do not claim a root cause without evidence.
- Do not assume a dependency is installed, authenticated, reachable, or compatible merely because configuration mentions it.
- Do not treat a passing static config dump as proof that runtime loading or end-to-end behavior works.
- Do not promote common conventions into project requirements without repository or user evidence.
