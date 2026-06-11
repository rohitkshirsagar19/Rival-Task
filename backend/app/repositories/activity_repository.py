from collections.abc import Sequence
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.activity_log import ActivityLog


class ActivityRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create_activity_log(
        self,
        *,
        task_id: int,
        user_id: int,
        action: str,
        old_value: dict[str, Any] | None,
        new_value: dict[str, Any] | None,
    ) -> ActivityLog:
        activity = ActivityLog(
            task_id=task_id,
            user_id=user_id,
            action=action,
            old_value=old_value,
            new_value=new_value,
        )
        self.db.add(activity)
        self.db.flush()
        self.db.refresh(activity)
        return activity

    def list_activity_for_user(self, *, user_id: int) -> Sequence[ActivityLog]:
        statement = (
            select(ActivityLog)
            .where(ActivityLog.user_id == user_id)
            .order_by(ActivityLog.created_at.desc(), ActivityLog.id.desc())
        )
        return self.db.scalars(statement).all()

    def list_activity_for_task(
        self,
        *,
        task_id: int,
        user_id: int,
    ) -> Sequence[ActivityLog]:
        statement = (
            select(ActivityLog)
            .where(ActivityLog.task_id == task_id, ActivityLog.user_id == user_id)
            .order_by(ActivityLog.created_at.desc(), ActivityLog.id.desc())
        )
        return self.db.scalars(statement).all()
