# Project management — edge cases

### Name collision
Creating `X` when `X` exists → reject: `Project *X* already exists. Rename or use it.`

### Delete project with active tasks
Warn count + confirm. Deletion cascades tasks.

### Restore archived
`update_project({ status: "active" })`. No separate restore endpoint.

### Bulk operations
Not supported in one call. Loop client-side, reply summary.

### Project + admin check race
Admin check uses `lookup_user.role`. If admin was demoted between turns, the create call itself will 403. Show server error cleanly.

### Trim project name
Strip surrounding whitespace. Lowercase + kebab recommended but not enforced.
