# Security Policy

## Scope

This repository configures an agent runtime that can execute shell commands, persistent terminal sessions, external CLIs, MCP tools, filesystem operations, and remote/mobile access. Configuration changes can therefore alter the effective host security boundary.

## Non-negotiable rules

- Never commit secrets, API keys, OAuth tokens, access tokens, cookies, private keys, or production credentials.
- Never make unrestricted host execution the global default.
- Never expose an unauthenticated agent control plane directly to the public internet.
- Treat MCP servers and third-party plugins as executable code with their own trust boundary.
- Treat external CLI authentication independently from executable availability.
- Keep production credentials separate from development credentials.
- Privilege elevation and destructive actions must be explicit, observable, and contract-defined.

## Secret handling contract

Versioned configuration may contain environment-variable names and secret placeholders, but never secret values.

Examples of acceptable references:

- `${SUPABASE_ACCESS_TOKEN}`
- `${VERCEL_TOKEN}`
- `${GITHUB_TOKEN}`

The bootstrap and doctor flows must detect missing required secrets without printing their values.

## Mobile access contract

The default agent control plane remains loopback-only. Mobile access must be provided through a private authenticated network transport or an authenticated HTTPS reverse proxy whose exposure is explicitly configured.

Public tunneling is not a default or bootstrap prerequisite.

## Dependency changes

DeepSeek Harness is a fast-moving upstream dependency. Any runtime version update must run compatibility and security acceptance gates before the pinned version changes.

## Incident response

If a committed secret is discovered:

1. revoke/rotate the credential immediately;
2. remove it from current repository content;
3. treat repository-history cleanup as separate from credential rotation;
4. inspect CI logs and generated artifacts for propagation;
5. add or strengthen a regression test preventing recurrence.
