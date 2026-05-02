# Task management — worked examples

> ⚠️ **FICTIONAL EXAMPLE DATA** — Names like "Ravi", "Priya" and tasks like "deploy v2" are placeholders only. Never use them in real responses. All output must come from live tool calls.

Concrete WhatsApp → tool-call pairs. Match by shape, not exact wording.

---

### 1. Simple create
**User:** "create task deploy v2"
1. `yesboss_lookup_user({ phone_e164 })` → `{ user_id, organization_id, role }`
2. `yesboss_create_task({ title: "deploy v2", organization_id })`
3. Reply: `✅ Task created: *deploy v2* (medium) — id: <id>`

### 2. Create with priority + project
**User:** "urgent task fix login bug for project payments"
1. lookup user
2. `yesboss_list_projects({ organization_id })` → find "payments" id
3. If ambiguous name, ask: "Which payments project — *payments-api* or *payments-web*?"
4. `yesboss_create_task({ title: "fix login bug", priority: "critical", project_id, organization_id })`

### 3. Create and assign in one shot
**User:** "create task write docs and assign to Ravi"
1. lookup sender + lookup Ravi by name (`yesboss_lookup_user` by name — or list users)
2. create task → get `task_id`
3. `yesboss_assign_task({ task_id, assignee_id: ravi_id })`
4. Reply combined: `✅ Task *write docs* created and assigned to Ravi`

### 4. Status update — direct
**User:** "mark deploy v2 as done"
1. If one matching task → `yesboss_update_task_status({ task_id, status: "done" })`
2. If multiple → ask: "You have 2 tasks matching 'deploy v2'. Pick id: 1) ... 2) ..."

### 5. Status update — "it"
**User (turn 1):** "what's pending for me?" → list shown
**User (turn 2):** "mark the first one done"
1. Read session turns. Resolve "first one" = `turns[-1].toolCalls[last].result[0]`
2. `yesboss_update_task_status({ task_id: resolved, status: "done" })`

### 6. Delete — destructive, confirm
**User:** "delete the login bug task"
1. Find task
2. Reply: `⚠️ Delete *fix login bug* (id X)? Reply YES to confirm.`
3. Call `yesboss_set_confirmation({ phoneE164, pending: { action: "delete_task", params: { task_id: X } } })`
4. Wait. On "YES" → `yesboss_delete_task({ task_id, confirmed: true })` → clear confirmation.
5. Any other reply → clear confirmation, say "Cancelled."

### 7. List-my-tasks
**User:** "what do I have to do today?" / "my tasks" / "pending"
1. `yesboss_list_my_tasks({ organization_id, user_id })`
2. Filter client-side to `status in [todo, in_progress, in_review]`, sort by priority then dueDate
3. Reply: bulleted, max 10, format: `• *title* (priority) — status`

### 8. Decompose epic
**User:** "break down 'launch v2 website' into tasks"
1. `yesboss_search_knowledge({ organization_id, q: "website launch SOP", category: "SOP" })`
2. `yesboss_decompose_task({ description: "launch v2 website", organization_id, project_id })`
3. Present proposed subtasks → ask "Create all? (YES) or edit list first?"
4. On YES → create parent + loop create subtasks with `parent_task_id`

### 9. Bulk status
**User:** "mark all my review tasks as done"
1. list_my_tasks filtered by `status=in_review`
2. Count. If > 5, confirm: "⚠️ Mark 7 tasks done? YES?"
3. Loop `update_task_status`

### 10. Ambiguous create
**User:** "task for Ravi"
1. Missing title. Set activeIntent:
   `yesboss_set_intent({ phoneE164, intent: { name: "creating_task", collected: { assignee_name: "Ravi" }, missing: ["title"] } })`
2. Ask: "What should the task be called?"
3. Next turn fills title → complete flow

### 11. Update title + priority
**User:** "rename 'fix bug' to 'fix login timeout' and make it critical"
1. resolve task → `yesboss_update_task({ task_id, title: "fix login timeout", priority: "critical" })`

### 12. Query by tag
**User:** "show me all frontend tasks"
1. `yesboss_list_tasks({ organization_id, tags: ["frontend"] })` (if backend supports)
2. Fallback: list all, filter client-side on returned tags.

### 13. Due date
**User:** "create task QA test due friday"
1. Parse "friday" → next Friday ISO date
2. create_task with `due_date`
3. Confirm with human-readable date.

### 14. Reopen done task
**User:** "reopen deploy v2"
1. `update_task_status({ task_id, status: "todo" })`
2. Reply: `🔁 *deploy v2* reopened (done → todo)`

### 15. Reassign
**User:** "move fix bug from Ravi to Priya"
1. `unassign_task({ task_id })`
2. `assign_task({ task_id, assignee_id: priya_id })`
3. Reply: `↔️ *fix bug*: Ravi → Priya`

### 16. Task with description
**User:** "create task Design review — need mockups for homepage and dashboard"
1. Split title vs description: title = "Design review", description = rest
2. `create_task` with both.

### 17. Status check on single task
**User:** "what's the status of deploy v2?"
1. `get_task({ task_id })`
2. Reply: `*deploy v2*: in_progress — assigned: Ravi — due: Fri`

### 18. Unknown entity
**User:** "update the website project"
1. `list_projects` → no match
2. Reply: "No project named *website* — did you mean *web-v2* or *marketing-site*?"

### 19. Non-admin destructive
**User (role=member):** "delete project X"
1. Role check via `lookup_user` result. Role ≠ admin.
2. Reply: `🚫 Only admins can delete projects. Ask your team admin.`

### 20. Rapid-fire multi-intent
**User:** "create task A, create task B, and mark C as done"
1. Parse into 3 operations
2. Execute sequentially, collect results
3. Reply: `✅ A created\n✅ B created\n🔄 C → done`
4. On any failure, continue others, summarize: `❌ B failed: <reason>`
