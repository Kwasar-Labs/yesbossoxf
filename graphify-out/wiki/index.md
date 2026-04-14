# YesBoss Knowledge Graph Wiki

Agent-crawlable wiki generated from the codebase knowledge graph.

**Stats:** 415 nodes, 389 edges, 41 communities

## Communities

- [System Architecture](system-architecture.md) (40 nodes) - YesBoss TypeScript Monorepo Architecture, Core Stack (pnpm, TypeScript, Express, MongoDB, RabbitMQ, PM2), Shared Packages Domain (@yesboss/types, @yesboss/errors, @yesboss/utils)
- [Auth Service Bootstrap](auth-service-bootstrap.md) (25 nodes) - app.ts, index.ts, start()
- [OpenClaw Plugin Tools](openclaw-plugin-tools.md) (24 nodes) - index.ts, register(), assignment-tools.ts
- [Error Handling](error-handling.md) (11 nodes) - http-error-handler.ts, httpErrorHandler(), http-error.ts
- [Shared Type Definitions](shared-type-definitions.md) (11 nodes) - assignment.ts, common.ts, knowledge.ts
- [Select UI Component](select-ui-component.md) (10 nodes) - select.tsx, SelectGroup(), SelectValue()
- [Task Repository](task-repository.md) (10 nodes) - task-repository.ts, getCollection(), createTask()
- [User Repository](user-repository.md) (9 nodes) - user-repository.ts, getCollection(), createUser()
- [Team Repository](team-repository.md) (8 nodes) - team-repository.ts, getCollection(), createTeam()
- [Sheet UI Component](sheet-ui-component.md) (8 nodes) - sheet.tsx, Sheet(), SheetTrigger()
- [Auth Guards](auth-guards.md) (7 nodes) - auth-guard.ts, authGuard(), apiKeyGuard()
- [Team Pages](team-pages.md) (7 nodes) - page.tsx, fetchTeams(), handleCreate()
- [Knowledge Repository](knowledge-repository.md) (7 nodes) - knowledge-repository.ts, getCollection(), createFact()
- [Project Repository](project-repository.md) (7 nodes) - project-repository.ts, getCollection(), createProject()
- [Organization Repository](organization-repository.md) (6 nodes) - organization-repository.ts, getCollection(), createOrg()
- [Phone Mapping Repository](phone-mapping-repository.md) (6 nodes) - phone-user-mapping-repository.ts, getCollection(), createMapping()
- [Task Detail Drawer](task-detail-drawer.md) (6 nodes) - task-detail-drawer.tsx, formatDateForInput(), handleGenerateSubtasks()
- [Dialog UI Component](dialog-ui-component.md) (6 nodes) - dialog.tsx, Dialog(), DialogTrigger()
- [Dropdown UI Component](dropdown-ui-component.md) (6 nodes) - dropdown-menu.tsx, DropdownMenu(), DropdownMenuPortal()
- [Assignment Repository](assignment-repository.md) (6 nodes) - assignment-repository.ts, getCollection(), createAssignment()
- [Table UI Component](table-ui-component.md) (5 nodes) - table.tsx, Table(), TableHeader()
- [API Client](api-client.md) (5 nodes) - api-client.ts, ApiError, .constructor()
- [Plugin Config & Client](plugin-config-and-client.md) (5 nodes) - config.ts, resolveApiUrl(), resolveApiKey()
- [HTTP Response Helpers](http-response-helpers.md) (5 nodes) - http-response.ts, ok(), created()
- [Static SVG Assets](static-svg-assets.md) (5 nodes) - File Document Icon, Globe Icon, Next.js Logo
- [Route Helpers](route-helpers.md) (4 nodes) - helpers.ts, param(), query()
- [User Admin Page](user-admin-page.md) (4 nodes) - page.tsx, fetchUsers(), updateRole()
- [Activity Feed](activity-feed.md) (4 nodes) - activity-feed.tsx, ActivityFeed(), getStatusIcon()
- [Organization Admin](organization-admin.md) (3 nodes) - page.tsx, fetchOrgs(), handleSave()
- [Auth Pages](auth-pages.md) (3 nodes) - page.tsx, handleSubmit(), page.tsx
- [Kanban Card](kanban-card.md) (3 nodes) - kanban-card.tsx, getPriorityColor(), cn()
- [Avatar Component](avatar-component.md) (3 nodes) - avatar.tsx, cn(), AvatarBadge()
- [Card Component](card-component.md) (3 nodes) - card.tsx, cn(), CardAction()
- [Scroll Area Component](scroll-area-component.md) (3 nodes) - scroll-area.tsx, ScrollArea(), ScrollBar()
- [Knowledge Controller](knowledge-controller.md) (3 nodes) - knowledge.controller.ts, resolveOrgId(), toPublic()
- [Project Controller](project-controller.md) (3 nodes) - project.controller.ts, toPublic(), resolveOrgId()
- [Task Controller](task-controller.md) (3 nodes) - task.controller.ts, toPublic(), resolveOrgId()
- [Plugin Tool Results](plugin-tool-results.md) (3 nodes) - tool-result.ts, toolResult(), toolError()
- [Permission Checks](permission-checks.md) (3 nodes) - permission-check.ts, requireRegisteredUser(), requireAdmin()
- [Phone Resolver](phone-resolver.md) (3 nodes) - phone-resolver.ts, resolveSender(), clearCache()
- [Community 40](community-40.md) (3 nodes) - logger.ts, formatMessage(), createLogger()

## Navigation Tips

- Each community article lists its key concepts and cross-community connections
- Follow cross-community links to trace dependencies across the codebase
- Start with [System Architecture](system-architecture.md) for the big picture
