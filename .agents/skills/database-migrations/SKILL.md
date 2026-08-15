---
name: database-migrations
description: "Plan and execute database schema/data changes with expand-contract compatibility, locking awareness, backfills, indexes, constraints, RLS/security, rollback, and production verification."
whenToUse: "Use for schema changes, backfills, index/constraint changes, Supabase/Postgres migrations, data model rewrites, or any deployment that mutates durable data."
metadata:
  owner: matspectrum-ai
  category: data
---

# Database Migrations

Durable data changes require stronger safety than ordinary code edits.

## Analyze first

Identify:

- current schema and constraints;
- row counts/data distribution when available;
- application versions that may coexist during deploy;
- write/read paths;
- foreign keys and triggers;
- RLS/policies/permissions;
- backup and restore capability.

## Prefer expand → migrate → contract

For compatibility-sensitive changes:

1. **Expand**
   - add new nullable/compatible structures;
   - deploy code that can handle old and new forms.

2. **Migrate/backfill**
   - update data in bounded batches if needed;
   - make progress observable and restartable;
   - protect against concurrent writes.

3. **Switch**
   - make new representation authoritative only after verification.

4. **Contract**
   - remove obsolete columns/constraints/code only after old versions are gone.

## Lock and performance safety

Consider:

- table rewrite;
- long exclusive locks;
- index build mode;
- transaction duration;
- statement timeout;
- replica impact;
- vacuum/storage growth;
- large backfill load.

## Constraints and indexes

- Add indexes intentionally for query patterns.
- Avoid duplicate/redundant indexes.
- Validate existing data before adding strict constraints.
- Use staged validation when the database supports it and scale warrants it.

## Security

For Postgres/Supabase:

- preserve RLS intent;
- review new tables for RLS defaults;
- review grants and service-role assumptions;
- never place credentials in migration files.

## Rollback

Classify changes:

- trivially reversible;
- code-reversible but data-destructive;
- effectively irreversible.

For irreversible changes, define backup/recovery and forward-fix strategy before deployment.

## TDD/verification

Before production:

- migration applies on representative prior schema;
- application works during compatibility window;
- constraints/indexes behave as intended;
- backfill is restartable/idempotent where required;
- rollback/recovery has been reasoned or tested;
- post-migration queries verify data invariants.

Do not declare a migration safe merely because the SQL parses.
