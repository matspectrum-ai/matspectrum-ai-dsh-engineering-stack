# Phase 3 Skills E2E #4 — contaminated session (antiX)

Date: 2026-08-14
Branch: `phase3/skills-foundation`
Runtime stack head materialized before the attempt: `c631eab`
Classification: **INVALID / CONTAMINATED — not evidence for PASS or FAIL of the current preset**

## Intended gate

Repeat the unchanged no-write `GET /health` planning prompt in a fresh DSH session after materializing the explicit Skill-preflight hardening.

The prompt explicitly requested, in order:

1. `problem-analysis`
2. `specification-driven-development`
3. `test-driven-development`
4. `verification`

## Why this attempt is invalid

The supplied transcript contains an earlier 22:21 request/response in the same DSH session, including:

- the prior `skill-catalog` injection;
- prior Skill tool results;
- prior speculative `GET /health` output.

The repeated prompt at 22:42 appears later in the same conversation history and is not preceded by a new `@deepseek-ai/dsh-system-prompt` / `skill-catalog` injection. Therefore the run does not establish behavior of a clean session using only the newly materialized preset state.

Because Skill tool results are retained as conversation history and the previous speculative answer is also retained, the 22:42 behavior is context-contaminated. It must not be used to conclude that the current preset or selected model route passed or failed the clean-session preflight contract.

## Observed 22:42 behavior (informational only)

The model made Skill calls, but the sequence was not a clean one-call-per-requested-Skill preflight and included duplicate/out-of-order loads. It also continued to emit unsupported API conventions such as concrete HTTP codes and health-response semantics.

Those observations explain why the transcript is unsuitable as a GREEN result, but they are not attributed to the current preset until reproduced in a fresh session.

## Required retest conditions

A valid next E2E must:

1. start from **New Session** after the current preset has been materialized;
2. show a fresh system-prompt / `skill-catalog` injection on the first user request;
3. record the model route selected in the Web UI;
4. use the unchanged no-write `GET /health` prompt;
5. contain exactly the requested Skill preflight evidence before substantive task output;
6. retain no earlier planning answer or Skill results in session history.

Only that clean run can classify the current head as PASS or FAIL.
