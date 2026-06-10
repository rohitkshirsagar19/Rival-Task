Yes. Since you are strong in FastAPI, we should make this assessment look like a **production-style FastAPI + Next.js system**, not a basic CRUD app.

Your best positioning:

```txt
Next.js + FastAPI + PostgreSQL + JWT Auth + Docker + CI + Tests + Real-time updates using WebSocket/SSE
```

FastAPI officially supports WebSockets, and its `StreamingResponse` can stream data from async generators, which fits SSE well. FastAPI also has official JWT/password-hashing guidance and supports testing HTTP and WebSocket endpoints with `TestClient`. ([FastAPI][1])

Also, this stack aligns strongly with your resume: FastAPI, Next.js, PostgreSQL, Docker, GitHub Actions, backend systems, distributed systems, and production API experience are already present in your profile. 

---

# 1. Final project direction

## Project name

```txt
TaskFlow
```

or

```txt
PulseTasks
```

Keep it professional. I prefer:

```txt
TaskFlow
```

## Main selling point

Do not present it as just “Task Management Application.”

Present it as:

```txt
A secure multi-user task management application with real-time task updates, PostgreSQL-backed filtering/search/sort, activity tracking, and a production-style Dockerized developer setup.
```

This sounds much stronger.

---

# 2. Final tech stack

## Frontend

```txt
Next.js App Router
TypeScript
Tailwind CSS
React Hook Form
Zod
TanStack Query
Axios
EventSource API for SSE
Native WebSocket API
```

## Backend

```txt
FastAPI
SQLAlchemy
Alembic
PostgreSQL
Pydantic
JWT
bcrypt / passlib
pytest
httpx
Docker
GitHub Actions
```

## Real-time layer

```txt
WebSocket:
- /ws/tasks
- Used for live task events while user is on dashboard

SSE:
- /events/tasks
- Used as fallback / lightweight server-to-client stream

Activity Log:
- Stored permanently in PostgreSQL
- Also emitted live through WebSocket/SSE
```

---

# 3. Scope decision

The required features are mandatory. For bonus, implement these:

```txt
1. Dockerized setup
2. CI pipeline
3. Activity log
4. Real-time updates using WebSocket + SSE
5. Optimistic UI
6. Dark mode
```

Do **not** implement attachments unless you finish everything else. File uploads add storage, validation, size limits, MIME type checking, and deployment complications.

---

# 4. Architecture overview

```txt
User
 |
 | Next.js Frontend
 | - Login / Signup
 | - Dashboard
 | - Filters / Search / Sort
 | - Task Form
 | - Optimistic Updates
 | - WebSocket/SSE Client
 |
FastAPI Backend
 | 
 | REST APIs
 | - Auth
 | - Task CRUD
 | - Activity Logs
 |
 | Real-time Layer
 | - WebSocket manager
 | - SSE event stream
 |
PostgreSQL
 | - users
 | - tasks
 | - activity_logs
```

The real-time architecture should be simple:

```txt
Task created / updated / deleted
        |
        v
Database transaction succeeds
        |
        v
Activity log is inserted
        |
        v
Event is published to user's active WebSocket/SSE connections
        |
        v
Next.js dashboard updates instantly
```

Important: **emit real-time events only after DB success**, not before. Optimistic UI happens on frontend, but backend broadcast should happen only after confirmed persistence.

---

# 5. Repository structure

```txt
taskflow/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── auth.py
│   │   │   │   ├── tasks.py
│   │   │   │   ├── activity.py
│   │   │   │   ├── realtime_ws.py
│   │   │   │   └── realtime_sse.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   ├── exceptions.py
│   │   │   └── constants.py
│   │   ├── db/
│   │   │   ├── base.py
│   │   │   ├── session.py
│   │   │   └── init_db.py
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── task.py
│   │   │   └── activity_log.py
│   │   ├── schemas/
│   │   │   ├── auth.py
│   │   │   ├── task.py
│   │   │   ├── activity.py
│   │   │   └── common.py
│   │   ├── services/
│   │   │   ├── auth_service.py
│   │   │   ├── task_service.py
│   │   │   ├── activity_service.py
│   │   │   └── realtime_service.py
│   │   ├── repositories/
│   │   │   ├── user_repository.py
│   │   │   ├── task_repository.py
│   │   │   └── activity_repository.py
│   │   └── realtime/
│   │       ├── connection_manager.py
│   │       ├── event_queue.py
│   │       └── event_types.py
│   ├── alembic/
│   ├── tests/
│   │   ├── test_auth.py
│   │   ├── test_tasks.py
│   │   ├── test_realtime_ws.py
│   │   └── test_activity.py
│   ├── Dockerfile
│   ├── pyproject.toml
│   ├── alembic.ini
│   └── .env.example
│
├── frontend/
│   ├── app/
│   │   ├── login/
│   │   ├── signup/
│   │   ├── dashboard/
│   │   ├── tasks/
│   │   │   ├── new/
│   │   │   └── [id]/edit/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── auth/
│   │   ├── tasks/
│   │   ├── activity/
│   │   ├── layout/
│   │   └── ui/
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useTasks.ts
│   │   ├── useTaskEvents.ts
│   │   ├── useTaskWebSocket.ts
│   │   └── useTaskSSE.ts
│   ├── lib/
│   │   ├── api.ts
│   │   ├── validators.ts
│   │   ├── auth.ts
│   │   └── realtime.ts
│   ├── types/
│   │   ├── task.ts
│   │   ├── auth.ts
│   │   └── activity.ts
│   ├── Dockerfile
│   └── .env.example
│
├── docker-compose.yml
├── README.md
├── .github/
│   └── workflows/
│       └── ci.yml
└── .gitignore
```

