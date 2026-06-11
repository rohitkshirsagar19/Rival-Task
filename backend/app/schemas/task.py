from datetime import datetime
from math import ceil
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator

TaskStatus = Literal["pending", "in_progress", "completed"]
TaskPriority = Literal["low", "medium", "high"]
TaskSortBy = Literal["due_date", "priority", "created_at"]
TaskSortOrder = Literal["asc", "desc"]


class TaskCreate(BaseModel):
    title: str = Field(min_length=3, max_length=160)
    description: str | None = Field(default=None, max_length=2000)
    status: TaskStatus = "pending"
    priority: TaskPriority = "medium"
    due_date: datetime | None = None


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=160)
    description: str | None = Field(default=None, max_length=2000)
    status: TaskStatus | None = None
    priority: TaskPriority | None = None
    due_date: datetime | None = None

    @model_validator(mode="after")
    def validate_not_empty(self) -> "TaskUpdate":
        if not self.model_fields_set:
            raise ValueError("At least one field must be provided")
        return self


class TaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    title: str
    description: str | None
    status: TaskStatus
    priority: TaskPriority
    due_date: datetime | None
    completed_at: datetime | None
    created_at: datetime
    updated_at: datetime


class PaginationMeta(BaseModel):
    page: int
    limit: int
    total: int
    total_pages: int

    @classmethod
    def build(cls, *, page: int, limit: int, total: int) -> "PaginationMeta":
        total_pages = ceil(total / limit) if total else 0
        return cls(page=page, limit=limit, total=total, total_pages=total_pages)


class TaskListResponse(BaseModel):
    tasks: list[TaskResponse]
    meta: PaginationMeta


class TaskQueryParams(BaseModel):
    status: TaskStatus | None = None
    priority: TaskPriority | None = None
    search: str | None = Field(default=None, max_length=160)
    sort_by: TaskSortBy = "created_at"
    sort_order: TaskSortOrder = "desc"
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=10, ge=1, le=100)
