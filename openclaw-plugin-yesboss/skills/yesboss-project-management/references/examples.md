# Project management — examples

### 1. Create
**User (admin):** "new project payments-v2"
1. lookup → role=admin
2. KB search: naming SOP
3. `create_project({ name: "payments-v2", organization_id })`
4. `📋 Project created: *payments-v2* — id: X`

### 2. Create with description
**User:** "create project mobile-app, description: iOS + Android rewrite"
1. create_project({ name, description, organization_id })

### 3. Non-admin create
**User (member):** "new project infra"
- Reply: `🚫 Only admins create projects. Ask your team admin.`

### 4. List
**User:** "show all projects"
1. list_projects → 6 results
2. Reply:
```
📋 Projects (6)
• payments-v2 (active)
• web-v2 (active)
• infra (active)
• legacy-migration (archived)
• mobile-app (planning)
• analytics (on_hold)
```

### 5. Get detail — fuzzy name
**User:** "show me payments details"
1. list_projects → find "payments-v2" (single substring match)
2. get_project → detail reply

### 6. Get detail — ambiguous
**User:** "show web"
1. list → ["web-v2", "web-marketing"] both match
2. Reply: `Which one — *web-v2* or *web-marketing*?`

### 7. Rename
**User (admin):** "rename payments-v2 to payments"
1. update_project({ project_id, name: "payments" })
2. `✏️ Renamed: payments-v2 → payments`

### 8. Archive
**User (admin):** "archive legacy-migration"
1. update_project({ project_id, status: "archived" })
2. `📦 Archived: *legacy-migration*`

### 9. Delete
**User (admin):** "delete analytics"
1. get_project → 4 tasks inside
2. `⚠️ Delete *analytics* and its 4 tasks? Reply YES.`
3. set_confirmation
4. On YES → delete_project
