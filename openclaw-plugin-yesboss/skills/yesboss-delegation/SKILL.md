---
name: yesboss-delegation
description: "Decompose large tasks/epics into subtasks, match assignees by skill + availability. Use when user says 'break down', 'decompose', 'plan', or for any task that looks multi-day."
metadata:
  openclaw:
    emoji: "🎯"
---

# YesBoss Delegation

Turn epics into actionable plans. Assign by fit, not random.

**"Yes Boss!" rule applies.** When user issues a decompose/plan command → start with `Yes Boss!`.

## When to decompose

Trigger decomposition if:
- User explicitly asks ("break down", "decompose", "plan", "subtasks for X").
- Title indicates scope (≥ 3 work items implied): "launch", "migrate", "rewrite", "ship", "rollout".
- Estimated effort >1 day (if effort field available).

## Decomposition flow

1. **Consult KB** — `yesboss_search_knowledge({ q: "<epic keyword> SOP", category: "SOP" })`. Use any org-defined checklist first.
2. **Consult templates** — see task skill's `references/templates.md` (bug / feature / deploy / onboarding / spike).
3. **Call decomposer** — `yesboss_decompose_task({ description, organization_id, project_id?, context? })`. Returns proposed subtasks (title, tags, priority, suggested_assignee_id).
4. **Present for approval** — list subtasks, ask `Create all? (YES) or edit.`
5. **On YES** — create parent task, then loop create each subtask with `parent_task_id`. Copy tags + suggested assignee if accepted.
6. **On edit** — set activeIntent to collect changes; user can drop / rename / re-assign items.

## Assignment by skill

After decomposer returns subtasks with suggested assignees:
- For each subtask without a suggestion, call `yesboss_search_knowledge({ q: "<subtask tag>", category: "USER_SKILL" })`.
- Top USER_SKILL fact's `reference_id` = candidate user.
- Fallback: project owner, then no assignment.

Prefer users with:
- High skill confidence (>0.6)
- Fewer open tasks (call `list_my_tasks` for each candidate — cap at 3 candidates to avoid overload)
- Recent activity (within 7 days)

## Load-balance

If top candidate has >10 open tasks:
- Suggest 2nd-place candidate.
- Alert: `ℹ️ [name] has [N] open tasks. Suggest [other name] instead — they have [N] and know [skill].`

## Plan replies

Keep compact (fill with real assignees from tools — never use example names):
```
Yes Boss! 🎯 Plan for *[real epic title]*:
1. [subtask 1] ([tag]) → [real assignee or unassigned]
2. [subtask 2] ([tag]) → [real assignee or unassigned]
3. [subtask 3] ([tag]) → [real assignee or unassigned]

Create all? (YES) or edit.
```

## Post-creation

After approved plan created:
1. `learn_fact({ category: "LESSON_LEARNED", content: "Launch v2 plan: 5 subtasks, assigned by skill match", source: "AI_OBSERVED" })` — for future reuse.
2. `push_recent_activity` per assignee.
3. Reply: `✅ 5 subtasks created under *launch v2 website*.`

## Examples

See `references/examples.md`.
