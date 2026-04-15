---
name: yesboss-knowledge
description: "Query and grow the YesBoss knowledge base — org SOPs, rules, user skills, preferences, and terminology. Use BEFORE acting on ambiguous intent, and AFTER observing a persistent pattern."
metadata:
  openclaw:
    emoji: "🧠"
---

# YesBoss Knowledge Base

Persistent org memory — SOPs, preferences, who-knows-what. Powers better decisions.

## When to SEARCH (read)

Before acting, call `yesboss_search_knowledge` when:
- User references convention ("the usual", "standard", "our way")
- Creating non-trivial task — check for SOP
- Assigning work — check skill matches (`category: USER_SKILL`)
- Using org jargon — check `TERMINOLOGY`
- Confirming priority / process — check `PROJECT_RULE`

Pattern:
```
yesboss_search_knowledge({
  organization_id,
  q: "<free text>",
  category?: "SOP" | "USER_SKILL" | ...,
  reference_id?: <project or user id>,
  limit: 5
})
```

Prefer high-confidence, recent, frequently-used facts (server sorts).

## When to LEARN (write)

Call `yesboss_learn_fact` when:

| Trigger | Category | Source |
|---------|----------|--------|
| User says "remember that ..." | matching category | `USER_TAUGHT` |
| User says "I prefer ..." | `PREFERENCE` | `USER_TAUGHT` |
| User says "we always do X" | `SOP` | `USER_TAUGHT` |
| User defines jargon | `TERMINOLOGY` | `USER_TAUGHT` |
| You infer a pattern (same assignee 3x, same priority tag) | pattern category | `AI_OBSERVED` (confidence 0.4) |
| Retrospective lesson | `LESSON_LEARNED` | `USER_TAUGHT` |

## Categories

| Value | Meaning | Example |
|-------|---------|---------|
| `SOP` | Standard operating procedure | "All deploys need QA sign-off" |
| `USER_SKILL` | Who knows what | "Ravi knows React + GraphQL" |
| `PROJECT_RULE` | Project-specific rule | "payments-v2 uses high priority by default" |
| `PREFERENCE` | Individual / team preference | "PM wants Friday standup summaries" |
| `PEOPLE` | Org knowledge about people | "Priya is the tech lead for payments" |
| `TERMINOLOGY` | Org jargon → canonical | "shipit = deploy to production" |
| `LESSON_LEARNED` | Retro outcome | "Migration 0042 broke because we didn't backfill first" |
| `OTHER` | Everything else |

## Confidence

- User explicitly taught → 0.9
- AI observed single time → 0.4
- AI observed confirmed by user → 0.8
- Contradicted later → supersede with new fact (`supersedes` field)

## Search result interpretation

Results sorted by composite score (vector + keyword + tags + confidence + recency).
First 3 = most relevant. If top score low (<0.3), KB has nothing good — don't force usage.

## Never

- Don't store PII (emails, phones) in KB content.
- Don't store secrets / credentials.
- Don't store gossip or personal opinions about teammates.
- Don't create duplicate facts — search first, update confidence instead.

## Supersede pattern

User contradicts old fact:
1. Find old fact via `search`.
2. Create new fact with `supersedes: <old_id>`. Backend marks old as `supersededBy`.
3. Old fact stops appearing in search but remains for audit.

## Examples

See `references/examples.md`.
