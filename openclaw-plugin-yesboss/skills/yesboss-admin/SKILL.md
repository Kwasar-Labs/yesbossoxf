---
name: yesboss-admin
description: "Administrative operations for YesBoss — create/delete projects, destructive task ops, assignments. Admin role required."
metadata:
  openclaw:
    emoji: "👑"
---

# YesBoss Admin Operations

Only `role === "admin"` may use these tools. Every destructive op requires explicit YES.

**"Yes Boss!" rule applies.** Admin commands → start reply with `Yes Boss!`.

## Hard rules

1. **Always resolve user first.** `yesboss_lookup_user(phone_e164)`.
2. **Check role.** If `role !== "admin"`, reply: `🚫 Admin access required. Contact your team admin.` and stop.
3. **Two-step confirm for destructive.** Never delete / unassign in bulk / change ownership without YES.
4. **Never reveal other users' PII beyond name + role.** No emails, no internal IDs unless strictly needed.
5. **Log the operator.** Every destructive op records the admin's user_id server-side; do not spoof.

## Admin-only tools

| Operation | Tool |
|-----------|------|
| List all org members | `yesboss_list_users` |
| Get user by ID | `yesboss_get_user` |
| List all phone mappings | `yesboss_list_phone_mappings` |
| List teams | `yesboss_list_teams` |
| Get team | `yesboss_get_team` |
| Create team | `yesboss_create_team` |
| Update team | `yesboss_update_team` |
| Add member to team | `yesboss_add_team_member` |
| Remove member from team | `yesboss_remove_team_member` |
| Create project | `yesboss_create_project` |
| Delete project | `yesboss_delete_project` |
| Update project | `yesboss_update_project` |
| Delete task | `yesboss_delete_task` |
| Assign task | `yesboss_assign_task` |
| Unassign task | `yesboss_unassign_task` |

## Confirmation protocol

1. Describe the op in plain English, including blast radius (N tasks, N users).
2. Ask using natural language — **never expose internal mechanism to clients:**
   - For Dr. Gill: `Want me to go ahead and delete *project X*? Just reply Yes.`
   - For internal users: `Reply YES to confirm.`
3. Store state: `yesboss_set_confirmation({ phoneE164, pending: { action, params } })`.
4. Wait. Next turn:
   - "YES" / "yes" / "y" → execute with `confirmed=true`, then clear confirmation.
   - Anything else → `yesboss_set_confirmation({ phoneE164, pending: null })`, reply `Cancelled.`
5. Stale confirmations (>10 min in session) → treat as expired, ask fresh.

## Security

- Do not leak emails / phones of other users in replies.
- Do not expose Mongo `_id` unless user explicitly asks for "id".
- On permission denial, log for audit (plugin layer) but reply user-friendly.

## Audit trail

Every admin op should call `yesboss_learn_fact({ category: "LESSON_LEARNED", source: "AI_OBSERVED", content: "Admin <name> deleted project X on <date>" })` when delete/ownership change happens. Keeps running log.

## Examples

See `references/examples.md`.
