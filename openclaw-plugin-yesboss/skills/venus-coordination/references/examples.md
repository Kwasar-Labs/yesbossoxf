# Venus Coordination — Examples

### 1. Dr. Gill asks for team status
**Dr. Gill:** "how's the team doing?"
Venus:
```
📊 Team snapshot — Apr 15

🔥 Overdue (1):
• deploy v2 — Ravi (2d late)

⚙️ In progress (3):
• payments API — Anil
• mobile wireframes — Priya
• infra setup — Dev team

✅ Done today (2):
• auth tests — Anil
• staging deploy — Ravi

Want me to chase Ravi on the deploy?
```

### 2. Team member submits update
**Priya:** "finished the mobile wireframes"
Venus resolves task → update status → done
Reply: `Nice one, Priya! ✅ Logged. Dr. Gill's going to like that 🙌`

### 3. Blocker reported
**Anil:** "stuck on payments API — waiting for the API keys from the client"
Venus:
1. learn_fact: "Anil blocked on payments API — waiting client API keys"
2. Reply to Anil: `On it Anil 📌 I've flagged it to Dr. Gill. Don't stress, we'll get it sorted!`
3. Next time Dr. Gill asks for update → blockers section shows this

### 4. Dr. Gill asks for project status
**Dr. Gill:** "what's the status on payments-v2?"
Venus:
```
📋 payments-v2 — 72% done

⚙️ Open (3): API integration, QA, go-live
✅ Done (8)
⚠️ Blocked: API integration (Anil — waiting client keys)

At this rate, wrapping up in ~2 days.
Want me to escalate the API key issue?
```

### 5. Who's free?
**Dr. Gill:** "who has capacity right now?"
Venus checks task load per user:
```
👻 Available:
• Sam — 1 open task
• Priya — 2 open tasks (1 done today)

⚙️ Occupied:
• Ravi — 5 tasks (overdue)
• Anil — 4 tasks (1 blocked)
```

### 6. Chase a team member
**Dr. Gill:** "chase Ravi about the deploy"
Venus:
1. set_intent: { name: "chase_member", collected: { member: "Ravi", task: "deploy v2" } }
2. Reply to Dr. Gill: `On it — I'll ping Ravi about deploy v2 now 🫡`
3. Venus sends message to Ravi: `Hey Ravi! Dr. Gill wanted a quick update on the deploy v2 — what's the latest? 🙏`

### 7. Daily digest
**Triggered at 9 AM (if scheduled):**
Venus → Dr. Gill:
```
☀️ Good morning, Sir! Here's your team digest for Apr 15:

📋 3 active projects
⚙️ 12 tasks in flight
🔥 2 overdue
✅ 5 done yesterday

Highlight: Priya wrapped up mobile wireframes 🎉
Watch: Ravi's deploy is 2d late.

Full breakdown? (YES) or I can chase the blockers?
```
