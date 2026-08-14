# ADR 0001 — Standalone DSH Engineering Distribution

Status: Accepted

## Context

The engineering environment must be reproducible, portable between machines, and independently versioned from DeepSeek Harness upstream development.

DeepSeek Harness already exposes profiles, bundles, plugin composition, filesystem Skills, MCP integration, shell/PTY capabilities, and other extension seams. A permanent fork would increase maintenance cost and couple the engineering methodology to upstream internals.

## Decision

Maintain `matspectrum-ai/matspectrum-ai-dsh-engineering-stack` as a standalone distribution repository.

Treat `deepseek-ai/deepseek-harness` as a pinned upstream runtime dependency.

The distribution repository owns:

- engineering specifications and contracts;
- SDD/TDD governance;
- portable Skills;
- graph orchestration definitions;
- DSH profile composition;
- MCP configuration templates;
- LSP mappings;
- terminal/shell policy;
- bootstrap, update, rollback, and doctor behavior;
- secure mobile access policy;
- acceptance and compatibility tests.

## Consequences

### Positive

- Upstream can be upgraded or rolled back independently.
- Engineering methodology remains portable.
- A clean machine can reproduce the environment from one repository.
- Upstream breaking changes become explicit compatibility events.
- Security boundaries can be stricter than upstream defaults where required.

### Negative

- The repository must maintain compatibility tests against upstream DSH releases.
- Some profile/plugin integration may require adapters.
- An upstream limitation may eventually require a narrowly scoped fork.

## Fork threshold

A fork of DeepSeek Harness is permitted only after a reproducible failing acceptance test demonstrates that a required contract cannot be satisfied through public extension/configuration seams.

Any fork must be documented by a new ADR with:

- failing contract;
- affected upstream version;
- attempted non-fork solutions;
- patch scope;
- upstream synchronization strategy;
- exit strategy.
