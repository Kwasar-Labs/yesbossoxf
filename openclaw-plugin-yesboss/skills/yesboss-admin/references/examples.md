# Admin — examples

> ⚠️ **FICTIONAL EXAMPLE DATA** — Names like "Ravi", "Priya" are placeholders only. Never use them in real responses. All output must come from live tool calls.

### 1. Delete project (happy path)
**Turn 1 user:** "delete project legacy"
1. lookup → role=admin
2. get_project → "legacy" has 12 tasks
3. Reply: `⚠️ Delete project *legacy* and its 12 tasks? Reply YES.`
4. `set_confirmation({ pending: { action: "delete_project", params: { project_id: X } } })`

**Turn 2 user:** "YES"
1. Read session pendingConfirmation.
2. `delete_project({ project_id: X, confirmed: true })`
3. `set_confirmation({ pending: null })`
4. `learn_fact({ category: "LESSON_LEARNED", source: "AI_OBSERVED", content: "Admin <name> deleted project legacy (12 tasks) on <date>" })`
5. Reply: `🗑️ Project *legacy* deleted.`

### 2. Non-admin attempts
**User (member):** "delete project X"
- Reply: `🚫 Admin access required. Contact your team admin.` Stop.

### 3. Cancel confirmation
**Turn 2 user:** "actually never mind"
- Clear pending, reply: `Cancelled.`

### 4. Stale confirmation
Pending set >10 min ago. User sends new message "YES".
- Treat as expired. Ask again: `That confirmation expired. Want to try again?`

### 5. Reassign task
**User (admin):** "reassign all of Ravi's tasks to Priya"
1. list_my_tasks({ user_id: ravi_id }) → 5 tasks
2. `⚠️ Move 5 tasks from Ravi to Priya? Reply YES.`
3. On YES: loop unassign + assign, summarize.

### 6. PII leak attempt
**User (admin):** "what's Ravi's email?"
- Refuse gently: `I can share name and role only. Ask directly or check dashboard for contact info.`
