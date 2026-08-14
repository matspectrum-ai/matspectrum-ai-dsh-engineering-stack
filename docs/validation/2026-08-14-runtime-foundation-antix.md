# Runtime Foundation Validation — antiX target

Date: 2026-08-14
Status: PASS

## Target environment

- OS family: antiX / Debian
- Node.js: `v24.18.1`
- pnpm: `11.7.0`
- DSH runtime: `0.1.0-rc.6`
- launcher: `~/.local/bin/dsh-engineering`
- canonical profile: `engineering`
- interactive surface: official DeepSeek Harness Web UI

## Bootstrap evidence

The target machine ran `./scripts/bootstrap` from the canonical repository branch.

Observed mandatory checks:

- pinned DSH release exists in npm registry: PASS
- dependency installation under reviewed `allowBuilds` policy: PASS
- canonical engineering profile materialized: PASS
- profile package manifest matches repository: PASS
- profile patch matches repository: PASS
- profile pnpm settings match repository: PASS
- `dsh --profile engineering --dump-config` composition: PASS
- official Web surface present: PASS
- `dsh-engineering` launcher points to canonical repository: PASS
- Git available: PASS
- GitHub CLI available: PASS
- Supabase CLI available: PASS
- Vercel CLI available: PASS

Doctor summary: `0 failure(s), 0 warning(s)`.

## Reproducibility evidence

The successful install generated the canonical root `pnpm-lock.yaml`.

The target machine then ran:

```sh
pnpm install --frozen-lockfile
```

Result: `Already up to date`, exit success.

The lockfile was committed to the foundation branch. CI subsequently reproduced the runtime using `pnpm install --frozen-lockfile` and verified the installed `dsh --version`.

## Web runtime evidence

The target machine ran:

```sh
dsh-engineering
```

Observed launcher output:

```text
dsh web: http://127.0.0.1:3080
```

The browser successfully loaded the official DeepSeek Harness Web UI at that loopback URL. The page rendered the DeepSeek Harness shell, New Session action, workspace selection, mode selection, and Settings surface without a fatal startup error.

## Security boundary verified in this phase

- Web control plane remains on loopback.
- No public `0.0.0.0` exposure was introduced.
- Global unrestricted host permissions were not enabled.
- Dependency build scripts remain fail-closed with a reviewed allowlist.
- Existing unrelated global `dsh` installations are not silently removed by bootstrap.

## Foundation conclusion

Phase 1 acceptance criteria are satisfied. Runtime Foundation may be merged and treated as the baseline for subsequent capability phases.
