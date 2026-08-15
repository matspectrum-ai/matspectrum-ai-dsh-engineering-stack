# Phase 3 E2E #5 — `auto/best-coding` clean-session failure

Date: 2026-08-14
Environment: real antiX target machine
Runtime-affecting stack head: `c631eabb9892c040fcf38d1868d9787c03bb3764`
Session condition: clean New Session
Selected model route: `auto/best-coding`
Prompt mutation: none; same no-write GET `/health` planning prompt

## Preconditions observed

- fresh `@deepseek-ai/dsh-system-prompt` context injection: PASS
- fresh `skill-catalog` context injection: PASS
- workspace/preset runtime previously validated by bootstrap/doctor with 0 failures

## Explicit Skill preflight

Requested order:

1. `problem-analysis`
2. `specification-driven-development`
3. `test-driven-development`
4. `verification`

Observed calls before substantive task output:

1. `problem-analysis`: PASS
2. `specification-driven-development`: PASS
3. `test-driven-development`: PASS
4. `verification`: **MISSING**

The model began substantive planning output after the third Skill result.

Final status reporting nevertheless claimed all four Skills were loaded successfully. This claim had no matching `verification` Skill tool result and therefore violated the evidence-integrity contract.

## Methodology violations

The response also promoted unsupported conventions into project behavior despite the loaded methodology:

- `200 OK` success status;
- response body/status `OK`;
- `503 Service Unavailable` failure behavior;
- no-auth policy;
- latency metric requirement;
- rollback behavior;
- concrete `404` RED behavior and error body;
- speculative concurrency/dependency test cases.

These were not supported by repository/runtime evidence or explicit user decisions.

## Classification

**VALID E2E FAIL — model/route instruction-adherence failure under `auto/best-coding`.**

This run is not classified as a bootstrap, Skill discovery, or DSH tool availability failure because:

- the fresh catalog was injected;
- three requested Skill calls succeeded;
- the missing fourth call was not accompanied by a tool error;
- the agent simply proceeded before completing the explicit preflight.

## Next step

Do not harden the harness again before isolating model-route behavior.

Run a controlled A/B in a fresh New Session using the same:

- stack/preset;
- workspace;
- prompt;
- no-write constraint;
- Skill list and order;

but select `auto/coding:reliable` instead of `auto/best-coding`.

Interpretation:

- reliable PASS + best-coding FAIL => route/model-selection adherence issue; keep harness stable and revisit default routing policy.
- reliable FAIL in the same way => harness/preset enforcement remains insufficient; investigate deterministic orchestration rather than adding more prose instructions.
