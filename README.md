# matspectrum-ai DSH Engineering Stack

Reproducible, version-controlled engineering distribution built on top of DeepSeek Harness (`dsh`).

This repository is the canonical source of truth for the engineering environment: profiles, skills, orchestration rules, contracts, verification gates, MCP/LSP integration, terminal capabilities, mobile-access policy, installation manifests, and acceptance tests.

## Runtime model

DeepSeek Harness is a pinned dependency, not vendored source and not a fork. The repository currently pins:

- `@deepseek-ai/dsh` `0.1.0-rc.6`
- `pnpm` `11.7.0`
- Node.js `^22.19.0 || >=24.0.0`

The canonical `engineering` profile composes the official `@deepseek-ai/dsh-base` and `@deepseek-ai/dsh-web-app` bundles. The official Web UI is therefore the primary interactive surface. Headless automation and a future TUI are separate surfaces over the same runtime configuration.

## Bootstrap

From a clone of this repository:

```sh
./scripts/bootstrap
```

Bootstrap validates Node.js, activates the pinned pnpm version, verifies the pinned DSH release exists, installs the repository-local DSH runtime from the canonical lockfile, materializes the canonical `engineering` profile under `$DSH_HOME` (default `~/.dsh`), installs `~/.local/bin/dsh-engineering`, validates profile composition, and runs the doctor.

It does not silently remove another existing global `dsh`. The managed launcher always executes the runtime pinned by this repository.

After bootstrap, open the engineering agent from any project directory:

```sh
cd /path/to/project
dsh-engineering
```

The current directory remains the DSH workspace while the launcher uses this repository's pinned runtime and `engineering` profile.

## Verification

```sh
pnpm acceptance
pnpm doctor
```

`doctor` distinguishes mandatory runtime failures from optional CLI warnings. Git is mandatory at this stage; GitHub, Supabase, and Vercel CLIs are detected and were present on the first validated antiX target machine.

## Status

Phase 1 — Runtime Foundation is validated.

The canonical bootstrap has been proven on the target antiX machine with Node.js `v24.18.1`, pnpm `11.7.0`, DSH `0.1.0-rc.6`, profile composition, launcher installation, and doctor result `0 failures / 0 warnings`. The official Web UI was then booted successfully through `dsh-engineering` at `http://127.0.0.1:3080`. The dependency graph is committed in `pnpm-lock.yaml`, and CI reproduces it with `pnpm install --frozen-lockfile`.

Subsequent phases add, in test-first order: shell/PTY capability verification, portable Skills, LSP, MCP, SDD/TDD governance, graph orchestration, secure mobile access, and hardening.

## Engineering rule

Changes follow specification-first and test-first development:

1. Problem analysis
2. Specification
3. Contracts
4. Failing tests / acceptance gates
5. Minimal implementation
6. Refactor
7. Technical verification

DeepSeek Harness is treated as a pinned upstream runtime dependency, not as the repository's source of truth for engineering methodology.