---

# 6. Database schema

## users

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## tasks

```sql
CREATE TABLE tasks (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(160) NOT NULL,
    description TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    priority VARCHAR(20) NOT NULL DEFAULT 'medium',
    due_date TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## activity_logs

```sql
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY,
    task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    old_value JSONB,
    new_value JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## indexes

```sql
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
CREATE INDEX idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX idx_tasks_title_search ON tasks USING gin (to_tsvector('english', title));
CREATE INDEX idx_activity_logs_task_id ON activity_logs(task_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
```

For search, you can start with `ILIKE` because it is simple. If you want to look more advanced, use PostgreSQL full-text search. But do not risk breaking the app. `ILIKE` is acceptable for this assessment.

---

# 7. Backend API plan

## Auth endpoints

```txt
POST /api/v1/auth/signup
POST /api/v1/auth/login
POST /api/v1/auth/logout
GET  /api/v1/auth/me
```

## Task endpoints

```txt
POST   /api/v1/tasks
GET    /api/v1/tasks
GET    /api/v1/tasks/{task_id}
PATCH  /api/v1/tasks/{task_id}
DELETE /api/v1/tasks/{task_id}
```

## Activity endpoints

```txt
GET /api/v1/tasks/{task_id}/activity
GET /api/v1/activity
```

## Real-time endpoints

```txt
WebSocket:
GET /api/v1/ws/tasks

SSE:
GET /api/v1/events/tasks
```

---

# 8. Auth strategy

Use:

```txt
JWT access token
httpOnly cookie
bcrypt password hashing
```

Why cookie instead of localStorage?

```txt
- Page refresh keeps user logged in
- EventSource can work with cookies
- WebSocket can authenticate using cookie
- More secure than exposing token directly to JavaScript
```

Frontend auth flow:

```txt
1. User logs in
2. Backend sets httpOnly cookie
3. Frontend calls /auth/me
4. If valid, user goes to dashboard
5. On refresh, frontend calls /auth/me again
6. If cookie is valid, session is restored
```

Backend cookie settings:

```txt
httponly=True
secure=True in production
samesite=lax
```

For local development:

```txt
secure=False
samesite=lax
```

---

# 9. Task validation rules

## Create task

```txt
title:
- required
- min 3 characters
- max 160 characters

description:
- optional
- max 2000 characters

status:
- pending | in_progress | completed

priority:
- low | medium | high

due_date:
- optional
- ISO datetime
```

## Update task

All fields optional, but at least one field must be present.

```txt
PATCH /tasks/{id}
```

Should reject empty payload:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "At least one field must be provided for update"
  }
}
```

---

# 10. Filtering, search, sorting, pagination

## API

```txt
GET /api/v1/tasks?status=pending&search=api&sortBy=due_date&sortOrder=asc&page=1&limit=10
```

## Supported query params

```txt
status = pending | in_progress | completed
priority = low | medium | high
search = title text
sortBy = due_date | priority | created_at
sortOrder = asc | desc
page = number
limit = number
```

## Response shape

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Build auth flow",
      "description": "Implement JWT cookie auth",
      "status": "pending",
      "priority": "high",
      "due_date": "2026-06-15T10:00:00Z",
      "created_at": "2026-06-10T10:00:00Z",
      "updated_at": "2026-06-10T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 28,
    "total_pages": 3
  }
}
```

## Priority sorting

Since priority is text, define manual sort order:

```txt
high = 1
medium = 2
low = 3
```

SQL idea:

```sql
ORDER BY
  CASE priority
    WHEN 'high' THEN 1
    WHEN 'medium' THEN 2
    WHEN 'low' THEN 3
  END ASC
```

---

# 11. Authorization rules

This is critical.

Every task operation must enforce ownership.

Bad:

```sql
SELECT * FROM tasks WHERE id = :task_id;
```

Good:

```sql
SELECT * FROM tasks
WHERE id = :task_id
AND user_id = :current_user_id;
```

For admin role:

```txt
user:
- can only see own tasks

admin:
- can see all users' tasks
- can filter by user_id
```

Admin is a bonus. Implement it lightly:

```txt
GET /api/v1/tasks?scope=all
```

Only admins can use `scope=all`.

