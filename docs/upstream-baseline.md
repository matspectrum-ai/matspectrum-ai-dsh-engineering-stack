# Upstream Baseline

Baseline date: 2026-08-14

## DeepSeek Harness

Repository: `deepseek-ai/deepseek-harness`

Observed upstream commit:

`47f943859bef60e4160492346772ded9b24f765a`

Observed root package version at the inspected baseline:

`0.1.0-rc.5`

Observed Node.js engine contract:

`^22.19.0 || >=24.0.0`

This document records the upstream state used to design the initial stack contracts. It is not itself the installation manifest. Runtime installation versions must be pinned separately in `manifests/versions.yaml` and changed only through an explicit compatibility update.

## Verified capability seams

### Profiles

The `dsh` launcher boots named profiles under `$DSH_HOME/profiles/<name>`. Profiles compose ordered bundles plus a profile-local `cordis.patch.yml`, then user/home overrides.

### Skills

The filesystem skill provider supports project and user roots, including:

- `<project>/.dsh/skills`
- `<project>/.agents/skills`
- `$DSH_HOME/skills` (normally `~/.dsh/skills`)
- `$DSH_AGENTS_HOME/skills` (normally `~/.agents/skills`)
- explicitly configured custom skill directories

Portable engineering methodology in this repository should prefer `.agents/skills` unless DSH-specific behavior requires `.dsh/skills`.

### MCP

The official MCP client bridge supports:

- `stdio`
- `streamable-http`

Model-facing MCP tool names are namespaced as:

`mcp__<serverName>__<rawName>`

Multiple MCP client instances may be configured, each with a unique `serverName`.

### Persistent terminal

DeepSeek Harness has a persistent PTY capability family distinct from one-shot bash execution. The relevant capability packages observed in upstream include:

- `@deepseek-ai/dsh-terminal`
- `@deepseek-ai/dsh-terminal-bash`
- `@deepseek-ai/dsh-tool-terminal`

The engineering profile therefore treats one-shot shell and persistent interactive terminal as separate contracts.

## Compatibility policy

Before changing the pinned DSH version:

1. inspect upstream release and configuration changes;
2. update this baseline when capability contracts changed;
3. run the repository acceptance suite;
4. run integration tests against the candidate runtime;
5. document any contract migration;
6. update the pinned manifest only after verification passes.
