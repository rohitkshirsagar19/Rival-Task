from datetime import UTC, datetime

from sqlalchemy.orm import Session

from app.core.exceptions import APIException
from app.models.task import Task
from app.models.user import User
from app.repositories.task_repository import TaskRepository
from app.schemas.task import TaskCreate, TaskQueryParams, TaskUpdate


class TaskService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.task_repository = TaskRepository(db)

    def create_task(self, *, user: User, payload: TaskCreate) -> Task:
        data = payload.model_dump()
        if data["status"] == "completed":
            data["completed_at"] = datetime.now(UTC)

        task = self.task_repository.create_task(
            user_id=user.id,
            data=data,
        )
        self.db.commit()
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
        data = payload.model_dump(exclude_unset=True)

        if "status" in data:
            if data["status"] == "completed" and task.completed_at is None:
                data["completed_at"] = datetime.now(UTC)
            elif data["status"] != "completed":
                data["completed_at"] = None

        updated_task = self.task_repository.update_task(task=task, data=data)
        self.db.commit()
        return updated_task

    def delete_task(self, *, user: User, task_id: int) -> None:
        task = self.get_task(user=user, task_id=task_id)
        self.task_repository.delete_task(task=task)
        self.db.commit()