If normal user tries:

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Admin access required"
  }
}
```

---

# 12. Real-time implementation plan

You want both WebSocket and SSE. Good. But use them smartly.

## Recommended design

```txt
WebSocket = primary live update channel
SSE = fallback / lightweight live stream
```

This gives you a strong bonus without making the UI confusing.

---

## Real-time event format

Use one shared event contract for both WebSocket and SSE:

```json
{
  "type": "task.updated",
  "task_id": "uuid",
  "user_id": "uuid",
  "payload": {
    "id": "uuid",
    "title": "Updated title",
    "status": "completed",
    "priority": "high"
  },
  "timestamp": "2026-06-10T12:00:00Z"
}
```

Event types:

```txt
task.created
task.updated
task.completed
task.deleted
activity.created
```

---

## WebSocket endpoint

```txt
GET /api/v1/ws/tasks
```

Behavior:

```txt
1. Client connects from dashboard
2. Backend authenticates user from cookie
3. Backend stores connection under user_id
4. When task changes, backend sends event only to that user
5. If admin is connected, admin can receive all task events
6. On disconnect, remove connection
```

Connection manager:

```txt
connections = {
  user_id: set[WebSocket]
}
```

For admin:

```txt
admin_connections = set[WebSocket]
```

Broadcast logic:

```txt
broadcast_to_user(user_id, event)
broadcast_to_admins(event)
```

---

## SSE endpoint

```txt
GET /api/v1/events/tasks
```

Behavior:

```txt
1. Client opens EventSource connection
2. Backend authenticates user from cookie
3. Backend creates async queue for that user
4. Backend yields events as SSE messages
5. Frontend receives events and updates task cache
```

SSE message format:

```txt
event: task.updated
data: {"task_id":"uuid","payload":{...},"timestamp":"..."}

```

Keep heartbeat:

```txt
event: ping
data: {}

```

Heartbeat every 20–30 seconds prevents idle connection issues.

---

## Important implementation note

For a single-process local app, an in-memory connection manager is fine.

In README, mention trade-off:

```md
Real-time delivery uses an in-memory connection manager, which is suitable for this assessment and single-instance deployment. In production, this could be replaced with Redis Pub/Sub or a message broker to support multiple backend replicas.
```

This is a very good engineering note.

---

# 13. Frontend real-time strategy

## Dashboard flow

```txt
1. Dashboard loads tasks using REST API.
2. TanStack Query stores task list.
3. WebSocket connects.
4. If WebSocket fails, fallback to SSE.
5. On event:
   - task.created → add task to cache
   - task.updated → update task in cache
   - task.completed → update status
   - task.deleted → remove task from cache
```

## Recommended hook

```txt
useTaskEvents()
```

Internally:

```txt
try WebSocket first
if failed after 2 attempts
fallback to SSE
```

Keep UI indicator:

```txt
Live
Reconnecting
Offline
```

Small badge in dashboard:

```txt
● Live updates connected
```

This will impress.

---

# 14. Optimistic UI plan

Use optimistic updates only for:

```txt
- Mark complete
- Delete task
```

Do not use optimistic UI for complex edit forms at first.

## Mark complete flow

```txt
1. User clicks "Mark Complete"
2. Frontend immediately updates task status to completed
3. API request sent
4. If success, keep update
5. If failure, rollback previous status and show toast
```

## Delete flow

```txt
1. User clicks delete
2. Task disappears immediately
3. API request sent
4. If success, keep removed
5. If failure, restore task and show error toast
```

This is simple and visible.

---

# 15. UI plan

## Pages

```txt
/
- Redirect to dashboard if logged in
- Redirect to login if not logged in

/signup
- Name
- Email
- Password
- Confirm password

/login
- Email
- Password

/dashboard
- Task list
- Search
- Filters
- Sorting
- Pagination
- Activity sidebar or recent activity panel

/tasks/new
- Create form

/tasks/[id]/edit
- Edit form
```

## Dashboard layout

Desktop:

```txt
------------------------------------------------
Navbar: TaskFlow | Dashboard | Theme | Logout
------------------------------------------------
Title + Create Task Button
------------------------------------------------
Search | Status Filter | Priority Filter | Sort
------------------------------------------------
Task Table / Task Cards
------------------------------------------------
Pagination
------------------------------------------------
Recent Activity Panel
------------------------------------------------
```

Mobile:

```txt
Navbar
Search
Filters collapsed
Task cards
Pagination
Activity section below
```

## Task card content

```txt
Title
Description preview
Priority badge
Status badge
Due date
Created date
Actions:
- Edit
- Complete
- Delete
```

---

# 16. Error handling plan

Use consistent API error shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title must be at least 3 characters",
    "details": {
      "field": "title"
    }
  }
}
```

Common error codes:

```txt
VALIDATION_ERROR
UNAUTHORIZED
FORBIDDEN
NOT_FOUND
CONFLICT
INTERNAL_SERVER_ERROR
```

Frontend should show:

```txt
- Form field errors
- Toast for API failures
- Empty state for no tasks
- Loading skeleton while fetching
- Error state with retry button
```

---

# 17. Tests plan

Assessment asks for at least 3 meaningful tests. Add 8 backend tests.

## Backend tests

```txt
1. Signup creates user and hashes password
2. Duplicate email returns 409
3. Login returns authenticated session
4. Creating task without title returns 400
5. Authenticated user can create task
6. User cannot access another user's task
7. Task list supports status filter + search + pagination
8. WebSocket receives task.updated event
```

Optional SSE test:

```txt
9. SSE stream emits task.created event
```

FastAPI’s official docs show `TestClient` usage for API testing and WebSocket testing, so this is practical for your project. ([FastAPI][2])

---

# 18. Docker setup

## docker-compose services

```txt
postgres
backend
frontend
```

Optional:

```txt
adminer
```

But do not overcomplicate. Add Adminer only if useful.

## Commands

```bash
docker compose up --build
```

Expected:

```txt
Frontend: http://localhost:3000
Backend:  http://localhost:8000
Docs:     http://localhost:8000/docs
Postgres: localhost:5432
```

## Backend startup

Backend should run:

