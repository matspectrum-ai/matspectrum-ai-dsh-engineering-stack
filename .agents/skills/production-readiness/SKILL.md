---
name: production-readiness
description: "Evaluate whether a change is safe to operate in production across configuration, secrets, observability, health, capacity, reliability, backup, rollback, security, deployment, and incident response."
whenToUse: "Use before production deployment, release, external launch, high-risk migration, or when converting a prototype into an operational service."
metadata:
  owner: matspectrum-ai
  category: operations
---

# Production Readiness

Passing tests is necessary but not sufficient for production readiness.

## Configuration

- production configuration is explicit and reproducible;
- required environment variables are documented/validated;
- secrets are external to Git;
- invalid configuration fails visibly;
- config precedence is understood.

## Availability and health

- startup failures are diagnosable;
- liveness/readiness semantics are appropriate;
- external dependency failure is classified;
- graceful shutdown/cancellation is handled;
- retry loops are bounded with backoff where needed.

## Observability

Ensure operators can answer:

- Is the service working?
- What failed?
- Which dependency is responsible?
- Which request/session/job was affected?
- Is the failure growing?

Use logs, metrics, traces, audit records, and doctor/health probes as appropriate. Avoid sensitive values.

## Capacity and performance

Consider:

- expected traffic/concurrency;
- memory/CPU limits;
- database connection pools;
- rate limits;
- queue/backpressure;
- large payloads;
- timeout budgets;
- cost-sensitive external calls.

## Data durability

- backups exist where needed;
- restore path is understood;
- migrations have recovery plans;
- destructive operations are guarded;
- retention/deletion behavior is explicit.

## Security

Load `security-review` for exposed or sensitive systems. Confirm least privilege, network bind, secrets, authn/authz, supply chain, and tool execution boundaries.

## Deployment

Define:

- deployment order;
- compatibility window;
- health verification;
- rollback trigger;
- rollback mechanics;
- feature flags or staged rollout when useful.

## Incident readiness

- failure signals are actionable;
- operators know how to stop/restart/disable a failing component;
- critical dependencies and owners are documented;
- recovery does not depend on undocumented conversation context.

## Release gate

Return a readiness matrix with PASS/WARN/FAIL/UNVERIFIED. A blocker remains a blocker until mitigated or explicitly accepted by the responsible owner.
