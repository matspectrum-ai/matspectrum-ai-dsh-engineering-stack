# Phase 3 E2E #6 — `auto/coding:reliable` methodology failure

Date: 2026-08-14
Environment: real antiX target machine
Profile: `engineering`
Preset: `matspectrum-engineering`
Model route: `omniroute/auto/coding:reliable`
Classification: **VALID FAIL**

## Purpose

Controlled A/B against the valid `auto/best-coding` failure. The stack, preset, workspace and prompt were held constant; only the OmniRoute model route changed to `auto/coding:reliable` in a fresh session.

## Prompt contract

The user explicitly requested, before substantive output, these Skills in exact order:

1. `problem-analysis`
2. `specification-driven-development`
3. `test-driven-development`
4. `verification`

The exercise was planning-only for a hypothetical `GET /health` endpoint in an evidence-starved workspace, with no file mutation.

## Observed preflight

Fresh session context was injected and the four requested Skill tool calls occurred in exact order before substantive planning output:

1. `skill(problem-analysis)` — PASS
2. `skill(specification-driven-development)` — PASS
3. `skill(test-driven-development)` — PASS
4. `skill(verification)` — PASS

This is a material improvement over the `auto/best-coding` run and proves the explicit Skill preflight can succeed through the existing DSH skill runtime.

## Methodology failure

Despite all four Skill bodies being loaded, the generated planning answer still promoted unsupported conventions into normative behavior. Examples included:

- success status `200 OK`;
- response body/status `"OK"`;
- failure status `503 Service Unavailable`;
- no-auth behavior;
- latency metric requirement;
- rollback behavior;
- concrete `404`/`503` RED expectations and example error body;
- speculative concurrency/dependency edge cases;
- a `non_goal` asserting existing endpoints are not altered without evidence that this was an explicit project decision.

The answer sometimes labelled those values as unknown later, but that does not repair the earlier normative requirements/acceptance criteria. The same artifact cannot simultaneously define a behavior as required and unresolved.

## Result

- skill discovery: PASS
- exact four-Skill preflight: PASS
- requested order: PASS
- no-write constraint: PASS
- evidence discipline / anti-speculation: **FAIL**

## A/B conclusion

`auto/coding:reliable` improves instruction-following for tool sequencing but does **not** satisfy the engineering methodology contract. Therefore changing the default OmniRoute route alone is insufficient.

The remaining defect is not explained by Skill discovery, materialization, or the explicit Skill-loading mechanism. Both tested routes can receive the methodology instructions and still generate unsupported normative claims.

## Engineering decision

Stop further prompt/persona hardening as the primary control. Move methodology correctness to native harness enforcement using documented DSH interception seams:

- `agent/pre-step` for per-turn state and policy context;
- `tools/pre-execute` / monotonic guards for deterministic tool gates;
- `tools/result` as authoritative tool evidence;
- `agent/turn-stopping` + `agent.steer()` for continuation when a required gate has not committed;
- a repository-owned structured methodology commit boundary whose normative entries require explicit provenance.

This E2E remains a failure and PR #3 must stay Draft until the deterministic enforcement path is specified, tested and validated.