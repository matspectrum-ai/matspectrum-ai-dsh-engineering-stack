# Phase 2 antiX validation — execution capabilities

Date: 2026-08-14
Target: antiX Linux, Node.js v24.18.1, pnpm 11.7.0
Branch: `phase2/execution-capabilities`

## Bootstrap result

The Phase 2 bootstrap completed successfully against the real user DSH home.

Observed doctor results:

- PASS: Node.js v24.18.1 is supported
- PASS: pnpm 11.7.0 matches the pinned version
- PASS: local DSH runtime matches pinned 0.1.0-rc.6
- PASS: runtime engineering profile files match repository canonical state
- PASS: runtime `matspectrum-engineering` preset files match repository canonical state
- PASS: engineering profile composes successfully
- PASS: official DSH Web UI surface is present
- PASS: persistent terminal registry is present
- PASS: local Bash PTY backend is present
- PASS: `matspectrum-engineering` is selected by the engineering profile
- PASS: managed `dsh-engineering` launcher points to this repository
- PASS: Git is available
- PASS: GitHub CLI authentication verified
- WARN: Supabase CLI installed, authentication not verified non-interactively
- PASS: Vercel CLI authentication verified

Summary: **0 failures, 1 warning**.

## Web UI validation

`dsh-engineering` booted the official Web UI at `http://127.0.0.1:3080`.

The preset selector displayed and selected the repository-owned `matspectrum Engineering` preset. The shipped Standard, Code, Minimal and Creator presets remained available alongside it.

This proves the target-machine gates for profile composition, PTY host services, preset materialization, default preset selection and Web UI discovery.

## Remaining end-to-end gates

Phase 2 remains open until a real configured model/provider session proves:

1. bounded one-shot shell execution;
2. persistent PTY open/send/read/list/close behavior;
3. state persistence across terminal sends;
4. CLI execution through the agent under the default workspace-write/approval boundary.
