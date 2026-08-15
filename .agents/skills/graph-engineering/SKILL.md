---
name: graph-engineering
description: "Model complex engineering work as an explicit dependency graph of contract-defined nodes, artifacts, transitions, verification gates, bounded retries, failure routing, and safe parallelism."
whenToUse: "Use for complex multi-step work, multiple agents/roles, long-running refactors, migrations, research-to-implementation pipelines, or tasks that benefit from explicit dependency and verification structure."
metadata:
  owner: matspectrum-ai
  category: orchestration-method
---

# Graph Engineering

This skill defines the methodology for graph-shaped engineering. Runtime orchestration may be implemented separately; do not assume a particular workflow engine is available.

## Core model

Represent work as nodes and directed edges.

A node has:

- stable id;
- role/purpose;
- declared inputs;
- expected outputs/artifacts;
- preconditions;
- allowed tools/capabilities;
- completion criteria;
- verification gate;
- retry policy;
- failure route.

An edge means the downstream node depends on a specific upstream artifact or verified condition, not merely chronological order.

## Suggested node contract

```yaml
id: implement-auth
role: implementation
inputs:
  - specs/auth.spec.yaml
  - contracts/auth.contract.yaml
requires:
  - tests-auth-red == true
outputs:
  - implementation-diff
verification:
  - focused-tests-green
retries:
  max: 2
  on:
    - deterministic-test-failure
failure_route: debug-auth
```

## Typical engineering graph

```text
research/problem-analysis
        ↓
architecture
        ↓
specification
        ↓
contracts
        ↓
tests-red
        ↓
implementation-green
        ↓
refactor
        ↓
code-review ──→ security-review
        \             /
         \           /
          verification
               ↓
        production-readiness
```

Nodes may run in parallel only when their inputs and write sets do not conflict.

## Artifact discipline

Shared state must be explicit. Prefer versioned artifacts such as:

- analysis notes;
- ADRs;
- specs;
- contracts;
- failing test evidence;
- implementation commits/diffs;
- review findings;
- verification reports.

Do not rely on hidden conversational memory as the sole handoff between nodes/agents.

## Gate rules

- A downstream node does not start until required upstream gates pass.
- Implementation cannot bypass spec/contracts/tests-red for material behavior.
- Review findings classified blocker/high route back to the responsible node.
- Verification is independent of the implementation node's own success claim.

## Retry rules

Retries must be bounded and reason-aware.

Retry only when:

- failure is plausibly transient; or
- the node receives new evidence/input that changes its next action.

Do not loop the same prompt/action without state change.

## Failure routing

Define recovery edges such as:

- test failure → debugging;
- contract mismatch → specification/contracts;
- security blocker → implementation/architecture;
- unavailable dependency → dependency-resolution or explicit blocked state.

## Parallelism

Parallelize research, reviews, or independent modules when:

- dependencies are explicit;
- write sets do not overlap unsafely;
- merge/reconciliation node exists;
- each branch has its own verification.

## Completion

A graph is complete only when terminal verification gates pass and every unresolved branch is either closed, explicitly deferred, or recorded as risk.
