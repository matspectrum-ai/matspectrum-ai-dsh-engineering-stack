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
- PASS: engineering profile `node_modules` points to the canonical locked workspace graph
- PASS: profile runtime dependency import succeeds for `@deepseek-ai/dsh-terminal`
- PASS: profile runtime dependency import succeeds for `@deepseek-ai/dsh-terminal-bash`
- PASS: profile runtime dependency import succeeds for `@deepseek-ai/dsh-tool-terminal`
- PASS: runtime `matspectrum-engineering` preset files match repository canonical state
- PASS: engineering profile composes successfully
- PASS: official DSH Web UI surface is present
- PASS: persistent terminal registry is present
- PASS: local Bash PTY backend is present
- PASS: `matspectrum-engineering` is selected by the engineering profile
- PASS: OmniRoute `auto/best-coding` is the composition-layer default model route
- PASS: managed `dsh-engineering` launcher points to this repository
- PASS: Git is available
- PASS: GitHub CLI authentication verified
- WARN: Supabase CLI installed, authentication not verified non-interactively
- PASS: Vercel CLI authentication verified
- PASS: OmniRoute `/v1/models` reachable and valid
- PASS: OmniRoute advertises `auto/best-coding`
- PASS: OmniRoute advertises `auto/coding:reliable`

Summary: **0 failures, 1 warning**.

## Session-creation regression and fix

Initial workspace selection exposed a real runtime packaging defect:

`agent-preset-invalid: preset "matspectrum-engineering" failed to mount: Cannot find package '@deepseek-ai/dsh-tool-terminal' imported from ~/.dsh/profiles/engineering/`

The previous CI only validated `--dump-config`; it did not mount the preset and therefore did not exercise loader resolution at session creation.

The fix made terminal runtime packages explicit, exact profile dependencies in the canonical workspace graph and materialized a managed profile `node_modules` link. The doctor now imports the three profile runtime packages from the profile resolution boundary, closing the false-GREEN gap.

After the fix, workspace `teste dsh` selected successfully and a blank `New Session` was created with the `matspectrum Engineering` preset under the `Workspace Write` permission boundary.

## Model selection precedence observed

The repository composition layer declares `omniroute/auto/best-coding` as the base default. The Web UI displayed `auto/coding` during the target-machine session because DSH persists a successful model-picker selection in the `agent-default-model` settings layer, which intentionally overrides the composition-layer default for subsequent blank/new sessions.

This persisted user preference is expected DSH behavior and is not classified as repository drift. The stack does not overwrite a deliberate user model selection during bootstrap.

## End-to-end agent capability validation

A real agent session through the Web UI completed the Phase 2 capability test without modifying files:

1. **Model/provider path** — the session produced normal LLM responses through the configured DSH/OmniRoute route.
2. **One-shot bash** — `pwd` executed successfully and returned `/home/matspectrum-ai/Desktop/teste dsh`.
3. **Git status** — `git status --short` returned an error because `teste dsh` is not a Git repository. This is a workspace property, not a bash-tool failure.
4. **Persistent PTY open** — `terminal_open` created shell session `pty-1`.
5. **Persistent state write** — `terminal_send` executed `export DSH_PTY_TEST=works` in `pty-1`.
6. **Persistent state read** — a later `terminal_send` executed `printf '%s\n' "$DSH_PTY_TEST"` and returned exactly `works`.
7. **Terminal inventory** — `terminal_list` confirmed `pty-1` was active.
8. **Explicit cleanup** — `terminal_close` closed `pty-1`.
9. **Authenticated external CLI** — one-shot bash executed `vercel whoami` successfully and returned the authenticated account identifier.

No files were changed, no commit was created, and no destructive operation was performed by the agent during this E2E test.

## Phase 2 result

The functional gates are GREEN:

- bounded one-shot shell execution: PASS
- persistent PTY open/send/read/list/close: PASS
- PTY state persistence across sends: PASS
- authenticated external CLI execution: PASS
- real Web UI session creation with repository-owned preset: PASS
- provider-backed LLM response: PASS

The Supabase authentication warning remains a non-blocking environment capability warning and is not a Phase 2 execution-runtime failure.
