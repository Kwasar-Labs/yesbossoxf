---
name: yesboss-task-management
description: "Create, update, query, and manage tasks in YesBoss project management. Use when the user wants to create a task, check task status, update a task, or manage assignments via WhatsApp."
metadata:
  openclaw:
    emoji: "✅"
---

# YesBoss Task Management

Manage tasks directly from WhatsApp conversations.

## Available tools

| Need | Tool |
|------|------|
| Create a task | `yesboss_create_task` |
| List/view tasks | `yesboss_list_tasks` |
| Get task details | `yesboss_get_task` |
| Edit a task | `yesboss_update_task` |
| Change task status | `yesboss_update_task_status` |
| Delete a task | `yesboss_delete_task` |
| Assign a task | `yesboss_assign_task` |
| Remove assignment | `yesboss_unassign_task` |
| See my tasks | `yesboss_list_my_tasks` |

## Resolving the user

Before performing any operation, use `yesboss_lookup_user` with the sender's phone number to get their user ID, role, and organization ID. You need the `organization_id` for most operations.

## Workflow patterns

### Creating a task
When the user says something like "create task: fix the login bug" or "add a task for John":
1. Use `yesboss_lookup_user` to resolve the sender
2. Call `yesboss_create_task` with:
   - `title` (required) — extract from the message
   - `organization_id` — from the user lookup
   - `priority` — if user mentions urgency ("urgent" → critical, "important" → high, default → medium)
   - `assignee_id` — if user mentions a person name, look them up first
   - `due_date` — if user mentions a deadline
3. Confirm creation back to user with task ID and summary

### Updating task status
When the user says "mark task X as done" or "task 5 is complete" or "move task to review":
1. Resolve the task ID first (use `yesboss_list_tasks` or `yesboss_get_task` if needed)
2. Call `yesboss_update_task_status` with the task ID and new status
3. Valid statuses: `todo`, `in_progress`, `in_review`, `done`, `cancelled`
4. Confirm the status change

### Querying tasks
When the user asks "what are my tasks?" or "show open tasks" or "what's pending?":
1. Use `yesboss_list_my_tasks` for personal tasks
2. Use `yesboss_list_tasks` with filters for broader queries
3. Format results as a clear numbered list with task title, status, and assignee

## Response format

Keep responses concise for WhatsApp:
- Use bullet points for lists
- Keep messages under 200 words
- Lead with the most important info (status, count, action taken)
- Include task IDs for reference

## Natural language mapping

| User says | Action |
|-----------|--------|
| "create task X" / "add task X" / "new task X" | Create task with title X |
| "mark X as done" / "X is complete" / "finish X" | Update status to done |
| "start working on X" | Update status to in_progress |
| "what are my tasks?" / "what's pending?" | List tasks assigned to user |
| "show project X tasks" | List tasks filtered by project |
| "assign X to Y" | Assign task |
