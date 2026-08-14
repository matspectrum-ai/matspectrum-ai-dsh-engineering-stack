# Engineering Governance

This repository is the canonical source of truth for the matspectrum-ai DeepSeek Harness engineering stack.

## Mandatory delivery pipeline

Every behavior-changing task MUST follow this order:

1. Problem Analysis
2. Specification
3. Contracts
4. Tests (RED)
5. Minimal Implementation (GREEN)
6. Refactor
7. Verification and Technical Explanation

Production implementation MUST NOT precede a specification, explicit contracts, and fail-first test coverage for the intended behavior.

## Core engineering rules

- Do not speculate. Unknowns must be stated and resolved through inspection or tests.
- Prefer deterministic behavior over heuristic behavior.
- Keep high cohesion and low coupling.
- Avoid hidden side effects.
- Failures must be explicit and observable.
- External tools are capabilities with contracts, not assumptions.
- All destructive or privilege-elevating behavior requires explicit policy.
- Secrets, tokens, credentials, session state, and machine-local identity MUST NOT be committed.
- Reusable engineering methodology should remain portable across agent runtimes whenever practical.

## Repository boundaries

### Versioned

- specifications
- contracts
- acceptance tests
- profiles and configuration templates
- portable Skills
- MCP definitions without secrets
- LSP mappings
- graph/workflow definitions
- bootstrap/update/doctor logic
- security and mobile-access policy
- pinned dependency manifests

### Never versioned

- API keys
- OAuth tokens
- Supabase access tokens
- Vercel credentials
- GitHub personal tokens
- DSH sessions
- caches and transient logs
- machine-local generated state unless explicitly used as a test fixture

## DeepSeek Harness upstream policy

`deepseek-ai/deepseek-harness` is an upstream runtime dependency. Do not fork or patch upstream by default.

A fork is allowed only when:

1. a required behavior cannot be implemented through supported profiles/plugins/contracts;
2. the limitation is reproduced by a failing test;
3. an upstream-compatible design has been considered;
4. the divergence and maintenance cost are documented in an ADR.

## TDD contract

For each implementation unit:

- RED: add or identify a deterministic failing test.
- GREEN: implement the smallest change that satisfies the test.
- REFACTOR: improve structure without changing contract behavior.
- VERIFY: run relevant unit, integration, acceptance, security, and static gates.

Do not weaken or delete a valid test merely to obtain GREEN.

## Graph orchestration contract

Complex work may be represented as a directed workflow graph. Every node must define:

- role/purpose;
- required inputs;
- permitted side effects;
- outputs/artifacts;
- success gate;
- failure route;
- bounded retry policy where retries are valid.

Planning, implementation, review, security, and verification must remain separable roles even when one model performs multiple roles sequentially.

## Completion contract

A task is not complete because code was generated. Completion requires:

- contract requirements satisfied;
- relevant tests green;
- no unresolved critical review/security findings;
- configuration remains reproducible;
- documentation changed when operational behavior changed.
