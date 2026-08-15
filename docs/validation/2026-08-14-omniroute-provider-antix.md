# OmniRoute provider validation — antiX — 2026-08-14

## Environment

- OmniRoute CLI: 3.8.49
- server health: healthy
- configured local client endpoint for DSH: `http://127.0.0.1:20128/v1`
- credential reference: `OMNIROUTE_API_KEY`
- secret value was not recorded

## Observed runtime

The target machine reported OmniRoute listening on TCP port 20128 and the CLI health command returned `healthy`.

The OpenAI-compatible `GET /v1/models` endpoint returned a model catalog containing, among many routes:

- `auto/best-coding`
- `auto/coding:reliable`
- `auto/pro-coding`
- concrete provider/model routes

The engineering stack therefore uses `auto/best-coding` as its default route and exposes `auto/coding:reliable` as the initial fallback. The stack does not claim or pin which upstream model a combo selects.

## Security note

At validation time the OmniRoute server process was observed listening on `0.0.0.0:20128`. The DSH integration itself is deliberately pinned to `127.0.0.1:20128`; hardening the OmniRoute server bind is a separate deployment task and must be completed before treating the local gateway as loopback-only.

## Remaining end-to-end gate

After the updated profile is materialized on the target machine, create a fresh `matspectrum Engineering` session and prove:

1. `omniroute/auto/best-coding` is selected;
2. one-shot `bash` executes successfully;
3. PTY state persists across terminal sends;
4. terminal session closes cleanly;
5. an authenticated CLI can be invoked under the default permission boundary.
