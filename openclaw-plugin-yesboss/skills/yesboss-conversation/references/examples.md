# Conversation — examples

### 1. Pronoun "it"
**Turn 1:** "create task deploy v2" → `✅ Task created: *deploy v2* id=X`
**Turn 2 user:** "mark it as done"
1. get_session → last assistant turn toolCalls show task id=X
2. `update_task_status({ task_id: X, status: "done" })`

### 2. Missing slot
**User:** "create a task"
1. No title → `set_intent({ name: "creating_task", collected: {}, missing: ["title"] })`
2. Reply: `What should the task be called?`

**User next turn:** "fix login bug"
1. get_session → activeIntent present, missing=["title"]
2. Move title into collected → missing empty → execute create_task.
3. Clear intent.

### 3. Pivot mid-intent
**Turn 1 user:** "create a task" (intent started, missing title)
**Turn 2 user:** "actually, what projects do we have?"
1. Clear old intent, list_projects.

### 4. Confirmation YES
**Turn 1 assistant:** "⚠️ Delete legacy project? Reply YES."
pendingConfirmation = delete_project.
**Turn 2 user:** "YES"
1. Execute delete_project with confirmed=true
2. Clear pendingConfirmation

### 5. Confirmation expired
pendingConfirmation set 12 min ago. User replies "YES".
1. Timestamp >10 min old → expired
2. Clear pending, reply: `That confirmation expired. Want to try again?`

### 6. "The first one"
**Turn 1 user:** "my tasks"
**Turn 1 reply:** listed 5 tasks ordered by priority
**Turn 2 user:** "start the first"
1. Resolve first = listed[0].id
2. update_task_status → in_progress

### 7. Ambiguous pronoun
**Turn 1 user:** "show tasks and projects"
**Turn 1 reply:** shows both
**Turn 2 user:** "delete the last one"
1. Ambiguous (task or project?)
2. Ask: `The last task *X*, or the last project *Y*?`

### 8. Concurrent intents
User starts creating task, doesn't finish, then asks unrelated question.
1. Keep intent, answer question, remind at end: `(Still waiting on task title. Say 'cancel' to drop.)`
