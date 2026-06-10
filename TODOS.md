# TaskFlow Build Plan: TODO-Based Implementation, Branching, and Commits

## Working Rule

The coding agent must work in small, reviewable steps.

Each TODO should produce:

1. working code
2. no unrelated changes
3. passing relevant checks
4. one clean commit

Do not ask the agent to build multiple major features in one run.

---

# Branching Strategy

Use this structure:

```bash
main
dev
feature/project-setup
feature/backend-foundation
feature/auth
feature/task-api
feature/activity-log
feature/realtime
feature/frontend-foundation
feature/frontend-auth
feature/dashboard
feature/forms-optimistic-ui
feature/docker-ci-docs
```

## Rules

* `main` should always stay stable.
* Work happens on feature branches.
* Merge feature branches into `dev`.
* Merge `dev` into `main` only after the full app works.
* Each TODO should have one commit.
* Do not squash everything into one commit.
* Do not commit broken code.
* Do not commit `.env`, `.venv`, `node_modules`, caches, build folders, or database volumes.

---

# Commit Message Format

Use this style:

```txt
type: short description
```

Allowed types:

```txt
chore
feat
fix
test
docs
refactor
style
ci
```

Examples:

```txt
chore: initialize monorepo structure
feat: add JWT cookie authentication
test: add task ownership tests
docs: add local setup instructions
ci: add backend test workflow
```

---

# Definition of Done for Every TODO

Before committing, the agent must check:

```bash
git status
```

For backend changes:

```bash
cd backend
uv run ruff check .
uv run pytest
```

For frontend changes:

```bash
cd frontend
npm run lint
npm run build
```

For Docker-related changes:

```bash
docker compose up --build
```

If a check cannot be run, the agent must mention why in the commit notes or final response.

---

# Phase 0: Project Setup

## Branch

```bash
git checkout -b feature/00-project-setup
```

---

## TODO 0.1: Initialize monorepo structure

Create the base structure:

```txt
taskflow/
├── backend/
├── frontend/
├── .github/
├── AGENT.md
├── TODO.md
├── README.md
├── docker-compose.yml
└── .gitignore
```

Acceptance criteria:

* folder structure exists
* root `.gitignore` exists
* empty README exists
* no generated dependency folders committed

Commit:

```txt
chore: initialize monorepo structure
```

---

## TODO 0.2: Initialize backend with uv

Inside `backend/`, initialize Python project using `uv`.

Required files:

```txt
backend/
├── pyproject.toml
├── uv.lock
├── .python-version
└── app/
```

Python version:

```txt
3.12
```

Install backend dependencies:

```bash
uv add fastapi uvicorn sqlalchemy alembic psycopg2-binary pydantic-settings python-jose passlib[bcrypt] python-multipart email-validator
uv add --dev pytest pytest-asyncio httpx ruff mypy
```

Acceptance criteria:

* `pyproject.toml` exists
* `uv.lock` exists
* `.python-version` exists
* no `requirements.txt`
* no raw `pip` usage

Commit:

```txt
chore: initialize FastAPI backend with uv
```

---

## TODO 0.3: Initialize frontend with Next.js

Inside `frontend/`, create Next.js app.

Use:

```txt
Next.js App Router
TypeScript
Tailwind CSS
ESLint
```

Acceptance criteria:

* frontend starts locally
* TypeScript enabled
* Tailwind configured
* basic home page exists

Commit:

```txt
chore: initialize Next.js frontend
```

---

## TODO 0.4: Add root Docker Compose skeleton

Create root `docker-compose.yml` with only PostgreSQL first.

Service:

```txt
postgres
```

Acceptance criteria:

* PostgreSQL starts with Docker Compose
* database name is `taskflow`
* username/password are local development values
* volume is ignored by git

Commit:

```txt
chore: add postgres docker compose service
```

---

# Phase 1: Backend Foundation

## Branch

