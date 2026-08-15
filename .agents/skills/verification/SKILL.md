---
name: verification
description: "Prove completion against specifications and contracts using an evidence matrix across tests, runtime probes, diffs, negative cases, observability, and residual-risk reporting."
whenToUse: "Use before claiming a task, phase, fix, migration, integration, or release is complete."
metadata:
  owner: matspectrum-ai
  category: quality
---

# Verification

No success claim without evidence.

## Build an acceptance matrix

Map each important acceptance criterion to a concrete verification action and result.

```text
Criterion | Evidence action | Concrete command/tool | Result | Notes
```

Evidence actions may include:

- focused automated tests;
- full/regression suite;
- typecheck/lint/build;
- configuration dump;
- runtime import/load probe;
- API request;
- UI/E2E behavior;
- database query;
- deployment health check;
- diff inspection.

Only include evidence categories relevant to the actual specification and failure modes. A generic checklist is not proof that a risk or requirement exists.

## Tooling evidence rule

Verification must use the repository's real toolchain, not a plausible one.

Do not invent verification commands, package-manager scripts, scanners, CI jobs, or tool names when the repository toolchain is unknown.

Describe the evidence action abstractly and mark the concrete command UNRESOLVED until discovered.

Examples:

- Safe with unknown toolchain: `focused route contract test | repository test harness | UNRESOLVED | planned`.
- Unsafe without evidence: `npm test -- health`, `npm run typecheck`, `npm run security:scan`, `pytest`, or `go test` merely because those commands are common.

Likewise, do not invent file names or CI workflow names. Inspect package manifests, task runners, CI configuration, repository instructions, and existing tests before naming a command.

## Verification sequence

1. Re-read specification and contracts.
2. Inspect the final diff for unintended scope.
3. Run focused tests using the repository's discovered test command.
4. Run adjacent regression tests that are actually present/relevant.
5. Run build/type/lint checks required by the repository, if any.
6. Exercise runtime boundaries that static tests cannot prove.
7. Test important negative/failure behavior specified or evidenced for the change.
8. Verify no secrets or unintended generated artifacts were introduced using repository-supported checks or direct diff inspection.
9. Confirm rollback/recovery behavior if the change is operationally risky and such behavior is defined.
10. State residual risks and unverified unknowns without filling gaps by assumption.

If any concrete command/tool in steps 3–9 has not been discovered, keep it `UNRESOLVED`; do not substitute a conventional command.

## Runtime evidence rule

A static check only proves static state.

Examples:

- a config entry does not prove a package can be imported;
- a package install does not prove authentication;
- a provider catalog does not prove a model request succeeds;
- a compiled UI does not prove the interaction works;
- a migration file does not prove production data can migrate safely.

Use the verification layer that matches the failure mode.

## Risk evidence rule

Never classify security, operational, compatibility, data-loss, or rollback risk as zero/none without direct evidence.

When evidence is insufficient:

- use **UNVERIFIED** for the specific claim;
- state what evidence would be required to classify it;
- do not substitute generic best practice or intuition for project evidence;
- do not infer that a planning-only/no-write exercise has zero security risk merely because no files were modified; only the mutation risk from that exercise may be directly low/absent.

Likewise, do not invent authentication policy, dependency behavior, observability signals, rollback procedures, status codes, or error semantics in a verification plan. Verify only what the specification/contracts actually require.

Conditional behavior that depends on unresolved design decisions must remain unresolved. Do not populate the current project's verification matrix with examples such as `DB down → degraded`, `auth denied → 401`, or latency thresholds until the specification actually defines those behaviors.

## Completion classifications

Use precise language:

- **PASS** — criterion directly verified;
- **FAIL** — criterion contradicted by evidence;
- **WARN** — non-blocking issue or optional capability unavailable;
- **UNVERIFIED** — no sufficient evidence gathered.

Do not convert WARN or UNVERIFIED into PASS.

## Technical explanation

The final report should include:

- what changed;
- why the design was chosen;
- trade-offs;
- verification performed;
- known limitations;
- rollback/recovery notes when applicable and known;
- next recommended work.

Keep implementation and risk claims proportional to the evidence actually collected.
