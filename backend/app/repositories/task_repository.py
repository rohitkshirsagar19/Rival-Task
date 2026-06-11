from collections.abc import Sequence

from sqlalchemy import Select, case, func, select
from sqlalchemy.orm import Session

from app.models.task import Task
from app.schemas.task import TaskQueryParams


class TaskRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create_task(self, *, user_id: int, data: dict) -> Task:
        task = Task(user_id=user_id, **data)
        self.db.add(task)
        self.db.flush()
        self.db.refresh(task)
        return task

    def get_task_by_id_for_user(self, *, task_id: int, user_id: int) -> Task | None:
        statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
        return self.db.scalar(statement)

    def list_tasks_for_user(
        self,
        *,
        user_id: int,
        params: TaskQueryParams,
    ) -> Sequence[Task]:
        statement = self._build_filtered_statement(user_id=user_id, params=params)
        statement = self._apply_sorting(statement, params)
        offset = (params.page - 1) * params.limit
        statement = statement.offset(offset).limit(params.limit)
        return self.db.scalars(statement).all()

    def update_task(self, *, task: Task, data: dict) -> Task:
        for field, value in data.items():
            setattr(task, field, value)
        self.db.flush()
        self.db.refresh(task)
        return task

    def delete_task(self, *, task: Task) -> None:
        self.db.delete(task)
        self.db.flush()

    def count_tasks_for_user(self, *, user_id: int, params: TaskQueryParams) -> int:
        statement = self._build_filtered_statement(user_id=user_id, params=params)
        count_statement = select(func.count()).select_from(statement.subquery())
        return self.db.scalar(count_statement) or 0

    def _build_filtered_statement(
        self,
        *,
        user_id: int,
        params: TaskQueryParams,
    ) -> Select[tuple[Task]]:
        statement = select(Task).where(Task.user_id == user_id)

        if params.status is not None:
            statement = statement.where(Task.status == params.status)
        if params.priority is not None:
            statement = statement.where(Task.priority == params.priority)
        if params.search:
            statement = statement.where(func.lower(Task.title).contains(params.search.lower()))

        return statement

    def _apply_sorting(
        self,
        statement: Select[tuple[Task]],
        params: TaskQueryParams,
    ) -> Select[tuple[Task]]:
        if params.sort_by == "priority":
            priority_rank = case(
                (Task.priority == "high", 3),
                (Task.priority == "medium", 2),
                else_=1,
            )
            order_column = priority_rank
        elif params.sort_by == "due_date":
            order_column = Task.due_date
        else:
            order_column = Task.created_at

        if params.sort_order == "asc":
            return statement.order_by(order_column.asc(), Task.id.asc())
        return statement.order_by(order_column.desc(), Task.id.desc())
