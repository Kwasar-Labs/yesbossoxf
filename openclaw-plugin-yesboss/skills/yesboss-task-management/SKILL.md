---
name: yesboss-task-management
description: "Create, update, query, and manage tasks in YesBoss project management. Use when the user wants to create a task, check task status, update a task, assign work, or manage task progress via WhatsApp."
metadata:
  openclaw:
    emoji: "✅"
---

# YesBoss Task Management

Manage tasks from WhatsApp conversations.

## Hard rules (never skip)

1. **Resolve user first.** Every turn, call `yesboss_lookup_user(phone_e164)` unless session already carries `user_id` + `organization_id` for this phone.
2. **Pass IDs as-is.** Do not parse, transform, or hand-write IDs.
3. **Confirm before destructive ops.** Delete, bulk-reassign, status → `cancelled` need explicit "YES".
4. **Consult KB before guessing.** If user says "normal priority for this kind of task" or "usual owner", call `yesboss_search_knowledge` first.
5. **Short replies.** WhatsApp = ≤10 lines, no markdown headings, lead with action taken.
6. **"Yes Boss!" on commands.** See yesboss-conversation skill rules.
7. **Always call the tool.** Never claim "no tasks" or "system unavailable" without first attempting the relevant tool call.

## Decision tree

```
user message
 ├─ asks to CREATE? → resolve user → search KB for SOP → yesboss_create_task
 ├─ asks to LIST? → list tasks (mine vs all by cue)
 ├─ "tasks from X" / "any tasks by X"? → see "Querying tasks by creator/context" below
 ├─ names specific task? → yesboss_get_task or update/status
 ├─ ambiguous? → set activeIntent, ask ONE clarifying question
 └─ destructive? → set pendingConfirmation, wait for YES
```

## Querying tasks by creator or context

When user asks "any tasks from Dr. Gill?" / "tasks Gurbeer sir gave me?" / "what did X assign to me?":
1. Resolve current user (the asker) → get their `user_id`
2. `yesboss_list_tasks({ organization_id, assignee_id: <asker_user_id> })` — all tasks assigned to them
3. Also try `yesboss_list_tasks({ organization_id })` if context suggests "all org tasks from X"
4. Filter/present tasks relevant to the named person (creator, assignee context)
5. Never say "no tasks found" without trying the tool first

## Tool map

| Intent | Tool | Required |
|--------|------|----------|
| Create | `yesboss_create_task` | `title`, `organization_id` |
| List (all) | `yesboss_list_tasks` | `organization_id` |
| List (mine) | `yesboss_list_my_tasks` | `organization_id`, `user_id` |
| Detail | `yesboss_get_task` | `task_id` |
| Edit | `yesboss_update_task` | `task_id` |
| Status | `yesboss_update_task_status` | `task_id`, `status` |
| Delete | `yesboss_delete_task` | `task_id` (+ `confirmed=true`) |
| Assign | `yesboss_assign_task` | `task_id`, `assignee_id` |
| Unassign | `yesboss_unassign_task` | `task_id` |
| Decompose | `yesboss_decompose_task` | `description`, `organization_id` |

## Priority mapping

| Phrase | Value |
|--------|-------|
| urgent / critical / p0 / blocker | `critical` |
| important / high / asap / p1 | `high` |
| normal / medium / default / p2 | `medium` |
| low / whenever / backlog / p3 | `low` |

## Status machine

`todo → in_progress → in_review → done`
Side transitions: any → `cancelled`. No skipping `in_progress` unless user explicit ("directly to review").

## Auto-learn hooks

After operation success, consider calling `yesboss_learn_fact`:
- User creates 3+ tasks in same project with same tag → `PROJECT_RULE`
- User says "I prefer X" → `PREFERENCE`
- User completes task with skill evidence ("I finished React migration") → `yesboss_add_user_skill`

## Memory injection

Before generating reply, check `yesboss_get_session(phone)` for:
- `activeIntent` — user may be mid-flow (collecting title, assignee, etc.)
- `pendingConfirmation` — user's YES/NO resolves it
- Last 5 turns — resolve "it", "that task", "the last one"

## Response patterns

```
Created:  Yes Boss! ✅ *[task title]* created ([priority]) — assigned to [real name].
Status:   🔄 *[task title]*: todo → in_progress
Deleted:  🗑️ *[task title]* deleted.
Error:    ❌ Couldn't create task: <reason>.
```

## Natural language map

| User says | Action |
|-----------|--------|
| "create task X" / "add task X" / "new task X" | Create with title X |
| "mark X as done" / "finish X" / "X is complete" | Status → done |
| "start X" / "working on X" | Status → in_progress |
| "put X in review" / "X ready for review" | Status → in_review |
| "cancel X" / "drop X" | Status → cancelled (confirm) |
| "what are my tasks?" / "pending?" / "todo?" | list_my_tasks |
| "all tasks" / "team tasks" | list_tasks |
| "assign X to Y" | assign_task |
| "unassign X" / "remove Y from X" | unassign_task |
| "break down X" / "decompose X" / "subtasks for X" | decompose_task |
| "tasks from X" / "any tasks by X" | list + filter by assignee/org context |

## More examples, edge cases, and templates

See `references/examples.md`, `references/edge-cases.md`, `references/templates.md`. Load them when:
- Input is ambiguous or multi-step
- User references project conventions
- You need a starting task template
