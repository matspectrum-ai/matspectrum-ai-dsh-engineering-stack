# matspectrum-ai DSH Engineering Stack

Reproducible, version-controlled engineering distribution built on top of DeepSeek Harness (`dsh`).

This repository is the canonical source of truth for the engineering environment: profiles, skills, orchestration rules, contracts, verification gates, MCP/LSP integration, terminal capabilities, mobile-access policy, installation manifests, and acceptance tests.

## Status

Foundation phase. No bootstrap or runtime implementation is considered stable yet.

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
