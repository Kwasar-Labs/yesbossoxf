import re
f=open('apps/workforce/src/database/task-repository.ts', 'r', encoding='utf-8')
t = f.read()
t = re.sub(r'export async function updateTaskStatus.*?return findTaskById\(id\);\s*\}', rep, t, flags=re.DOTALL)
open('apps/workforce/src/database/task-repository.ts', 'w', encoding='utf-8').write(t)
