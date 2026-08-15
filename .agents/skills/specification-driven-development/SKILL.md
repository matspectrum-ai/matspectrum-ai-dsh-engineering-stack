---
name: specification-driven-development
description: "Define executable engineering intent in a versioned specification before implementation, including objectives, requirements, acceptance criteria, edge cases, non-goals, dependencies, and verification evidence."
whenToUse: "Use after problem analysis and before contracts, tests, or implementation for any material feature, fix, migration, integration, or infrastructure change."
metadata:
  owner: matspectrum-ai
  category: engineering-method
---

# Specification-Driven Development

Implementation follows specification; specification does not retroactively describe whatever was built.

## Entry conditions

Before writing a spec:

- load or perform `problem-analysis`;
- inspect existing specifications for naming and schema conventions;
- identify the repository location that is canonical for the feature;
- distinguish verified facts, explicit user requirements, unresolved unknowns, and optional design choices.

## Specification structure

Prefer YAML for machine-readable engineering specs. At minimum include the fields that are actually supported by evidence or explicit requirements:

```yaml
feature: <stable-name>
status: draft
schema_version: 1

objectives:
  - <observable outcome>

requirements:
  functional:
    - <required behavior>
  non_functional:
    - <security/performance/operability requirement>

acceptance_criteria:
  - <evidence-backed completion condition>

edge_cases:
  - <boundary or failure case>

failure_modes:
  <name>:
    classification: <type>
    expected_behavior: <deterministic behavior>

security:
  - <security invariant>

observability:
  - <signal needed to diagnose behavior>

rollback:
  - <recovery or reversal strategy>

non_goals:
  - <explicit evidence-backed exclusion>

unknowns:
  - <only unresolved, explicit unknowns>
```

Adapt the schema to the repository, but preserve equivalent semantics. Optional sections may be omitted when there is no evidence-backed content for them.

## Evidence gate

A specification is normative. Every normative statement must come from one of:

1. an explicit user requirement;
2. repository source, tests, contracts, schemas, configuration, or versioned decisions;
3. verified runtime behavior;
4. a user-approved design decision made to resolve an explicit unknown.

A specification must not turn an unresolved unknown into a requirement, acceptance criterion, edge case, failure mode, security rule, observability signal, or rollback behavior.

If evidence is insufficient, keep the field unresolved or omit it and record the decision as an unknown.

Common conventions are not evidence. Do not invent response status codes, response bodies, authentication policy, dependency checks, metrics, timeouts, error shapes, retries, rollback procedures, or operational behavior because they are typical for similar systems.

For hypothetical planning with no repository evidence, a minimal spec should contain only the behavior explicitly requested by the user plus explicit unknowns. For example, a request to add `GET /health` establishes the method and path; it does not by itself establish status code, body schema, authentication, dependency semantics, metrics, latency target, or failure behavior.

## Scope classification rule

A `non_goal` is a deliberate exclusion from scope. It is normative just like a requirement.

An unresolved or pending decision is not a non-goal. Put it under `unknowns` until repository evidence or an explicit user decision excludes it from scope.

Do not write statements such as "do not add authentication", "do not check dependencies", or "do not add metrics" merely because those decisions are unknown. Omitting unsupported behavior from the current requirement set is sufficient; do not convert absence of evidence into a prohibition.

## Readiness rule

Use specification status to communicate readiness accurately.

- `draft` or repository-equivalent: important decisions are still unresolved;
- `specified` or repository-equivalent: normative behavior is sufficiently resolved for the next contractual/test stage;
- `implementation-ready`: all blocking decisions required to implement and test deterministically are resolved.

Do not mark a specification implementation-ready while blocking unknowns remain unresolved.

If the repository uses different status values, preserve its vocabulary while retaining the same readiness semantics. In a hypothetical or empty workspace with unresolved status code, response contract, auth policy, test harness, or other implementation-blocking decisions, keep the spec non-ready rather than pretending those decisions are settled.

## Rules

1. **Specify behavior, not implementation trivia**
   - State what the system must do and observable constraints.
   - Include implementation detail only when it is a deliberate architectural contract.

2. **Make requirements testable**
   - Avoid words such as fast, robust, scalable, secure, or user-friendly without measurable meaning.
   - Each critical requirement should map to verification evidence.
   - Do not manufacture measurable values to make a requirement look testable.

3. **State precedence**
   - When multiple configuration layers are known to exist, define which layer wins.
   - Distinguish canonical defaults from user overrides and runtime state.

4. **Define lifecycle behavior only when applicable**
   - Startup, normal operation, failure, retry, shutdown, migration, and rollback belong in the spec only when evidence or an explicit requirement makes them part of scope.

5. **Include negative behavior only when supported**
   - What must never happen?
   - What state must fail closed?
   - What data must never be committed or logged?
   - If the answer is unknown, say so instead of inventing a policy.

6. **Keep unknowns explicit**
   - Resolve by inspection when possible.
   - Do not hide uncertainty inside acceptance criteria.
   - Do not convert a plausible option into normative behavior without a decision.

7. **Version meaningful behavior changes**
   - If implementation changes required behavior, update the spec first, then contracts/tests, then implementation.

## Specification review gate

A spec is implementation-ready only when:

- objectives are unambiguous;
- scope and non-goals are explicit where known;
- normative behavior is evidence-backed;
- required failure behavior is deterministic where it has actually been specified;
- security and compatibility constraints are represented when known;
- acceptance criteria can be verified;
- unresolved unknowns do not block implementation decisions.

If unresolved unknowns do block implementation, the correct result is `not implementation-ready`, not a guessed specification.

## Handoff

After the specification is stable, load `contract-driven-development` before writing implementation tests or code.
