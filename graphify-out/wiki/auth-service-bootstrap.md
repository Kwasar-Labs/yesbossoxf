# Auth Service Bootstrap

**Community 1** | 25 nodes

## Key Concepts

- **app.ts** (code) - 
- **index.ts** (code) - 
- **start()** (code) - 
- **env.ts** (code) - 
- **resolveKey()** (code) - 
- **connection.ts** (code) - 
- **connectToDatabase()** (code) - 
- **getDb()** (code) - 
- **auth.routes.ts** (code) - 
- **organization.routes.ts** (code) - 
- **phone-mapping.routes.ts** (code) - 
- **team.routes.ts** (code) - 
- **user.routes.ts** (code) - 
- **app.ts** (code) - 
- **index.ts** (code) - 
- ... and 10 more nodes

## Cross-Community Connections

### -> Organization Repository
- connection.ts --imports_from--> organization-repository.ts [EXTRACTED]

### -> Phone Mapping Repository
- connection.ts --imports_from--> phone-user-mapping-repository.ts [EXTRACTED]

### -> Team Repository
- connection.ts --imports_from--> team-repository.ts [EXTRACTED]

### -> User Repository
- connection.ts --imports_from--> user-repository.ts [EXTRACTED]

### -> Assignment Repository
- connection.ts --imports_from--> assignment-repository.ts [EXTRACTED]

### -> Knowledge Repository
- connection.ts --imports_from--> knowledge-repository.ts [EXTRACTED]

### -> Project Repository
- connection.ts --imports_from--> project-repository.ts [EXTRACTED]

### -> Task Repository
- connection.ts --imports_from--> task-repository.ts [EXTRACTED]
