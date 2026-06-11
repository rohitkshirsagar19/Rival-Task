from datetime import datetime
from typing import Any

from sqlalchemy.orm import Session

from app.models.activity_log import ActivityLog
from app.models.task import Task
from app.models.user import User
from app.repositories.activity_repository import ActivityRepository


def serialize_task(task: Task) -> dict[str, Any]:
    return {
        "id": task.id,
        "user_id": task.user_id,
        "title": task.title,
        "description": task.description,
        "status": task.status,
        "priority": task.priority,
        "due_date": _to_iso(task.due_date),
        "completed_at": _to_iso(task.completed_at),
        "created_at": _to_iso(task.created_at),
        "updated_at": _to_iso(task.updated_at),
    }


def _to_iso(value: datetime | None) -> str | None:
    return value.isoformat() if value is not None else None


class ActivityService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.activity_repository = ActivityRepository(db)

    def log_task_created(self, *, task: Task, user: User) -> ActivityLog:
        return self.activity_repository.create_activity_log(
            task_id=task.id,
            user_id=user.id,
            action="task.created",
            old_value=None,
            new_value=serialize_task(task),
        )

    def log_task_updated(
        self,
        *,
        task: Task,
        user: User,
        old_value: dict[str, Any],
    ) -> ActivityLog:
        action = "task.completed" if task.status == "completed" else "task.updated"
        return self.activity_repository.create_activity_log(
            task_id=task.id,
            user_id=user.id,
            action=action,
            old_value=old_value,
            new_value=serialize_task(task),
        )

    def log_task_deleted(
        self,
        *,
        task_id: int,
        user: User,
        old_value: dict[str, Any],
    ) -> ActivityLog:
        return self.activity_repository.create_activity_log(
            task_id=task_id,
            user_id=user.id,
            action="task.deleted",
            old_value=old_value,
            new_value=None,
        )

    def list_for_user(self, *, user: User) -> list[ActivityLog]:
        return list(self.activity_repository.list_activity_for_user(user_id=user.id))

    def list_for_task(self, *, task_id: int, user: User) -> list[ActivityLog]:
        return list(self.activity_repository.list_activity_for_task(task_id=task_id, user_id=user.id))
