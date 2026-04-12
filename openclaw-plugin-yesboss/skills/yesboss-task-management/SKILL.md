---
name: yesboss-task-management
description: "Create, update, query, and manage tasks in YesBoss project management. Use when the user wants to create a task, check task status, update a task, or manage assignments via WhatsApp."
metadata:
  openclaw:
    emoji: "✅"
---

# YesBoss Task Management

Manage tasks directly from WhatsApp conversations.

## CRITICAL: Step-by-step workflow

**ALWAYS follow this exact sequence. Do NOT skip steps. Do NOT try to run code.**

### Step 1: Resolve the user FIRST
Call `yesboss_lookup_user` with the sender's phone number. The response gives you:
- `user_id` — the user's ID
- `organization_id` — REQUIRED for all task operations
- `name`, `email`, `role`

### Step 2: Perform the requested operation
Use the values from Step 1 directly. Do NOT try to parse or transform them.

## Available tools

| Need | Tool | Required params |
|------|------|-----------------|
| Create a task | `yesboss_create_task` | `title`, `organization_id` |
| List/view tasks | `yesboss_list_tasks` | `organization_id` |
| Get task details | `yesboss_get_task` | `task_id` |
| Edit a task | `yesboss_update_task` | `task_id` |
| Change task status | `yesboss_update_task_status` | `task_id`, `status` |
| Delete a task | `yesboss_delete_task` | `task_id` |
| Assign a task | `yesboss_assign_task` | `task_id`, `assignee_id` |
| Remove assignment | `yesboss_unassign_task` | `task_id` |
| See my tasks | `yesboss_list_my_tasks` | `organization_id`, `user_id` |

## Creating a task — example

When the user says "create task deploy with high priority":
1. Call `yesboss_lookup_user` with `phone_e164` = sender's phone
2. From the result, take `organization_id`
3. Call `yesboss_create_task` with:
   - `title`: "deploy"
   - `organization_id`: value from step 2
   - `priority`: "high"
4. Confirm creation with: "✅ Task created: **deploy** (high priority)"

## Priority mapping
- "urgent" / "critical" → `critical`
- "important" / "high" → `high`
- "normal" / default → `medium`
- "low" → `low`

## Status values
Valid: `todo`, `in_progress`, `in_review`, `done`, `cancelled`

## Response format
Keep responses concise for WhatsApp:
- Use bullet points for lists
- Keep messages under 200 words
- Lead with the action taken
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
