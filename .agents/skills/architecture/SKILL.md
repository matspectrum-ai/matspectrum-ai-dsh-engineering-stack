---
name: architecture
description: "Design module boundaries, dependency direction, data flow, state ownership, extensibility seams, and reversible architectural decisions before large implementation changes."
whenToUse: "Use for new subsystems, cross-cutting changes, major integrations, runtime boundaries, persistence changes, or decisions that would be costly to reverse."
metadata:
  owner: matspectrum-ai
  category: design
---

# Architecture

Architecture work should reduce ambiguity and future coupling, not add abstraction for its own sake.

## Start from constraints

Read:

- problem analysis;
- specifications and contracts;
- existing ADRs;
- module graph and package boundaries;
- deployment/runtime topology;
- security and persistence boundaries.

## Design questions

### Ownership

- Which module owns the capability?
- Which layer owns durable state?
- Which layer is allowed to know about infrastructure?
- Is there one canonical source of truth?

### Dependency direction

- Can policy depend on mechanism instead of the reverse?
- Are shared abstractions genuinely shared?
- Are there circular dependencies or implicit global state?

### Boundary design

- What is the public contract?
- What is private implementation detail?
- Which errors cross the boundary?
- How are cancellation, retries, and timeouts propagated?

### Data flow

- Where does data originate?
- Where is it validated?
- Where can it be transformed?
- Which state is authoritative?
- What is persisted versus derived?

### Failure isolation

- Can one provider/subsystem fail without corrupting unrelated state?
- Are retries bounded?
- Is recovery deterministic?
- Is degraded mode explicit?

### Evolvability

- Can implementation be replaced behind the contract?
- Are versioning and migrations possible?
- Does the design create accidental vendor/runtime lock-in?

## Prefer

- high cohesion;
- low coupling;
- explicit state ownership;
- tool-first interfaces for agent systems;
- deterministic verification seams;
- repository-owned configuration where reproducibility matters;
- reversible decisions when requirements are still evolving.

## Avoid

- speculative distributed architecture;
- hidden side effects;
- duplicated configuration truth;
- abstraction layers with one caller and no demonstrated seam;
- global mutable state without ownership;
- generic plugin systems when a direct contract is enough.

## ADR requirement

Write an ADR when the decision:

- changes a subsystem boundary;
- introduces a durable dependency;
- selects a persistence or deployment model;
- changes compatibility expectations;
- rejects a plausible alternative that future maintainers may reconsider.

An ADR should contain context, decision, consequences, and rejected alternatives.

## Output

Produce a decision-complete design with:

- component boundaries;
- dependency direction;
- data/state flow;
- public contracts;
- failure and recovery model;
- security boundary;
- migration/rollback plan;
- test seams;
- ADRs for durable choices.