```txt
alembic upgrade head
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

---

# 19. Environment variables

## backend/.env.example

```env
APP_NAME=TaskFlow
ENVIRONMENT=development
DEBUG=true

DATABASE_URL=postgresql+psycopg2://postgres:postgres@postgres:5432/taskflow

JWT_SECRET_KEY=change-me
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440

FRONTEND_URL=http://localhost:3000

COOKIE_NAME=taskflow_token
COOKIE_SECURE=false
COOKIE_SAMESITE=lax
```

## frontend/.env.example

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8000/api/v1/ws/tasks
NEXT_PUBLIC_SSE_URL=http://localhost:8000/api/v1/events/tasks
```

---

# 20. GitHub Actions CI

Keep CI simple:

```txt
On push / pull request:
- Checkout code
- Setup Python
- Install backend deps
- Run backend tests
```

Optional:

```txt
- Setup Node
- Install frontend deps
- Run lint/build
```

Best CI jobs:

```txt
backend-tests
frontend-build
```

This looks professional.

---

# 21. Clean Git history plan

This is important. Do not push everything in one commit.

Use this exact commit plan:

```txt
chore: initialize monorepo structure

chore: add docker compose with postgres service

feat: setup FastAPI app configuration and health check

feat: add SQLAlchemy database session and Alembic migrations

feat: add user model and authentication schemas

feat: implement signup login logout and current user APIs

feat: add JWT cookie authentication middleware

feat: add task model schemas and repository layer

feat: implement protected task CRUD APIs

feat: add task filtering search sorting and pagination

feat: add activity log model and tracking service

feat: add WebSocket connection manager for task events

feat: add SSE task event stream endpoint

test: add auth and task API tests

test: add authorization and realtime tests

feat: setup Next.js app with Tailwind and base layout

feat: add login signup and persisted auth flow

feat: add task dashboard with filters search sort and pagination

feat: add create and edit task forms with validation

feat: add optimistic complete and delete task actions

feat: connect dashboard to WebSocket and SSE live updates

feat: add activity log panel

feat: add dark mode with persisted preference

chore: add GitHub Actions CI workflow

docs: add README setup assumptions and tradeoffs
```

This history will look very impressive.

---

# 22. Branching strategy

Use simple branches:

```txt
main
dev
feature/auth
feature/task-api
feature/realtime
feature/frontend-dashboard
feature/docker-ci
```

But since it is an assessment, do not overdo PRs unless you have time.

Simpler:

```txt
main only, with clean atomic commits
```

That is enough.

---

# 23. 5-day execution plan

## Day 1 — Backend foundation

Goal: auth + database foundation.

Build:

```txt
- Monorepo setup
- Docker Postgres
- FastAPI health check
- SQLAlchemy setup
- Alembic setup
- User model
- Signup
- Login
- Logout
- /me
- JWT cookie auth
```

End of Day 1 deliverable:

```txt
User can signup, login, refresh page/session via /me, and logout.
```

Commits:

```txt
chore: initialize monorepo structure
chore: add docker compose with postgres service
feat: setup FastAPI app configuration and health check
feat: add database session and migrations
feat: implement signup login logout and current user APIs
```

---

## Day 2 — Task API + query system

Goal: complete required backend API.

Build:

```txt
- Task model
- Create task
- List tasks
- Get task by id
- Update task
- Delete task
- Ownership checks
- Validation
- Filtering by status
- Search by title
- Sort by due date, priority, created date
- Pagination metadata
- Consistent error response
```

End of Day 2 deliverable:

```txt
All required backend APIs work correctly with auth and ownership checks.
```

Commits:

```txt
feat: add task model schemas and repository layer
feat: implement protected task CRUD APIs
feat: add task filtering search sorting and pagination
```

---

## Day 3 — Real-time + activity log + tests

Goal: bonus backend quality.

Build:

```txt
- Activity log table
- Log create/update/delete/complete
- WebSocket manager
- /ws/tasks endpoint
- SSE /events/tasks endpoint
- Broadcast task events
- Backend tests
```

End of Day 3 deliverable:

```txt
Task changes create activity logs and publish live events over WebSocket/SSE.
```

Commits:

```txt
feat: add activity log model and tracking service
feat: add WebSocket connection manager for task events
feat: add SSE task event stream endpoint
test: add auth task authorization and realtime tests
```

---

## Day 4 — Frontend

Goal: complete user-facing app.

Build:

```txt
- Next.js setup
- Tailwind setup
- Login page
- Signup page
- Auth persistence
- Protected dashboard
- Task list
- Search/filter/sort controls
- Pagination
- Create task form
- Edit task form
- Mark complete
- Delete
- Loading/empty/error states
```

End of Day 4 deliverable:

```txt
A user can use the complete app from browser.
```

Commits:

```txt
feat: setup Next.js app with Tailwind and base layout
feat: add login signup and persisted auth flow
feat: add task dashboard with filters search sort and pagination
feat: add create and edit task forms with validation
```

---

## Day 5 — Polish, deployment, README

Goal: make submission selector-ready.

Build:

```txt
- Optimistic complete/delete
- WebSocket/SSE integration in frontend
- Activity panel
- Dark mode
- Docker polish
- CI pipeline
- README
- .env.example
- Deployment
- Final bug testing
```

End of Day 5 deliverable:

```txt
Repo is deployable, documented, tested, and submission-ready.
```

Commits:

