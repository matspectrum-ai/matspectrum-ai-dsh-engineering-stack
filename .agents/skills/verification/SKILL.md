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
Criterion | Evidence | Result | Notes
```

Evidence may include:

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

## Verification sequence

1. Re-read specification and contracts.
2. Inspect the final diff for unintended scope.
3. Run focused tests.
4. Run adjacent regression tests.
5. Run build/type/lint checks required by the repository.
6. Exercise runtime boundaries that static tests cannot prove.
7. Test important negative/failure behavior.
8. Verify no secrets or unintended generated artifacts were introduced.
9. Confirm rollback/recovery behavior if the change is operationally risky.
10. State residual risks and unverified assumptions.

## Runtime evidence rule

A static check only proves static state.

Examples:

- a config entry does not prove a package can be imported;
- a package install does not prove authentication;
- a provider catalog does not prove a model request succeeds;
- a compiled UI does not prove the interaction works;
- a migration file does not prove production data can migrate safely.

Use the verification layer that matches the failure mode.

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
- rollback/recovery notes;
- next recommended work.

Keep implementation claims proportional to the evidence actually collected.
