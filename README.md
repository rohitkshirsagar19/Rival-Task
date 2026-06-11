# TaskFlow

TaskFlow is a full-stack task management application built with Next.js, FastAPI, and PostgreSQL. It combines secure cookie-based authentication, task ownership enforcement, realtime task delivery over WebSocket with SSE fallback, and a Dockerized local setup that is easy for a reviewer to run.

## Features

- User signup, login, logout, and `/api/v1/auth/me` session restore
- JWT authentication stored in an `httpOnly` cookie
- Per-user task ownership on every protected task route
- Task CRUD with validation, filtering, search, sorting, and pagination
- Recent activity log for task changes
- WebSocket realtime updates with SSE fallback
- Optimistic complete and delete actions in the dashboard
- Responsive Next.js dashboard with persisted dark mode
- Docker Compose setup for PostgreSQL, backend, and frontend
- GitHub Actions CI for backend checks and frontend build verification

## Tech Stack

- Frontend: Next.js App Router, TypeScript, Tailwind CSS, React Hook Form, Zod, TanStack Query
- Backend: FastAPI, SQLAlchemy, Alembic, PostgreSQL, Pydantic Settings, Passlib, python-jose
- Realtime: FastAPI WebSocket endpoint, SSE endpoint, in-memory connection manager
- Tooling: `uv`, pytest, Ruff, Docker, GitHub Actions

## Architecture

```txt
Next.js frontend
  - auth pages
  - task dashboard
  - activity panel
  - WebSocket/SSE client hooks

FastAPI backend
  - auth routes
  - task CRUD routes
  - activity routes
  - realtime WebSocket and SSE routes

PostgreSQL
  - users
  - tasks
  - activity_logs
```

Task updates are broadcast only after the database transaction succeeds. Activity logs are stored in PostgreSQL and the frontend refreshes them when task events arrive.

## Database Schema Summary

- `users`: identity, email, password hash, role, timestamps
- `tasks`: task ownership, title, description, status, priority, due/completion timestamps
- `activity_logs`: user-scoped task activity with `old_value` and `new_value` JSON snapshots

## API Routes

### Auth

- `POST /api/v1/auth/signup`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

### Tasks

- `POST /api/v1/tasks`
- `GET /api/v1/tasks`
- `GET /api/v1/tasks/{task_id}`
- `PATCH /api/v1/tasks/{task_id}`
- `DELETE /api/v1/tasks/{task_id}`

### Activity

- `GET /api/v1/activity`
- `GET /api/v1/tasks/{task_id}/activity`

### Realtime

- WebSocket: `GET /api/v1/ws/tasks`
- SSE: `GET /api/v1/events/tasks`

## Realtime Design

The dashboard tries WebSocket first and falls back to SSE if WebSocket reconnect attempts are exhausted. Incoming events update TanStack Query task caches immediately so the list stays in sync with backend mutations.

## Local Setup

### Backend

```bash
cd backend
cp .env.example .env
uv sync
uv run alembic upgrade head
uv run uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
cp .env.example .env.local
npm ci
npm run dev
```

### PostgreSQL

Use a local PostgreSQL instance on `localhost:5432` with the values from `backend/.env.example`, or start the full Docker stack below.

## Docker Setup

```bash
docker compose up --build
```

Expected URLs:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`

The backend container runs `alembic upgrade head` before starting Uvicorn.

## Environment Variables

### Backend

See [backend/.env.example](/home/riku/projects/Rival/backend/.env.example).

Required values:
- `APP_NAME`
- `FRONTEND_ORIGIN`
- `DATABASE_URL`
- `AUTH_SECRET_KEY`
- `AUTH_ALGORITHM`
- `ACCESS_TOKEN_EXPIRE_MINUTES`
- `AUTH_COOKIE_NAME`
- `AUTH_COOKIE_SECURE`
- `AUTH_COOKIE_SAMESITE`

### Frontend

See [frontend/.env.example](/home/riku/projects/Rival/frontend/.env.example).

Required values:
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_WS_URL`
- `NEXT_PUBLIC_SSE_URL`

## Test Commands

```bash
cd backend
uv run ruff check .
uv run pytest

cd ../frontend
npm run lint
npm run build
```

## Assumptions and Trade-offs

- Although Go was preferred, the assessment allowed choosing another backend language based on expertise. I chose FastAPI to prioritize correctness, secure authentication, clean API design, PostgreSQL-backed querying, tests, and polished delivery within the expected timeline.
- Real-time updates use an in-memory WebSocket/SSE connection manager, which is suitable for this single-instance assessment deployment. In production, this could be replaced with Redis Pub/Sub or a message broker to support multiple backend replicas.
- JWT authentication is stored in an `httpOnly` cookie so the frontend can restore sessions across refreshes without exposing the token to `localStorage`.
- Task search currently uses title matching. For larger datasets, this can be replaced with PostgreSQL full-text search.
- Optimistic UI is implemented for complete and delete actions because those interactions are frequent and easy to roll back safely.

## Deployment Notes

- The frontend expects public API URLs at build time because the client bundle reads `NEXT_PUBLIC_*` variables.
- For production, set `AUTH_COOKIE_SECURE=true`, use a strong `AUTH_SECRET_KEY`, and point `FRONTEND_ORIGIN` and the frontend `NEXT_PUBLIC_*` URLs to deployed domains.
- The current realtime approach assumes a single backend replica. Horizontal scaling needs a shared pub/sub layer.

## Future Improvements

- Replace in-memory realtime delivery with Redis-backed pub/sub
- Add PostgreSQL full-text search and richer activity filters
- Add admin-scoped task views if the assessment requires cross-user visibility
- Add end-to-end browser tests and container image publishing in CI
