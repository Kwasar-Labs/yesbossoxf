# Task templates

Starting shapes when user asks for common flows. Customize based on KB + user memory.

## Bug fix
- Title: `fix: <short summary>`
- Priority: default `high` unless user says otherwise
- Tags: `bug`
- Description template:
  ```
  Repro:
  Expected:
  Actual:
  Impact:
  ```

## Feature delivery (epic decomposition)
Parent: feature name.
Subtasks (default set):
1. `design: <feature>` — tag `design`
2. `backend: <feature>` — tag `backend`
3. `frontend: <feature>` — tag `frontend`
4. `tests: <feature>` — tag `qa`
5. `docs: <feature>` — tag `docs`
6. `release: <feature>` — tag `release`

## Deploy
Parent: `deploy <version>`.
Subtasks:
1. `pre-deploy checks` — tag `ops`
2. `run migrations` — tag `db`
3. `deploy backend` — tag `ops`
4. `deploy frontend` — tag `ops`
5. `smoke tests` — tag `qa`
6. `monitor 1h` — tag `ops`

## Onboarding new hire
Parent: `onboard <name>`.
Subtasks:
1. accounts & access
2. intro to codebase
3. shadow team member 1wk
4. first ticket
5. 30-day check-in

## Research / spike
- Title: `spike: <question>`
- Priority: `medium`
- Tags: `research`
- Due: 3 days from creation (default for spikes)
- Description: `Question: ... / Deliverable: summary doc + recommendation`

## Override via KB
Before using any template, call `yesboss_search_knowledge` with category `SOP` and the template name. Org-specific SOPs override these defaults.