```txt
feat: add optimistic complete and delete task actions
feat: connect dashboard to WebSocket and SSE live updates
feat: add activity log panel
feat: add dark mode with persisted preference
chore: add GitHub Actions CI workflow
docs: add README setup assumptions and tradeoffs
```

---

# 24. README plan

Your README should be strong. Use this structure:

```md
# TaskFlow

A full-stack task management application built with Next.js, FastAPI, and PostgreSQL.

## Live Links

- Frontend:
- Backend:
- API Docs:

## Features

- User signup and login
- JWT-based authentication
- Secure password hashing
- Protected task routes
- Per-user task ownership
- Task CRUD
- Status filtering
- Search by title
- Sorting by due date, priority, and created date
- Pagination
- Real-time task updates using WebSocket
- SSE fallback stream
- Activity log for task changes
- Optimistic UI for complete/delete actions
- Responsive UI
- Dark mode
- Dockerized local setup
- GitHub Actions CI
- Backend tests

## Tech Stack

## Architecture

## Database Schema

## API Documentation

## Real-time Design

## Local Setup

## Environment Variables

## Running Tests

## Deployment

## Assumptions and Trade-offs

## Future Improvements
```

---

# 25. README trade-offs section

Use this exact text or a slightly modified version:

```md
## Assumptions and Trade-offs

- The backend uses FastAPI instead of Go. Go was preferred, but the assessment allowed choosing another backend language based on expertise. I chose FastAPI to prioritize correctness, secure authentication, clean API design, PostgreSQL-backed querying, tests, and polished delivery within the expected timeline.
- Real-time updates are implemented with an in-memory WebSocket/SSE connection manager. This is suitable for a single-instance assessment deployment. In production, I would replace this with Redis Pub/Sub or a message broker to support multiple backend replicas.
- JWT authentication is stored in an httpOnly cookie so the frontend can persist auth state across page refreshes without exposing the token to localStorage.
- Task search is implemented on task titles. For larger datasets, this can be upgraded to PostgreSQL full-text search.
- Optimistic UI is implemented for complete and delete actions because those interactions are frequent and have simple rollback behavior.
- File attachments were intentionally not prioritized to keep the core application stable, secure, and production-like within the 3–5 day timeline.
```

This will make your FastAPI choice look intentional.

---

# 26. Submission email

When done, send this:

```txt
Subject: Full-Stack Developer Assessment Submission - Rohit Kshirsagar

Hi Sabir,

Please find my submission for the Full-Stack Developer Assessment.

GitHub Repository:
<repo-link>

Live Frontend:
<frontend-link>

Live Backend / API Docs:
<backend-link>/docs

I built the application using Next.js, FastAPI, and PostgreSQL. The project includes secure JWT authentication, protected task ownership, filtering/search/sorting/pagination, real-time task updates using WebSocket/SSE, activity logs, Dockerized setup, CI, and backend tests.

I have also documented setup instructions, assumptions, trade-offs, and environment variables in the README.

Best regards,
Rohit Kshirsagar
```

---

# 27. What to avoid

Avoid these mistakes:

```txt
- Do not store JWT in localStorage if you can avoid it.
- Do not implement task CRUD without user ownership checks.
- Do not add WebSocket events before the DB transaction succeeds.
- Do not make one giant commit.
- Do not leave README incomplete.
- Do not skip .env.example.
- Do not deploy only the frontend.
- Do not add too many bonus features if core features are buggy.
```

---

# 28. Final recommended feature checklist

## Must-have

```txt
[x] Signup
[x] Login
[x] Logout
[x] /me session restore
[x] Password hashing
[x] JWT auth
[x] Protected task routes
[x] User-specific task ownership
[x] Create task
[x] List tasks
[x] Get task
[x] Update task
[x] Delete task
[x] Filter by status
[x] Search by title
[x] Sort by due date, priority, created date
[x] Pagination
[x] Client-side validation
[x] Loading states
[x] Empty states
[x] Error states
[x] Responsive layout
[x] README
[x] .env.example
[x] Tests
```

## Strong bonus

```txt
[x] Docker Compose
[x] GitHub Actions CI
[x] Activity log
[x] WebSocket real-time updates
[x] SSE fallback
[x] Optimistic UI
[x] Dark mode
```

## Skip unless time remains

```txt
[ ] File attachments
[ ] Complex admin dashboard
[ ] Redis-backed realtime
```

---

# 29. Final build strategy

Your assessment should communicate this:

```txt
I can ship a complete product.
I understand auth and ownership.
I can design APIs cleanly.
I can work with PostgreSQL properly.
I can build real-time features.
I can write tests.
I can Dockerize and document a project.
I make practical trade-offs.
```

For you, the best final implementation is:

```txt
Next.js + FastAPI + PostgreSQL + JWT Cookie Auth + WebSocket/SSE + Docker + CI + Activity Logs
```

This is ambitious enough to impress, but still realistic in 3–5 days if you stay disciplined.

[1]: https://fastapi.tiangolo.com/advanced/websockets/?utm_source=chatgpt.com "WebSockets"
[2]: https://fastapi.tiangolo.com/tutorial/testing/?utm_source=chatgpt.com "Testing"


# Additional Agent Instructions

## Core Principle

Build this project like a real production assessment, not like a demo CRUD app. Prioritize correctness, security, clean architecture, maintainability, and a polished developer experience.

The final result must be easy for a reviewer to run, inspect, test, and understand.

---