```bash
git checkout dev
git checkout -b feature/01-backend-foundation
```

---

## TODO 1.1: Add FastAPI app, health route, and CORS

Create:

```txt
backend/app/main.py
backend/app/core/config.py
backend/app/core/constants.py
```

Add:

```txt
GET /health
```

Response:

```json
{
  "status": "ok",
  "service": "TaskFlow API"
}
```

Acceptance criteria:

* app starts with `uv run uvicorn app.main:app --reload`
* `/health` works
* config loads from environment variables
* CORS allows frontend origin

Commit:

```txt
feat: add FastAPI app configuration and health check
```

---

## TODO 1.2: Add centralized error response system

Create:

```txt
backend/app/core/exceptions.py
backend/app/schemas/common.py
```

All errors should follow:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable message",
    "details": {}
  }
}
```

Acceptance criteria:

* custom exception class exists
* global exception handlers exist
* validation errors return consistent structure
* no raw stack traces in API response

Commit:

```txt
feat: add consistent API error responses
```

---

## TODO 1.3: Add database session and SQLAlchemy base

Create:

```txt
backend/app/db/session.py
backend/app/db/base.py
backend/app/db/init_db.py
```

Acceptance criteria:

* database URL loads from config
* SQLAlchemy engine/session configured
* base model import path ready for Alembic
* app can connect to local Postgres

Commit:

```txt
feat: add database session setup
```

---

## TODO 1.4: Add Alembic migrations setup

Initialize Alembic.

Acceptance criteria:

* `alembic/` exists
* `alembic.ini` configured
* env.py reads database URL from app config
* migrations can run using:

```bash
uv run alembic upgrade head
```

Commit:

```txt
chore: configure Alembic migrations
```

---

# Phase 2: Authentication

## Branch

```bash
git checkout dev
git checkout -b feature/02-auth
```

---

## TODO 2.1: Add user model and migration

Create:

```txt
backend/app/models/user.py
```

User fields:

```txt
id
name
email
password_hash
role
created_at
updated_at
```

Acceptance criteria:

* user model exists
* email is unique
* role defaults to `user`
* migration generated and tested

Commit:

```txt
feat: add user model and migration
```

---

## TODO 2.2: Add auth schemas

Create:

```txt
backend/app/schemas/auth.py
```

Schemas:

```txt
SignupRequest
LoginRequest
UserResponse
AuthResponse
```

Acceptance criteria:

* email validation works
* password minimum length enforced
* password hash is never returned

Commit:

```txt
feat: add authentication schemas
```

---

## TODO 2.3: Add password hashing and JWT utilities

Create:

```txt
backend/app/core/security.py
```

Implement:

```txt
hash_password
verify_password
create_access_token
decode_access_token
set_auth_cookie
clear_auth_cookie
```

Acceptance criteria:

* passwords hashed with bcrypt/passlib
* JWT expiry configured
* cookie is httpOnly
* cookie settings come from config

Commit:

```txt
feat: add password hashing and JWT utilities
```

---

## TODO 2.4: Add auth repository and service

Create:

```txt
backend/app/repositories/user_repository.py
backend/app/services/auth_service.py
```

Acceptance criteria:

* create user
* get user by email
* authenticate user
* duplicate email handled cleanly

Commit:

```txt
feat: add authentication service layer
```

---

## TODO 2.5: Add auth routes

Create:

```txt
backend/app/api/v1/auth.py
backend/app/api/deps.py
```

Routes:

```txt
POST /api/v1/auth/signup
POST /api/v1/auth/login
POST /api/v1/auth/logout
GET  /api/v1/auth/me
```

Acceptance criteria:

* signup creates user
* login sets cookie
* logout clears cookie
* `/me` returns current user
* unauthenticated `/me` returns 401

Commit:

```txt
feat: implement JWT cookie authentication APIs
```

---

## TODO 2.6: Add auth tests

Create:

```txt
backend/tests/test_auth.py
```

Tests:

```txt
signup creates user and hashes password
duplicate email returns 409
login works with valid credentials
login fails with invalid password
me returns user when authenticated
me returns 401 when unauthenticated
```

Commit:

```txt
test: add authentication API tests
```

---

# Phase 3: Task API

## Branch

```bash
git checkout dev
git checkout -b feature/03-task-api
```

---

## TODO 3.1: Add task model and migration

Create:

```txt
backend/app/models/task.py
```

Task fields:

```txt
id
user_id
title
description
status
priority
due_date
completed_at
created_at
updated_at
```

Acceptance criteria:

* task belongs to user
* deleting user deletes tasks
* status and priority stored
* migration works

Commit:

```txt
feat: add task model and migration
```

---

## TODO 3.2: Add task schemas and validation

Create:

```txt
backend/app/schemas/task.py
```

Schemas:

```txt
TaskCreate
TaskUpdate
TaskResponse
TaskListResponse
TaskQueryParams
```

Validation:

```txt
title min 3 max 160
description max 2000
status pending/in_progress/completed
priority low/medium/high
empty PATCH rejected
```

Commit:

```txt
feat: add task schemas and validation
```

---

## TODO 3.3: Add task repository

Create:

```txt
backend/app/repositories/task_repository.py
```

Repository methods:

```txt
create_task
get_task_by_id_for_user
list_tasks_for_user
update_task
delete_task
count_tasks_for_user
```

Acceptance criteria:

* all user queries enforce `user_id`
* no task can be fetched only by ID
* list supports base pagination

Commit:

```txt
feat: add task repository with ownership queries
```

---

## TODO 3.4: Add task service

Create:

```txt
backend/app/services/task_service.py
```

Business logic:

```txt
create task
list tasks
get task
update task
delete task
mark completed if status changes to completed
```

Acceptance criteria:

* raises NOT_FOUND if task does not belong to user
* handles completed_at correctly
* no HTTP-specific logic inside service

Commit:

```txt
feat: add task service layer
```

---

## TODO 3.5: Add task CRUD routes

Create:

```txt
backend/app/api/v1/tasks.py
```

Routes:

```txt
POST   /api/v1/tasks
GET    /api/v1/tasks
GET    /api/v1/tasks/{task_id}
PATCH  /api/v1/tasks/{task_id}
DELETE /api/v1/tasks/{task_id}
```

Acceptance criteria:

* all task routes require auth
* create returns 201
* get/update/delete enforce ownership
* delete returns 204 or success response consistently

Commit:

```txt
feat: implement protected task CRUD APIs
```

---

## TODO 3.6: Add filtering, search, sorting, and pagination

Support:

```txt
status
priority
search
sortBy = due_date | priority | created_at
sortOrder = asc | desc
page
limit
```

Acceptance criteria:

* filters work together
* search works with title
* priority sort uses logical order: high > medium > low
* pagination metadata returned
* invalid query params return 400

Commit:

```txt
feat: add task filtering search sorting and pagination
```

---

## TODO 3.7: Add task API tests

Create:

```txt
backend/tests/test_tasks.py
```

Tests:

```txt
unauthenticated user cannot create task
authenticated user can create task
missing title returns validation error
user can list own tasks
user cannot fetch another user's task
user cannot update another user's task
user cannot delete another user's task
status filter works
search works
pagination works
priority sorting works
```

Commit:

```txt
test: add task API and ownership tests
```

---

# Phase 4: Activity Log

## Branch

```bash
git checkout dev
git checkout -b feature/04-activity-log
```

---

## TODO 4.1: Add activity log model and migration

Create:

```txt
backend/app/models/activity_log.py
backend/app/schemas/activity.py
```

Fields:

```txt
id
task_id
user_id
action
old_value
new_value
created_at
```

Commit:

```txt
feat: add activity log model and migration
```

---

## TODO 4.2: Add activity service

Create:

```txt
backend/app/services/activity_service.py
backend/app/repositories/activity_repository.py
```

Track:

```txt
task.created
task.updated
task.completed
task.deleted
```

Acceptance criteria:

* logs created after task changes
* old and new values stored where useful
* failure in activity logging should not break core task operation unless transaction design requires it

Commit:

```txt
feat: add task activity logging service
```

---

## TODO 4.3: Add activity routes

Routes:

```txt
GET /api/v1/tasks/{task_id}/activity
GET /api/v1/activity
```

Acceptance criteria:

* authenticated only
* user sees only own activity
* task activity enforces ownership

Commit:

```txt
feat: add activity log APIs
```

---

## TODO 4.4: Add activity tests

Tests:

```txt
activity log is created after task creation
activity log is created after task update
user cannot see another user's task activity
```

Commit:

```txt
test: add activity log tests
```

---

# Phase 5: Real-Time Updates

## Branch

```bash
git checkout dev
git checkout -b feature/05-realtime
```

---

## TODO 5.1: Add real-time event types

Create:

```txt
backend/app/realtime/event_types.py
backend/app/schemas/realtime.py
```

Event shape:

```json
{
  "type": "task.updated",
  "task_id": "uuid",
  "user_id": "uuid",
  "payload": {},
  "timestamp": "ISO timestamp"
}
```

Commit:

```txt
feat: add realtime task event contracts
```

---

## TODO 5.2: Add WebSocket connection manager

Create:

```txt
backend/app/realtime/connection_manager.py
```

Responsibilities:

```txt
connect user
disconnect user
broadcast to user
broadcast to admins if implemented
handle broken connections safely
```

Commit:

```txt
feat: add WebSocket connection manager
```

---

## TODO 5.3: Add WebSocket route

Create:

```txt
backend/app/api/v1/realtime_ws.py
```

Route:

```txt
GET /api/v1/ws/tasks
```

Acceptance criteria:

* authenticates using cookie
* unauthorized clients are rejected
* connected clients receive events
* disconnected clients are cleaned up

Commit:

```txt
feat: add WebSocket task updates endpoint
```

---

## TODO 5.4: Broadcast events after task mutations

Integrate real-time publishing into task service.

Broadcast after:

```txt
task created
task updated
task completed
task deleted
```

Acceptance criteria:

* events are emitted only after DB operation succeeds
* event sent only to owner
* event payload is consistent

Commit:

```txt
feat: publish realtime events for task changes
```

---

## TODO 5.5: Add SSE event queue and endpoint

Create:

```txt
backend/app/realtime/event_queue.py
backend/app/api/v1/realtime_sse.py
```

Route:

```txt
GET /api/v1/events/tasks
```

Acceptance criteria:

* uses StreamingResponse
* authenticates user
* emits SSE event messages
* sends heartbeat every 20–30 seconds
* handles disconnect safely

Commit:

```txt
feat: add SSE task event stream
```

---

## TODO 5.6: Add real-time tests

Create:

```txt
backend/tests/test_realtime.py
```

Tests:

```txt
WebSocket rejects unauthenticated connection
WebSocket receives task update event
SSE endpoint requires auth
```

Commit:

```txt
test: add realtime endpoint tests
```

---

# Phase 6: Frontend Foundation

## Branch

```bash
git checkout dev
git checkout -b feature/06-frontend-foundation
```

---

## TODO 6.1: Add frontend environment and API client

Create:

```txt
frontend/lib/api.ts
frontend/types/api.ts
```

Acceptance criteria:

* API base URL comes from env
* requests include credentials
* common error handling exists

Commit:

```txt
feat: add frontend API client
```

---

## TODO 6.2: Add base layout and navigation

Create:

```txt
frontend/components/layout/
```

Acceptance criteria:

* responsive root layout
* navbar placeholder
* basic dashboard shell
* clean Tailwind styling

Commit:

```txt
feat: add responsive app layout
```

---

## TODO 6.3: Add shared UI components

Create reusable components:

```txt
Button
Input
Select
Textarea
Badge
Card
LoadingState
ErrorState
EmptyState
Pagination
```

Commit:

```txt
feat: add reusable UI components
```

---

# Phase 7: Frontend Auth

## Branch

```bash
git checkout dev
git checkout -b feature/07-frontend-auth
```

---

## TODO 7.1: Add auth types and validators

Create:

```txt
frontend/types/auth.ts
frontend/lib/validators.ts
```

Use:

```txt
zod
react-hook-form
```

Commit:

```txt
feat: add frontend auth validation schemas
```

---

## TODO 7.2: Add auth hook/session provider

Create:

```txt
frontend/hooks/useAuth.ts
frontend/components/auth/AuthProvider.tsx
```

Behavior:

```txt
on app load call /auth/me
persist session through cookie
redirect unauthenticated users from protected pages
```

Commit:

```txt
feat: add frontend session restore flow
```

---

## TODO 7.3: Add signup page

Route:

```txt
/signup
```

Acceptance criteria:

* client-side validation
* calls backend signup
* redirects to dashboard on success
* shows error on duplicate email

Commit:

```txt
feat: add signup page
```

---

## TODO 7.4: Add login page

Route:

```txt
/login
```

Acceptance criteria:

* client-side validation
* calls backend login
* redirects to dashboard
* shows invalid credential error

Commit:

```txt
feat: add login page
```

---

## TODO 7.5: Add logout flow

Acceptance criteria:

* logout button calls backend logout
* user redirected to login
* session cleared from frontend state

Commit:

```txt
feat: add logout flow
```

---

# Phase 8: Task Dashboard

## Branch

```bash
git checkout dev
git checkout -b feature/08-dashboard
```

---

## TODO 8.1: Add task types and validators

Create:

```txt
frontend/types/task.ts
frontend/lib/task-validators.ts
```

Commit:

```txt
feat: add task types and validation schemas
```

---

## TODO 8.2: Add task API functions

Create:

```txt
frontend/lib/tasks-api.ts
```

Functions:

```txt
listTasks
getTask
createTask
updateTask
deleteTask
markTaskComplete
```

Commit:

```txt
feat: add frontend task API functions
```

---

## TODO 8.3: Add task query hook

Create:

```txt
frontend/hooks/useTasks.ts
```

Use TanStack Query.

Support:

```txt
status
priority
search
sortBy
sortOrder
page
limit
```

Commit:

```txt
feat: add task query hooks
```

---

## TODO 8.4: Add dashboard filters

Components:

```txt
TaskSearch
StatusFilter
PriorityFilter
SortDropdown
```

Acceptance criteria:

* filter state updates URL or local dashboard state
* changing filters refetches tasks
* filters work together

Commit:

```txt
feat: add task dashboard filters
```

---

## TODO 8.5: Add task list UI

Components:

```txt
TaskList
TaskCard
TaskTable
TaskActions
```

Acceptance criteria:

* shows tasks
* loading state
* empty state
* error state
* responsive mobile cards
* desktop table or clean card grid

Commit:

```txt
feat: add task list dashboard UI
```

---

## TODO 8.6: Add pagination controls

Acceptance criteria:

* next/previous page works
* current page shown
* total pages shown
* disabled states handled

Commit:

```txt
feat: add task pagination controls
```

---

# Phase 9: Forms and Optimistic UI

## Branch

```bash
git checkout dev
git checkout -b feature/09-forms-optimistic-ui
```

---

## TODO 9.1: Add reusable task form

Create:

```txt
frontend/components/tasks/TaskForm.tsx
```

Fields:

```txt
title
description
status
priority
due_date
```

Acceptance criteria:

* React Hook Form
* Zod validation
* works for create and edit mode

Commit:

```txt
feat: add reusable task form
```

---

## TODO 9.2: Add create task page

Route:

```txt
/tasks/new
```

Acceptance criteria:

* creates task
* redirects to dashboard
* shows validation errors
* handles API errors

Commit:

```txt
feat: add create task page
```

---

## TODO 9.3: Add edit task page

Route:

```txt
/tasks/[id]/edit
```

Acceptance criteria:

* fetches existing task
* pre-fills form
* updates task
* handles not found
* redirects after success

Commit:

```txt
feat: add edit task page
```

---

## TODO 9.4: Add mark complete action

Acceptance criteria:

* button marks task completed
* backend update called
* UI updates correctly

Commit:

```txt
feat: add mark task complete action
```

---

## TODO 9.5: Add delete task action

Acceptance criteria:

* delete confirmation exists
* task deleted from backend
* UI updates correctly

Commit:

```txt
feat: add delete task action
```

---

## TODO 9.6: Add optimistic UI for complete and delete

Acceptance criteria:

* complete updates instantly
* delete removes instantly
* rollback happens on API failure
* error message shown on failure

Commit:

```txt
feat: add optimistic complete and delete actions
```

---

# Phase 10: Frontend Real-Time and Activity

## Branch

```bash
git checkout dev
git checkout -b feature/10-frontend-realtime-activity
```

---

## TODO 10.1: Add WebSocket hook

Create:

```txt
frontend/hooks/useTaskWebSocket.ts
```

Acceptance criteria:

* connects to backend WebSocket
* receives task events
* exposes connection status
* reconnects safely

Commit:

```txt
feat: add task WebSocket hook
```

---

## TODO 10.2: Add SSE fallback hook

Create:

```txt
frontend/hooks/useTaskSSE.ts
```

Acceptance criteria:

* connects to SSE stream
* receives events
* handles reconnect
* works with cookies

Commit:

```txt
feat: add task SSE fallback hook
```

---

## TODO 10.3: Add unified task events hook

Create:

```txt
frontend/hooks/useTaskEvents.ts
```

Behavior:

```txt
try WebSocket first
fallback to SSE if WebSocket fails
update TanStack Query cache on events
```

Commit:

```txt
feat: connect realtime events to task cache
```

---

## TODO 10.4: Add live status badge

Dashboard should show:

```txt
Live
Reconnecting
Offline
```

Commit:

```txt
feat: add realtime connection status badge
```

---

## TODO 10.5: Add activity log panel

Create:

```txt
frontend/components/activity/ActivityPanel.tsx
```

Acceptance criteria:

* shows recent task activity
* handles empty/loading/error states
* responsive layout

Commit:

```txt
feat: add activity log panel
```

---

# Phase 11: Dark Mode

## Branch

```bash
git checkout dev
git checkout -b feature/11-dark-mode
```

---

## TODO 11.1: Add theme provider and toggle

Acceptance criteria:

* light/dark mode toggle
* preference persisted
* no hydration issues
* clean styling in both modes

Commit:

```txt
feat: add persisted dark mode toggle
```

---

# Phase 12: Docker, CI, README, Deployment Prep

## Branch

```bash
git checkout dev
git checkout -b feature/12-docker-ci-docs
```

---

## TODO 12.1: Add backend Dockerfile using uv

Backend Dockerfile must use `uv`.

Acceptance criteria:

* no pip install
* uses `uv sync --frozen`
* starts FastAPI
* migrations can run

Commit:

```txt
chore: add backend Dockerfile with uv
```

---

## TODO 12.2: Add frontend Dockerfile

Acceptance criteria:

* frontend builds
* production start works
* env variables documented

Commit:

```txt
chore: add frontend Dockerfile
```

---

## TODO 12.3: Complete docker-compose setup

Services:

```txt
postgres
backend
frontend
```

Acceptance criteria:

```txt
docker compose up --build
```

starts full app.

Expected URLs:

```txt
Frontend: http://localhost:3000
Backend: http://localhost:8000
Docs: http://localhost:8000/docs
```

Commit:

```txt
chore: complete docker compose setup
```

---

## TODO 12.4: Add GitHub Actions CI

Create:

```txt
.github/workflows/ci.yml
```

Jobs:

```txt
backend-tests
frontend-build
```

Backend:

```bash
uv sync --frozen
uv run ruff check .
uv run pytest
```

Frontend:

```bash
npm ci
npm run lint
npm run build
```

Commit:

```txt
ci: add backend and frontend CI workflow
```

---

## TODO 12.5: Add environment example files

Create:

```txt
backend/.env.example
frontend/.env.example
```

Acceptance criteria:

* all required env variables listed
* no real secrets
* README references them

Commit:

```txt
docs: add environment example files
```

---

## TODO 12.6: Write complete README

README must include:

```txt
overview
features
tech stack
architecture
database schema summary
API routes
realtime design
local setup
Docker setup
environment variables
test commands
assumptions and trade-offs
deployment notes
future improvements
```

Must include FastAPI trade-off:

```txt
Although Go was preferred, the assessment allowed choosing another backend language based on expertise. I chose FastAPI to prioritize correctness, secure authentication, clean API design, PostgreSQL-backed querying, tests, and polished delivery within the expected timeline.
```

Must include realtime trade-off:

```txt
Real-time updates use an in-memory WebSocket/SSE connection manager, which is suitable for this single-instance assessment deployment. In production, this could be replaced with Redis Pub/Sub or a message broker to support multiple backend replicas.
```

Commit:

```txt
docs: add complete project README
```

---

## TODO 12.7: Final cleanup pass

Run:

```bash
git status
docker compose up --build
cd backend && uv run pytest
cd frontend && npm run build
```

Check:

```txt
no secrets committed
no broken links
no fake deployment links
README is accurate
all required features work
```

Commit:

```txt
chore: final assessment cleanup
```

---

# Final Merge Flow

After each feature branch is done:

```bash
git checkout dev
git merge feature/<branch-name>
```

After all phases are complete and tested:

```bash
git checkout main
git merge dev
```

Tag final submission:

```bash
git tag v1.0-assessment-submission
```

---

# How to Prompt the Coding Agent for Each TODO

Use this template every time:

```txt
You are working on the TaskFlow assessment project.

