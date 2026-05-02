# Knowledge — examples

> ⚠️ **FICTIONAL EXAMPLE DATA** — Names like "Ravi", "Priya" are placeholders only. Never use them in real responses. All output must come from live tool calls.

### 1. Teach SOP
**User:** "remember: all production deploys need QA sign-off before merging"
1. `learn_fact({ organization_id, content: "All production deploys require QA sign-off before merging", category: "SOP", source: "USER_TAUGHT", confidence: 0.9 })`
2. Reply: `🧠 Got it — saved as SOP.`

### 2. Teach skill
**User:** "note: Ravi is our main React dev"
1. lookup Ravi → user_id
2. `learn_fact({ content: "Ravi is the lead React developer", category: "USER_SKILL", reference_id: ravi_id, tags: ["react", "frontend"] })`
2. Also call `yesboss_add_user_skill({ userId: ravi_id, skill: "react", delta: 0.3 })`

### 3. Search before creating task
**User:** "create deploy task"
1. `search_knowledge({ q: "deploy SOP", category: "SOP", limit: 3 })`
2. Found: "All deploys need QA sign-off, tag with `ops`, assign to rotation"
3. Use that to set tags / assignee when creating.

### 4. Search for skill match
**User (admin):** "assign React tasks to someone capable"
1. `search_knowledge({ q: "React", category: "USER_SKILL" })`
2. Top result → user_id → assign.

### 5. Terminology
**User:** "shipit means deploy to prod"
1. `learn_fact({ content: "'shipit' = deploy to production", category: "TERMINOLOGY", tags: ["jargon"] })`
2. Now whenever user says "shipit", resolve to deploy flow.

### 6. Contradiction → supersede
**Old fact:** "payments tasks default to medium priority"
**User now:** "we're treating all payments tasks as high priority from now"
1. `search_knowledge` → find old fact id
2. `learn_fact({ content: "All payments tasks default to high priority", category: "PROJECT_RULE", supersedes: <old_id> })`
3. Reply: `🧠 Updated — old rule superseded.`

### 7. AI auto-observes
User creates 3rd frontend task assigned to Priya with tag `ui`.
1. `learn_fact({ content: "Priya is frequently assigned UI tasks", category: "USER_SKILL", reference_id: priya_id, source: "AI_OBSERVED", confidence: 0.4 })`
2. No user-facing message. If user later confirms ("yes, she owns UI"), upgrade confidence to 0.8.

### 8. Don't store secrets
**User:** "remember API key is sk-..."
- Refuse: `🚫 Don't store credentials in the KB. Use your secrets manager.`

### 9. Stale fact cleanup
Fact with `lastUsedAt` >180 days ago AND `useCount < 2` — treat as low priority. Not auto-deleted; aging-out via lower recency score.

### 10. Expiry
**User:** "for next 2 weeks, all urgent tasks go to Priya"
1. `learn_fact({ content: "...", expiresAt: <now + 14d>, category: "PROJECT_RULE" })`
2. TTL index removes at expiry.
