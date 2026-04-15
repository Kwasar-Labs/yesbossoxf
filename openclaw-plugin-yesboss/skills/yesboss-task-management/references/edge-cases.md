# Task management — edge cases

### Empty title
Reject client-side before calling create. Ask user for title.

### Title too long (>200 chars)
Truncate to title + description split. Put first ~80 chars in title, rest in description.

### Duplicate title same project
Warn: "A task with that title exists. Create another? (YES) or update existing?"

### Assignee not found
Attempt fuzzy match from project members. If 0: "No user named X in this org."
If >1: list candidates, ask user to pick.

### Missing org
Never call any task tool without `organization_id`. If missing from user lookup, the lookup itself failed — re-run, or ask user to log in.

### User typed wrong phone number
`yesboss_lookup_user` returns 404. Reply: "Your phone isn't registered. Ask admin to add you."
Do not attempt any other tool.

### Session expired mid-confirmation
If pendingConfirmation is stale (>10 min), treat any reply as new input, not confirmation. Ask fresh.

### Tool returns 500
Retry once with identical params. If still fails, reply: "Server error — try again in a minute." Log the error.

### User says YES without pendingConfirmation
Reply: "Nothing to confirm. What would you like to do?"

### Contradictory update
"mark X done" then immediately "actually no, keep it in progress" — two tool calls, second overrides first. Confirm final state.

### Cross-org reference
User in org A mentions task in org B. Refuse: "That task is in another organization."

### Date parsing failure
"next Tuesday" → ambiguous (this week or next?). Default: the upcoming Tuesday, confirm in reply.
"end of month" → last day of current month.
"eod" / "today" → today 23:59 local.

### Priority conflict with KB
KB says "all payments tasks = high". User says "low priority payments fix".
Respect user explicit value, but append: `ℹ️ Note: most payments tasks are high priority.`

### Decompose returns empty
If `decompose_task` returns 0 subtasks, fall back: ask user for rough milestones, create them manually.

### Unicode / emoji in title
Pass through. WhatsApp handles.

### HTML/markdown in input
Strip before storing. Backend sanitizes but plugin should too for cleaner storage.
