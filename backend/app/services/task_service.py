from datetime import UTC, datetime

from sqlalchemy.orm import Session

from app.core.exceptions import APIException
from app.models.task import Task
from app.models.user import User
from app.repositories.task_repository import TaskRepository
from app.schemas.task import TaskCreate, TaskQueryParams, TaskUpdate
from app.services.activity_service import ActivityService, serialize_task


class TaskService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.task_repository = TaskRepository(db)
        self.activity_service = ActivityService(db)

    def create_task(self, *, user: User, payload: TaskCreate) -> Task:
        data = payload.model_dump()
        if data["status"] == "completed":
            data["completed_at"] = datetime.now(UTC)

        task = self.task_repository.create_task(
            user_id=user.id,
            data=data,
        )
        self.db.commit()
        self._safe_log_created(task=task, user=user)
        return task

    def list_tasks(self, *, user: User, params: TaskQueryParams) -> tuple[list[Task], int]:
        tasks = list(self.task_repository.list_tasks_for_user(user_id=user.id, params=params))
        total = self.task_repository.count_tasks_for_user(user_id=user.id, params=params)
        return tasks, total

    def get_task(self, *, user: User, task_id: int) -> Task:
        task = self.task_repository.get_task_by_id_for_user(task_id=task_id, user_id=user.id)
        if task is None:
            raise APIException(status_code=404, code="NOT_FOUND", message="Task not found")
        return task

    def update_task(self, *, user: User, task_id: int, payload: TaskUpdate) -> Task:
        task = self.get_task(user=user, task_id=task_id)
        old_value = serialize_task(task)
        data = payload.model_dump(exclude_unset=True)

        if "status" in data:
            if data["status"] == "completed" and task.completed_at is None:
                data["completed_at"] = datetime.now(UTC)
            elif data["status"] != "completed":
                data["completed_at"] = None

        updated_task = self.task_repository.update_task(task=task, data=data)
        self.db.commit()
        self._safe_log_updated(task=updated_task, user=user, old_value=old_value)
        return updated_task

    def delete_task(self, *, user: User, task_id: int) -> None:
        task = self.get_task(user=user, task_id=task_id)
        old_value = serialize_task(task)
        deleted_task_id = task.id
        self.task_repository.delete_task(task=task)
        self.db.commit()
        self._safe_log_deleted(task_id=deleted_task_id, user=user, old_value=old_value)

    def _safe_log_created(self, *, task: Task, user: User) -> None:
        try:
            self.activity_service.log_task_created(task=task, user=user)
            self.db.commit()
        except Exception:
            self.db.rollback()

    def _safe_log_updated(self, *, task: Task, user: User, old_value: dict) -> None:
        try:
            self.activity_service.log_task_updated(task=task, user=user, old_value=old_value)
            self.db.commit()
        except Exception:
            self.db.rollback()

    def _safe_log_deleted(self, *, task_id: int, user: User, old_value: dict) -> None:
        try:
            self.activity_service.log_task_deleted(task_id=task_id, user=user, old_value=old_value)
            self.db.commit()
        except Exception:
            self.db.rollback()
