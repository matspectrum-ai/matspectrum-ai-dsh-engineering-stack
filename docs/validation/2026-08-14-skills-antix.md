# Phase 3 antiX validation — engineering skills

Date: 2026-08-14
Target: antiX Linux, Node.js v24.18.1, pnpm 11.7.0
Branch: `phase3/skills-foundation`

## Bootstrap result

The Phase 3 bootstrap completed successfully against the real user runtime homes:

- DSH home: `~/.dsh`
- Agents home: `~/.agents`

Observed behavior:

- repository dependencies were already up to date under the pinned pnpm version;
- engineering profile runtime dependencies resolved from the canonical locked workspace graph;
- canonical engineering profile was materialized into the real DSH home;
- canonical `matspectrum-engineering` preset was materialized and a divergent previous `agent.cordis.yml` was backed up before replacement;
- canonical engineering skills were materialized into `~/.agents/skills`;
- composed profile validation succeeded.

## Doctor result

Doctor reported:

- PASS: Node.js v24.18.1 supported;
- PASS: pnpm 11.7.0 matches the pin;
- PASS: local DSH runtime matches 0.1.0-rc.6;
- PASS: engineering profile files match repository canonical state;
- PASS: profile `node_modules` points to the canonical locked workspace graph;
- PASS: terminal runtime packages import successfully from the profile boundary;
- PASS: canonical `matspectrum-engineering` preset matches repository state;
- PASS: all 14 managed skill bundles have matching frontmatter names;
- PASS: all 14 managed skills have required descriptions;
- PASS: all 14 runtime managed skills match repository canonical state;
- PASS: managed skills manifest contains exactly 14 skills;
- PASS: engineering profile composes successfully;
- PASS: Web UI, persistent terminal registry and Bash PTY backend are present;
- PASS: `matspectrum-engineering` is selected by the engineering profile;
- PASS: OmniRoute `auto/best-coding` is the composition-layer default;
- PASS: GitHub CLI authentication verified;
- WARN: Supabase CLI installed but authentication could not be verified non-interactively;
- PASS: Vercel CLI authentication verified;
- PASS: OmniRoute endpoint/catalog/default/fallback route checks passed.

Summary: **0 failures, 1 non-blocking warning**.

## Managed skills validated

1. `problem-analysis`
2. `specification-driven-development`
3. `contract-driven-development`
4. `test-driven-development`
5. `architecture`
6. `debugging`
7. `code-review`
8. `security-review`
9. `verification`
10. `git-workflow`
11. `api-design`
12. `database-migrations`
13. `production-readiness`
14. `graph-engineering`

## Remaining target-machine gates

The runtime materialization and doctor gates are GREEN. Phase 3 remains open until a real DSH session in an unrelated workspace proves:

1. the global Agents-home skills appear in the model-facing skill catalog;
2. the agent can load `problem-analysis`, `specification-driven-development`, `test-driven-development`, and `verification` through the skill tool;
3. the loaded skill instructions materially shape a no-write planning exercise;
4. the agent remains in Brazilian Portuguese under the repository-owned persona policy.
