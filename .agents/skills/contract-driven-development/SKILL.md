---
name: contract-driven-development
description: "Turn specifications into explicit behavioral, type, interface, state, error, compatibility, and security contracts that constrain implementation and tests."
whenToUse: "Use after a feature specification and before implementation tests whenever components, APIs, data, configuration, tools, or state transitions cross a boundary."
metadata:
  owner: matspectrum-ai
  category: engineering-method
---

# Contract-Driven Development

Contracts define what other code and operators are allowed to rely on.

## Inputs

- approved specification;
- current public interfaces and schemas;
- compatibility requirements;
- relevant ADRs and security boundaries.

## Contract categories

Define only categories that apply, but do not omit a real boundary.

### Interface contracts

Specify:

- input types and required fields;
- output types;
- nullable/optional semantics;
- preconditions and postconditions;
- side effects;
- ordering guarantees;
- timeout/cancellation behavior.

### Error contracts

Specify:

- stable error classes/codes;
- retryable versus terminal failures;
- user-visible versus internal messages;
- partial-success semantics;
- logging/telemetry expectations without leaking secrets.

### State contracts

Specify:

- valid states;
- allowed transitions;
- transition preconditions;
- idempotency;
- duplicate-event behavior;
- concurrency ownership.

### Data contracts

Specify:

- schema and constraints;
- identifiers;
- precision/units/time zones;
- uniqueness and referential integrity;
- migration compatibility;
- retention or deletion semantics.

### Configuration contracts

Specify:

- source of truth;
- precedence layers;
- defaults versus user overrides;
- secret references versus literal values;
- reload/restart requirements;
- invalid configuration behavior.

### Security contracts

Specify:

- trust boundary;
- authentication and authorization requirements;
- least privilege;
- allowed network scope;
- sensitive data handling;
- fail-open versus fail-closed decisions.

## Contract quality rules

- Use stable names.
- Make invariants explicit.
- Prefer exact enums and types over prose when feasible.
- Do not encode an implementation accident as a public guarantee without intent.
- Define compatibility impact before changing an existing contract.
- Define rollback expectations for irreversible-looking changes.

## Example YAML shape

```yaml
contract: <name>
version: 1

inputs:
  <field>: <type>

outputs:
  <field>: <type>

invariants:
  - <must always hold>

failure_modes:
  <error>:
    classification: <type>
    retryable: false
    behavior: <deterministic response>

compatibility:
  existing_callers: preserved

security:
  secret_boundary: environment
```

## Handoff to tests

Every important invariant and failure mode must have a verification strategy. Load `test-driven-development` and create failing tests or contract checks before implementation.
