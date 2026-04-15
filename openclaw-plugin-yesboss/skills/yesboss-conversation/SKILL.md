---
name: yesboss-conversation
description: "Multi-turn conversation state for WhatsApp — resolve 'it'/'that'/'last one', track pending confirmations, manage multi-turn intents (mid-collection). Use on EVERY user turn."
metadata:
  openclaw:
    emoji: "💬"
---

# YesBoss Conversation State

WhatsApp is async + forgetful. Session store keeps the thread coherent across turns.

## First thing every turn

```
yesboss_get_session({ phoneE164 })
```

Examine:
- `pendingConfirmation` — if present, interpret user reply as YES/NO for that action.
- `activeIntent` — user was mid-flow. Continue it unless user clearly pivoted.
- `turns[-1..-5]` — resolve pronouns ("it", "that", "the last one").

## After every turn

Append with:
```
yesboss_append_turn({
  phoneE164, userId, organizationId,
  turn: { role: "user" | "assistant", content, toolCalls? },
  activeIntent: <new or null>,
  pendingConfirmation: <new or null>,
})
```

Use `null` to clear a field. `undefined` leaves it alone.

## Active intent lifecycle

Intent = multi-turn collection. Example: creating a task when user only gave assignee.

```
{
  name: "creating_task",
  collected: { assignee_name: "Ravi" },
  missing: ["title"],
  startedAt: <iso>
}
```

Per turn:
1. If active intent exists and user's reply fills a `missing` slot → move to `collected`.
2. If all slots filled → execute the tool, clear intent.
3. If user pivots (different intent) → clear old intent, start new.
4. If user says "cancel" / "nvm" → clear intent.

## Pending confirmation lifecycle

```
{
  action: "delete_task",
  params: { task_id: "abc" },
  promptedAt: <iso>
}
```

Per turn:
1. If pending exists:
   - User reply = YES → execute action, clear pending.
   - Anything else → clear pending, proceed with new input as normal.
2. If pending is >10 min old → treat as expired, clear, ask fresh.

## Pronoun resolution

| Phrase | Resolve to |
|--------|-----------|
| "it" / "that one" | Last object mentioned in prior assistant reply |
| "the first" / "#1" | First item from last list |
| "the last" | Last item from last list |
| "this task" | Task just created / named |
| "the same" | Previous assignee / project |

If ambiguous, ask ONE clarifying question.

## Privacy

- Never store raw PII in turns beyond what the user just typed.
- Session data expires (TTL 24h default).
- Never log sessions outside the service.

## Examples

See `references/examples.md`.
