# Delegation — examples

> ⚠️ **FICTIONAL EXAMPLE DATA** — Names like "Ravi", "Priya", "Anil" are placeholders only. Never use them in real responses. All output must come from live tool calls.

### 1. Explicit decompose
**User:** "break down 'launch v2 website' into tasks"
1. KB search SOP "website launch"
2. `decompose_task({ description: "launch v2 website", organization_id })`
3. Present 5-7 subtasks, request approval
4. On YES → create parent + children

### 2. Implicit decompose
**User:** "ship payments refactor by next Friday"
- "ship" + deadline + scope = epic. Suggest decomposition before creating.
- Reply: `That sounds like a multi-step effort. Want me to break it down? (YES/no)`

### 3. Assign by skill
Decomposed subtask `frontend build` has tag `react`.
1. search_knowledge({ q: "react", category: "USER_SKILL" })
2. Top: Ravi (confidence 0.8)
3. Check Ravi's load: list_my_tasks → 4 open. OK.
4. Suggest Ravi.

### 4. Overloaded top candidate
Top candidate Ravi has 12 open tasks. 2nd: Priya (skill 0.6, 3 open).
- Suggest Priya, note "(Ravi has 12 open, Priya has 3 and knows React)."

### 5. No skill match
Tag `embedded-c` — no USER_SKILL fact for it.
- Leave subtask unassigned. Note: "No embedded-C expert in KB — assign manually."

### 6. Edit plan
User replies "edit" after plan shown.
1. set_intent({ name: "editing_plan", collected: { proposed: [...] }, missing: [] })
2. Reply: `Which subtask to change? (e.g., 'drop #4', 'rename #2 to X', 'assign #3 to Y')`
3. Loop until user says "create".

### 7. Reuse successful plan
User launches another site 6 months later.
- `search_knowledge` finds old plan fact → reuse as starting template.

### 8. Partial creation failure
Creating 5 subtasks, subtask #3 fails (network).
- Continue others, summarize: `✅ 4 of 5 created. *QA smoke tests* failed — retry?`
