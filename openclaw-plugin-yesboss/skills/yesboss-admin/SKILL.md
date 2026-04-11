---
name: yesboss-admin
description: "Administrative operations for YesBoss. Only available to admin users. Includes creating/deleting projects, deleting tasks, and managing assignments."
metadata:
  openclaw:
    emoji: "👑"
---

# YesBoss Admin Operations

These operations require admin privileges. If the user is not an admin, politely explain that the operation requires admin access and suggest they contact their team admin.

## Admin-only operations

| Operation | Tool |
|-----------|------|
| Create project | `yesboss_create_project` |
| Delete project | `yesboss_delete_project` |
| Delete task | `yesboss_delete_task` |
| Assign task | `yesboss_assign_task` |
| Unassign task | `yesboss_unassign_task` |
| Update project | `yesboss_update_project` |

## Confirmation requirements

ALL destructive admin operations require explicit confirmation before executing:

- **Delete**: "Are you sure you want to delete [name]? This cannot be undone. Reply YES to confirm."
- **Reassign**: "Reassign [task title] to [new person]? Reply YES to confirm."

**Protocol:**
1. Present what will happen
2. Ask for explicit "yes" / "confirm" / "YES" response
3. Only then call the tool with `confirmed=true`
4. If the user says anything else, cancel the operation

## Permission checking

1. Always resolve the sender with `yesboss_lookup_user` first
2. Check the returned `role` field
3. If `role` is not "admin", respond: "This operation requires admin access. Please contact your team admin."
4. Do NOT proceed with the operation if the user is not an admin

## Security notes

- Never reveal other users' personal information beyond name and role
- Do not expose internal IDs unless necessary for the conversation
- Log all admin operations mentally and include a brief audit note in your response
