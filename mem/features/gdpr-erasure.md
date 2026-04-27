---
name: GDPR Right to Erasure
description: How account deletion erases all user data across 695+ tables without FK cascades
type: feature
---

## Problem
The schema has ~695 public tables with `user_id` columns but **none** have a foreign key to `auth.users`. Calling `auth.admin.deleteUser` alone leaves all user data orphaned, breaching GDPR.

## Solution
- DB function `public.gdpr_purge_user_data(_user_id uuid) returns jsonb`
  - SECURITY DEFINER, search_path locked, EXECUTE granted only to `service_role`
  - Dynamically iterates `information_schema.columns` for every public BASE TABLE with a `user_id` column and runs `DELETE FROM ... WHERE user_id = $1`
  - Also deletes from `profiles` (matches on `id`) and `user_roles`
  - Returns `{ user_id, total_rows_deleted, per_table, completed_at }`
  - Per-table errors are caught and reported in the result instead of aborting the whole purge

- Edge function `delete-user-account`
  1. Validates the caller's JWT, gets their `user.id`
  2. Requires `{ confirm: "DELETE" }` in the body
  3. Calls `gdpr_purge_user_data` via service-role RPC
  4. Then calls `auth.admin.deleteUser(userId)`
  5. Returns the purge report so the client can log/display row counts

## How to apply
- Any new user-owned table automatically benefits — no code change needed, the function discovers it via `information_schema`.
- Do NOT add `user_id` columns to tables that aren't owned by users (e.g. join/lookup tables) without RLS, or they will be wiped on account deletion.
- If a table needs to retain rows after deletion (e.g. anonymized analytics), give it a different column name like `actor_id` or `subject_id`.