Current branch:
<branch-name>

Complete only this TODO:
<TODO number and title>

Context:
<short context>

Acceptance criteria:
<copy exact acceptance criteria>

Rules:
- Do not work on future TODOs.
- Do not modify unrelated files.
- Use uv for all backend Python commands.
- Do not use pip.
- Keep code clean and typed.
- Run relevant tests/checks.
- Give me a short summary of changed files.
- Tell me the exact commit command after completion.
```

---

# Recommended First Agent Prompt

```txt
You are working on the TaskFlow assessment project.

Current branch:
feature/00-project-setup

Complete only TODO 0.1: Initialize monorepo structure.

Create the base project structure:

taskflow/
├── backend/
├── frontend/
├── .github/
├── AGENT.md
├── TODO.md
├── README.md
├── docker-compose.yml
└── .gitignore

Acceptance criteria:
- folder structure exists
- root .gitignore exists
- empty README exists
- no generated dependency folders committed

Rules:
- Do not initialize FastAPI yet.
- Do not initialize Next.js yet.
- Do not add Docker services yet.
- Do not work on future TODOs.
- Give me a short summary of changed files.
- Tell me the exact commit command after completion.
```

---

# Final Submission Quality Bar

The finished project should prove:

```txt
secure auth
task ownership
clean REST APIs
PostgreSQL querying
real-time WebSocket/SSE updates
activity logging
optimistic UI
Dockerized setup
CI pipeline
meaningful tests
clear documentation
clean commit history
```

Do not chase unnecessary complexity. A stable, clean, well-documented implementation is better than a half-working app with too many features.
