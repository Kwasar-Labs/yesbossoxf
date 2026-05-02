---
name: yesboss-project-management
description: "Manage projects in YesBoss — create, list, inspect, update, delete. Create/delete require admin. Use when the user wants to work with projects, not tasks."
metadata:
  openclaw:
    emoji: "📋"
---

# YesBoss Project Management

**"Yes Boss!" rule applies.** Project commands → start with `Yes Boss!`. Queries → answer directly.

## Hard rules

1. Resolve user first. `yesboss_lookup_user(phone_e164)` — every turn unless session has it.
2. Admin-only: `create_project`, `delete_project`, `update_project`. Check `role` from lookup.
3. Destructive ops need explicit YES (see `yesboss-admin` skill for confirm pattern).
4. Never fabricate project IDs. List, then pick.

## Tool map

| Intent | Tool | Admin? |
|--------|------|--------|
| Create | `yesboss_create_project` | yes |
| List | `yesboss_list_projects` | no |
| Detail | `yesboss_get_project` | no |
| Update | `yesboss_update_project` | yes |
| Delete | `yesboss_delete_project` | yes (+ YES) |

## Standard flows

### Create
1. Verify admin.
2. Search KB for project naming SOP: `yesboss_search_knowledge({ q: "project naming", category: "SOP" })`.
3. `yesboss_create_project({ name, organization_id, description? })`
4. Reply: `Yes Boss! 📋 Project *name* created.`

### List
`yesboss_list_projects({ organization_id })` → format: `• *name* (status)`
Max 15 per reply. If more: `Showing 15 of N — ask for a name to filter.`

### Detail
`yesboss_get_project({ project_id })` → reply:
```
📋 *name*
status: active
tasks: 12 open, 34 done
```

### Update
Identify field (name, description, status). `yesboss_update_project` with only changed fields.

### Delete
1. Show what will be deleted (project + N tasks).
2. Use natural language for client, standard for internal:
   - Dr. Gill: `Delete *name* and all its tasks? Just reply Yes.`
   - Internal: `⚠️ Delete *name* and all tasks? Reply YES.`
3. `yesboss_set_confirmation` then wait.
4. On YES: `yesboss_delete_project({ project_id, confirmed: true })`.

## Matching project by name

User mentions project loosely. Match strategy:
1. Exact case-insensitive name → use it.
2. Substring match → if single, use. If multiple, ask.
3. No match → say so, suggest similar names (Levenshtein-closest from list).

## Natural language map

| User says | Action |
|-----------|--------|
| "new project X" / "create project X" / "start project X" | create_project |
| "show projects" / "what projects" / "list projects" | list_projects |
| "project X details" / "about project X" | get_project |
| "rename project X to Y" | update_project name |
| "archive X" / "close project X" | update_project status=archived |
| "delete project X" | delete_project (admin + YES) |

## Response format

- Lists: one project per line, trim to 3 fields.
- Detail: multi-line, include task summary.
- Never include `organizationId` in user-facing text.

## Examples / edge cases

`references/examples.md` for full flows. `references/edge-cases.md` for ambiguity.