## Non-Negotiable Rules

1. Do not create one large unstructured code dump.
2. Do not skip tests.
3. Do not hardcode secrets, database URLs, JWT keys, or production URLs.
4. Do not store JWT tokens in localStorage.
5. Do not expose another user's tasks through any API.
6. Do not implement real-time events before the related database operation succeeds.
7. Do not add bonus features if core requirements are incomplete or unstable.
8. Do not leave broken Docker, broken migrations, or broken README instructions.
9. Do not commit `.env`, generated caches, database volumes, build artifacts, or node_modules.
10. Do not fake tests, fake CI, fake deployment links, or fake README claims.

---

## Preferred Implementation Order

Always build in this order:

1. Backend project foundation
2. PostgreSQL connection
3. Alembic migrations
4. Auth models and schemas
5. Signup, login, logout, and `/me`
6. Protected task CRUD APIs
7. Ownership checks
8. Filtering, search, sorting, and pagination
9. Activity logs
10. Backend tests
11. WebSocket real-time events
12. SSE fallback
13. Frontend auth flow
14. Frontend task dashboard
15. Forms and validation
16. Optimistic UI
17. Dark mode
18. Docker polish
19. GitHub Actions
20. README and final cleanup

Do not start frontend polish before backend APIs are stable.

---

## Backend Engineering Rules

Use FastAPI with a layered structure:

* routes should handle HTTP concerns only
* services should contain business logic
* repositories should contain database queries
* schemas should contain request/response validation
* models should contain SQLAlchemy database models
* core should contain config, security, and error handling

Avoid placing business logic directly inside route handlers.

---

## API Response Standards

All successful list responses must use this shape:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "total_pages": 0
  }
}
```

All error responses must use this shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable error message",
    "details": {}
  }
}
```

Use consistent error codes:

* `VALIDATION_ERROR`
* `UNAUTHORIZED`
* `FORBIDDEN`
* `NOT_FOUND`
* `CONFLICT`
* `INTERNAL_SERVER_ERROR`

---

## Auth Rules

Use JWT stored in an httpOnly cookie.

Required auth behavior:

* signup creates a new user
* password is hashed using bcrypt/passlib
* login verifies credentials and sets auth cookie
* logout clears auth cookie
* `/auth/me` returns the current user if authenticated
* frontend must stay logged in after page refresh
* protected routes must reject unauthenticated users

Do not store raw passwords.

Do not return `password_hash` in any API response.

---

## Task Authorization Rules

Every task query must enforce ownership.

For normal users:

```sql
WHERE task.id = :task_id AND task.user_id = :current_user_id
```

Never fetch, update, or delete a task only by task ID.

Admin support may allow viewing all tasks, but only if the current user has `role = 'admin'`.

If admin support is incomplete, document it clearly as a future improvement instead of pretending it is complete.

---

## Validation Rules

Task creation:

* title is required
* title minimum length: 3
* title maximum length: 160
* description maximum length: 2000
* status must be one of: `pending`, `in_progress`, `completed`
* priority must be one of: `low`, `medium`, `high`
* due date must be a valid datetime if provided

Task update:

* all fields are optional
* reject empty PATCH payloads
* validate status and priority exactly like create

---

## Filtering, Search, Sort, Pagination

The task list endpoint must support these together:

```txt
GET /api/v1/tasks?status=pending&priority=high&search=auth&sortBy=due_date&sortOrder=asc&page=1&limit=10
```

Rules:

* `status` filter should be optional
* `priority` filter should be optional
* `search` should search task title
* `sortBy` allowed values: `due_date`, `priority`, `created_at`
* `sortOrder` allowed values: `asc`, `desc`
* `page` default: 1
* `limit` default: 10
* maximum limit: 100

Priority sort must use logical priority order, not alphabetical order:

```txt
high > medium > low
```

---

## Real-Time Rules

Implement WebSocket as the primary real-time channel.

Implement SSE as a fallback/lightweight stream.

Use the same event shape for WebSocket and SSE:

```json
{
  "type": "task.updated",
  "task_id": "uuid",
  "user_id": "uuid",
  "payload": {},
  "timestamp": "ISO timestamp"
}
```

Supported event types:

* `task.created`
* `task.updated`
* `task.completed`
* `task.deleted`
* `activity.created`

Important:

* Broadcast only after the database transaction succeeds.
* Broadcast only to the task owner.
* Admin users may receive all events only if admin support is implemented.
* Keep an in-memory connection manager for this assessment.
* Document that Redis Pub/Sub would be needed for multi-instance production deployment.

For SSE:

* use `StreamingResponse`
* send heartbeat events every 20–30 seconds
* handle client disconnects safely

For WebSocket:

* authenticate the user before accepting or immediately after accepting
* disconnect unauthorized clients
* remove disconnected clients from the connection manager
* avoid crashing the server when one client disconnects unexpectedly

---

## Activity Log Rules

Track important changes:

* task created
* task updated
* task completed
* task deleted

Each activity log should store:

* task ID
* user ID
* action
* old value where relevant
* new value where relevant
* created timestamp

Activity logs should be queryable from the frontend.

Do not make activity logs block the whole app if the UI panel fails. Activity logs are a bonus feature, not the main product path.

---

## Frontend Rules

Use Next.js App Router with TypeScript.

Use:

* Tailwind CSS for styling
* React Hook Form for forms
* Zod for client-side validation
* TanStack Query for API state
* Axios or a clean fetch wrapper for API calls

