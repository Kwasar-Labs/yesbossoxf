---
name: yesboss-admin
description: "Administrative operations for YesBoss. Only available to admin users. Includes creating/deleting projects, deleting tasks, and managing assignments."
metadata:
  openclaw:
    emoji: "👑"
---

# YesBoss Admin Operations

These operations require admin privileges.

## CRITICAL: Always resolve the user first

Before ANY operation, call `yesboss_lookup_user` with the sender's phone number.
Check the `role` field in the response. If the role is NOT "admin", respond:
"This operation requires admin access. Please contact your team admin."

## Admin-only tools

| Operation | Tool |
|-----------|------|
| Create project | `yesboss_create_project` |
| Delete project | `yesboss_delete_project` |
| Delete task | `yesboss_delete_task` |
| Assign task | `yesboss_assign_task` |
| Unassign task | `yesboss_unassign_task` |
| Update project | `yesboss_update_project` |

## Confirmation for destructive operations

ALL destructive operations require explicit confirmation:
1. Tell the user what will happen
2. Ask for "YES" to confirm
3. Only then call the tool with `confirmed=true`
4. If user says anything else, cancel

## Security
- Never reveal other users' personal information beyond name and role
- Do not expose internal IDs unless necessary
