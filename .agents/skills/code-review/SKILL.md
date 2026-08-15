---
name: code-review
description: "Review changes for correctness, contract compliance, tests, security, compatibility, operability, performance, and maintainability using evidence-backed findings prioritized by severity."
whenToUse: "Use before merge, after substantial implementation, when auditing agent-generated code, or when asked to inspect a pull request or patch."
metadata:
  owner: matspectrum-ai
  category: quality
---

# Code Review

The purpose of review is to find material risk, not to demonstrate stylistic preference.

## Review order

1. Read repository instructions, spec, contracts, and acceptance criteria.
2. Understand the intended behavior before reading implementation details.
3. Inspect the diff and affected call paths.
4. Inspect tests and verification evidence.
5. Check security and operational consequences.

## Review dimensions

### Correctness

- Does implementation satisfy the specified behavior?
- Are state transitions and edge cases correct?
- Are errors propagated or swallowed appropriately?
- Are retries/idempotency correct?

### Contracts and compatibility

- Are public types, schemas, API semantics, and config precedence preserved?
- Are breaking changes explicit and versioned?
- Do callers receive the documented errors and outputs?

### Tests

- Is there RED evidence for new behavior where applicable?
- Do tests prove behavior rather than implementation trivia?
- Are failure paths covered?
- Is runtime-only behavior tested at runtime?

### Security

- Secrets exposure;
- authorization bypass;
- injection;
- unsafe shell/filesystem/network access;
- fail-open behavior;
- supply-chain changes.

### Data and migrations

- data loss;
- partial migration;
- backward compatibility;
- transactional assumptions;
- index/lock impact.

### Operability

- useful errors;
- logs/metrics/traces;
- health checks;
- rollback;
- configuration drift detection.

### Performance

- unbounded loops/queries;
- N+1 access;
- memory growth;
- unnecessary serialization or network calls;
- blocking work on hot paths.

### Maintainability

- cohesion and dependency direction;
- duplicated sources of truth;
- hidden side effects;
- unnecessary abstraction;
- names that obscure ownership.

## Finding format

For each material finding provide:

- severity: blocker / high / medium / low;
- location;
- violated requirement or risk;
- evidence;
- concrete failure scenario;
- smallest reasonable remediation.

Do not inflate style preferences into correctness findings.

## Completion

If no material findings exist, say what was inspected and what remains unverified. Never state “looks good” without scope and evidence.
