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
- identify the repository location that is canonical for the feature.

## Specification structure

Prefer YAML for machine-readable engineering specs. At minimum include:

```yaml
feature: <stable-name>
status: specified
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
  - <explicit exclusion>

unknowns:
  - <only unresolved, explicit unknowns>
```

Adapt the schema to the repository, but preserve equivalent semantics.

## Rules

1. **Specify behavior, not implementation trivia**
   - State what the system must do and observable constraints.
   - Include implementation detail only when it is a deliberate architectural contract.

2. **Make requirements testable**
   - Avoid words such as fast, robust, scalable, secure, or user-friendly without measurable meaning.
   - Each critical requirement should map to verification evidence.

3. **State precedence**
   - When multiple configuration layers exist, define which layer wins.
   - Distinguish canonical defaults from user overrides and runtime state.

4. **Define lifecycle behavior**
   - Startup, normal operation, failure, retry, shutdown, migration, and rollback where relevant.

5. **Include negative behavior**
   - What must never happen?
   - What state must fail closed?
   - What data must never be committed or logged?

6. **Keep unknowns explicit**
   - Resolve by inspection when possible.
   - Do not hide uncertainty inside acceptance criteria.

7. **Version meaningful behavior changes**
   - If implementation changes required behavior, update the spec first, then contracts/tests, then implementation.

## Specification review gate

A spec is implementation-ready only when:

- objectives are unambiguous;
- scope and non-goals are explicit;
- behavior and failure modes are deterministic;
- security and compatibility constraints are represented;
- acceptance criteria can be verified;
- unresolved unknowns do not block implementation decisions.

## Handoff

After the specification is stable, load `contract-driven-development` before writing implementation tests or code.