Frontend must include:

* signup page
* login page
* protected dashboard
* task creation page/form
* task edit page/form
* task list with filters
* search input
* sort dropdown
* pagination controls
* mark complete action
* delete action
* loading state
* empty state
* error state
* responsive mobile layout

Do not build a beautiful UI with broken logic. Correct behavior comes first.

---

## Frontend Auth Rules

On app load:

1. call `/auth/me`
2. if authenticated, allow dashboard access
3. if unauthenticated, redirect to login

Use cookies with `credentials: "include"` in frontend API requests.

Do not manually read JWT from JavaScript.

---

## Optimistic UI Rules

Use optimistic UI only for:

* mark task as complete
* delete task

Rollback on failure.

Required optimistic flow:

1. save previous cache state
2. update UI immediately
3. send API request
4. keep change on success
5. restore previous state on failure
6. show error toast/message

Do not use optimistic UI for create/edit until the core app is stable.

---

## Testing Rules

Add meaningful backend tests.

Minimum required tests:

1. signup creates user and hashes password
2. duplicate email returns conflict
3. login works with valid credentials
4. unauthenticated task creation is rejected
5. creating task without title returns validation error
6. authenticated user can create task
7. user cannot access another user's task
8. task list supports status filter, search, and pagination
9. WebSocket receives an event after a task update, if practical
10. activity log is created after task update

Use pytest.

Tests should run with one command:

```bash
pytest
```

If a test requires database setup, document it clearly.

Do not leave tests dependent on local hidden state.

---

## Docker Rules

`docker compose up --build` should start the project locally.

Required services:

* postgres
* backend
* frontend

Expected local URLs:

```txt
Frontend: http://localhost:3000
Backend:  http://localhost:8000
API Docs: http://localhost:8000/docs
```

Backend container should run migrations before starting the app.

Do not require the reviewer to manually create database tables.

---

## Environment Variable Rules

Provide `.env.example` files for both backend and frontend.

Backend `.env.example` must include:

```env
APP_NAME=TaskFlow
ENVIRONMENT=development
DEBUG=true
DATABASE_URL=postgresql+psycopg2://postgres:postgres@postgres:5432/taskflow
JWT_SECRET_KEY=change-me
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440
FRONTEND_URL=http://localhost:3000
COOKIE_NAME=taskflow_token
COOKIE_SECURE=false
COOKIE_SAMESITE=lax
```

Frontend `.env.example` must include:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8000/api/v1/ws/tasks
NEXT_PUBLIC_SSE_URL=http://localhost:8000/api/v1/events/tasks
```

---

## Git Commit Rules

Maintain clean commit history.

Use small, meaningful commits.

Recommended commit style:

```txt
chore: initialize monorepo structure
feat: setup FastAPI app and health check
feat: add auth models and migrations
feat: implement JWT cookie authentication
feat: implement protected task CRUD APIs
feat: add filtering search sorting and pagination
feat: add activity logging
feat: add WebSocket task events
feat: add SSE task event stream
test: add backend auth and task tests
feat: setup Next.js frontend
feat: add auth pages and session restore
feat: add task dashboard
feat: add task forms with validation
feat: add optimistic complete and delete actions
feat: add realtime dashboard updates
chore: add Docker setup
chore: add GitHub Actions CI
docs: add README setup and tradeoffs
```

Before each commit:

1. run relevant tests
2. check formatting
3. check that the app still starts
4. ensure no secrets are staged

---

## Code Quality Rules

Backend:

* use type hints
* keep functions small
* avoid circular imports
* avoid duplicate validation logic
* use dependency injection for DB session and current user
* keep config centralized
* keep error handling centralized

Frontend:

* use TypeScript types for API responses
* avoid `any` unless absolutely necessary
* keep API calls in `lib/api.ts`
* keep reusable UI in components
* keep dashboard logic readable
* avoid deeply nested component logic

---

## Security Rules

Required:

* bcrypt password hashing
* httpOnly auth cookie
* protected task APIs
* ownership checks
* CORS restricted to frontend origin
* no secrets committed
* no password hash returned
* no stack traces exposed in production responses

Recommended:

* validate all write payloads
* limit pagination size
* sanitize frontend rendering by avoiding unsafe HTML
* use secure cookie settings in production

---

## README Rules

The README must be complete enough that a reviewer can run the project without asking questions.

README must include:

* project overview
* live frontend link
* live backend/API docs link
* tech stack
* feature list
* architecture overview
* database schema summary
* API documentation
* real-time design explanation
* local setup
* Docker setup
* environment variables
* test instructions
* assumptions and trade-offs
* future improvements

Include this trade-off clearly:

```md
Although Go was preferred, the assessment allowed choosing another backend language based on expertise. I chose FastAPI to prioritize correctness, secure authentication, clean API design, PostgreSQL-backed querying, tests, and polished delivery within the expected timeline.
```

Also include this real-time trade-off:

```md
Real-time updates use an in-memory WebSocket/SSE connection manager, which is suitable for this single-instance assessment deployment. In production, this could be replaced with Redis Pub/Sub or a message broker to support multiple backend replicas.
```

---

## Final Review Checklist

Before final submission, verify:

* signup works
* login works
* logout works
* page refresh keeps user logged in
* unauthenticated users cannot access dashboard
* users cannot access another user's tasks
* create task works
* edit task works
* delete task works
* mark complete works
* filters work
* search works
* sorting works
* pagination works
* WebSocket/SSE events work
* activity logs work
* Docker setup works
* tests pass
* GitHub Actions passes
* README is complete
* `.env.example` exists
* no secrets are committed
* frontend is deployed
* backend is deployed
* API docs are accessible

---

# Python Dependency Management with uv

Use `uv` for all Python dependency management. Do not use raw `pip`, `requirements.txt`, Poetry, or Pipenv unless explicitly required for deployment compatibility.

The backend must use:

```txt id="x7hb0j"
pyproject.toml
uv.lock
.python-version
```

Do not create or maintain:

```txt id="4a5are"
requirements.txt
Pipfile
poetry.lock
setup.py
```

unless a deployment provider absolutely requires it. If required, generate it from `uv`, do not manually maintain it.

---

## uv Rules

Use these commands:

```bash id="ywanzg"
uv init
uv add fastapi uvicorn sqlalchemy alembic psycopg2-binary pydantic-settings python-jose passlib[bcrypt] python-multipart email-validator
uv add --dev pytest pytest-asyncio httpx ruff mypy
uv sync
uv run pytest
uv run uvicorn app.main:app --reload
```

All Python commands must be executed through `uv run`.

Examples:

```bash id="6wn98e"
uv run pytest
uv run alembic revision --autogenerate -m "create users and tasks tables"
uv run alembic upgrade head
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
uv run ruff check .
uv run ruff format .
```

Do not use:

```bash id="885t9m"
pip install ...
python -m pytest
python app/main.py
```

Use:

```bash id="btrbim"
uv add <package>
uv add --dev <package>
uv run <command>
```

---

## Python Version

Pin the Python version using `.python-version`.

Recommended:

```txt id="nqt079"
3.12
```

The backend should be compatible with Python 3.12.

---

## Lockfile Rules

Commit `uv.lock`.

The lockfile is required for reproducible local, Docker, and CI installs.

Do not manually edit `uv.lock`.

When dependencies change:

```bash id="91c1ox"
uv add <package>
uv lock
uv sync
```

Before final submission, run:

```bash id="3vmmrm"
uv sync --frozen
uv run pytest
```

`uv sync --frozen` should pass without modifying the lockfile.

---

## Backend pyproject.toml Requirements

The backend `pyproject.toml` should include project metadata, dependencies, dev dependencies, and tool configs.

Required dependency groups:

```txt id="us6ncp"
main dependencies:
- fastapi
- uvicorn
- sqlalchemy
- alembic
- psycopg2-binary
- pydantic-settings
- python-jose
- passlib[bcrypt]
- python-multipart
- email-validator

