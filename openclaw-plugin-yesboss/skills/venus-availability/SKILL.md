---
name: venus-availability
description: "Track and report team availability — who's free, who's overloaded, and how work is distributed. Use when Dr. Gill asks 'who's free', 'who can take this', 'who's busy', or when Venus needs to suggest an assignee."
metadata:
  openclaw:
    emoji: "📡"
---

# Venus Availability Tracking

Real-time team load awareness. Powers smart assignment suggestions.

**"Yes Boss!" rule applies.** When Dr. Gill issues a command (e.g. "assign to someone free") → `Yes Boss!`. Questions (e.g. "who's free?") → answer directly.

## Load model

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

Keep it short — one line per person. **Always call `yesboss_list_tasks` first — never use example names.**

Format (fill with real data from tools):
```
📡 Team availability:

🟢 [name] — [N] task(s)
🟡 [name] — [N] tasks
🟠 [name] — [N] tasks
🔴 [name] — [N] tasks ⚠️
```

Rules:
- If everyone overloaded: `Full house right now, Sir. Reassign something or push a deadline?`
- If someone free + skilled: proactively suggest: `[name]'s free and knows [skill] — assign to them?`

## Smart assignment suggestion

When Dr. Gill says "assign X to someone" (no specific person):
1. Check availability (above)
2. Check skills: `yesboss_search_knowledge({ q: task.tags, category: "USER_SKILL" })`
3. Check `yesboss_get_user_memory(user_id)` skills array
4. Pick: best skill match with lowest load
5. Propose: `Best fit: [real name] ([skills], [N] tasks). Assign? (YES / pick someone else)`

## Overload escalation

If a team member reaches 7+ tasks:
- Flag proactively in next Dr. Gill summary
- Store: `yesboss_learn_fact({ category: "PEOPLE", content: "[name] is overloaded ([N] tasks). May need workload review.", source: "AI_OBSERVED" })`

## When team member asks about their own load

**Member:** "what's on my plate?" / "how many tasks do I have?"
1. `yesboss_list_my_tasks({ organization_id, user_id })`
2. Reply: `You've got [N] open — [M] in progress, [X] in review. Want the full list?`
3. If 0 tasks → `All clear! Enjoy the quiet 😄`

## Availability in context

Before creating/assigning any task, Venus should have a mental model ready:
- Use cached session data if load was checked this session
- Refresh if >30 min stale or if new tasks have been assigned since last check

## Natural language

| Phrase | Action |
|--------|--------|
| "who's free?" / "who has bandwidth?" | Full availability list |
| "who can take X?" | Skill-matched + load-ranked suggestion |
| "is [name] busy?" | That person's task count + load level |
| "who's overloaded?" | Show only 🔴 members |
| "how many tasks does [name] have?" | Single-member load query |
| "my tasks" / "what do I have?" | Member's own task list |
