---
name: api-design
description: "Design stable HTTP/API contracts covering resources, methods, schemas, errors, authentication, idempotency, pagination, versioning, retries, webhooks, observability, and compatibility."
whenToUse: "Use for new or changed REST/HTTP APIs, SDK-facing interfaces, provider adapters, webhooks, public endpoints, or internal service boundaries."
metadata:
  owner: matspectrum-ai
  category: design
---

# API Design

Treat an API as a compatibility contract, not merely a route handler.

## Resource and operation design

- Model domain resources and actions deliberately.
- Use HTTP methods consistently with semantics.
- Define identifiers and lifecycle.
- Separate commands from reads when side effects matter.

## Request contract

Specify:

- path/query/header/body fields;
- required versus optional;
- formats and units;
- validation rules;
- size limits;
- content type;
- authentication context.

## Response contract

Specify:

- success status codes;
- response schema;
- empty/no-content behavior;
- stable error envelope;
- correlation/request identifier where useful.

## Error model

Define machine-usable errors. Include:

- code;
- HTTP status;
- human-safe message;
- retryability;
- field-level validation details where appropriate.

Do not leak internal stack traces or secrets.

## Idempotency and retries

For operations that may be retried:

- define idempotency key scope;
- duplicate request behavior;
- expiration/window;
- conflict semantics;
- downstream side-effect protection.

## Collections

Define pagination, ordering, filtering, and limits explicitly. Avoid unbounded list endpoints.

## Versioning and compatibility

- Prefer additive changes when possible.
- Define deprecation lifecycle.
- Do not silently change field meaning.
- Treat enum narrowing and required-field additions as compatibility-sensitive.

## Authentication and authorization

Document:

- credential type;
- scopes/roles;
- tenant/resource authorization;
- unauthenticated and unauthorized errors;
- rate limits when applicable.

## Webhooks

Specify:

- event types and versions;
- delivery identifier;
- signature verification;
- replay protection;
- retry schedule;
- duplicate delivery handling;
- ordering guarantees or lack thereof.

## OpenAPI

When the project uses OpenAPI, keep the specification as source of truth for request/response schemas and generate/validate downstream artifacts where practical.

## Verification

Test happy path, validation, authn/authz, idempotency, errors, retry behavior, compatibility, and malformed inputs. Use contract tests for provider adapters.
