---
name: venus-availability
description: "Track and report team availability — who's free, who's overloaded, and how work is distributed. Use when Dr. Gill asks 'who's free', 'who can take this', 'who's busy', or when Venus needs to suggest an assignee."
metadata:
  openclaw:
    emoji: "📡"
---

# Venus Availability Tracking

Real-time team load awareness. Powers smart assignment suggestions.

## Load model

Venus defines **load** as:

| Load level | # in-progress tasks | Label |
|------------|---------------------|-------|
| Free | 0–1 | 🟢 Available |
| Light | 2–3 | 🟡 Light load |
| Busy | 4–6 | 🟠 Occupied |
| Overloaded | 7+ | 🔴 Overloaded |

Overdue tasks count double toward load score.

## How to calculate

1. `yesboss_list_tasks({ organization_id })` — get all tasks
2. Group by `assignee_id`, filter `status in [in_progress, in_review]`
3. Count per user, look up names from `yesboss_lookup_user` or existing session data
4. Sort by load ascending

## Availability reply to Dr. Gill

When asked "who's free?" or before suggesting an assignee:

```
📡 Team availability:

🟢 Sam — 1 task (available)
🟡 Priya — 3 tasks (light)
🟠 Anil — 5 tasks (occupied)
🔴 Ravi — 8 tasks (overloaded ⚠️)
```

Rules:
- If everyone is overloaded: "Full house right now, Sir. Want to reassign or push a deadline?"
- If someone is free + skilled for the task: proactively suggest: "Sam's free and knows QA — assign to her?"

## Smart assignment suggestion

When Dr. Gill says "assign X to someone" (no specific person):
1. Check availability (above)
2. Check skills: `yesboss_search_knowledge({ q: task.tags, category: "USER_SKILL" })`
3. Check `yesboss_get_user_memory(user_id)` skills array
4. Pick: best skill match with lowest load
5. Propose: `Best fit: Priya (React, 2 tasks). Assign? (YES/pick someone else)`

## Overload escalation

If a team member reaches 7+ tasks:
- Flag proactively in next Dr. Gill summary
- Store: `yesboss_learn_fact({ category: "PEOPLE", content: "[name] is overloaded ([N] tasks). May need workload review." source: "AI_OBSERVED" })`

## When team member asks about their own load

**Member:** "what's on my plate?" / "how many tasks do I have?"
1. `yesboss_list_my_tasks({ organization_id, user_id })`
2. Reply: `You've got [N] open tasks, [M] in progress, [X] in review. [Lightest: task name]. Want the full list?`
3. Fun tone: if 0 tasks → "You're all clear! Enjoy the calm before the storm 😄"

## Availability in context

Before creating/assigning any task, Venus should have a mental model ready:
- Use cached session data if load was checked this session
- Refresh if >30 min stale or if new tasks have been assigned

## Natural language

| Phrase | Action |
|--------|--------|
| "who's free?" / "who has bandwidth?" | Full availability list |
| "who can take X?" | Skill-matched + load-ranked suggestion |
| "is Ravi busy?" | Ravi's specific task count + status |
| "who's overloaded?" | Show only 🔴 members |
| "how many tasks does Priya have?" | Single-member load query |
| "my tasks" / "what do I have?" | Member's own task list |
