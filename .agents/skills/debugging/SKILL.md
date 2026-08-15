---
name: debugging
description: "Diagnose failures through reproducible evidence, hypothesis-driven isolation, minimal experiments, root-cause confirmation, regression tests, and verified fixes instead of shotgun edits."
whenToUse: "Use for bugs, failing tests, runtime exceptions, unexpected UI behavior, integration failures, performance regressions, or configuration drift."
metadata:
  owner: matspectrum-ai
  category: reliability
---

# Debugging

Do not start by editing. Start by making the failure observable and reproducible.

## Workflow

1. **Capture the symptom exactly**
   - error text;
   - stack trace;
   - command/request;
   - environment/version;
   - expected versus actual behavior.

2. **Reproduce**
   - Find the smallest reliable reproduction.
   - Distinguish deterministic from intermittent failures.
   - Preserve the original failure evidence.

3. **Locate the failing boundary**
   - UI event versus API call;
   - configuration composition versus runtime import;
   - network versus authentication;
   - schema versus data;
   - test harness versus product behavior.

4. **Generate hypotheses**
   - Keep hypotheses explicit and ranked.
   - Tie each hypothesis to an observation that would confirm or reject it.

5. **Run discriminating experiments**
   - Prefer one-variable changes.
   - Use reads, logs, probes, targeted tests, and runtime introspection.
   - Do not stack multiple speculative fixes before re-testing.

6. **Identify root cause**
   - Explain the causal chain, not only the failing line.
   - Ask why existing tests/doctor/monitoring failed to detect it earlier.

7. **Add RED regression coverage**
   - Encode the bug in the lowest meaningful test layer.
   - If the bug only exists at runtime composition, add a runtime smoke/E2E gate rather than a misleading static grep.

8. **Fix minimally**
   - Change the root cause, not the symptom.
   - Preserve compatibility unless the spec explicitly changes it.

9. **Verify**
   - focused regression test;
   - related suite;
   - original reproduction;
   - negative/edge case if relevant.

10. **Close the detection gap**
    - strengthen doctor, CI, logs, metrics, or contracts so the same class of failure becomes visible earlier.

## Useful evidence hierarchy

Prefer, in order:

- direct runtime reproduction;
- failing automated test;
- source/config inspection;
- structured logs/telemetry;
- controlled experiment;
- inference.

Clearly label inference as inference.

## Anti-patterns

- changing unrelated code until the error disappears;
- assuming the first stack frame is the root cause;
- treating an error message from a secondary parser as the primary failure;
- dismissing warnings without understanding their relevance;
- claiming a fix without rerunning the original reproduction.

## Output

Report symptom, reproduction, root cause, why prior safeguards missed it, regression test, fix, verification evidence, and residual risk.
