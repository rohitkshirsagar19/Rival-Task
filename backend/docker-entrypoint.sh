#!/bin/sh
set -eu

python - <<'PY'
import os
import socket
import time
from urllib.parse import urlsplit

url = os.environ.get("DATABASE_URL", "postgresql+psycopg2://taskflow:taskflow@postgres:5432/taskflow")
parsed = urlsplit(url)
host = parsed.hostname or "postgres"
port = parsed.port or 5432
last_error = None

for attempt in range(1, 31):
    try:
        with socket.create_connection((host, port), timeout=2):
            print(f"Database reachable at {host}:{port} after {attempt} attempt(s).")
            break
    except OSError as exc:
        last_error = exc
        print(f"Waiting for database {host}:{port} (attempt {attempt}/30): {exc}")
        time.sleep(2)
else:
    raise SystemExit(f"Database never became reachable: {last_error}")
PY

/app/.venv/bin/alembic upgrade head
exec /app/.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
