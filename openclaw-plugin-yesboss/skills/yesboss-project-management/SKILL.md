---
name: yesboss-project-management
description: "Manage projects in YesBoss. Use when the user wants to create, view, update, or delete projects. Admin users can create and delete projects."
metadata:
  openclaw:
    emoji: "📋"
---

# YesBoss Project Management

Manage projects through WhatsApp.

## Available tools

| Need | Tool |
|------|------|
| Create a project | `yesboss_create_project` |
| List projects | `yesboss_list_projects` |
| Get project details | `yesboss_get_project` |
| Update a project | `yesboss_update_project` |
| Delete a project | `yesboss_delete_project` |

## Workflow patterns

### Creating a project
When the user says "create project X" or "new project X":
1. Resolve sender with `yesboss_lookup_user`
2. Verify user is admin (only admins can create projects)
3. Call `yesboss_create_project` with name and organization_id
4. Confirm creation

### Listing projects
When the user asks "show projects" or "what projects do we have?":
1. Call `yesboss_list_projects` with organization_id
2. Format as a list with project name, status, and ID

### Getting project details
When the user asks about a specific project:
1. Call `yesboss_get_project` with the project ID
2. Show name, description, status, owners, and task summary

## Response format

Keep it WhatsApp-friendly:
- Project name + status for lists
- Full details only when specifically asked
- Include project IDs for reference
