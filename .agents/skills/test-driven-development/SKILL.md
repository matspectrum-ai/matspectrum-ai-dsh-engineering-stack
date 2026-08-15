---
name: test-driven-development
description: "Implement behavior through an explicit RED → GREEN → REFACTOR loop, deriving tests from specification and contracts and preserving evidence that the test can detect the missing or broken behavior."
whenToUse: "Use before implementation whenever requested behavior is testable through unit, integration, contract, acceptance, or runtime smoke tests."
metadata:
  owner: matspectrum-ai
  category: engineering-method
---

# Test-Driven Development

The required sequence is RED → GREEN → REFACTOR. A test written after implementation is useful regression coverage but is not TDD evidence.

## Preconditions

Before implementation:

- problem analysis exists;
- specification defines expected behavior;
- contracts define relevant boundaries and invariants.

If these are missing, load the corresponding skills first.

## RED

1. Choose the smallest test that represents the next required behavior.
2. Run it before implementation.
3. Confirm it fails for the intended reason.
4. Record enough evidence to distinguish a meaningful RED from syntax/setup failure.

A valid RED must not fail merely because:

- the test file has a syntax error;
- the test environment is broken;
- an unrelated dependency is missing;
- the assertion does not exercise the requested behavior.

For configuration/infrastructure work, an acceptance script or runtime smoke check can be the RED test.

### RED planning when the baseline is unknown

When planning before the relevant test has actually been run, distinguish the **assertion we intend to make** from the **baseline behavior we have observed**.

Do not invent the current system response merely to describe RED.

If the baseline is unknown, describe RED as the specified assertion failing for the missing behavior and defer the exact observed status/body until the test is actually run.

Examples:

- Safe: "A route-level test for the specified `GET /health` contract should fail before implementation; the exact current HTTP response is unverified until the test/probe runs."
- Unsafe without evidence: "The RED is `404` with `{\"error\":\"Endpoint not found\"}`."

Never claim a concrete pre-implementation status code, exception, error body, timeout, or dependency failure unless repository/runtime evidence has established it.

### Test-harness evidence rule

A planned test describes behavior first. Concrete test implementation belongs to the repository's actual test stack.

Do not invent a test language, framework, runner, helper, file name, package manager, or command when the project test stack is unknown.

Describe planned tests behaviorally until repository evidence identifies the concrete test harness.

For an evidence-starved hypothetical task, write statements such as:

- "send the specified method/path through the repository's route-level test harness";
- "assert the response contract once status/body requirements are resolved";
- "run the repository's focused test command once discovered".

Do not emit JavaScript/Python/Go test code, `describe` blocks, request helpers, test file paths, `npm test`, `pytest`, `go test`, or equivalent concrete tooling unless the repository or user established that tooling.

## GREEN

1. Implement the minimum production change that satisfies the failing contract.
2. Avoid unrelated refactors during GREEN.
3. Re-run the focused test.
4. Run adjacent regression tests that could be affected.

Do not weaken the assertion to obtain GREEN.

## REFACTOR

After GREEN:

- simplify duplication;
- improve naming and boundaries;
- remove temporary scaffolding;
- preserve behavior;
- re-run tests after refactor.

## Test selection

Use the lowest-cost layer that proves the requirement, then add higher-level coverage where integration boundaries matter.

- unit: pure logic and local invariants;
- component/module: local integration;
- contract: interfaces and protocol shapes;
- integration: real adapters or controlled substitutes;
- acceptance: repository-level behavior;
- E2E: runtime composition, UI/session creation, external boundary behavior.

Static composition is not equivalent to runtime loading. If a defect can occur only when a plugin, preset, package, process, or request is actually instantiated, include a runtime smoke/E2E gate.

## Required edge coverage

Consider only cases that are relevant to the specification and contracts, such as:

- invalid and empty inputs;
- boundary values;
- duplicate/retry behavior;
- concurrency;
- partial failures;
- permission denial;
- unavailable dependencies;
- version/config drift;
- rollback paths.

A checklist item is not automatically a requirement. Do not create tests for invented behavior solely because it is a common edge case.

If an edge behavior is conditional on an unresolved design decision, keep the test branch unresolved. Do not populate it with conventional status codes, dependency states, or auth semantics merely as an example of what the project might do.

## Anti-patterns

- mocking the behavior being tested instead of its dependencies;
- assertions that only check implementation details;
- snapshot-only tests for critical logic;
- tests that always pass;
- skipping the pre-implementation RED run;
- accepting flaky retries as correctness;
- claiming a precise RED result before observing it;
- writing tests for speculative requirements;
- selecting a test framework or command without repository evidence.

## Completion evidence

Report:

- RED command and observed intended failure, once actually run;
- implementation change;
- GREEN command/result;
- regression suite result;
- remaining untested risk.

If RED has not actually been run yet, label it as **planned RED**, not evidence. If the command is not yet known, mark the concrete command **UNRESOLVED** rather than inventing one.