dev dependencies:
- pytest
- pytest-asyncio
- httpx
- ruff
- mypy
```

Add Ruff configuration in `pyproject.toml`.

Use Ruff for formatting and linting.

---

## Docker Rules with uv

The backend Dockerfile must use `uv`, not `pip`.

Use dependency-layer caching.

Preferred Docker flow:

```txt id="3jo0v3"
1. copy pyproject.toml and uv.lock first
2. run uv sync without installing project source if possible
3. copy application source
4. run migrations
5. start FastAPI with uvicorn through uv
```

The backend container should start with:

```bash id="z1n1iw"
uv run alembic upgrade head && uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Do not run:

```bash id="oewynt"
pip install -r requirements.txt
```

---

## CI Rules with uv

GitHub Actions must install and use `uv`.

CI should run:

```bash id="3bfxg4"
uv sync --frozen
uv run ruff check .
uv run pytest
```

Optional but recommended:

```bash id="69aapd"
uv run mypy app
```

CI must fail if:

```txt id="567gs3"
- dependencies are not locked
- tests fail
- linting fails
```

---

## README Rules for uv

The README must explain backend setup using `uv`.

Include local backend commands:

```bash id="z6x9fa"
cd backend
uv sync
cp .env.example .env
uv run alembic upgrade head
uv run uvicorn app.main:app --reload
```

Include test command:

```bash id="u3nywh"
uv run pytest
```

Include lint command:

```bash id="tdfz2x"
uv run ruff check .
uv run ruff format .
```

Do not mention `pip install -r requirements.txt` in the main setup path.

---

## Dependency Hygiene

Keep dependencies minimal.

Do not add unnecessary libraries.

Before adding a package, prefer built-in FastAPI, Starlette, SQLAlchemy, or Python standard library features.

For WebSockets, use native FastAPI WebSocket support.

For SSE, use FastAPI/Starlette `StreamingResponse`.

Do not add extra WebSocket or SSE packages unless absolutely necessary.

---

## Final uv Checklist

Before final submission, verify:

```txt id="8zmfro"
[x] backend has pyproject.toml
[x] backend has uv.lock
[x] backend has .python-version
[x] README uses uv commands
[x] Dockerfile uses uv
[x] GitHub Actions uses uv
[x] no requirements.txt unless generated for deployment compatibility
[x] uv sync --frozen passes
[x] uv run pytest passes
[x] uv run ruff check . passes
```


## Final Output Standard

The final repository should look like it was built by someone who understands backend systems, API design, auth, PostgreSQL, real-time communication, testing, Docker, and practical engineering trade-offs.

Do not chase unnecessary complexity. A stable, clean, well-documented app is better than a flashy but unreliable one.

