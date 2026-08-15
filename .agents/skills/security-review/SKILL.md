---
name: security-review
description: "Perform threat-model-driven security review across trust boundaries, authentication, authorization, secrets, injection, filesystem/shell/network access, supply chain, data exposure, and fail-open behavior."
whenToUse: "Use for authentication, payments, secrets, external integrations, agents/tools, filesystem or shell capabilities, public endpoints, migrations, deployment changes, or before production release."
metadata:
  owner: matspectrum-ai
  category: security
---

# Security Review

Security review starts from assets and trust boundaries, not a generic checklist.

## Threat model

Identify:

- protected assets;
- actors and privilege levels;
- trust boundaries;
- ingress/egress paths;
- secret stores;
- code execution surfaces;
- external dependencies;
- persistence containing sensitive data.

## Review areas

### Authentication

- credential verification;
- token lifetime and rotation;
- session fixation/replay;
- anonymous fallback;
- secure failure behavior.

### Authorization

- server-side enforcement;
- object/tenant ownership;
- privilege escalation;
- confused deputy risk;
- default-deny behavior.

### Secrets

- no literal secrets in Git;
- no secret values in logs/errors;
- environment/secret-manager boundaries;
- least-scope tokens;
- rotation and revocation.

### Injection and parsing

- SQL/command/template injection;
- path traversal;
- unsafe deserialization;
- prompt/tool injection where agents cross untrusted content;
- schema validation at boundaries.

### Shell, filesystem, and agent tools

- workspace boundary;
- approval requirements;
- destructive command controls;
- symlink/path escape;
- environment leakage;
- persistent terminal lifetime;
- no assumption that unrestricted host access is acceptable.

### Network

- SSRF;
- public bind versus loopback/private bind;
- TLS/authentication;
- redirect handling;
- egress scope;
- webhook verification.

### Data protection

- sensitive fields;
- encryption requirements;
- retention/deletion;
- backups;
- tenant isolation;
- PII in telemetry.

### Supply chain

- pinned dependencies;
- lifecycle scripts;
- provenance;
- unreviewed packages;
- build-time code execution.

## Finding format

For each finding:

```text
Severity:
Asset/boundary:
Attack precondition:
Exploit path:
Impact:
Evidence:
Remediation:
Verification:
```

Distinguish demonstrated vulnerability from hardening recommendation.

## Security gate

Do not mark production-ready while a blocker/high finding lacks an explicit accepted risk or remediation. Verify security fixes with negative tests where practical.
